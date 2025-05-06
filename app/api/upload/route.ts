import { type NextRequest, NextResponse } from "next/server"
import { saveFile } from "@/lib/file-storage"
import { processFile } from "@/lib/file-processor"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Verificar tipo de arquivo
    if (!file.name.endsWith(".xls") && !file.name.endsWith(".xlsx")) {
      return NextResponse.json({ error: "Apenas arquivos Excel (.xls ou .xlsx) são permitidos" }, { status: 400 })
    }

    // Converter o arquivo para Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Salvar o arquivo no servidor
    const savedFilename = await saveFile(buffer, file.name)

    // Processar o arquivo
    const processedData = await processFile(file)

    // Adicionar o nome do arquivo salvo aos dados processados
    processedData.storedFilename = savedFilename

    return NextResponse.json({
      success: true,
      data: processedData,
    })
  } catch (error) {
    console.error("Erro ao processar upload:", error)
    return NextResponse.json({ error: "Falha ao processar o arquivo" }, { status: 500 })
  }
}
