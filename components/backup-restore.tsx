"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, Upload, AlertCircle } from "lucide-react"
import { exportAllData, importData, clearAllData } from "@/lib/file-storage"

export function BackupRestore() {
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    setIsExporting(true)

    try {
      // Exportar todos os dados
      const jsonData = exportAllData()

      // Criar blob e link para download
      const blob = new Blob([jsonData], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `analisador_comissoes_backup_${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsExporting(false)
    } catch (error) {
      console.error("Erro ao exportar dados:", error)
      setIsExporting(false)
    }
  }

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportError(null)
    setImportSuccess(false)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string
        const success = importData(jsonData)

        if (success) {
          setImportSuccess(true)
          // Recarregar a página após 1 segundo para refletir os dados importados
          setTimeout(() => {
            window.location.reload()
          }, 1000)
        } else {
          setImportError("Formato de arquivo inválido")
        }
      } catch (error) {
        console.error("Erro ao importar dados:", error)
        setImportError("Erro ao processar o arquivo")
      } finally {
        setIsImporting(false)
      }
    }

    reader.onerror = () => {
      setImportError("Erro ao ler o arquivo")
      setIsImporting(false)
    }

    reader.readAsText(file)
  }

  const handleClearData = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      clearAllData()
      // Recarregar a página após limpar os dados
      window.location.reload()
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Backup e Restauração
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Backup e Restauração</DialogTitle>
          <DialogDescription>Exporte seus dados para backup ou restaure a partir de um arquivo</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="backup">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="restore">Restauração</TabsTrigger>
          </TabsList>

          <TabsContent value="backup" className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Exporte todos os seus dados para um arquivo JSON que pode ser usado para restauração futura.
            </p>
            <Button onClick={handleExport} disabled={isExporting} className="w-full">
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Exportar Dados
                </>
              )}
            </Button>

            <div className="mt-4">
              <Button variant="destructive" onClick={handleClearData} className="w-full">
                Limpar Todos os Dados
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Atenção: Esta ação irá remover todos os dados e não pode ser desfeita.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="restore" className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Restaure seus dados a partir de um arquivo de backup JSON exportado anteriormente.
            </p>

            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />

            <Button onClick={handleImportClick} disabled={isImporting} className="w-full">
              {isImporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar Arquivo
                </>
              )}
            </Button>

            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            {importSuccess && (
              <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
                <AlertTitle>Sucesso</AlertTitle>
                <AlertDescription>Dados importados com sucesso! Recarregando a página...</AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Nota: A restauração substituirá todos os dados atuais. Faça um backup antes de restaurar.
            </p>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            variant="outline"
            type="button"
            onClick={() => document.querySelector<HTMLButtonElement>('[data-state="closed"]')?.click()}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
