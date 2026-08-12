import { useEffect, useRef, useState } from "react"

import {
  ArrowUpRight,
  Check,
  FileOutput,
  ImagePlus,
  Info,
  LockKeyhole,
  Maximize2,
  Minus,
  Plus,
  Printer,
  Sparkles,
  UploadCloud,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

type QueuedImage = {
  id: string
  name: string
  previewUrl: string
  copies: number
}

type Feedback = {
  tone: "error" | "success"
  message: string
}

const isImageFile = (file: File) => file.type.toLowerCase().startsWith("image/")
const MAX_CARD_FACES = 81

const getTotalCardFaces = (images: QueuedImage[]) => images.reduce((total, image) => total + image.copies, 0)

function App() {
  const [images, setImages] = useState<QueuedImage[]>([])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const objectUrlsRef = useRef<Set<string>>(new Set())
  const nextImageIdRef = useRef(1)
  const nextClipboardImageNumberRef = useRef(1)
  const totalCardFaces = getTotalCardFaces(images)

  useEffect(() => {
    return () => {
      for (const url of objectUrlsRef.current) {
        URL.revokeObjectURL(url)
      }
      objectUrlsRef.current.clear()
    }
  }, [])

  const addImageFiles = (files: File[], source: "file" | "clipboard") => {
    const imageFiles = files.filter(isImageFile)
    const rejectedCount = files.length - imageFiles.length
    const availableCardFaces = MAX_CARD_FACES - totalCardFaces
    const acceptedImageFiles = imageFiles.slice(0, availableCardFaces)
    const capacityRejectedCount = imageFiles.length - acceptedImageFiles.length

    if (acceptedImageFiles.length > 0) {
      const newImages = acceptedImageFiles.map((file) => {
        const previewUrl = URL.createObjectURL(file)
        objectUrlsRef.current.add(previewUrl)

        const fileName = file.name.trim()
        const name =
          fileName ||
          (source === "clipboard"
            ? `クリップボード画像 ${nextClipboardImageNumberRef.current++}`
            : "名称未設定の画像")

        return {
          id: `image-${nextImageIdRef.current++}`,
          name,
          previewUrl,
          copies: 1,
        }
      })

      setImages((currentImages) => [...currentImages, ...newImages])
    }

    if (capacityRejectedCount > 0 && acceptedImageFiles.length > 0) {
      setFeedback({
        tone: "error",
        message: `${acceptedImageFiles.length} 件の画像を追加しました。カード面の上限（${MAX_CARD_FACES}枚）のため、${capacityRejectedCount} 件は追加しませんでした。`,
      })
    } else if (capacityRejectedCount > 0) {
      setFeedback({
        tone: "error",
        message: `カード面の上限（${MAX_CARD_FACES}枚）に達しているため、画像を追加できません。枚数を減らすと追加できます。`,
      })
    } else if (rejectedCount > 0 && acceptedImageFiles.length > 0) {
      setFeedback({
        tone: "error",
        message: `${acceptedImageFiles.length} 件の画像を追加しました。${rejectedCount} 件は画像ファイルではないため追加しませんでした。`,
      })
    } else if (rejectedCount > 0) {
      setFeedback({
        tone: "error",
        message: "画像ファイルではないため追加できません。画像を選択してください。",
      })
    } else if (acceptedImageFiles.length > 0) {
      setFeedback({
        tone: "success",
        message: `${acceptedImageFiles.length} 件の画像を追加しました。`,
      })
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    addImageFiles(Array.from(event.target.files ?? []), "file")
    event.target.value = ""
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    addImageFiles(Array.from(event.dataTransfer.files), "file")
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLElement>) => {
    const clipboardItems = Array.from(event.clipboardData.items)
    const imageFiles = clipboardItems
      .filter((item) => item.kind === "file" && item.type.toLowerCase().startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null)

    if (imageFiles.length === 0) {
      setFeedback({
        tone: "error",
        message:
          clipboardItems.length === 0
            ? "クリップボードが空です。画像をコピーして貼り付けてください。"
            : "クリップボードに画像データがありません。画像をコピーして貼り付けてください。",
      })
      return
    }

    event.preventDefault()
    addImageFiles(imageFiles, "clipboard")
  }

  const adjustImageCopies = (imageId: string, delta: number) => {
    const image = images.find((queuedImage) => queuedImage.id === imageId)
    if (!image) return

    const nextCopies = image.copies + delta
    if (nextCopies > 4) return

    if (nextCopies > image.copies && totalCardFaces >= MAX_CARD_FACES) {
      setFeedback({
        tone: "error",
        message: `カード面の上限（${MAX_CARD_FACES}枚）に達しているため、枚数を増やせません。`,
      })
      return
    }

    if (nextCopies < 1) {
      objectUrlsRef.current.delete(image.previewUrl)
      URL.revokeObjectURL(image.previewUrl)
      setImages((currentImages) => currentImages.filter((currentImage) => currentImage.id !== imageId))
      return
    }

    setImages((currentImages) =>
      currentImages.map((currentImage) =>
        currentImage.id === imageId ? { ...currentImage, copies: nextCopies } : currentImage,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-paper text-ink" onPaste={handlePaste}>
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-sky-100/50 blur-3xl" />
      </div>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-8 max-w-2xl">
          <Badge>
            <Sparkles className="mr-1.5 h-3 w-3" />
            かんたん 3 ステップ
          </Badge>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
            カード画像を、<span className="text-brand-600">印刷できる形</span>に。
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            画像を追加して枚数を指定するだけ。実カードサイズに合わせた A4 レイアウトで、プロキシを準備できます。
          </p>
        </section>

        <section aria-labelledby="add-images-heading">
          <Card className="overflow-hidden border-brand-100/80 shadow-card">
            <CardContent className="p-0">
              <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
                <div className="relative p-6 sm:p-8">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <ImagePlus className="h-4 w-4" />
                        </div>
                        <h2 id="add-images-heading" className="text-base font-bold text-slate-900">
                          画像を追加
                        </h2>
                      </div>
                      <p className="mt-2 pl-10 text-xs leading-5 text-slate-500">
                        ドラッグ＆ドロップ、ファイル選択、画像のペーストに対応しています。
                      </p>
                    </div>
                    <Badge variant="success" className="shrink-0">
                      対応済み
                    </Badge>
                  </div>

                  <div
                    className={`relative flex min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${
                      isDragging ? "border-brand-500 bg-brand-100/70" : "border-brand-200 bg-brand-50/35"
                    }`}
                    onDragEnter={(event) => {
                      event.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragOver={(event) => {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = "copy"
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    role="region"
                    aria-label="画像のドロップエリア"
                  >
                    <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(#b8d1ff_0.7px,transparent_0.7px)] [background-size:14px_14px]" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="relative mt-4 text-sm font-semibold text-slate-800">
                      {isDragging ? "ここにドロップ" : "ここにカード画像を追加"}
                    </p>
                    <p className="relative mt-1 text-xs text-slate-500">ドラッグ＆ドロップ / ファイル選択 / ペースト</p>
                    <p className="relative mt-2 text-[11px] font-medium text-slate-400">
                      カード面合計 {totalCardFaces} / {MAX_CARD_FACES} 枚
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="relative mt-5 bg-white"
                      aria-controls="image-file-input"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      画像を選択
                    </Button>
                    <input
                      ref={fileInputRef}
                      id="image-file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleFileChange}
                      tabIndex={-1}
                      aria-label="画像ファイルを選択"
                    />
                    {feedback ? (
                      <p
                        className={`relative mt-3 text-xs font-medium ${
                          feedback.tone === "error" ? "text-rose-600" : "text-emerald-700"
                        }`}
                        role={feedback.tone === "error" ? "alert" : "status"}
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {feedback.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <aside className="flex min-w-[240px] flex-col justify-between border-t border-slate-100 bg-slate-50/70 p-6 lg:w-64 lg:border-l lg:border-t-0">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workflow</p>
                    <ol className="mt-5 space-y-5">
                      <WorkflowStep number="01" label="画像を追加" active />
                      <WorkflowStep number="02" label="枚数を調整" />
                      <WorkflowStep number="03" label="PDFを書き出す" />
                    </ol>
                  </div>
                  <div className="mt-7 flex items-start gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-3 text-[11px] leading-4 text-slate-500">
                    <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>画像はサーバーへ送信されず、このブラウザ内で処理されます。</span>
                  </div>
                </aside>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <Card className="shadow-card">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">カード一覧</CardTitle>
                  <Badge variant="muted">{images.length} 件</Badge>
                </div>
                <CardDescription className="mt-1">
                  各画像のコピー数を 1〜4 枚で調整できます。合計 {MAX_CARD_FACES} カード面まで。
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-slate-400">カード面合計</p>
                <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">
                  {totalCardFaces} <span className="text-xs font-medium text-slate-400">/ {MAX_CARD_FACES} 枚</span>
                </p>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 sm:p-8">
              {images.length > 0 ? (
                <ImageQueue images={images} totalCardFaces={totalCardFaces} onAdjustCopies={adjustImageCopies} />
              ) : (
                <EmptyQueue />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Printer className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">印刷設定</CardTitle>
                    <CardDescription className="mt-0.5">出力レイアウトの概要</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <SettingRow label="用紙" value="A4 / 縦" />
                <SettingRow label="配置" value="3 列 × 3 行" />
                <SettingRow label="カードサイズ" value="63 × 88 mm" />
                <SettingRow label="カード間隔" value="1 mm" />
                <SettingRow label="印刷面" value="片面" />
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex w-full items-start gap-2 rounded-xl bg-brand-50/70 p-3 text-[11px] leading-4 text-brand-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>印刷時は「実際のサイズ」を選択してください。</span>
                </div>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-slate-800 bg-slate-900 text-white shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300">
                    <FileOutput className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">PDF を作成</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {images.length > 0
                        ? "次の工程で枚数を調整すると利用できます。"
                        : "画像を 1 枚以上追加すると利用できます。"}
                    </p>
                  </div>
                </div>
                <Button disabled variant="secondary" size="lg" className="mt-5 w-full bg-white/10 text-slate-500">
                  PDFを書き出す
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200/70 pt-5 text-[11px] font-medium text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>カード画像は端末内でのみ扱われます。</p>
          <p className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            画像追加機能を利用できます
          </p>
        </footer>
      </main>
    </div>
  )
}

function WorkflowStep({ number, label, active = false }: { number: string; label: string; active?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={
          active
            ? "flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-[10px] font-bold text-white"
            : "flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-400"
        }
      >
        {number}
      </span>
      <span className={active ? "text-xs font-semibold text-slate-800" : "text-xs font-medium text-slate-400"}>{label}</span>
    </li>
  )
}

function ImageQueue({
  images,
  totalCardFaces,
  onAdjustCopies,
}: {
  images: QueuedImage[]
  totalCardFaces: number
  onAdjustCopies: (imageId: string, delta: number) => void
}) {
  return (
    <ul className="divide-y divide-slate-100" aria-label="追加した画像の一覧">
      {images.map((image) => (
        <li key={image.id} className="flex flex-col gap-4 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
          <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm">
            <img
              src={image.previewUrl}
              alt={image.name}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800" title={image.name}>
              {image.name}
            </p>
            <p className="mt-1 text-xs text-slate-500">端末内で処理される画像プレビュー</p>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-start">
            <span id={`${image.id}-copies-label`} className="text-xs font-semibold text-slate-500">
              コピー数
            </span>
            <div
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
              role="group"
              aria-labelledby={`${image.id}-copies-label`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg p-0"
                aria-label={`${image.name}のコピー数を1枚減らす（1枚のときは一覧から削除）`}
                onClick={() => onAdjustCopies(image.id, -1)}
              >
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
              <span className="min-w-10 px-2 text-center text-sm font-bold text-slate-800" aria-live="polite">
                {image.copies} 枚
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg p-0"
                aria-label={`${image.name}のコピー数を1枚増やす`}
                disabled={image.copies >= 4 || totalCardFaces >= MAX_CARD_FACES}
                onClick={() => onAdjustCopies(image.id, 1)}
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function EmptyQueue() {
  return (
    <div className="flex min-h-[230px] flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-10 text-center">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-3xl bg-brand-50" />
        <div className="absolute left-2 top-2 h-14 w-14 rotate-[-7deg] rounded-xl border border-brand-100 bg-white shadow-sm" />
        <div className="absolute right-2 top-3 h-14 w-14 rotate-[8deg] rounded-xl border border-brand-100 bg-brand-50/80" />
        <Maximize2 className="relative h-6 w-6 text-brand-500" />
      </div>
      <h3 className="mt-5 text-sm font-semibold text-slate-800">まだ画像がありません</h3>
      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
        上の「画像を追加」エリアからカード画像を追加すると、ここに一覧が表示されます。
      </p>
      <div className="mt-5 flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-400">
        <Minus className="h-3 w-3" />
        各画像は 1〜4 枚、合計 81 カード面まで
        <Plus className="h-3 w-3" />
      </div>
    </div>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  )
}

export default App
