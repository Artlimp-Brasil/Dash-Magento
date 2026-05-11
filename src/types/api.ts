export interface ExecutionStatus {
  ID: number;
  EXEC_TOTAL_EM_ANDAMENTO: "S" | "N";
  DATA_HORA: string;
}

export interface ExecutionHistory {
  ID_EXEC: number;
  INICIO_ATUALIZACAO: string;
  FIM_ATUALIZACAO: string | null;
  TOTAL_REGISTRO: number;
  TOTAL_ATUALIZADO: number;
}

export interface ExecutionItem {
  ID_ITEM: number;
  ID_EXEC: number;
  SKU: string;
  TIPO_ATUALIZACAO: "PRECO" | "ESTOQUE";
  VALOR_ATUAL: number;
  DT_IDENTIFICACAO: string;
  STATUS_ENVIO: "ENVIADO" | "ERRO";
  MENSAGEM_RETORNO: string;
}

export interface ApiError {
  message: string;
  status?: number;
}