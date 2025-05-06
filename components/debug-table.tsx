"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Download } from "lucide-react"
import type { ProcessedFile } from "@/types/file-types"

interface DebugTableProps {
  file: ProcessedFile
}

export function DebugTable({ file }: DebugTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showRawData, setShowRawData] = useState(false)

  // Função para exportar dados como CSV
  const exportAsCSV = () => {
    // Obter os dados do arquivo
    const data = file.data

    // Obter os cabeçalhos (chaves do primeiro objeto)
    const headers = Object.keys(data[0]).join(",")

    // Converter cada linha para CSV
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => {
          // Se for string com vírgula, colocar entre aspas
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`
          }
          // Se for objeto ou array, converter para JSON
          if (typeof value === "object") {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`
          }
          return value
        })
        .join(","),
    )

    // Juntar cabeçalhos e linhas
    const csv = [headers, ...rows].join("\n")

    // Criar blob e link para download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${file.name.replace(/\s+/g, "_")}_debug.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Verificar se há valores NaN nos dados
  const hasNaNValues = file.data.some((item) => {
    return Object.values(item).some((value) => typeof value === "number" && isNaN(value))
  })

  // Filtrar dados com base no termo de pesquisa
  const filteredData = file.data.filter((item) => {
    return Object.values(item).some((value) => {
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Depuração de Dados
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRawData(!showRawData)}>
              {showRawData ? "Ocultar Dados Brutos" : "Mostrar Dados Brutos"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportAsCSV}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Examine os dados brutos do arquivo para identificar problemas</CardDescription>
      </CardHeader>
      <CardContent>
        {hasNaNValues && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Valores inválidos detectados</AlertTitle>
            <AlertDescription>
              Este arquivo contém valores NaN (Not a Number) que podem causar problemas de exibição. Verifique os dados
              na tabela abaixo.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <Input
            placeholder="Pesquisar em todos os campos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border rounded-md overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Índice</TableHead>
                <TableHead>Nome Cliente</TableHead>
                <TableHead>Código Item</TableHead>
                <TableHead>Valor Comissão</TableHead>
                <TableHead>Tipo Valor</TableHead>
                {showRawData && <TableHead>Dados Brutos</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.slice(0, 100).map((row, index) => (
                <TableRow
                  key={index}
                  className={
                    typeof row.valor_comissao_total === "number" && isNaN(row.valor_comissao_total) ? "bg-amber-50" : ""
                  }
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.nome_clifor}</TableCell>
                  <TableCell>{row.codigo_item}</TableCell>
                  <TableCell>
                    {typeof row.valor_comissao_total === "number" && isNaN(row.valor_comissao_total) ? (
                      <span className="text-amber-600 font-medium">NaN (Valor Inválido)</span>
                    ) : (
                      new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(row.valor_comissao_total)
                    )}
                  </TableCell>
                  <TableCell>{typeof row.valor_comissao_total}</TableCell>
                  {showRawData && (
                    <TableCell>
                      <pre className="text-xs whitespace-pre-wrap max-w-xs overflow-auto">
                        {JSON.stringify(row.rawData || row, null, 2)}
                      </pre>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredData.length > 100 && (
            <div className="p-4 text-center text-muted-foreground">
              Mostrando 100 de {filteredData.length} registros
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
