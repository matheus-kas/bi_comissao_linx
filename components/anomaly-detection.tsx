"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, AlertCircle, AlertOctagon, BarChart4, Users, Package, Percent, Download } from "lucide-react"
import {
  detectAllAnomalies,
  detectClientAnomalies,
  detectProductAnomalies,
  detectPercentageAnomalies,
} from "@/lib/anomaly-detection"
import type { ProcessedFile } from "@/types/file-types"
import { AnomalyChart } from "@/components/anomaly-chart"

interface AnomalyDetectionProps {
  file: ProcessedFile
}

export function AnomalyDetection({ file }: AnomalyDetectionProps) {
  const [detectionMethod, setDetectionMethod] = useState<"zscore" | "iqr">("iqr")
  const [anomalyType, setAnomalyType] = useState<"all" | "client" | "product" | "percentage">("all")
  const [selectedSeverity, setSelectedSeverity] = useState<"all" | "low" | "medium" | "high">("all")

  // Detectar anomalias
  const anomalies = useMemo(() => {
    if (!file || !file.data || !file.data.length) return []

    try {
      switch (anomalyType) {
        case "client":
          return detectClientAnomalies(file.data, detectionMethod)
        case "product":
          return detectProductAnomalies(file.data, detectionMethod)
        case "percentage":
          return detectPercentageAnomalies(file.data, detectionMethod)
        case "all":
        default:
          return detectAllAnomalies(file.data)
      }
    } catch (error) {
      console.error("Erro ao detectar anomalias:", error)
      return []
    }
  }, [file?.id, anomalyType, detectionMethod])

  // Filtrar por severidade
  const filteredAnomalies = useMemo(() => {
    if (selectedSeverity === "all") return anomalies
    return anomalies.filter((anomaly) => anomaly.severity === selectedSeverity)
  }, [anomalies, selectedSeverity])

  // Agrupar anomalias por tipo
  const groupedAnomalies = useMemo(() => {
    const clientAnomalies = filteredAnomalies.filter((a) => a.entityType === "client")
    const productAnomalies = filteredAnomalies.filter(
      (a) => a.entityType === "product" && a.metric === "valor_comissao_total",
    )
    const percentageAnomalies = filteredAnomalies.filter((a) => a.metric === "percent_comissao_item_contrato")

    return {
      clientAnomalies,
      productAnomalies,
      percentageAnomalies,
    }
  }, [filteredAnomalies])

  // Formatar valor monetário
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }, [])

  // Renderizar ícone de severidade
  const renderSeverityIcon = useCallback((severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <AlertOctagon className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "low":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
    }
  }, [])

  // Renderizar badge de severidade
  const renderSeverityBadge = useCallback((severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">Alta</Badge>
      case "medium":
        return (
          <Badge variant="default" className="bg-amber-500">
            Média
          </Badge>
        )
      case "low":
        return <Badge variant="outline">Baixa</Badge>
    }
  }, [])

  // Exportar anomalias para CSV
  const exportToCSV = useCallback(() => {
    if (!file || !filteredAnomalies.length) return

    // Cabeçalhos
    const headers = [
      "Tipo",
      "Nome",
      "Valor",
      "Valor Mínimo Esperado",
      "Valor Máximo Esperado",
      "Desvio (%)",
      "Severidade",
      "Descrição",
    ].join(",")

    // Linhas
    const rows = filteredAnomalies.map((anomaly) =>
      [
        anomaly.entityType === "client" ? "Cliente" : anomaly.entityType === "product" ? "Produto" : "Fatura",
        `"${anomaly.entityName}"`,
        anomaly.metric === "percent_comissao_item_contrato"
          ? `${anomaly.value.toFixed(2)}%`
          : formatCurrency(anomaly.value).replace(/\./g, "").replace(",", "."),
        anomaly.metric === "percent_comissao_item_contrato"
          ? `${anomaly.expectedRange.min.toFixed(2)}%`
          : formatCurrency(anomaly.expectedRange.min).replace(/\./g, "").replace(",", "."),
        anomaly.metric === "percent_comissao_item_contrato"
          ? `${anomaly.expectedRange.max.toFixed(2)}%`
          : formatCurrency(anomaly.expectedRange.max).replace(/\./g, "").replace(",", "."),
        `${anomaly.deviationPercentage.toFixed(2)}`,
        anomaly.severity,
        `"${anomaly.description}"`,
      ].join(","),
    )

    // Criar CSV
    const csv = [headers, ...rows].join("\n")

    // Download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `anomalias_${file.name.replace(/\s+/g, "_")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [file, filteredAnomalies, formatCurrency])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span>Detecção de Anomalias</span>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardTitle>
          <CardDescription>Identificação automática de valores atípicos nos dados de comissão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Método de Detecção</label>
              <Select value={detectionMethod} onValueChange={(value: "zscore" | "iqr") => setDetectionMethod(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Método de detecção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iqr">Intervalo Interquartil (IQR)</SelectItem>
                  <SelectItem value="zscore">Z-Score (Desvio Padrão)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Tipo de Anomalia</label>
              <Select
                value={anomalyType}
                onValueChange={(value: "all" | "client" | "product" | "percentage") => setAnomalyType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de anomalia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Anomalias</SelectItem>
                  <SelectItem value="client">Clientes</SelectItem>
                  <SelectItem value="product">Produtos</SelectItem>
                  <SelectItem value="percentage">Percentuais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Severidade</label>
              <Select
                value={selectedSeverity}
                onValueChange={(value: "all" | "low" | "medium" | "high") => setSelectedSeverity(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Severidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Anomalias em Clientes</p>
                  <p className="text-2xl font-bold">{groupedAnomalies.clientAnomalies.length}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Anomalias em Produtos</p>
                  <p className="text-2xl font-bold">{groupedAnomalies.productAnomalies.length}</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-full">
                  <Package className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Anomalias em Percentuais</p>
                  <p className="text-2xl font-bold">{groupedAnomalies.percentageAnomalies.length}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                  <Percent className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {filteredAnomalies.length > 0 ? (
            <Tabs defaultValue="table">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Tabela</TabsTrigger>
                <TabsTrigger value="chart">Gráfico</TabsTrigger>
              </TabsList>

              <TabsContent value="table">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Faixa Esperada</TableHead>
                        <TableHead>Desvio</TableHead>
                        <TableHead>Severidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAnomalies.map((anomaly) => (
                        <TableRow key={anomaly.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {anomaly.entityType === "client" ? (
                                <Users className="h-4 w-4" />
                              ) : anomaly.entityType === "product" ? (
                                anomaly.metric === "percent_comissao_item_contrato" ? (
                                  <Percent className="h-4 w-4" />
                                ) : (
                                  <Package className="h-4 w-4" />
                                )
                              ) : (
                                <BarChart4 className="h-4 w-4" />
                              )}
                              <span>
                                {anomaly.entityType === "client"
                                  ? "Cliente"
                                  : anomaly.entityType === "product"
                                    ? "Produto"
                                    : "Fatura"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{anomaly.entityName}</TableCell>
                          <TableCell>
                            {anomaly.metric === "percent_comissao_item_contrato"
                              ? `${anomaly.value.toFixed(2)}%`
                              : formatCurrency(anomaly.value)}
                          </TableCell>
                          <TableCell>
                            {anomaly.metric === "percent_comissao_item_contrato"
                              ? `${anomaly.expectedRange.min.toFixed(2)}% - ${anomaly.expectedRange.max.toFixed(2)}%`
                              : `${formatCurrency(anomaly.expectedRange.min)} - ${formatCurrency(
                                  anomaly.expectedRange.max,
                                )}`}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {renderSeverityIcon(anomaly.severity)}
                              <span
                                className={
                                  anomaly.severity === "high"
                                    ? "text-red-600"
                                    : anomaly.severity === "medium"
                                      ? "text-amber-600"
                                      : "text-blue-600"
                                }
                              >
                                {anomaly.deviationPercentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{renderSeverityBadge(anomaly.severity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="chart">
                <AnomalyChart anomalies={filteredAnomalies} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center p-8 border rounded-md bg-muted/20">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-lg font-medium">Nenhuma anomalia detectada</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tente ajustar os parâmetros de detecção ou selecionar outro tipo de anomalia
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
