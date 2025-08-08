import { supabase } from "@/integrations/supabase/client";
import { RETURN_STATUS, BORROWING_STATUS } from "./businessRules";
import { PenaltyService } from "./penaltyService";
import { BorrowingService } from "./borrowingService";

export interface ReturnRequest {
  borrowing_id: string;
  kondisi_alat: string;
  catatan_tahap_awal?: string;
}

export interface ReturnProcessResult {
  success: boolean;
  data?: any;
  error?: string;
  penalty?: {
    amount: number;
    reason: string;
  };
}

export class ReturnService {
  /**
   * Submit initial return request (Stage 1)
   */
  static async submitReturnRequest(request: ReturnRequest): Promise<ReturnProcessResult> {
    try {
      // Get borrowing details
      const { data: borrowing, error: borrowingError } = await supabase
        .from('borrowings')
        .select(`
          *,
          equipment(nama, categories(nama))
        `)
        .eq('id', request.borrowing_id)
        .single();

      if (borrowingError || !borrowing) {
        return {
          success: false,
          error: 'Borrowing record not found'
        };
      }

      // Check if borrowing is active
      if (borrowing.status !== 'active' && borrowing.status !== 'overdue') {
        return {
          success: false,
          error: 'Borrowing is not active'
        };
      }

      // Calculate penalty if any
      const today = new Date().toISOString();
      const penalty = PenaltyService.calculatePenalty(
        borrowing.tanggal_kembali,
        today,
        borrowing.equipment?.categories?.nama || '',
        request.kondisi_alat
      );

      // Create return record
      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .insert({
          borrowing_id: request.borrowing_id,
          kondisi_alat: request.kondisi_alat,
          catatan_tahap_awal: request.catatan_tahap_awal,
          status: RETURN_STATUS.INITIAL
        })
        .select()
        .single();

      if (returnError) throw returnError;

      // Create penalty record if applicable
      if (penalty.totalPenalty > 0) {
        await PenaltyService.createPenalty(
          request.borrowing_id,
          penalty.totalPenalty,
          penalty.reason
        );
      }

      return {
        success: true,
        data: returnData,
        penalty: penalty.totalPenalty > 0 ? {
          amount: penalty.totalPenalty,
          reason: penalty.reason
        } : undefined
      };

    } catch (error) {
      console.error('Error submitting return request:', error);
      return {
        success: false,
        error: 'Failed to submit return request'
      };
    }
  }

  /**
   * Admin approval of Stage 1 (initial verification)
   */
  static async approveReturnStage1(
    returnId: string,
    adminId: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('returns')
        .update({
          status: RETURN_STATUS.FINAL,
          catatan_tahap_akhir: notes,
          processed_at: new Date().toISOString(),
          processed_by: adminId
        })
        .eq('id', returnId);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error approving return stage 1:', error);
      return {
        success: false,
        error: 'Failed to approve return stage 1'
      };
    }
  }

  /**
   * Complete return process (Stage 2 - final verification)
   */
  static async completeReturn(
    returnId: string,
    adminId: string,
    finalCondition?: string,
    finalNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get return details
      const { data: returnData, error: returnError } = await supabase
        .from('returns')
        .select('*, borrowings(*)')
        .eq('id', returnId)
        .single();

      if (returnError || !returnData) {
        return {
          success: false,
          error: 'Return record not found'
        };
      }

      // Update return status to completed
      const { error: updateError } = await supabase
        .from('returns')
        .update({
          status: RETURN_STATUS.COMPLETED,
          kondisi_alat: finalCondition || returnData.kondisi_alat,
          catatan_tahap_akhir: finalNotes || returnData.catatan_tahap_akhir,
          processed_at: new Date().toISOString(),
          processed_by: adminId
        })
        .eq('id', returnId);

      if (updateError) throw updateError;

      // Update borrowing status to returned
      const { error: borrowingError } = await supabase
        .from('borrowings')
        .update({
          status: BORROWING_STATUS.RETURNED
        })
        .eq('id', returnData.borrowing_id);

      if (borrowingError) throw borrowingError;

      // Update equipment status
      await BorrowingService.updateEquipmentStatus(returnData.borrowing_id);

      // Process equipment queue
      if (returnData.borrowings) {
        await BorrowingService.processEquipmentQueue(returnData.borrowings.equipment_id);
      }

      return { success: true };

    } catch (error) {
      console.error('Error completing return:', error);
      return {
        success: false,
        error: 'Failed to complete return'
      };
    }
  }

  /**
   * Reject return request
   */
  static async rejectReturn(
    returnId: string,
    adminId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('returns')
        .update({
          status: RETURN_STATUS.INITIAL,
          catatan_tahap_akhir: `Ditolak: ${reason}`,
          processed_by: adminId
        })
        .eq('id', returnId);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error rejecting return:', error);
      return {
        success: false,
        error: 'Failed to reject return'
      };
    }
  }

  /**
   * Get return statistics for dashboard
   */
  static async getReturnStats(): Promise<{
    initialStage: number;
    finalStage: number;
    completed: number;
    overdue: number;
  }> {
    try {
      const { data: returns } = await supabase
        .from('returns')
        .select('status, borrowings(tanggal_kembali)')
        .order('created_at', { ascending: false });

      if (!returns) return { initialStage: 0, finalStage: 0, completed: 0, overdue: 0 };

      const today = new Date();
      
      return {
        initialStage: returns.filter(r => r.status === RETURN_STATUS.INITIAL).length,
        finalStage: returns.filter(r => r.status === RETURN_STATUS.FINAL).length,
        completed: returns.filter(r => r.status === RETURN_STATUS.COMPLETED).length,
        overdue: returns.filter(r => 
          r.borrowings && 
          new Date(r.borrowings.tanggal_kembali) < today &&
          r.status !== RETURN_STATUS.COMPLETED
        ).length
      };

    } catch (error) {
      console.error('Error getting return stats:', error);
      return { initialStage: 0, finalStage: 0, completed: 0, overdue: 0 };
    }
  }

  /**
   * Get user's active borrowings that can be returned
   */
  static async getUserReturnableItems(userId: string): Promise<any[]> {
    try {
      const { data: borrowings, error } = await supabase
        .from('borrowings')
        .select(`
          *,
          equipment(nama, categories(nama)),
          returns(id, status)
        `)
        .eq('user_id', userId)
        .in('status', ['active', 'overdue'] as any)
        .order('tanggal_kembali', { ascending: true });

      if (error) throw error;

      // Filter out items that already have return requests
      return borrowings?.filter(b => !b.returns || b.returns.length === 0) || [];

    } catch (error) {
      console.error('Error getting returnable items:', error);
      return [];
    }
  }
}