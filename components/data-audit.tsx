"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { DataTable } from "@/components/data-table"
import type { ProcessedFile } from "@/types/file-types"

interface DataAuditProps {
  files: ProcessedFile[]
}

export function DataAudit({ files }: DataAuditProps) {
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || "")

  const selectedFile = useMemo(() => {
    return files.find((file) => file.id === selectedFileId) || null
  }, [files, selectedFileId])

  const handleExportCSV = () => {
    if (!selectedFile) return

    // Converter dados para CSV
    const headers = Object.keys(selectedFile.data[0]).join(",")
    const rows = selectedFile.data.map((row) =>
      Object.values(row)
        .map((value) => (typeof value === "string" && value.includes(",") ? `"${value}"` : value))
        .join(","),
    )
    const csv = [headers, ...rows].join("\n")

    // Criar blob e link para download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${selectedFile.name.replace(/\s+/g, "_")}_export.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Auditoria de Dados</CardTitle>
          <CardDescription>Visualize e exporte os dados brutos dos arquivos processados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-64">
              <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um arquivo" />
                </SelectTrigger>
                <SelectContent>
                  {files.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleExportCSV} disabled={!selectedFile}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedFile ? (
        <Card>
          <CardContent className="p-0">
            <DataTable data={selectedFile.data} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Selecione um arquivo para visualizar os dados</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
