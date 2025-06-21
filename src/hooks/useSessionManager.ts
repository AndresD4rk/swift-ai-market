
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SessionManager {
  currentSessionId: string | null;
  isActive: boolean;
  startSession: (productId: number) => Promise<string | null>;
  endSession: () => Promise<void>;
  updateActivity: () => void;
}

export const useSessionManager = (): SessionManager => {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  // Configuración: sesión se considera inactiva después de 5 minutos
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutos en milisegundos

  const updateActivity = useCallback(() => {
    setLastActivity(new Date());
  }, []);

  const startSession = useCallback(async (productId: number): Promise<string | null> => {
    try {
      const userIdentifier = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('admin_sessions')
        .insert({
          product_id: productId,
          user_identifier: userIdentifier,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return null;
      }

      setCurrentSessionId(data.id);
      setIsActive(true);
      setLastActivity(new Date());
      
      console.log('Session started:', data.id);
      return data.id;
    } catch (err) {
      console.error('Error in startSession:', err);
      return null;
    }
  }, []);

  const endSession = useCallback(async () => {
    if (!currentSessionId) return;

    try {
      const { error } = await supabase
        .from('admin_sessions')
        .update({ 
          status: 'ended',
          session_end: new Date().toISOString()
        })
        .eq('id', currentSessionId);

      if (error) {
        console.error('Error ending session:', error);
      } else {
        console.log('Session ended:', currentSessionId);
      }
    } catch (err) {
      console.error('Error in endSession:', err);
    } finally {
      setCurrentSessionId(null);
      setIsActive(false);
    }
  }, [currentSessionId]);

  // Detectar inactividad y terminar sesión automáticamente
  useEffect(() => {
    if (!isActive || !currentSessionId) return;

    const checkInactivity = () => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
      
      if (timeSinceLastActivity > INACTIVITY_TIMEOUT) {
        console.log('Session timeout detected, ending session');
        endSession();
      }
    };

    const interval = setInterval(checkInactivity, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [isActive, currentSessionId, lastActivity, endSession]);

  // Detectar actividad del usuario (mouse, teclado, scroll)
  useEffect(() => {
    if (!isActive) return;

    const handleActivity = () => {
      updateActivity();
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isActive, updateActivity]);

  // Terminar sesión al cerrar la página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSessionId) {
        // Usar sendBeacon para enviar la petición de forma síncrona
        navigator.sendBeacon(
          `${import.meta.env.VITE_SUPABASE_URL || 'https://pkxvaddvdzeamhqvxvks.supabase.co'}/rest/v1/admin_sessions?id=eq.${currentSessionId}`,
          JSON.stringify({
            status: 'ended',
            session_end: new Date().toISOString()
          })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // También terminar sesión al desmontar el componente
      if (currentSessionId) {
        endSession();
      }
    };
  }, [currentSessionId, endSession]);

  return {
    currentSessionId,
    isActive,
    startSession,
    endSession,
    updateActivity
  };
};
