import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Loader2 } from "lucide-react";
import { ExecutionHistory } from "@/types/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ExecutionTableProps {
  executions: ExecutionHistory[];
  isLoading: boolean;
  error?: string;
  onViewDetails: (executionId: number) => void;
}

export function ExecutionTable({ executions, isLoading, error, onViewDetails }: ExecutionTableProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Histórico de Execuções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-muted-foreground">Carregando execuções...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-gradient-card border-destructive/20 shadow-card">
        <CardHeader>
          <CardTitle className="text-foreground">Histórico de Execuções</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const calculatePercentage = (updated: number, total: number) => {
    return total > 0 ? Math.round((updated / total) * 100) : 0;
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">Histórico de Execuções</CardTitle>
      </CardHeader>
      <CardContent>
        {executions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma execução encontrada para o período selecionado.</p>
          </div>
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">ID Execução</TableHead>
                  <TableHead className="text-muted-foreground">Início</TableHead>
                  <TableHead className="text-muted-foreground">Fim</TableHead>
                  <TableHead className="text-muted-foreground">Total Registros</TableHead>
                  <TableHead className="text-muted-foreground">Total Atualizados</TableHead>
                  <TableHead className="text-muted-foreground">% Atualizado</TableHead>
                  <TableHead className="text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {executions.map((execution) => {
                  const percentage = calculatePercentage(execution.TOTAL_ATUALIZADO, execution.TOTAL_REGISTRO);
                  const isInProgress = !execution.FIM_ATUALIZACAO;
                  
                  return (
                    <TableRow key={execution.ID_EXEC} className="border-border hover:bg-muted/50">
                      <TableCell className="font-medium text-foreground">
                        {execution.ID_EXEC}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(execution.INICIO_ATUALIZACAO)}
                      </TableCell>
                      <TableCell>
                        {isInProgress ? (
                          <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                            Em andamento
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            {formatDateTime(execution.FIM_ATUALIZACAO)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {execution.TOTAL_REGISTRO.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {execution.TOTAL_ATUALIZADO.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={
                            percentage >= 80 
                              ? "bg-success/20 text-success border-success/30"
                              : percentage >= 50
                              ? "bg-warning/20 text-warning border-warning/30"
                              : "bg-destructive/20 text-destructive border-destructive/30"
                          }
                        >
                          {percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(execution.ID_EXEC)}
                          className="text-primary hover:text-primary-foreground hover:bg-primary/20"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}