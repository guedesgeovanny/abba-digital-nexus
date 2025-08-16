import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, Crown } from 'lucide-react';
import { useConnectionAssignment, User } from '@/hooks/useConnectionAssignment';

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
  onSuccess: () => void;
}

export const ConnectionAssignmentModal = ({
  connection,
  isOpen,
  onClose,
  onSuccess
}: ConnectionAssignmentModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { loading, fetchActiveUsers, updateConnectionAssignment, getAssignedUsers } = useConnectionAssignment();

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

      // Load current assignments
      const currentAssignments = await getAssignedUsers(connection.id);
      console.log('📋 Current assignments:', currentAssignments);
      setSelectedUserIds(currentAssignments);
    } catch (error) {
      console.error('❌ Error loading modal data:', error);
    }
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if (!connection) return;

    const success = await updateConnectionAssignment(connection.id, selectedUserIds);
    if (success) {
      onSuccess();
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedUserIds([]);
    onClose();
  };

  if (!connection) return null;

  const owner = users.find(user => user.id === connection.user_id);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            Gerenciar Acesso
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{connection.name}</p>
        </DialogHeader>

        <div className="space-y-3">
          {/* Owner Info - Compact */}
          {owner && (
            <div className="p-2 rounded-md bg-muted/30 border">
              <div className="flex items-center gap-2">
                <Crown className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium">Proprietário:</span>
                <span className="text-xs">{owner.full_name || owner.email}</span>
              </div>
            </div>
          )}

          {/* Users List - Compact */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Atribuir acesso:</h4>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
              {users
                .filter(user => user.id !== connection.user_id)
                .map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 p-1 rounded hover:bg-muted/50">
                    <Checkbox
                      id={user.id}
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={() => handleUserToggle(user.id)}
                    />
                    <label htmlFor={user.id} className="flex-1 text-xs cursor-pointer">
                      {user.full_name || user.email}
                    </label>
                    <Badge variant="outline" className="text-[10px] px-1">
                      {user.role}
                    </Badge>
                  </div>
                ))}
              {users.filter(user => user.id !== connection.user_id).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Nenhum usuário disponível
                </p>
              )}
            </div>
          </div>

          {/* Selected Count - Compact */}
          <div className="text-xs text-muted-foreground">
            {selectedUserIds.length} usuário(s) com acesso
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};