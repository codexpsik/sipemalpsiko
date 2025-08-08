import { supabase } from "@/integrations/supabase/client";
import { BUSINESS_RULES, BORROWING_STATUS, EQUIPMENT_STATUS } from "./businessRules";

export interface BorrowingRequest {
  equipment_id: string;
  user_id: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  jumlah: number;
  catatan: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class BorrowingService {
  /**
   * Validate a borrowing request against business rules
   */
  static async validateBorrowingRequest(request: BorrowingRequest): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. Check equipment availability
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*, categories(nama)')
        .eq('id', request.equipment_id)
        .single();

      if (equipmentError || !equipment) {
        errors.push('Equipment not found');
        return { isValid: false, errors, warnings };
      }

      // 2. Check if enough quantity is available
      const { data: activeBorrowings } = await supabase
        .from('borrowings')
        .select('jumlah')
        .eq('equipment_id', request.equipment_id)
        .in('status', ['approved', 'active']);

      const borrowedQuantity = activeBorrowings?.reduce((sum, b) => sum + b.jumlah, 0) || 0;
      const availableQuantity = equipment.stok - borrowedQuantity;

      if (request.jumlah > availableQuantity) {
        errors.push(`Only ${availableQuantity} units available, requested ${request.jumlah}`);
      }

      // 3. Check user's active borrowings
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', request.user_id)
        .single();

      if (userProfile) {
        const { data: userActiveBorrowings } = await supabase
          .from('borrowings')
          .select('id')
          .eq('user_id', request.user_id)
          .in('status', ['approved', 'active']);

        const maxAllowed = BUSINESS_RULES.MAX_ACTIVE_BORROWINGS[userProfile.role as keyof typeof BUSINESS_RULES.MAX_ACTIVE_BORROWINGS] || 3;
        
        if ((userActiveBorrowings?.length || 0) >= maxAllowed) {
          errors.push(`Maximum active borrowings exceeded (${maxAllowed} allowed)`);
        }
      }

      // 4. Check borrowing duration
      const startDate = new Date(request.tanggal_pinjam);
      const endDate = new Date(request.tanggal_kembali);
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const categoryName = equipment.categories?.nama;
      const maxDuration = BUSINESS_RULES.MAX_BORROWING_DURATION[categoryName as keyof typeof BUSINESS_RULES.MAX_BORROWING_DURATION];
      
      if (maxDuration && durationDays > maxDuration) {
        errors.push(`Maximum borrowing duration for ${categoryName} is ${maxDuration} days`);
      }

      // 5. Check for pending penalties
      const { data: pendingPenalties } = await supabase
        .from('penalties')
        .select('id')
        .eq('status', 'pending')
        .eq('user_id', request.user_id);

      if (pendingPenalties && pendingPenalties.length > 0) {
        warnings.push('User has pending penalties');
      }

      // 6. Check if start date is not in the past
      if (startDate < new Date()) {
        errors.push('Start date cannot be in the past');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        errors: ['Validation failed due to system error'],
        warnings
      };
    }
  }

  /**
   * Create a new borrowing request
   */
  static async createBorrowingRequest(request: BorrowingRequest): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Validate the request first
      const validation = await this.validateBorrowingRequest(request);
      
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Check if auto-approval is possible
      const shouldAutoApprove = await this.checkAutoApprovalEligibility(request.user_id);
      
      const borrowingData = {
        ...request,
        status: shouldAutoApprove ? BORROWING_STATUS.APPROVED : BORROWING_STATUS.PENDING,
        approved_at: shouldAutoApprove ? new Date().toISOString() : null,
        approved_by: shouldAutoApprove ? 'system' : null
      };

      const { data, error } = await supabase
        .from('borrowings')
        .insert(borrowingData)
        .select()
        .single();

      if (error) throw error;

      // If equipment is not available, add to queue
      if (validation.warnings.some(w => w.includes('availability'))) {
        await this.addToQueue(request);
      }

      return { success: true, data };

    } catch (error) {
      console.error('Error creating borrowing request:', error);
      return {
        success: false,
        error: 'Failed to create borrowing request'
      };
    }
  }

  /**
   * Check if user is eligible for auto-approval
   */
  static async checkAutoApprovalEligibility(userId: string): Promise<boolean> {
    if (!BUSINESS_RULES.AUTO_APPROVAL.enabled) return false;

    try {
      // Check pending penalties
      const { data: penalties } = await supabase
        .from('penalties')
        .select('id')
        .eq('status', 'pending')
        .eq('user_id', userId);

      if (penalties && penalties.length > BUSINESS_RULES.AUTO_APPROVAL.conditions.maxPendingPenalties) {
        return false;
      }

      // Check active borrowings
      const { data: activeBorrowings } = await supabase
        .from('borrowings')
        .select('id')
        .eq('user_id', userId)
        .in('status', ['approved', 'active']);

      if (activeBorrowings && activeBorrowings.length >= BUSINESS_RULES.AUTO_APPROVAL.conditions.maxActiveBorrowings) {
        return false;
      }

      return true;

    } catch (error) {
      console.error('Error checking auto-approval eligibility:', error);
      return false;
    }
  }

  /**
   * Add request to equipment queue
   */
  static async addToQueue(request: BorrowingRequest): Promise<void> {
    try {
      await supabase
        .from('equipment_queue')
        .insert({
          equipment_id: request.equipment_id,
          user_id: request.user_id,
          tanggal_mulai: request.tanggal_pinjam,
          tanggal_selesai: request.tanggal_kembali,
          status: 'waiting'
        });
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  }

  /**
   * Approve a borrowing request
   */
  static async approveBorrowingRequest(borrowingId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('borrowings')
        .update({
          status: BORROWING_STATUS.APPROVED,
          approved_at: new Date().toISOString(),
          approved_by: adminId
        })
        .eq('id', borrowingId);

      if (error) throw error;

      // Update equipment status if needed
      await this.updateEquipmentStatus(borrowingId);

      return { success: true };

    } catch (error) {
      console.error('Error approving borrowing request:', error);
      return {
        success: false,
        error: 'Failed to approve borrowing request'
      };
    }
  }

  /**
   * Reject a borrowing request
   */
  static async rejectBorrowingRequest(borrowingId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('borrowings')
        .update({
          status: BORROWING_STATUS.REJECTED,
          catatan: reason
        })
        .eq('id', borrowingId);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error rejecting borrowing request:', error);
      return {
        success: false,
        error: 'Failed to reject borrowing request'
      };
    }
  }

  /**
   * Update equipment status based on borrowings
   */
  static async updateEquipmentStatus(borrowingId: string): Promise<void> {
    try {
      // Get borrowing details
      const { data: borrowing } = await supabase
        .from('borrowings')
        .select('equipment_id, status')
        .eq('id', borrowingId)
        .single();

      if (!borrowing) return;

      // Check if equipment should be marked as borrowed
      const { data: activeBorrowings } = await supabase
        .from('borrowings')
        .select('jumlah')
        .eq('equipment_id', borrowing.equipment_id)
        .in('status', ['approved', 'active']);

      const { data: equipment } = await supabase
        .from('equipment')
        .select('stok')
        .eq('id', borrowing.equipment_id)
        .single();

      if (activeBorrowings && equipment) {
        const borrowedQuantity = activeBorrowings.reduce((sum, b) => sum + b.jumlah, 0);
        const status = borrowedQuantity >= equipment.stok ? EQUIPMENT_STATUS.BORROWED : EQUIPMENT_STATUS.AVAILABLE;

        await supabase
          .from('equipment')
          .update({ status })
          .eq('id', borrowing.equipment_id);
      }

    } catch (error) {
      console.error('Error updating equipment status:', error);
    }
  }

  /**
   * Process queue when equipment becomes available
   */
  static async processEquipmentQueue(equipmentId: string): Promise<void> {
    try {
      const { data: queueItems } = await supabase
        .from('equipment_queue')
        .select('*')
        .eq('equipment_id', equipmentId)
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });

      if (!queueItems || queueItems.length === 0) return;

      for (const item of queueItems) {
        // Try to create borrowing request for queued item
        const request: BorrowingRequest = {
          equipment_id: item.equipment_id,
          user_id: item.user_id,
          tanggal_pinjam: item.tanggal_mulai,
          tanggal_kembali: item.tanggal_selesai,
          jumlah: 1, // Default quantity
          catatan: 'Processed from queue'
        };

        const result = await this.createBorrowingRequest(request);
        
        if (result.success) {
          // Remove from queue
          await supabase
            .from('equipment_queue')
            .update({ status: 'processed' })
            .eq('id', item.id);
          
          // TODO: Send notification to user
          break; // Process one at a time
        }
      }

    } catch (error) {
      console.error('Error processing equipment queue:', error);
    }
  }
}