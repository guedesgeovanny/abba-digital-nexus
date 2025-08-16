import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, Crown } from 'lucide-react';
import { useConnectionAssignment, User } from '@/hooks/useConnectionAssignment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Connection {
  id: string;
  name: string;
  user_id: string;
  assigned_users?: string[];
}

interface ConnectionAssignmentModalProps {
  connection: Connection | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ConnectionAssignmentModal = ({
  connection,
  isOpen,
  onClose,
  onSuccess
}: ConnectionAssignmentModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedResponsibleId, setSelectedResponsibleId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { fetchActiveUsers } = useConnectionAssignment();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && connection) {
      loadData();
    }
  }, [isOpen, connection]);

  const loadData = async () => {
    if (!connection) return;

    console.log('🔄 Loading modal data for connection:', connection.id);
    
    try {
      // Load active users
      const activeUsers = await fetchActiveUsers();
      console.log('👥 Active users loaded:', activeUsers.length);
      setUsers(activeUsers);

      // Set current responsible
      setSelectedResponsibleId(connection.user_id);
    } catch (error) {
      console.error('❌ Error loading modal data:', error);
    }
  };

  const handleResponsibleChange = (userId: string) => {
    setSelectedResponsibleId(userId);
  };

  const handleSave = async () => {
    if (!connection || !selectedResponsibleId) return;

    console.log('🚀 Starting save process...');
    setLoading(true);
    
    try {
      // Update the responsible user (change owner)
      const { error } = await supabase
        .from('conexoes')
        .update({ user_id: selectedResponsibleId })
        .eq('id', connection.id);

      if (error) {
        console.error('❌ Error updating responsible:', error);
        toast({
          title: "Erro",
          description: "Falha ao alterar responsável",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Responsible updated successfully');
      
      toast({
        title: "Sucesso",
        description: "Responsável alterado com sucesso",
      });
      
      // Close modal first
      onClose();
      
      // Call refresh after a small delay
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 50);
      }
      
    } catch (error) {
      console.error('❌ Error in handleSave:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedResponsibleId('');
    onClose();
  };

  if (!connection) return null;

  const currentResponsible = users.find(user => user.id === selectedResponsibleId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            Alterar Responsável
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{connection.name}</p>
        </DialogHeader>

        <div className="space-y-3">
          {/* Current Responsible */}
          {currentResponsible && (
            <div className="p-2 rounded-md bg-muted/30 border">
              <div className="flex items-center gap-2">
                <Crown className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium">Responsável atual:</span>
                <span className="text-xs">{currentResponsible.full_name || currentResponsible.email}</span>
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Selecionar novo responsável:</h4>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
              {users.map((user) => (
                <div 
                  key={user.id} 
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                    selectedResponsibleId === user.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleResponsibleChange(user.id)}
                >
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    selectedResponsibleId === user.id 
                      ? 'bg-primary border-primary' 
                      : 'border-gray-300'
                  }`} />
                  <span className="flex-1 text-xs">
                    {user.full_name || user.email}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading || !selectedResponsibleId}>
            {loading ? 'Salvando...' : 'Alterar Responsável'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};