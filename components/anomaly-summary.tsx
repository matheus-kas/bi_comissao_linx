"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, AlertCircle, AlertOctagon } from "lucide-react"
import { detectAllAnomalies } from "@/lib/anomaly-detection"
import type { ProcessedFile } from "@/types/file-types"
import Link from "next/link"

interface AnomalySummaryProps {
  file: ProcessedFile
}

export function AnomalySummary({ file }: AnomalySummaryProps) {
  // Detectar anomalias
  const anomalies = useMemo(() => {
    if (!file || !file.data) return []
    return detectAllAnomalies(file.data)
  }, [file])

  // Agrupar por severidade
  const anomaliesBySeverity = useMemo(() => {
    const high = anomalies.filter((a) => a.severity === "high")
    const medium = anomalies.filter((a) => a.severity === "medium")
    const low = anomalies.filter((a) => a.severity === "low")

    return { high, medium, low }
  }, [anomalies])

  // Agrupar por tipo
  const anomaliesByType = useMemo(() => {
    const clients = anomalies.filter((a) => a.entityType === "client")
    const products = anomalies.filter((a) => a.entityType === "product" && a.metric === "valor_comissao_total")
    const percentages = anomalies.filter((a) => a.metric === "percent_comissao_item_contrato")

    return { clients, products, percentages }
  }, [anomalies])

  if (anomalies.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <span>Anomalias Detectadas</span>
        </CardTitle>
        <CardDescription>Foram encontradas {anomalies.length} anomalias nos dados de comissão</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
            <AlertOctagon className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Alta Severidade</p>
              <p className="text-2xl font-bold text-red-600">{anomaliesBySeverity.high.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Média Severidade</p>
              <p className="text-2xl font-bold text-amber-600">{anomaliesBySeverity.medium.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <AlertCircle className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Baixa Severidade</p>
              <p className="text-2xl font-bold text-blue-600">{anomaliesBySeverity.low.length}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {anomaliesBySeverity.high.length > 0 && (
            <div className="p-3 border rounded-md bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
              <p className="font-medium text-red-800 dark:text-red-300 mb-1">Anomalias de Alta Severidade:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {anomaliesBySeverity.high.slice(0, 3).map((anomaly, index) => (
                  <li key={index} className="text-red-700 dark:text-red-400">
                    {anomaly.entityType === "client" ? "Cliente" : "Produto"} <strong>{anomaly.entityName}</strong>:{" "}
                    {anomaly.description}
                  </li>
                ))}
                {anomaliesBySeverity.high.length > 3 && (
                  <li className="text-red-700 dark:text-red-400">
                    E mais {anomaliesBySeverity.high.length - 3} anomalias...
                  </li>
                )}
              </ul>
            </div>
          )}

          {anomaliesBySeverity.medium.length > 0 && (
            <div className="p-3 border rounded-md bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
              <p className="font-medium text-amber-800 dark:text-amber-300 mb-1">Anomalias de Média Severidade:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {anomaliesBySeverity.medium.slice(0, 2).map((anomaly, index) => (
                  <li key={index} className="text-amber-700 dark:text-amber-400">
                    {anomaly.entityType === "client" ? "Cliente" : "Produto"} <strong>{anomaly.entityName}</strong>:{" "}
                    {anomaly.description}
                  </li>
                ))}
                {anomaliesBySeverity.medium.length > 2 && (
                  <li className="text-amber-700 dark:text-amber-400">
                    E mais {anomaliesBySeverity.medium.length - 2} anomalias...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <Button asChild>
            <Link href={`/audit?file=${file.id}&tab=anomalies`}>Ver Análise Completa</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
