import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  Mail,
  Instagram,
  User,
  Calendar,
  Clock,
  MessageCircle,
  Edit,
  MoveRight,
  Trash2,
  Building,
  DollarSign,
  Target,
} from "lucide-react";
import { CRMDeal } from "@/hooks/useCRMData";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadDetailsDialogProps {
  deal: CRMDeal | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (deal: CRMDeal) => void;
  stageColor: string;
}

export const LeadDetailsDialog: React.FC<LeadDetailsDialogProps> = ({
  deal,
  isOpen,
  onClose,
  onOpenChat,
  stageColor,
}) => {
  if (!deal) return null;

  const handleChatClick = () => {
    onOpenChat(deal);
    onClose();
  };

  const formatValue = (value: string) => {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  };

  const getSourceIcon = (source: string) => {
    if (source.toLowerCase().includes('instagram')) {
      return <Instagram className="h-4 w-4" />;
    }
    if (source.toLowerCase().includes('phone') || source.toLowerCase().includes('telefone')) {
      return <Phone className="h-4 w-4" />;
    }
    return <Mail className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xl font-semibold">{deal.name}</span>
              {deal.company && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {deal.company}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                {formatValue(deal.value)}
              </span>
              <Badge 
                variant="outline" 
                style={{ borderColor: stageColor, color: stageColor }}
              >
                {deal.status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Informações de Contato
            </h3>
            <div className="space-y-2">
              {deal.contact && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{deal.contact}</span>
                </div>
              )}
              {deal.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{deal.email}</span>
                </div>
              )}
              {deal.instagram && (
                <div className="flex items-center gap-2 text-sm">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <span>@{deal.instagram}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Business Information */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Informações do Negócio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deal.agent && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Agente:</strong> {deal.agent}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                {getSourceIcon(deal.source)}
                <span><strong>Fonte:</strong> {deal.source}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span><strong>Dias no estágio:</strong> {deal.daysInStage}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tags */}
          {deal.tags && deal.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {deal.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Dates */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datas
            </h3>
            <div className="space-y-2 text-sm">
              {deal.created_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Criado:</strong> {formatDistanceToNow(new Date(deal.created_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              )}
              {deal.updated_at && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    <strong>Atualizado:</strong> {formatDistanceToNow(new Date(deal.updated_at), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={handleChatClick}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <MoveRight className="h-4 w-4" />
              Mover
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};