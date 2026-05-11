import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { StatusCard } from "@/components/StatusCard";
import { StatsCards } from "@/components/StatsCards";
import { FilterSection } from "@/components/FilterSection";
import { ExecutionTable } from "@/components/ExecutionTable";
import { ExecutionDetailsModal } from "@/components/ExecutionDetailsModal";
import { Activity, Database } from "lucide-react";
import { ExecutionStatus, ExecutionHistory } from "@/types/api";
import { format, subDays } from "date-fns";
import ApiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus | null>(null);
  const [executions, setExecutions] = useState<ExecutionHistory[]>([]);
  const [selectedExecutionId, setSelectedExecutionId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [isExecutionsLoading, setIsExecutionsLoading] = useState(false);
  const [statusError, setStatusError] = useState<string>("");
  const [executionsError, setExecutionsError] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    loadExecutionStatus();
    // Load initial executions for the last 7 days
    const startDate = format(subDays(new Date(), 7), "yyyy-MM-dd");
    const endDate = format(new Date(), "yyyy-MM-dd");
    loadExecutions(startDate, endDate);
  }, []);

  const loadExecutionStatus = async () => {
    setIsStatusLoading(true);
    setStatusError("");
    try {
      const data = await ApiService.getExecutionStatus();
      setExecutionStatus(data);
    } catch (error) {
      setStatusError("Erro ao carregar status da execução");
      toast({
        title: "Erro ao carregar status",
        description: "Não foi possível carregar o status da execução atual",
        variant: "destructive",
      });
    } finally {
      setIsStatusLoading(false);
    }
  };

  const loadExecutions = async (startDate: string, endDate: string) => {
    setIsExecutionsLoading(true);
    setExecutionsError("");
    try {
      const data = await ApiService.getExecutionHistory(startDate, endDate);
      setExecutions(data);
      toast({
        title: "Dados atualizados",
        description: `${data.length} execuções carregadas com sucesso`,
      });
    } catch (error) {
      setExecutionsError("Erro ao carregar histórico de execuções");
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar o histórico de execuções",
        variant: "destructive",
      });
    } finally {
      setIsExecutionsLoading(false);
    }
  };

  const handleViewDetails = (executionId: number) => {
    setSelectedExecutionId(executionId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExecutionId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-gradient-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
              <Database className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard de Atualizações Magento</h1>
              <p className="text-muted-foreground">Monitoramento em tempo real das atualizações</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Status Section */}
        <section>
          <StatusCard 
            status={executionStatus}
            isLoading={isStatusLoading}
            error={statusError}
          />
        </section>

        {/* Statistics Cards */}
        <section>
          <StatsCards executions={executions} />
        </section>

        {/* Filters */}
        <section>
          <FilterSection onFilter={loadExecutions} isLoading={isExecutionsLoading} />
        </section>

        {/* Executions Table */}
        <section>
          <ExecutionTable
            executions={executions}
            isLoading={isExecutionsLoading}
            error={executionsError}
            onViewDetails={handleViewDetails}
          />
        </section>

        {/* Execution Details Modal */}
        <ExecutionDetailsModal
          executionId={selectedExecutionId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </main>

      <Toaster />
    </div>
  );
};

export default Index;
