import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { ExecutionStatus } from "@/types/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StatusCardProps {
  status: ExecutionStatus | null;
  isLoading: boolean;
  error?: string;
}

export function StatusCard({ status, isLoading, error }: StatusCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-muted-foreground">Carregando status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-card border-destructive/20 shadow-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-destructive">Erro ao carregar status</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) return null;

  const isRunning = status.EXEC_TOTAL_EM_ANDAMENTO === "S";
  const lastUpdate = new Date(status.DATA_HORA);

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRunning ? (
              <Clock className="h-5 w-5 text-warning" />
            ) : (
              <CheckCircle className="h-5 w-5 text-success" />
            )}
            <div>
              <h3 className="font-semibold text-foreground">Status da Execução</h3>
              <p className="text-sm text-muted-foreground">
                Última atualização: {format(lastUpdate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
          <Badge variant={isRunning ? "secondary" : "default"} className={
            isRunning 
              ? "bg-warning/20 text-warning border-warning/30" 
              : "bg-success/20 text-success border-success/30"
          }>
            {isRunning ? "Em Andamento" : "Finalizado"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}