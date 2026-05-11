import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, X, Package, TrendingUp, AlertTriangle, CheckCircle, Search, Download, Filter } from "lucide-react";
import * as XLSX from 'xlsx';
import { ExecutionItem } from "@/types/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ApiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface ExecutionDetailsModalProps {
  executionId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutionDetailsModal({ executionId, isOpen, onClose }: ExecutionDetailsModalProps) {
  const [items, setItems] = useState<ExecutionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchSKU, setSearchSKU] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    if (executionId && isOpen) {
      loadExecutionItems();
    }
  }, [executionId, isOpen]);

  const loadExecutionItems = async () => {
    if (!executionId) return;

    setIsLoading(true);
    try {
      const data = await ApiService.getExecutionItems(executionId);
      setItems(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os itens da execução",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const formatValue = (value: number, type: string) => {
    if (type === "PRECO") {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value);
    }
    return value.toLocaleString("pt-BR");
  };

  // Reset pagination when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  // Reset filters and pagination when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchSKU("");
      setStatusFilter("all");
      setTypeFilter("all");
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Filter and paginate items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSKU = searchSKU ? item.SKU.toLowerCase().includes(searchSKU.toLowerCase()) : true;
      const matchesStatus = statusFilter === "all" ? true : 
        statusFilter === "success" ? item.STATUS_ENVIO === "ENVIADO" :
        statusFilter === "error" ? item.STATUS_ENVIO === "ERRO" : true;
      const matchesType = typeFilter === "all" ? true : item.TIPO_ATUALIZACAO === typeFilter;
      
      return matchesSKU && matchesStatus && matchesType;
    });
  }, [items, searchSKU, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const successCount = items.filter(item => item.STATUS_ENVIO === "ENVIADO").length;
  const errorCount = items.filter(item => item.STATUS_ENVIO === "ERRO").length;
  const successRate = items.length > 0 ? Math.round((successCount / items.length) * 100) : 0;

  const exportToExcel = () => {
    const dataToExport = filteredItems.map(item => ({
      'ID Item': item.ID_ITEM,
      'SKU': item.SKU,
      'Tipo Atualização': item.TIPO_ATUALIZACAO,
      'Valor Atual': item.TIPO_ATUALIZACAO === "PRECO" ? 
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.VALOR_ATUAL) :
        item.VALOR_ATUAL.toLocaleString("pt-BR"),
      'Data Identificação': formatDateTime(item.DT_IDENTIFICACAO),
      'Status Envio': item.STATUS_ENVIO,
      'Mensagem Retorno': item.MENSAGEM_RETORNO
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Execução ${executionId}`);
    
    // Auto-size columns
    const colWidths = Object.keys(dataToExport[0] || {}).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;
    
    XLSX.writeFile(workbook, `execucao_${executionId}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Exportação concluída",
      description: "Dados exportados para Excel com sucesso",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gradient-card border-border shadow-glow flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Detalhes da Execução #{executionId}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">Carregando itens...</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-info" />
                  <span className="text-sm text-muted-foreground">Total Itens</span>
                </div>
                <p className="text-2xl font-semibold text-foreground">{items.length}</p>
              </div>
              
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm text-muted-foreground">Sucessos</span>
                </div>
                <p className="text-2xl font-semibold text-success">{successCount}</p>
              </div>
              
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-muted-foreground">Erros</span>
                </div>
                <p className="text-2xl font-semibold text-destructive">{errorCount}</p>
              </div>
              
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Taxa Sucesso</span>
                </div>
                <p className="text-2xl font-semibold text-primary">{successRate}%</p>
              </div>
            </div>

            {/* Filters and Export */}
            <div className="flex flex-col md:flex-row gap-4 p-4 bg-background/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por SKU..."
                  value={searchSKU}
                  onChange={(e) => setSearchSKU(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="success">Sucessos</SelectItem>
                    <SelectItem value="error">Erros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Tipos</SelectItem>
                    <SelectItem value="PRECO">Preço</SelectItem>
                    <SelectItem value="ESTOQUE">Estoque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={exportToExcel} 
                variant="outline" 
                size="sm"
                disabled={filteredItems.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar Excel
              </Button>
            </div>

            {/* Results Info */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                Exibindo {paginatedItems.length} de {filteredItems.length} itens 
                {filteredItems.length !== items.length && ` (filtrados de ${items.length} total)`}
              </span>
              {totalPages > 1 && (
                <span>Página {currentPage} de {totalPages}</span>
              )}
            </div>

            {/* Items Table */}
            <div className="flex-1 overflow-auto min-h-0">
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground min-w-[120px]">SKU</TableHead>
                      <TableHead className="text-muted-foreground min-w-[100px]">Tipo</TableHead>
                      <TableHead className="text-muted-foreground min-w-[130px]">Valor Atual</TableHead>
                      <TableHead className="text-muted-foreground min-w-[160px]">Data Identificação</TableHead>
                      <TableHead className="text-muted-foreground min-w-[100px]">Status</TableHead>
                      <TableHead className="text-muted-foreground min-w-[200px]">Mensagem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedItems.map((item) => (
                      <TableRow key={item.ID_ITEM} className="border-border hover:bg-muted/50">
                        <TableCell className="font-mono text-foreground">
                          <div className="max-w-[120px] truncate" title={item.SKU}>
                            {item.SKU}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-info/20 text-info border-info/30 whitespace-nowrap">
                            {item.TIPO_ATUALIZACAO}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="max-w-[130px] truncate" title={formatValue(item.VALOR_ATUAL, item.TIPO_ATUALIZACAO)}>
                            {formatValue(item.VALOR_ATUAL, item.TIPO_ATUALIZACAO)}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="max-w-[160px] truncate" title={formatDateTime(item.DT_IDENTIFICACAO)}>
                            {formatDateTime(item.DT_IDENTIFICACAO)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              item.STATUS_ENVIO === "ENVIADO"
                                ? "bg-success/20 text-success border-success/30 whitespace-nowrap"
                                : "bg-destructive/20 text-destructive border-destructive/30 whitespace-nowrap"
                            }
                          >
                            {item.STATUS_ENVIO}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="max-w-[200px] truncate" title={item.MENSAGEM_RETORNO}>
                            {item.MENSAGEM_RETORNO}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center flex-shrink-0 pt-4 border-t border-border">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, current page and neighbors, last page
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <PaginationItem key={page}>
                            <span className="px-3 py-2">...</span>
                          </PaginationItem>
                        );
                      }
                      
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {filteredItems.length === 0 && items.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum item encontrado com os filtros aplicados.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSearchSKU("");
                    setStatusFilter("all");
                    setTypeFilter("all");
                  }}
                  className="mt-2"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}

            {items.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum item encontrado para esta execução.</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}