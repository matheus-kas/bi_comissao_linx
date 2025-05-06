import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import { getFilePath } from "@/lib/file-storage"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  const filename = params.filename
  const filePath = getFilePath(filename)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 })
  }

  const fileBuffer = fs.readFileSync(filePath)

  // Determinar o tipo MIME com base na extensão
  const contentType = filename.endsWith(".xlsx")
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "application/vnd.ms-excel"

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}

export async function DELETE(request: NextRequest, { params }: { params: { filename: string } }) {
  const filename = params.filename
  const filePath = getFilePath(filename)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 })
  }

  try {
    fs.unlinkSync(filePath)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir arquivo:", error)
    return NextResponse.json({ error: "Falha ao excluir o arquivo" }, { status: 500 })
  }
}
