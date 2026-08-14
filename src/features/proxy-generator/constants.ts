import type { QueuedImage } from "./types"

export const MAX_CARD_FACES = 81
export const MAX_IMAGE_COPIES = 4

export const getTotalCardFaces = (images: QueuedImage[]) =>
  images.reduce((total, image) => total + image.copies, 0)
