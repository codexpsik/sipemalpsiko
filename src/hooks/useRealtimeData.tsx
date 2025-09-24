import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type RealtimeTable = 'borrowings' | 'returns' | 'equipment' | 'categories' | 'profiles';

interface UseRealtimeDataProps {
  table: RealtimeTable;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
}

export const useRealtimeData = ({ 
  table, 
  onInsert, 
  onUpdate, 
  onDelete 
}: UseRealtimeDataProps) => {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel(`schema-db-changes-${table}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`New ${table} inserted:`, payload);
          onInsert?.(payload);
          
          if (table === 'borrowings') {
            toast({
              title: "New Borrowing Request",
              description: "A new borrowing request has been submitted",
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`${table} updated:`, payload);
          onUpdate?.(payload);
          
          if (table === 'borrowings' && payload.new?.status !== payload.old?.status) {
            toast({
              title: "Borrowing Status Updated",
              description: `Request status changed to ${payload.new.status}`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: table
        },
        (payload) => {
          console.log(`${table} deleted:`, payload);
          onDelete?.(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onInsert, onUpdate, onDelete, toast]);
};

export const useUserPresence = (roomId: string = 'admin-dashboard') => {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUser(user);

      const channel = supabase.channel(roomId);

      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel.presenceState();
          const users = Object.values(newState).flat();
          setOnlineUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        });

      await channel.subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        const userStatus = {
          user_id: user.id,
          email: user.email,
          online_at: new Date().toISOString(),
          page: window.location.pathname
        };

        await channel.track(userStatus);
      });

      return () => {
        channel.unsubscribe();
      };
    };

    setupPresence();
  }, [roomId]);

  return { onlineUsers, currentUser };
};