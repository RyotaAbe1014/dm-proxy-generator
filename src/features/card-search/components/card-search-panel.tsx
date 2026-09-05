import { useEffect, useRef, useState } from "react"
import type { FormEvent, MouseEvent } from "react"
import { ExternalLink, LoaderCircle, Plus, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { MAX_CARD_FACES } from "../../proxy-generator/constants"
import type { CardSearchResponse, CardSearchResult } from "../types"

type CardSearchPanelProps = {
  totalCardFaces: number
  // falseの場合は、キュー追加に失敗したため成功メッセージを表示しません。
  onAddCard: (card: CardSearchResult) => Promise<boolean>
}

export function CardSearchPanel({ totalCardFaces, onAddCard }: CardSearchPanelProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CardSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchMessage, setSearchMessage] = useState<string | null>(null)
  const [addingCardId, setAddingCardId] = useState<string | null>(null)
  const [selectedCard, setSelectedCard] = useState<CardSearchResult | null>(null)
  const requestIdRef = useRef(0)
  const previewCloseButtonRef = useRef<HTMLButtonElement | null>(null)
  const previewTriggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!selectedCard) return

    const previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    previewCloseButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedCard(null)
        previewTriggerRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousBodyOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedCard])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const keyword = query.trim()
    if (!keyword || isSearching) return

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsSearching(true)
    setSearchError(null)
    setSearchMessage(null)
    setResults([])

    try {
      const response = await fetch(`/api/cards/search?q=${encodeURIComponent(keyword)}`)
      const payload = (await response.json()) as CardSearchResponse & { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || "カード検索に失敗しました。")
      }

      if (requestId !== requestIdRef.current) return

      setResults(payload.results)
      setSearchMessage(
        payload.results.length > 0
          ? `${payload.results.length}件のカードが見つかりました。`
          : "カードが見つかりませんでした。",
      )
    } catch (error) {
      if (requestId !== requestIdRef.current) return

      console.error("Card search failed", error)
      setSearchError("カード検索に失敗しました。時間をおいて再度お試しください。")
    } finally {
      if (requestId === requestIdRef.current) {
        setIsSearching(false)
      }
    }
  }

  const handleAddCard = async (card: CardSearchResult) => {
    if (addingCardId || totalCardFaces >= MAX_CARD_FACES) return

    setAddingCardId(card.id)
    setSearchError(null)
    setSearchMessage(null)

    try {
      const added = await onAddCard(card)
      if (added) {
        setSearchMessage(`「${card.name}」を追加しました。`)
      }
    } finally {
      setAddingCardId(null)
    }
  }

  const handleOpenPreview = (card: CardSearchResult, event: MouseEvent<HTMLButtonElement>) => {
    previewTriggerRef.current = event.currentTarget
    setSelectedCard(card)
  }

  const handleClosePreview = () => {
    setSelectedCard(null)
    previewTriggerRef.current?.focus()
  }

  return (
    <section className="mt-6" aria-labelledby="card-search-heading">
      <Card className="shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle id="card-search-heading" className="text-base">
                  公式カードを検索
                </CardTitle>
                <Badge variant="muted">試験的</Badge>
              </div>
              <CardDescription className="mt-1">
                カード名で検索して、画像をそのまま一覧へ追加できます。
              </CardDescription>
            </div>
            <Search className="mt-1 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleSubmit}>
            <label htmlFor="card-search-input" className="sr-only">
              カード名
            </label>
            <input
              id="card-search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="カード名を入力（例：ドギラゴン）"
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              disabled={isSearching}
            />
            <Button type="submit" disabled={isSearching || query.trim().length === 0}>
              {isSearching ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Search className="h-4 w-4" aria-hidden="true" />
              )}
              {isSearching ? "検索中…" : "検索"}
            </Button>
          </form>

          <p className="mt-2 text-[11px] leading-4 text-slate-400">
            公式サイトを検索するため、検索結果は最大12件まで表示します。
          </p>

          {searchError ? (
            <p className="mt-3 text-xs font-medium text-rose-600" role="alert">
              {searchError}
            </p>
          ) : searchMessage ? (
            <p className="mt-3 text-xs font-medium text-emerald-700" role="status">
              {searchMessage}
            </p>
          ) : null}

          {results.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="カード検索結果">
              {results.map((card) => {
                const isAdding = addingCardId === card.id

                return (
                  <li
                    key={card.id}
                    className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <button
                      type="button"
                      className="group relative h-20 w-14 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                      aria-label={`「${card.name}」の画像を拡大表示`}
                      onClick={(event) => handleOpenPreview(card, event)}
                    >
                      <img
                        src={card.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-slate-950/65 px-0.5 py-1 text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        拡大
                      </span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-800">
                        {card.name}
                      </p>
                      <a
                        href={card.detailUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-brand-600"
                      >
                        公式ページ
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                      <Button
                        size="sm"
                        className="mt-2 h-8 w-full px-2 text-[11px]"
                        disabled={isAdding || totalCardFaces >= MAX_CARD_FACES}
                        onClick={() => void handleAddCard(card)}
                      >
                        {isAdding ? (
                          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {isAdding ? "取得中…" : "一覧に追加"}
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      {selectedCard ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              handleClosePreview()
            }
          }}
        >
          <div
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col gap-4 overflow-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="card-preview-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p id="card-preview-title" className="truncate text-base font-bold text-slate-900">
                  {selectedCard.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">カード画像プレビュー</p>
              </div>
              <button
                ref={previewCloseButtonRef}
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                aria-label="カード画像プレビューを閉じる"
                onClick={handleClosePreview}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex min-h-0 items-center justify-center rounded-xl bg-slate-100 p-3 sm:p-5">
              <img
                src={`/api/cards/${encodeURIComponent(selectedCard.id)}/image`}
                alt={selectedCard.name}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
                decoding="async"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <a
                href={selectedCard.detailUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600"
              >
                公式ページ
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <Button size="sm" variant="outline" onClick={handleClosePreview}>
                閉じる
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
