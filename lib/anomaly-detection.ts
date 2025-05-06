/**
 * Biblioteca de funções para detecção de anomalias em dados de comissão
 */

import type { CommissionData } from "@/types/file-types"

// Interface para anomalias detectadas
export interface Anomaly {
  id: string
  entityId: string
  entityName: string
  entityType: "client" | "product" | "invoice"
  value: number
  expectedRange: {
    min: number
    max: number
  }
  deviationPercentage: number
  severity: "low" | "medium" | "high"
  metric: string
  description: string
}

/**
 * Detecta anomalias usando o método Z-score (desvio padrão)
 * @param data Array de valores numéricos
 * @param threshold Número de desvios padrão para considerar como anomalia (padrão: 2.5)
 * @returns Índices dos valores considerados anômalos
 */
export function detectAnomaliesByZScore(data: number[], threshold = 2.5): number[] {
  // Calcular média
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length

  // Calcular desvio padrão
  const squareDiffs = data.map((value) => {
    const diff = value - mean
    return diff * diff
  })
  const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length
  const stdDev = Math.sqrt(avgSquareDiff)

  // Se o desvio padrão for muito pequeno, evitar divisão por valores próximos a zero
  if (stdDev < 0.0001) return []

  // Encontrar anomalias
  return data.reduce<number[]>((anomalies, value, index) => {
    const zScore = Math.abs((value - mean) / stdDev)
    if (zScore > threshold) {
      anomalies.push(index)
    }
    return anomalies
  }, [])
}

/**
 * Detecta anomalias usando o método IQR (Intervalo Interquartil)
 * @param data Array de valores numéricos
 * @param iqrMultiplier Multiplicador do IQR para definir limites (padrão: 1.5)
 * @returns Índices dos valores considerados anômalos
 */
export function detectAnomaliesByIQR(data: number[], iqrMultiplier = 1.5): number[] {
  // Ordenar dados
  const sortedData = [...data].sort((a, b) => a - b)

  // Calcular quartis
  const q1Index = Math.floor(sortedData.length * 0.25)
  const q3Index = Math.floor(sortedData.length * 0.75)
  const q1 = sortedData[q1Index]
  const q3 = sortedData[q3Index]

  // Calcular IQR
  const iqr = q3 - q1

  // Definir limites
  const lowerBound = q1 - iqr * iqrMultiplier
  const upperBound = q3 + iqr * iqrMultiplier

  // Encontrar anomalias
  return data.reduce<number[]>((anomalies, value, index) => {
    if (value < lowerBound || value > upperBound) {
      anomalies.push(index)
    }
    return anomalies
  }, [])
}

/**
 * Detecta anomalias em comissões de clientes
 * @param data Dados de comissão
 * @param method Método de detecção ('zscore' ou 'iqr')
 * @returns Lista de anomalias detectadas
 */
