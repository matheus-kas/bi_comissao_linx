"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Bug, Download } from "lucide-react"
import type { ProcessedFile } from "@/types/file-types"

interface DebugDataViewerProps {
  file: ProcessedFile
}

export function DebugDataViewer({ file }: DebugDataViewerProps) {
  const [activeTab, setActiveTab] = useState("raw")

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Visualização de Depuração
          <Button variant="outline" size="sm" onClick={exportAsCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
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
              na aba "Valores Problemáticos".
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="raw">Dados Brutos</TabsTrigger>
            <TabsTrigger value="problems">Valores Problemáticos</TabsTrigger>
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="raw">
            <div className="border rounded-md overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(file.data[0]).map((key) => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {file.data.slice(0, 50).map((row, index) => (
                    <TableRow key={index}>
                      {Object.entries(row).map(([key, value]) => (
                        <TableCell key={key}>
                          {typeof value === "number" && isNaN(value) ? (
                            <span className="text-amber-600 font-medium">NaN</span>
                          ) : typeof value === "object" ? (
                            JSON.stringify(value)
                          ) : (
                            String(value)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {file.data.length > 50 && (
                <div className="p-4 text-center text-muted-foreground">
                  Mostrando 50 de {file.data.length} registros
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="problems">
            <div className="border rounded-md overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Linha</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Problema</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {file.data.flatMap((row, rowIndex) =>
                    Object.entries(row)
                      .filter(
                        ([_, value]) =>
                          (typeof value === "number" && isNaN(value)) || value === null || value === undefined,
                      )
                      .map(([key, value], colIndex) => (
                        <TableRow key={`${rowIndex}-${colIndex}`}>
                          <TableCell>{rowIndex + 1}</TableCell>
                          <TableCell>{key}</TableCell>
                          <TableCell>
                            <span className="text-amber-600 font-medium">
                              {value === null ? "null" : value === undefined ? "undefined" : "NaN"}
                            </span>
                          </TableCell>
                          <TableCell>{typeof value}</TableCell>
                          <TableCell>
                            {value === null
                              ? "Valor nulo"
                              : value === undefined
                                ? "Valor indefinido"
                                : "Não é um número"}
                          </TableCell>
                        </TableRow>
                      )),
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="summary">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Estatísticas do Arquivo</h3>
                  <ul className="space-y-1">
                    <li>
                      <span className="font-medium">Nome:</span> {file.name}
                    </li>
                    <li>
                      <span className="font-medium">Tamanho:</span> {(file.size / 1024).toFixed(2)} KB
                    </li>
                    <li>
                      <span className="font-medium">Data de Upload:</span> {new Date(file.uploadDate).toLocaleString()}
                    </li>
                    <li>
                      <span className="font-medium">Período:</span> {file.period}
                    </li>
                    <li>
                      <span className="font-medium">Total de Registros:</span> {file.data.length}
                    </li>
                  </ul>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Problemas Detectados</h3>
                  <ul className="space-y-1">
                    {hasNaNValues ? (
                      <li className="text-amber-600">
                        <Bug className="h-4 w-4 inline mr-1" />
                        Valores NaN detectados
                      </li>
                    ) : (
                      <li className="text-green-600">Nenhum problema detectado</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Tipos de Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(file.data[0]).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {typeof value}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
