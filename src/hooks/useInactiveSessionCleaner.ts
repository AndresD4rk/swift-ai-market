
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useInactiveSessionCleaner = () => {
  useEffect(() => {
    // Función para limpiar sesiones inactivas
    const cleanInactiveSessions = async () => {
      try {
        // Marcar como "ended" las sesiones que llevan más de 10 minutos activas
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        
        const { error } = await supabase
          .from('admin_sessions')
          .update({ 
            status: 'ended',
            session_end: new Date().toISOString()
          })
          .eq('status', 'active')
          .lt('session_start', tenMinutesAgo);

        if (error) {
          console.error('Error cleaning inactive sessions:', error);
        } else {
          console.log('Cleaned inactive sessions older than 10 minutes');
        }
      } catch (err) {
        console.error('Error in cleanInactiveSessions:', err);
      }
    };

    // Ejecutar inmediatamente
    cleanInactiveSessions();

    // Ejecutar cada 2 minutos
    const interval = setInterval(cleanInactiveSessions, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
