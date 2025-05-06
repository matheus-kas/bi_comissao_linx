"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ProcessedFile } from "@/types/file-types"

interface FileListProps {
  files: ProcessedFile[]
  selectedFileId: string | null
  onSelectFile: (fileId: string) => void
  onDeleteFile: (fileId: string) => void
}

export function FileList({ files, selectedFileId, onSelectFile, onDeleteFile }: FileListProps) {
  if (files.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">Nenhum arquivo processado</div>
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div
          key={file.id}
          className={`flex items-center justify-between p-3 rounded-md cursor-pointer ${
            selectedFileId === file.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
          onClick={() => onSelectFile(file.id)}
        >
          <div className="truncate">
            <p className="font-medium truncate">{file.name}</p>
            <p className="text-xs truncate">
              {selectedFileId === file.id ? file.period : `${file.summary.clientCount} clientes`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteFile(file.id)
            }}
            className={selectedFileId === file.id ? "hover:bg-primary/90" : "hover:bg-muted/90"}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Excluir</span>
          </Button>
        </div>
      ))}
    </div>
  )
}
