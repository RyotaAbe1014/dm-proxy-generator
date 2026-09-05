import { load } from "cheerio"

import { mapWithConcurrency } from "./concurrency.ts"
import { fetchWithTimeout } from "./fetch-with-timeout.ts"

/**
 * デュエマ公式サイトとの通信・HTML解析をまとめたサーバー側アダプターです。
 * 汎用URLプロキシではなく、公式サイトの検索・詳細・画像取得だけを扱います。
 */
export const OFFICIAL_ORIGIN = "https://dm.takaratomy.co.jp"

const OFFICIAL_CARD_SEARCH_URL = `${OFFICIAL_ORIGIN}/card/`
const OFFICIAL_CARD_DETAIL_PATH = "/card/detail/"
// 画面にページネーションはないため、検索結果は公式サイトの先頭12件に限定します。
const MAX_SEARCH_RESULTS = 12
const DETAIL_FETCH_CONCURRENCY = 3
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

const CARD_ID_PATTERN = /^[a-z0-9-]{1,100}$/i

export type OfficialCardDetail = {
  id: string
  name: string
  imageUrl: string
  detailUrl: string
}

export type OfficialCardSearchResult = OfficialCardDetail & {
  thumbnailUrl: string
}

const isCardId = (id: string) => CARD_ID_PATTERN.test(id)

const createOfficialUrl = (value: string, requiredPathPrefix?: string) => {
  const url = new URL(value, OFFICIAL_ORIGIN)

  if (url.origin !== OFFICIAL_ORIGIN) {
    throw new Error("公式サイト以外のURLは扱えません。")
  }

  if (requiredPathPrefix && !url.pathname.startsWith(requiredPathPrefix)) {
    throw new Error("公式サイトの許可された画像URLではありません。")
  }

  return url.href
}

const fetchOfficialSite = (input: RequestInfo | URL, init: RequestInit = {}) =>
  fetchWithTimeout(input, {
    ...init,
    headers: {
      Accept: "text/html,application/xhtml+xml,image/*;q=0.8,*/*;q=0.5",
      "User-Agent": "dm-proxy-generator/0.1",
      ...init.headers,
    },
  })

const extractCardId = (href: string) => {
  try {
    const url = new URL(href, OFFICIAL_ORIGIN)
    const id = url.searchParams.get("id")
    return id && isCardId(id) ? id : null
  } catch {
    return null
  }
}

const extractSearchCandidates = (html: string) => {
  const $ = load(html)
  const candidates = new Map<string, { id: string; thumbnailUrl: string }>()

  $("#cardlist a[data-href], #cardlist a[href]").each((_, element) => {
    if (candidates.size >= MAX_SEARCH_RESULTS) return

    const anchor = $(element)
    const id = extractCardId(anchor.attr("data-href") || anchor.attr("href") || "")
    const thumbnailSource = anchor.find("img").first().attr("src")

    if (!id || !thumbnailSource) return

    try {
      const thumbnailUrl = createOfficialUrl(
        thumbnailSource,
        "/wp-content/card/cardthumb/",
      )
      candidates.set(id, { id, thumbnailUrl })
    } catch {
      // Ignore malformed or unexpected result entries.
    }
  })

  return Array.from(candidates.values())
}

const parseCardDetail = (html: string, id: string): OfficialCardDetail => {
  const $ = load(html)
  const nameElement = $(".card-name").first()
  const imageSource =
    $(".card-img img").first().attr("src") ||
    $('meta[property="og:image"]').first().attr("content")

  nameElement.find(".packname").remove()
  const name = nameElement.text().trim()

  if (!name || !imageSource) {
    throw new Error("カード詳細を解析できませんでした。")
  }

  return {
    id,
    name,
    imageUrl: createOfficialUrl(imageSource, "/wp-content/card/cardimage/"),
    detailUrl: `${OFFICIAL_ORIGIN}${OFFICIAL_CARD_DETAIL_PATH}?id=${encodeURIComponent(id)}`,
  }
}

/**
 * 詳細API、検索結果のカード名補完、画像プロキシで共用する公式詳細ページ取得処理です。
 */
export const fetchOfficialCardDetail = async (id: string) => {
  if (!isCardId(id)) {
    throw new Error("カードIDの形式が正しくありません。")
  }

  const detailUrl = `${OFFICIAL_ORIGIN}${OFFICIAL_CARD_DETAIL_PATH}?id=${encodeURIComponent(id)}`
  const response = await fetchOfficialSite(detailUrl)

  if (!response.ok) {
    throw new Error("カード詳細を取得できませんでした。")
  }

  return parseCardDetail(await response.text(), id)
}

export const searchOfficialCards = async (keyword: string) => {
  const searchParams = new URLSearchParams()
  searchParams.set("keyword", keyword)
  searchParams.append("keyword_type[]", "card_name")
  searchParams.append("keyword_type[]", "card_ruby")
  searchParams.set("suggest", "on")
  // UIにページネーションはないため、公式サイトの先頭ページだけを検索します。
  searchParams.set("pagenum", "1")
  searchParams.set("sort", "release_new")
  searchParams.set("samename", "show")

  const response = await fetchOfficialSite(OFFICIAL_CARD_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: searchParams,
  })

  if (!response.ok) {
    throw new Error("公式カード検索に失敗しました。")
  }

  const candidates = extractSearchCandidates(await response.text())
  const detailedResults = await mapWithConcurrency(
    candidates,
    DETAIL_FETCH_CONCURRENCY,
    async (candidate) => {
      try {
        const detail = await fetchOfficialCardDetail(candidate.id)
        return { ...candidate, ...detail }
      } catch {
        // 詳細ページを取得できないカードだけを除外し、検索全体は継続します。
        return null
      }
    },
  )

  return detailedResults.filter(
    (result): result is OfficialCardSearchResult => result !== null,
  )
}

export const fetchOfficialCardImage = async (id: string) => {
  const detail = await fetchOfficialCardDetail(id)
  const response = await fetchOfficialSite(detail.imageUrl, {
    headers: { Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*;q=0.8" },
  })

  if (!response.ok) {
    throw new Error("カード画像を取得できませんでした。")
  }

  const contentType = response.headers.get("content-type")?.split(";", 1)[0].trim() || ""
  if (!contentType.toLowerCase().startsWith("image/")) {
    throw new Error("取得したデータが画像ではありません。")
  }

  const contentLength = Number(response.headers.get("content-length"))
  if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_BYTES) {
    throw new Error("カード画像のサイズが大きすぎます。")
  }

  const body = await response.arrayBuffer()
  if (body.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("カード画像のサイズが大きすぎます。")
  }

  return { body, contentType }
}

/**
 * 詳細APIと画像APIで共通利用するカードIDの抽出・形式検証です。
 */
export const getCardIdFromRequest = (requestUrl: string) => {
  const segments = new URL(requestUrl).pathname.split("/").filter(Boolean)
  const cardsIndex = segments.indexOf("cards")
  const rawId = cardsIndex >= 0 ? segments[cardsIndex + 1] : undefined

  if (!rawId) return null

  try {
    const id = decodeURIComponent(rawId)
    return isCardId(id) ? id : null
  } catch {
    return null
  }
}
