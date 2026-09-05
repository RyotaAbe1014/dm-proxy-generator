export type CardSearchResult = {
  id: string
  name: string
  thumbnailUrl: string
  imageUrl: string
  detailUrl: string
}

export type CardSearchResponse = {
  results: CardSearchResult[]
}
