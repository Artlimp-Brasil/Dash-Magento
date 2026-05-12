import { ExecutionStatus, ExecutionHistory, ExecutionItem } from "@/types/api";

const BASE_URL = "https://sistemas.artlimpbrasil.com.br/webhook";
const WEBHOOK_ID = "0f3e2242-727c-4132-bf12-4806ec81b62b";

class ApiService {
  private async fetchData<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API fetch error:", error);
      throw new Error(
        error instanceof Error ? error.message : "Erro desconhecido"
      );
    }
  }

  async getExecutionStatus(): Promise<ExecutionStatus> {
    const data = await this.fetchData<ExecutionStatus[]>(
      `${BASE_URL}/${WEBHOOK_ID}-1`
    );

    return data[0];
  }

  async getExecutionHistory(
    startDate: string,
    endDate: string
  ): Promise<ExecutionHistory[]> {
    const url = `${BASE_URL}/${WEBHOOK_ID}-2?data_inicio=${startDate}&data_fim=${endDate}`;
    return this.fetchData<ExecutionHistory[]>(url);
  }

  async getExecutionItems(executionId: number): Promise<ExecutionItem[]> {
    const url = `${BASE_URL}/${WEBHOOK_ID}-3?id_execucao=${executionId}`;
    return this.fetchData<ExecutionItem[]>(url);
  }
}

export default new ApiService();