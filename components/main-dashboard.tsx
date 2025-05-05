"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileUploader } from "@/components/file-uploader"
import { DataViewer } from "@/components/data-viewer"
import { ComparisonTool } from "@/components/comparison-tool"
import { DataAudit } from "@/components/data-audit"
import { Header } from "@/components/header"
import type { ProcessedFile } from "@/types/file-types"

export function MainDashboard() {
  const [files, setFiles] = useState<ProcessedFile[]>([])
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileProcessed = (newFile: ProcessedFile) => {
    setFiles((prev) => [...prev, newFile])
    setActiveTab("dashboard")
  }

  const handleFileDelete = (fileId: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="dashboard" disabled={files.length === 0}>
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="comparison" disabled={files.length < 2}>
              Comparação
            </TabsTrigger>
            <TabsTrigger value="audit" disabled={files.length === 0}>
              Auditoria
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <FileUploader onFileProcessed={handleFileProcessed} />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-4">
            <DataViewer files={files} onDeleteFile={handleFileDelete} />
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            <ComparisonTool files={files} />
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <DataAudit files={files} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
