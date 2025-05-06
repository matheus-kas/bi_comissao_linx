"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { FileUploader } from "@/components/file-uploader"
import { useRouter } from "next/navigation"
import type { ProcessedFile } from "@/types/file-types"

export default function UploadPage() {
  const router = useRouter()

  const handleFileProcessed = (file: ProcessedFile) => {
    // Em um cenário real, isso seria gerenciado por um contexto global ou API
    const existingFiles = localStorage.getItem("processedFiles")
    const files = existingFiles ? JSON.parse(existingFiles) : []
    localStorage.setItem("processedFiles", JSON.stringify([...files, file]))

    // Redirecionar para o dashboard
    router.push("/dashboard")
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload de Arquivo</h1>
          <p className="text-muted-foreground">Faça upload de arquivos Excel com dados de comissão</p>
        </div>

        <FileUploader onFileProcessed={handleFileProcessed} />
      </div>
    </MainLayout>
  )
}
