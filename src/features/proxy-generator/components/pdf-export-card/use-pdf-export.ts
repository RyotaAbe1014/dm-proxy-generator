import { useState } from "react"

import { generateProxyPdf } from "@/lib/generate-proxy-pdf"
import type { ProxyPdfQueueItem } from "@/lib/generate-proxy-pdf"

export function usePdfExport(images: ProxyPdfQueueItem[], totalCardFaces: number) {
  const [isExportingPdf, setIsExportingPdf] = useState(false)
  const [pdfExportError, setPdfExportError] = useState<string | null>(null)

  const handleExportPdf = async () => {
    if (isExportingPdf || totalCardFaces === 0) return

    setIsExportingPdf(true)
    setPdfExportError(null)

    try {
      await generateProxyPdf(images)
    } catch (error) {
      console.error("PDF export failed", error)
      setPdfExportError(
        "PDFの作成に失敗しました。画像を読み込めるか確認して、もう一度お試しください。",
      )
    } finally {
      setIsExportingPdf(false)
    }
  }

  return { isExportingPdf, pdfExportError, handleExportPdf }
}
