import { jsPDF } from "jspdf"

export type ProxyPdfQueueItem = {
  previewUrl: string
  copies: number
}

export const PROXY_PDF_FILE_NAME = "dm-proxy-cards.pdf"

export const PROXY_PDF_LAYOUT = {
  pageWidthMm: 210,
  pageHeightMm: 297,
  cardWidthMm: 63,
  cardHeightMm: 88,
  gapMm: 1,
  columns: 3,
  rows: 3,
  contentWidthMm: 191,
  contentHeightMm: 266,
  startXmm: 9.5,
  startYmm: 15.5,
} as const

const CARD_CANVAS_WIDTH_PX = 630
const CARD_CANVAS_HEIGHT_PX = 880
const JPEG_QUALITY = 0.92

const flattenQueue = (queue: ProxyPdfQueueItem[]) => {
  const cardFaces: string[] = []

  for (const item of queue) {
    for (let copy = 0; copy < item.copies; copy += 1) {
      cardFaces.push(item.previewUrl)
    }
  }

  return cardFaces
}

const loadImage = (source: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("カード画像を読み込めませんでした。"))
    image.src = source
  })

const createCoveredCardCanvas = (image: HTMLImageElement) => {
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height

  if (sourceWidth <= 0 || sourceHeight <= 0) {
    throw new Error("カード画像のサイズを取得できませんでした。")
  }

  const targetAspect = PROXY_PDF_LAYOUT.cardWidthMm / PROXY_PDF_LAYOUT.cardHeightMm
  const sourceAspect = sourceWidth / sourceHeight
  const cropWidth = sourceAspect > targetAspect ? sourceHeight * targetAspect : sourceWidth
  const cropHeight = sourceAspect > targetAspect ? sourceHeight : sourceWidth / targetAspect
  const cropX = (sourceWidth - cropWidth) / 2
  const cropY = (sourceHeight - cropHeight) / 2
  const canvas = document.createElement("canvas")

  canvas.width = CARD_CANVAS_WIDTH_PX
  canvas.height = CARD_CANVAS_HEIGHT_PX

  const context = canvas.getContext("2d")
  if (!context) {
    throw new Error("カード画像の描画領域を作成できませんでした。")
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = "high"
  context.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    CARD_CANVAS_WIDTH_PX,
    CARD_CANVAS_HEIGHT_PX,
  )

  return canvas
}

export const generateProxyPdf = async (queue: ProxyPdfQueueItem[]) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("PDFの作成はブラウザでのみ実行できます。")
  }

  const cardFaces = flattenQueue(queue)
  if (cardFaces.length === 0) {
    throw new Error("PDFに書き出すカード画像がありません。")
  }

  const facesPerPage = PROXY_PDF_LAYOUT.columns * PROXY_PDF_LAYOUT.rows
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  })
  const canvasBySource = new Map<string, HTMLCanvasElement>()

  for (let faceIndex = 0; faceIndex < cardFaces.length; faceIndex += 1) {
    if (faceIndex > 0 && faceIndex % facesPerPage === 0) {
      doc.addPage("a4", "portrait")
    }

    const source = cardFaces[faceIndex]
    let canvas = canvasBySource.get(source)
    if (!canvas) {
      const image = await loadImage(source)
      canvas = createCoveredCardCanvas(image)
      canvasBySource.set(source, canvas)
    }

    const positionOnPage = faceIndex % facesPerPage
    const column = positionOnPage % PROXY_PDF_LAYOUT.columns
    const row = Math.floor(positionOnPage / PROXY_PDF_LAYOUT.columns)
    const x = PROXY_PDF_LAYOUT.startXmm + column * (PROXY_PDF_LAYOUT.cardWidthMm + PROXY_PDF_LAYOUT.gapMm)
    const y = PROXY_PDF_LAYOUT.startYmm + row * (PROXY_PDF_LAYOUT.cardHeightMm + PROXY_PDF_LAYOUT.gapMm)

    doc.addImage(
      canvas.toDataURL("image/jpeg", JPEG_QUALITY),
      "JPEG",
      x,
      y,
      PROXY_PDF_LAYOUT.cardWidthMm,
      PROXY_PDF_LAYOUT.cardHeightMm,
      undefined,
      "FAST",
    )
  }

  doc.save(PROXY_PDF_FILE_NAME)
}
