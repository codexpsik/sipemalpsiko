export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      borrowings: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          catatan: string | null
          created_at: string
          equipment_id: string
          id: string
          jumlah: number
          status: Database["public"]["Enums"]["borrowing_status"]
          tanggal_kembali: string
          tanggal_pinjam: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          catatan?: string | null
          created_at?: string
          equipment_id: string
          id?: string
          jumlah?: number
          status?: Database["public"]["Enums"]["borrowing_status"]
          tanggal_kembali: string
          tanggal_pinjam: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          catatan?: string | null
          created_at?: string
          equipment_id?: string
          id?: string
          jumlah?: number
          status?: Database["public"]["Enums"]["borrowing_status"]
          tanggal_kembali?: string
          tanggal_pinjam?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "borrowings_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          deskripsi: string | null
          id: string
          nama: string
          tipe: Database["public"]["Enums"]["equipment_category"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          nama: string
          tipe: Database["public"]["Enums"]["equipment_category"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          id?: string
          nama?: string
          tipe?: Database["public"]["Enums"]["equipment_category"]
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          created_at: string
          deskripsi: string | null
          gambar_url: string | null
          id: string
          kategori_id: string
          kondisi: string | null
          nama: string
          status: string | null
          stok: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deskripsi?: string | null
          gambar_url?: string | null
          id?: string
          kategori_id: string
          kondisi?: string | null
          nama: string
          status?: string | null
          stok?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deskripsi?: string | null
          gambar_url?: string | null
          id?: string
          kategori_id?: string
          kondisi?: string | null
          nama?: string
          status?: string | null
          stok?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_kategori_id_fkey"
            columns: ["kategori_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_queue: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          status: string
          tanggal_mulai: string
          tanggal_selesai: string
          user_id: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          status?: string
          tanggal_mulai: string
          tanggal_selesai: string
          user_id: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          status?: string
          tanggal_mulai?: string
          tanggal_selesai?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_queue_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      penalties: {
        Row: {
          amount: number
          borrowing_id: string
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          reason: string
          status: string
          updated_at: string
          waived_at: string | null
          waived_by: string | null
        }
        Insert: {
          amount?: number
          borrowing_id: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          reason: string
          status?: string
          updated_at?: string
          waived_at?: string | null
          waived_by?: string | null
        }
        Update: {
          amount?: number
          borrowing_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          reason?: string
          status?: string
          updated_at?: string
          waived_at?: string | null
          waived_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          jenis_kelamin: Database["public"]["Enums"]["gender"]
          nama: string
          nim: string | null
          nomor_whatsapp: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          jenis_kelamin: Database["public"]["Enums"]["gender"]
          nama: string
          nim?: string | null
          nomor_whatsapp: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: Database["public"]["Enums"]["gender"]
          nama?: string
          nim?: string | null
          nomor_whatsapp?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      returns: {
        Row: {
          borrowing_id: string
          catatan_tahap_akhir: string | null
          catatan_tahap_awal: string | null
          created_at: string
          id: string
          kondisi_alat: string | null
          processed_at: string | null
          processed_by: string | null
          status: Database["public"]["Enums"]["return_status"]
          updated_at: string
        }
        Insert: {
          borrowing_id: string
          catatan_tahap_akhir?: string | null
          catatan_tahap_awal?: string | null
          created_at?: string
          id?: string
          kondisi_alat?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
        }
        Update: {
          borrowing_id?: string
          catatan_tahap_akhir?: string | null
          catatan_tahap_awal?: string | null
          created_at?: string
          id?: string
          kondisi_alat?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: Database["public"]["Enums"]["return_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_borrowing_id_fkey"
            columns: ["borrowing_id"]
            isOneToOne: false
            referencedRelation: "borrowings"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_penalty_record: {
        Args: { p_borrowing_id: string; p_amount: number; p_reason: string }
        Returns: undefined
      }
      log_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_table_name: string
          p_record_id?: string
          p_old_data?: Json
          p_new_data?: Json
        }
        Returns: undefined
      }
    }
    Enums: {
      borrowing_status:
        | "pending"
        | "approved"
        | "returned"
        | "rejected"
        | "active"
        | "overdue"
      equipment_category: "harus_dikembalikan" | "habis_pakai" | "copy_1"
      gender: "laki-laki" | "perempuan"
      return_status: "initial" | "final" | "completed"
      user_role: "admin" | "dosen" | "mahasiswa"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      borrowing_status: [
        "pending",
        "approved",
        "returned",
        "rejected",
        "active",
        "overdue",
      ],
      equipment_category: ["harus_dikembalikan", "habis_pakai", "copy_1"],
      gender: ["laki-laki", "perempuan"],
      return_status: ["initial", "final", "completed"],
      user_role: ["admin", "dosen", "mahasiswa"],
    },
  },
} as const