export function detectClientAnomalies(data: CommissionData[], method: "zscore" | "iqr" = "zscore"): Anomaly[] {
  // Agrupar dados por cliente
  const clientMap = new Map<
    string,
    {
      total: number
      count: number
      values: number[]
      name: string
    }
  >()

  data.forEach((item) => {
    const clientId = item.cnpj_cliente || item.nome_clifor
    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        total: 0,
        count: 0,
        values: [],
        name: item.nome_clifor,
      })
    }

    const client = clientMap.get(clientId)!
    client.total += item.valor_comissao_total
    client.count += 1
    client.values.push(item.valor_comissao_total)
  })

  // Extrair totais de comissão por cliente
  const clientIds = Array.from(clientMap.keys())
  const clientTotals = clientIds.map((id) => clientMap.get(id)!.total)

  // Detectar anomalias
  const anomalyIndices =
    method === "zscore" ? detectAnomaliesByZScore(clientTotals) : detectAnomaliesByIQR(clientTotals)

  // Calcular estatísticas para todos os clientes
  const allTotals = Array.from(clientMap.values()).map((c) => c.total)
  const mean = allTotals.reduce((sum, val) => sum + val, 0) / allTotals.length
  const sortedTotals = [...allTotals].sort((a, b) => a - b)
  const q1 = sortedTotals[Math.floor(sortedTotals.length * 0.25)]
  const q3 = sortedTotals[Math.floor(sortedTotals.length * 0.75)]
  const iqr = q3 - q1

  // Criar objetos de anomalia
  return anomalyIndices.map((index) => {
    const clientId = clientIds[index]
    const client = clientMap.get(clientId)!
    const value = client.total

    // Calcular o quanto este valor está fora do esperado
    const deviationFromMean = Math.abs(value - mean)
    const deviationPercentage = (deviationFromMean / mean) * 100

    // Determinar severidade
    let severity: "low" | "medium" | "high" = "low"
    if (deviationPercentage > 200) {
      severity = "high"
    } else if (deviationPercentage > 100) {
      severity = "medium"
    }

    // Determinar faixa esperada
    const min = method === "zscore" ? mean - 2.5 * Math.sqrt(mean) : q1 - 1.5 * iqr
    const max = method === "zscore" ? mean + 2.5 * Math.sqrt(mean) : q3 + 1.5 * iqr

    return {
      id: `client-${clientId}`,
      entityId: clientId,
      entityName: client.name,
      entityType: "client",
      value,
      expectedRange: {
        min: Math.max(0, min),
        max,
      },
      deviationPercentage,
      severity,
      metric: "valor_comissao_total",
      description:
        value > max
          ? `Comissão ${deviationPercentage.toFixed(0)}% acima do esperado`
          : `Comissão ${deviationPercentage.toFixed(0)}% abaixo do esperado`,
    }
  })
}

/**
 * Detecta anomalias em comissões de produtos
 * @param data Dados de comissão
 * @param method Método de detecção ('zscore' ou 'iqr')
 * @returns Lista de anomalias detectadas
 */
export function detectProductAnomalies(data: CommissionData[], method: "zscore" | "iqr" = "zscore"): Anomaly[] {
  // Agrupar dados por produto
  const productMap = new Map<
    string,
    {
      total: number
      count: number
      values: number[]
    }
  >()

  data.forEach((item) => {
    const productId = item.codigo_item
    if (!productMap.has(productId)) {
      productMap.set(productId, { total: 0, count: 0, values: [] })
    }

    const product = productMap.get(productId)!
    product.total += item.valor_comissao_total
    product.count += 1
    product.values.push(item.valor_comissao_total)
  })

  // Extrair totais de comissão por produto
  const productIds = Array.from(productMap.keys())
  const productTotals = productIds.map((id) => productMap.get(id)!.total)

  // Detectar anomalias
  const anomalyIndices =
    method === "zscore" ? detectAnomaliesByZScore(productTotals) : detectAnomaliesByIQR(productTotals)

  // Calcular estatísticas para todos os produtos
  const allTotals = Array.from(productMap.values()).map((p) => p.total)
  const mean = allTotals.reduce((sum, val) => sum + val, 0) / allTotals.length
  const sortedTotals = [...allTotals].sort((a, b) => a - b)
  const q1 = sortedTotals[Math.floor(sortedTotals.length * 0.25)]
  const q3 = sortedTotals[Math.floor(sortedTotals.length * 0.75)]
  const iqr = q3 - q1

  // Criar objetos de anomalia
  return anomalyIndices.map((index) => {
    const productId = productIds[index]
    const product = productMap.get(productId)!
    const value = product.total

    // Calcular o quanto este valor está fora do esperado
    const deviationFromMean = Math.abs(value - mean)
    const deviationPercentage = (deviationFromMean / mean) * 100

    // Determinar severidade
    let severity: "low" | "medium" | "high" = "low"
    if (deviationPercentage > 200) {
      severity = "high"
    } else if (deviationPercentage > 100) {
      severity = "medium"
    }

    // Determinar faixa esperada
    const min = method === "zscore" ? mean - 2.5 * Math.sqrt(mean) : q1 - 1.5 * iqr
    const max = method === "zscore" ? mean + 2.5 * Math.sqrt(mean) : q3 + 1.5 * iqr

    return {
      id: `product-${productId}`,
      entityId: productId,
      entityName: productId,
      entityType: "product",
      value,
      expectedRange: {
        min: Math.max(0, min),
        max,
      },
      deviationPercentage,
      severity,
      metric: "valor_comissao_total",
      description:
        value > max
          ? `Comissão ${deviationPercentage.toFixed(0)}% acima do esperado`
          : `Comissão ${deviationPercentage.toFixed(0)}% abaixo do esperado`,
    }
  })
}

