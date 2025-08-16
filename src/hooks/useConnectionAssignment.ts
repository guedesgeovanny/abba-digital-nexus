import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
}

export const useConnectionAssignment = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchActiveUsers = async (): Promise<User[]> => {
    try {
      console.log('🔍 Fetching active users...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, status')
        .neq('status', 'pending') // Get all users except pending
        .order('full_name');

      if (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
      }
      
      console.log('✅ Fetched users:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive"
      });
      return [];
    }
  };

  const updateConnectionAssignment = async (
    connectionId: string,
    assignedUserIds: string[]
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('conexoes')
        .update({ assigned_users: assignedUserIds })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Atribuições atualizadas com sucesso",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating connection assignment:', error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar atribuições",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAssignedUsers = async (connectionId: string): Promise<string[]> => {
    try {
      console.log('📋 Getting assigned users for connection:', connectionId);
      const { data, error } = await supabase
        .from('conexoes')
        .select('assigned_users')
        .eq('id', connectionId)
        .maybeSingle(); // Use maybeSingle to avoid errors when no data

      if (error) {
        console.error('❌ Error fetching assigned users:', error);
        throw error;
      }
      
      console.log('✅ Assigned users data:', data);
      
      // Safely handle the JSONB array
      const assignedUsers = data?.assigned_users;
      if (Array.isArray(assignedUsers)) {
        return assignedUsers as string[];
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching assigned users:', error);
      return [];
    }
  };

  return {
    loading,
    fetchActiveUsers,
    updateConnectionAssignment,
    getAssignedUsers
  };
};