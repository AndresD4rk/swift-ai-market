
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const RealtimeMetrics = () => {
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    // Subscribe to admin_sessions changes for real-time updates
    const channel = supabase
      .channel('admin-sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_sessions'
        },
        (payload) => {
          console.log('Real-time admin session change:', payload);
          // Refresh active user count when sessions change
          fetchActiveUsers();
        }
      )
      .subscribe();

    const fetchActiveUsers = async () => {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('user_identifier')
        .eq('status', 'active');
      
      if (!error && data) {
        const uniqueUsers = new Set(data.map(session => session.user_identifier)).size;
        setActiveUsers(uniqueUsers);
      }
    };

    fetchActiveUsers();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Usuarios Activos</p>
            <p className="text-2xl font-bold text-white">{activeUsers}</p>
            <p className="text-xs text-green-400">En tiempo real</p>
          </div>
          <Users className="w-8 h-8 text-purple-400" />
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeMetrics;