/**
 * Detecta anomalias em percentuais de comissão
 * @param data Dados de comissão
 * @param method Método de detecção ('zscore' ou 'iqr')
 * @returns Lista de anomalias detectadas
 */
export function detectPercentageAnomalies(data: CommissionData[], method: "zscore" | "iqr" = "zscore"): Anomaly[] {
  // Agrupar dados por produto
  const productMap = new Map<
    string,
    {
      percentages: number[]
      values: number[]
      clients: Set<string>
    }
  >()

  data.forEach((item) => {
    const productId = item.codigo_item
    if (!productMap.has(productId)) {
      productMap.set(productId, {
        percentages: [],
        values: [],
        clients: new Set(),
      })
    }

    const product = productMap.get(productId)!
    product.percentages.push(item.percent_comissao_item_contrato)
    product.values.push(item.valor_comissao_total)
    product.clients.add(item.nome_clifor)
  })

  // Filtrar produtos com variação nos percentuais
  const productsWithVariation = Array.from(productMap.entries()).filter(([_, product]) => {
    const uniquePercentages = new Set(product.percentages)
    return uniquePercentages.size > 1
  })

  const anomalies: Anomaly[] = []

  // Analisar cada produto com variação
  productsWithVariation.forEach(([productId, product]) => {
    // Calcular média ponderada pelo valor
    const totalValue = product.values.reduce((sum, val) => sum + val, 0)
    const weightedPercentages = product.percentages.map((percent, i) => percent * (product.values[i] / totalValue))
    const weightedMean = weightedPercentages.reduce((sum, val) => sum + val, 0)

    // Detectar anomalias nos percentuais
    const anomalyIndices =
      method === "zscore"
        ? detectAnomaliesByZScore(product.percentages, 2.0) // Limiar mais baixo para percentuais
        : detectAnomaliesByIQR(product.percentages, 1.2) // Limiar mais baixo para percentuais

    // Adicionar anomalias encontradas
    anomalyIndices.forEach((index) => {
      const percent = product.percentages[index]
      const deviationFromMean = Math.abs(percent - weightedMean)
      const deviationPercentage = (deviationFromMean / weightedMean) * 100

      // Determinar severidade
      let severity: "low" | "medium" | "high" = "low"
      if (deviationPercentage > 50) {
        severity = "high"
      } else if (deviationPercentage > 25) {
        severity = "medium"
      }

      anomalies.push({
        id: `percent-${productId}-${index}`,
        entityId: productId,
        entityName: productId,
        entityType: "product",
        value: percent,
        expectedRange: {
          min: weightedMean * 0.75,
          max: weightedMean * 1.25,
        },
        deviationPercentage,
        severity,
        metric: "percent_comissao_item_contrato",
        description: `Percentual de comissão atípico (${percent.toFixed(2)}% vs média de ${weightedMean.toFixed(2)}%)`,
      })
    })
  })

  return anomalies
}

/**
 * Detecta todas as anomalias nos dados de comissão
 * @param data Dados de comissão
 * @returns Lista de todas as anomalias detectadas
 */
export function detectAllAnomalies(data: CommissionData[]): Anomaly[] {
  const clientAnomalies = detectClientAnomalies(data, "iqr")
  const productAnomalies = detectProductAnomalies(data, "iqr")
  const percentageAnomalies = detectPercentageAnomalies(data, "iqr")

  return [...clientAnomalies, ...productAnomalies, ...percentageAnomalies]
}
