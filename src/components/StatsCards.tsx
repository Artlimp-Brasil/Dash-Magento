import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, CheckCircle, Clock } from "lucide-react";
import { ExecutionHistory } from "@/types/api";

interface StatsCardsProps {
  executions: ExecutionHistory[];
}

export function StatsCards({ executions }: StatsCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayExecutions = executions.filter(exec => {
    const execDate = new Date(exec.INICIO_ATUALIZACAO);
    execDate.setHours(0, 0, 0, 0);
    return execDate.getTime() === today.getTime();
  });

  const totalRecords = executions.reduce((sum, exec) => sum + exec.TOTAL_REGISTRO, 0);
  const totalUpdated = executions.reduce((sum, exec) => sum + exec.TOTAL_ATUALIZADO, 0);
  const successRate = totalRecords > 0 ? Math.round((totalUpdated / totalRecords) * 100) : 0;
  const inProgressCount = executions.filter(exec => !exec.FIM_ATUALIZACAO).length;

  const stats = [
    {
      title: "Execuções Hoje",
      value: todayExecutions.length.toString(),
      icon: Clock,
      color: "info",
      description: "Execuções processadas hoje"
    },
    {
      title: "Total Registros",
      value: totalRecords.toLocaleString(),
      icon: Users,
      color: "primary",
      description: "Registros processados no período"
    },
    {
      title: "Taxa de Sucesso",
      value: `${successRate}%`,
      icon: TrendingUp,
      color: successRate >= 80 ? "success" : successRate >= 50 ? "warning" : "destructive",
      description: "Média geral de atualizações"
    },
    {
      title: "Em Andamento",
      value: inProgressCount.toString(),
      icon: CheckCircle,
      color: inProgressCount > 0 ? "warning" : "success",
      description: "Execuções em processamento"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "success":
        return "text-success bg-success/20 border-success/30";
      case "warning":
        return "text-warning bg-warning/20 border-warning/30";
      case "destructive":
        return "text-destructive bg-destructive/20 border-destructive/30";
      case "info":
        return "text-info bg-info/20 border-info/30";
      default:
        return "text-primary bg-primary/20 border-primary/30";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-gradient-card border-border shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-lg border ${getColorClasses(stat.color)}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}