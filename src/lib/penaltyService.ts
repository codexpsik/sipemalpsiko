import { supabase } from "@/integrations/supabase/client";
import { BUSINESS_RULES } from "./businessRules";

export interface PenaltyCalculation {
  lateDays: number;
  latePenalty: number;
  damagePenalty: number;
  totalPenalty: number;
  reason: string;
}

export class PenaltyService {
  /**
   * Calculate penalty for a return request
   */
  static calculatePenalty(
    dueDate: string,
    returnDate: string,
    categoryName: string,
    condition: string = 'baik'
  ): PenaltyCalculation {
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    
    // Calculate late days
    const lateDays = Math.max(0, Math.ceil((returned.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Calculate late penalty
    const dailyRate = BUSINESS_RULES.PENALTY_RATES[categoryName as keyof typeof BUSINESS_RULES.PENALTY_RATES] || 5000;
    const latePenalty = lateDays * dailyRate;
    
    // Calculate damage penalty
    let damagePenalty = 0;
    let damageReason = '';
    
    switch (condition.toLowerCase()) {
      case 'rusak_ringan':
        damagePenalty = BUSINESS_RULES.DAMAGE_PENALTIES.minor;
        damageReason = 'Kerusakan ringan';
        break;
      case 'rusak_berat':
        damagePenalty = BUSINESS_RULES.DAMAGE_PENALTIES.major;
        damageReason = 'Kerusakan berat';
        break;
      case 'hilang':
        damagePenalty = BUSINESS_RULES.DAMAGE_PENALTIES.total;
        damageReason = 'Alat hilang';
        break;
      default:
        damageReason = '';
    }
    
    const totalPenalty = latePenalty + damagePenalty;
    
    let reason = '';
    if (lateDays > 0) {
      reason += `Terlambat ${lateDays} hari (Rp ${latePenalty.toLocaleString()})`;
    }
    if (damagePenalty > 0) {
      if (reason) reason += '; ';
      reason += `${damageReason} (Rp ${damagePenalty.toLocaleString()})`;
    }
    
    return {
      lateDays,
      latePenalty,
      damagePenalty,
      totalPenalty,
      reason: reason || 'Tidak ada denda'
    };
  }

  /**
   * Create penalty record in database
   */
  static async createPenalty(
    borrowingId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (amount <= 0) {
        return { success: true, data: null };
      }

      const { data, error } = await supabase
        .from('penalties')
        .insert({
          borrowing_id: borrowingId,
          amount,
          reason,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };

    } catch (error) {
      console.error('Error creating penalty:', error);
      return {
        success: false,
        error: 'Failed to create penalty record'
      };
    }
  }

  /**
   * Mark penalty as paid
   */
  static async markPenaltyPaid(
    penaltyId: string,
    adminId: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('penalties')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          notes: notes || null
        })
        .eq('id', penaltyId);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error marking penalty as paid:', error);
      return {
        success: false,
        error: 'Failed to update penalty status'
      };
    }
  }

  /**
   * Waive penalty (admin action)
   */
  static async waivePenalty(
    penaltyId: string,
    adminId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('penalties')
        .update({
          status: 'waived',
          waived_at: new Date().toISOString(),
          waived_by: adminId,
          notes: reason
        })
        .eq('id', penaltyId);

      if (error) throw error;

      return { success: true };

    } catch (error) {
      console.error('Error waiving penalty:', error);
      return {
        success: false,
        error: 'Failed to waive penalty'
      };
    }
  }

  /**
   * Get user's penalty summary
   */
  static async getUserPenaltySummary(userId: string): Promise<{
    totalPending: number;
    totalPaid: number;
    penalties: any[];
  }> {
    try {
      const { data: penalties, error } = await supabase
        .from('penalties')
        .select(`
          *,
          borrowings(
            *,
            equipment(nama),
            profiles(nama)
          )
        `)
        .eq('borrowings.user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const totalPending = penalties
        ?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0) || 0;

      const totalPaid = penalties
        ?.filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0) || 0;

      return {
        totalPending,
        totalPaid,
        penalties: penalties || []
      };

    } catch (error) {
      console.error('Error getting penalty summary:', error);
      return {
        totalPending: 0,
        totalPaid: 0,
        penalties: []
      };
    }
  }

  /**
   * Check for overdue borrowings and create penalties
   */
  static async processOverdueBorrowings(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: overdueBorrowings } = await supabase
        .from('borrowings')
        .select(`
          *,
          equipment(nama, categories(nama))
        `)
        .eq('status', 'active')
        .lt('tanggal_kembali', today);

      if (!overdueBorrowings) return;

      for (const borrowing of overdueBorrowings) {
        // Check if penalty already exists
        const { data: existingPenalty } = await supabase
          .from('penalties')
          .select('id')
          .eq('borrowing_id', borrowing.id)
          .single();

        if (existingPenalty) continue;

        // Calculate penalty
        const penalty = this.calculatePenalty(
          borrowing.tanggal_kembali,
          today,
          borrowing.equipment?.categories?.nama || '',
          'baik'
        );

        if (penalty.totalPenalty > 0) {
          await this.createPenalty(
            borrowing.id,
            penalty.totalPenalty,
            penalty.reason
          );
        }

        // Update borrowing status to overdue
        await supabase
          .from('borrowings')
          .update({ status: 'overdue' })
          .eq('id', borrowing.id);
      }

    } catch (error) {
      console.error('Error processing overdue borrowings:', error);
    }
  }
}