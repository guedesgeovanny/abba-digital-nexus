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

    // Load active users
    const activeUsers = await fetchActiveUsers();
    setUsers(activeUsers);

    // Load current assignments
    const currentAssignments = await getAssignedUsers(connection.id);
    setSelectedUserIds(currentAssignments);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Acesso - {connection.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Owner Info */}
          {owner && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Proprietário
              </h4>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                <span className="text-sm">{owner.full_name || owner.email}</span>
                <Badge variant="outline" className="text-xs">
                  {owner.role}
                </Badge>
              </div>
              <Separator />
            </div>
          )}

          {/* Users List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Atribuir para Usuários</h4>
            <ScrollArea className="h-64 border rounded-md p-2">
              <div className="space-y-2">
                {users
                  .filter(user => user.id !== connection.user_id) // Exclude owner
                  .map((user) => (
                    <div key={user.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox
                        id={user.id}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                      />
                      <label
                        htmlFor={user.id}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span>{user.full_name || user.email}</span>
                          <Badge variant="outline" className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </label>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>

          {/* Selected Count */}
          <div className="text-sm text-muted-foreground">
            {selectedUserIds.length} usuário(s) selecionado(s)
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};