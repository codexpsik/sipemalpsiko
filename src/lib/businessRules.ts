// Business Rules and Constants for SIPEMAL
export const BUSINESS_RULES = {
  // Borrowing limits
  MAX_ACTIVE_BORROWINGS: {
    mahasiswa: 3,
    dosen: 5,
    admin: 10
  },
  
  // Maximum borrowing duration in days
  MAX_BORROWING_DURATION: {
    'Harus Dikembalikan': 14, // 2 weeks
    'Copy 1': 7,             // 1 week  
    'Habis Pakai': 1         // Same day
  },
  
  // Penalty rates (per day in Rupiah)
  PENALTY_RATES: {
    'Harus Dikembalikan': 5000,
    'Copy 1': 3000,
    'Habis Pakai': 2000
  },
  
  // Damage penalties (in Rupiah)
  DAMAGE_PENALTIES: {
    minor: 25000,    // Ringan
    major: 100000,   // Berat
    total: 500000    // Hilang/Rusak Total
  },
  
  // Auto-approval conditions
  AUTO_APPROVAL: {
    enabled: true,
    conditions: {
      // Auto-approve if equipment is available and user has good history
      requiresGoodHistory: true,
      maxPendingPenalties: 0,
      maxActiveBorrowings: 2
    }
  },
  
  // Queue management
  QUEUE: {
    maxWaitTime: 30, // days
    priorityOrder: ['dosen', 'mahasiswa'] // dosen gets priority
  },
  
  // Notification timing
  NOTIFICATIONS: {
    reminderDays: [3, 1], // Send reminders 3 days and 1 day before due
    overdueNotification: true,
    approvalNotification: true
  }
};

export const BORROWING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved', 
  ACTIVE: 'active',
  RETURNED: 'returned',
  REJECTED: 'rejected',
  OVERDUE: 'overdue'
} as const;

export const RETURN_STATUS = {
  INITIAL: 'initial',     // User submitted return request
  FINAL: 'final',         // Admin verified physical return
  COMPLETED: 'completed'  // Process completed
} as const;

export const EQUIPMENT_STATUS = {
  AVAILABLE: 'available',
  BORROWED: 'borrowed',
  MAINTENANCE: 'maintenance',
  DAMAGED: 'damaged'
} as const;