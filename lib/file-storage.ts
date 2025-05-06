import { v4 as uuidv4 } from "uuid"
import type { ProcessedFile } from "@/types/file-types"
import path from "path"
import fs from "fs"

// Chave para armazenamento no localStorage
const STORAGE_KEY = "processedFiles"

// Diretório onde os arquivos serão armazenados (para API routes)
const UPLOAD_DIR = path.join(process.cwd(), "uploads")

// Garantir que o diretório existe
if (typeof window === "undefined" && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// Função para salvar um arquivo processado
export function saveProcessedFile(file: ProcessedFile): void {
  try {
    // Obter arquivos existentes
    const existingFiles = getProcessedFiles()

    // Adicionar novo arquivo
    existingFiles.push(file)

    // Salvar no localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingFiles))
  } catch (error) {
    console.error("Erro ao salvar arquivo processado:", error)
    throw new Error("Não foi possível salvar o arquivo processado")
  }
}

// Função para obter todos os arquivos processados
export function getProcessedFiles(): ProcessedFile[] {
  try {
    const filesJson = localStorage.getItem(STORAGE_KEY)
    return filesJson ? JSON.parse(filesJson) : []
  } catch (error) {
    console.error("Erro ao obter arquivos processados:", error)
    return []
  }
}

// Função para obter um arquivo processado por ID
export function getProcessedFileById(id: string): ProcessedFile | null {
  try {
    const files = getProcessedFiles()
    return files.find((file) => file.id === id) || null
  } catch (error) {
    console.error("Erro ao obter arquivo processado por ID:", error)
    return null
  }
}

// Função para excluir um arquivo processado
export function deleteProcessedFile(id: string): boolean {
  try {
    const files = getProcessedFiles()
    const newFiles = files.filter((file) => file.id !== id)

    if (files.length === newFiles.length) {
      return false // Arquivo não encontrado
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles))
    return true
  } catch (error) {
    console.error("Erro ao excluir arquivo processado:", error)
    return false
  }
}

// Função para atualizar um arquivo processado
export function updateProcessedFile(updatedFile: ProcessedFile): boolean {
  try {
    const files = getProcessedFiles()
    const index = files.findIndex((file) => file.id === updatedFile.id)

    if (index === -1) {
      return false // Arquivo não encontrado
    }

    files[index] = updatedFile
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
    return true
  } catch (error) {
    console.error("Erro ao atualizar arquivo processado:", error)
    return false
  }
}

// Função para salvar o arquivo original (simulação)
export function saveOriginalFile(file: File): string {
  // Em um cenário real, você salvaria o arquivo em um servidor ou serviço de armazenamento
  // Aqui, apenas simulamos o processo retornando um ID único

  const fileId = uuidv4()
  console.log(`Arquivo original ${file.name} seria salvo com ID ${fileId}`)

  return fileId
}

// Função para limpar todos os dados
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY)
}

// Função para exportar todos os dados
export function exportAllData(): string {
  const data = {
    files: getProcessedFiles(),
    exportDate: new Date().toISOString(),
    version: "1.0.0",
  }

  return JSON.stringify(data, null, 2)
}

// Função para importar dados
export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData)

    if (!data.files || !Array.isArray(data.files)) {
      throw new Error("Formato de dados inválido")
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.files))
    return true
  } catch (error) {
    console.error("Erro ao importar dados:", error)
    return false
  }
}

// Funções para API routes
export function saveFile(buffer: Buffer, originalName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = Date.now()
      const filename = `${timestamp}-${originalName.replace(/\s+/g, "_")}`
      const filePath = path.join(UPLOAD_DIR, filename)

      fs.writeFileSync(filePath, buffer)
      resolve(filename)
    } catch (error) {
      reject(error)
    }
  })
}

export function getFilePath(filename: string): string {
  return path.join(UPLOAD_DIR, filename)
}

export function listFiles(): string[] {
  if (typeof window !== "undefined" || !fs.existsSync(UPLOAD_DIR)) return []
  return fs.readdirSync(UPLOAD_DIR)
}
