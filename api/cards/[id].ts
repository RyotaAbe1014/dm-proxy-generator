import {
  fetchOfficialCardDetail,
  getCardIdFromRequest,
} from "../_lib/official-card-site"

const cacheHeaders = {
  "Cache-Control": "public, max-age=300, must-revalidate",
  "Vercel-CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
}

export async function GET(request: Request) {
  const id = getCardIdFromRequest(request.url)

  if (!id) {
    return Response.json({ error: "カードIDの形式が正しくありません。" }, { status: 400 })
  }

  try {
    const card = await fetchOfficialCardDetail(id)
    return Response.json(
      {
        ...card,
        imageProxyUrl: `/api/cards/${encodeURIComponent(id)}/image`,
      },
      { headers: cacheHeaders },
    )
  } catch (error) {
    console.error("Official card detail fetch failed", error)
    return Response.json(
      { error: "カード詳細を取得できませんでした。" },
      { status: 502 },
    )
  }
}
