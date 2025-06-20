
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminSessions = () => {
  const [loading, setLoading] = useState(false);

  const createSession = useCallback(async (productId: number) => {
    try {
      setLoading(true);
      
      // Get user identifier (could be improved with actual user ID if auth is implemented)
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

      console.log('Session created for product:', productId);
      return data;
    } catch (err) {
      console.error('Error in createSession:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const endSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('admin_sessions')
        .update({ 
          status: 'ended',
          session_end: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        console.error('Error ending session:', error);
      }
    } catch (err) {
      console.error('Error in endSession:', err);
    }
  }, []);

  return {
    createSession,
    endSession,
    loading
  };
};
