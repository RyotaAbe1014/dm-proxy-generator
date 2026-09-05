export type ImageInputSource = "file" | "clipboard" | "official-card"

export type QueuedImage = {
  id: string
  name: string
  previewUrl: string
  copies: number
}

export type Feedback = {
  tone: "error" | "success"
  message: string
}
