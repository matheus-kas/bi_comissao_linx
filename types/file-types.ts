export interface CommissionData {
  contato: string
  clifor_cliente: string
  nome_clifor: string
  cnpj_cliente: string
  fatura: string
  codigo_item: string
  emissao: string
  vencimento_real: string
  valor_recebido_total: number
  percent_comissao_item_contrato: number
  valor_comissao_total: number
  taxa_imposto: number
  valor_imposto: number
  valor_a_pagar_sem_imposto: number
  valor_menos_imposto: number
}

export interface FileSummary {
  clientCount: number
  productCount: number
  totalCommission: number
}

export interface ProcessedFile {
  id: string
  name: string
  originalName: string
  size: number
  uploadDate: string
  period: string
  data: CommissionData[]
  summary: FileSummary
}
