import { NextResponse } from "next/server"
import { listFiles, getFilePath } from "@/lib/file-storage"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const files = listFiles()

    // Obter informações detalhadas de cada arquivo
    const fileDetails = files.map((filename) => {
      const filePath = getFilePath(filename)
      const stats = fs.statSync(filePath)

      return {
        filename,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        extension: path.extname(filename),
      }
    })

    return NextResponse.json({ files: fileDetails })
  } catch (error) {
    console.error("Erro ao listar arquivos:", error)
    return NextResponse.json({ error: "Falha ao listar arquivos" }, { status: 500 })
  }
}
