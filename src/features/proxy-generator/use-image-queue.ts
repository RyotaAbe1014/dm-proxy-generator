import { useCallback, useEffect, useRef, useState } from "react"
import type { ChangeEvent, ClipboardEvent, DragEvent } from "react"

import { MAX_CARD_FACES, MAX_IMAGE_COPIES, getTotalCardFaces } from "./constants"
import type { Feedback, ImageInputSource, QueuedImage } from "./types"

const isImageFile = (file: File) => file.type.toLowerCase().startsWith("image/")

export function useImageQueue() {
  const [images, setImages] = useState<QueuedImage[]>([])
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const objectUrlsRef = useRef<Set<string>>(new Set())
  const nextImageIdRef = useRef(1)
  const nextClipboardImageNumberRef = useRef(1)
  const totalCardFaces = getTotalCardFaces(images)

  useEffect(() => {
    const objectUrls = objectUrlsRef.current

    return () => {
      for (const url of objectUrls) {
        URL.revokeObjectURL(url)
      }
      objectUrls.clear()
    }
  }, [])

  const addImageFiles = useCallback(
    (files: File[], source: ImageInputSource) => {
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
    },
    [totalCardFaces],
  )

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      addImageFiles(Array.from(event.target.files ?? []), "file")
      event.target.value = ""
    },
    [addImageFiles],
  )

  const handleDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      setIsDragging(false)
      addImageFiles(Array.from(event.dataTransfer.files), "file")
    },
    [addImageFiles],
  )

  const handlePaste = useCallback(
    (event: ClipboardEvent<HTMLElement>) => {
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
    },
    [addImageFiles],
  )

  const adjustImageCopies = useCallback(
    (imageId: string, delta: number) => {
      const image = images.find((queuedImage) => queuedImage.id === imageId)
      if (!image) return

      const nextCopies = image.copies + delta
      if (nextCopies > MAX_IMAGE_COPIES) return

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
        setImages((currentImages) =>
          currentImages.filter((currentImage) => currentImage.id !== imageId),
        )
        return
      }

      setImages((currentImages) =>
        currentImages.map((currentImage) =>
          currentImage.id === imageId ? { ...currentImage, copies: nextCopies } : currentImage,
        ),
      )
    },
    [images, totalCardFaces],
  )

  return {
    images,
    feedback,
    isDragging,
    totalCardFaces,
    handleFileChange,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handlePaste,
    adjustImageCopies,
  }
}
