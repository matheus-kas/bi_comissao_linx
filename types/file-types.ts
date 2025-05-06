export interface CommissionData {
  id: string
  nome_clifor: string
  cnpj_cliente: string
  codigo_item: string
  valor_comissao_total: number
  percent_comissao_item_contrato: number
  emissao: string
  fatura: string
  valor_recebido_total: number
  contato: string
  clifor_cliente: string
  vencimento_real: string
  taxa_imposto: number
  valor_imposto: number
  valor_a_pagar_sem_imposto: number
  valor_menos_imposto: number
  rawData?: any
}

export interface FileSummary {
  totalCommission: number
  clientCount: number
  productCount: number
  avgCommission: number
  recordCount: number
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
  storedFilename?: string // Nome do arquivo no servidor (se implementado)
}

export interface ComparisonResult {
  clientData: any[]
  productData: any[]
  summary: {
    totalCommission1: number
    totalCommission2: number
    totalDifference: number
    totalPercentChange: number
    uniqueClientsFile1: number
    uniqueClientsFile2: number
    uniqueProductsFile1: number
    uniqueProductsFile2: number
  }
}

export interface EvolutionDataPoint {
  name: string
  period: string
  fileName: string
  totalCommission: number
  clientCount: number
  productCount: number
}

export interface ClientEvolutionData {
  name: string
  total: number
  [period: string]: number | string
}
