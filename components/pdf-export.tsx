"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, FileText, Download } from "lucide-react"
import type { ProcessedFile } from "@/types/file-types"

interface PdfExportProps {
  file: ProcessedFile
}

export function PdfExport({ file }: PdfExportProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [options, setOptions] = useState({
    includeSummary: true,
    includeCharts: true,
    includeTable: true,
    includeHeader: true,
    includeFooter: true,
  })

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Simulação de exportação para PDF
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Em um cenário real, você usaria uma biblioteca como jsPDF ou pdfmake
      // para gerar o PDF com os dados do arquivo

      console.log("Exportando para PDF com opções:", options)
      console.log("Dados do arquivo:", file)

      // Simulação de download
      const blob = new Blob(["Simulação de PDF"], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${file.name.replace(/\s+/g, "_")}_relatorio.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsExporting(false)
    } catch (error) {
      console.error("Erro ao exportar PDF:", error)
      setIsExporting(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Exportar PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar para PDF</DialogTitle>
          <DialogDescription>Selecione as opções para exportar o relatório em PDF</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeSummary"
              checked={options.includeSummary}
              onCheckedChange={(checked) => setOptions({ ...options, includeSummary: checked === true })}
            />
            <Label htmlFor="includeSummary">Incluir resumo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeCharts"
              checked={options.includeCharts}
              onCheckedChange={(checked) => setOptions({ ...options, includeCharts: checked === true })}
            />
            <Label htmlFor="includeCharts">Incluir gráficos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeTable"
              checked={options.includeTable}
              onCheckedChange={(checked) => setOptions({ ...options, includeTable: checked === true })}
            />
            <Label htmlFor="includeTable">Incluir tabela de dados</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeHeader"
              checked={options.includeHeader}
              onCheckedChange={(checked) => setOptions({ ...options, includeHeader: checked === true })}
            />
            <Label htmlFor="includeHeader">Incluir cabeçalho</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeFooter"
              checked={options.includeFooter}
              onCheckedChange={(checked) => setOptions({ ...options, includeFooter: checked === true })}
            />
            <Label htmlFor="includeFooter">Incluir rodapé</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
