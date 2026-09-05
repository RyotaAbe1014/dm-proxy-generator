import { searchOfficialCards } from "../_lib/official-card-site.ts"

const MAX_KEYWORD_LENGTH = 80

/**
 * FunctionのレスポンスをブラウザとVercel CDNで別々に制御するための設定です。
 * Vercel-CDN-Cache-Controlは、Vercel CDN向けのキャッシュ時間と
 * stale-while-revalidateを指定するヘッダーです。
 * @see https://vercel.com/docs/caching/cdn-cache
 * @see https://vercel.com/docs/caching/cache-control-headers
 */
const cacheHeaders = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "Vercel-CDN-Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const keyword = url.searchParams.get("q")?.trim() || ""

  if (!keyword) {
    return Response.json({ error: "検索キーワードを入力してください。" }, { status: 400 })
  }

  if (keyword.length > MAX_KEYWORD_LENGTH) {
    return Response.json(
      { error: `検索キーワードは${MAX_KEYWORD_LENGTH}文字以内で入力してください。` },
      { status: 400 },
    )
  }

  try {
    const results = await searchOfficialCards(keyword)
    return Response.json({ results }, { headers: cacheHeaders })
  } catch (error) {
    console.error("Official card search failed", error)
    return Response.json(
      { error: "公式カード検索に失敗しました。時間をおいて再度お試しください。" },
      { status: 502 },
    )
  }
}
