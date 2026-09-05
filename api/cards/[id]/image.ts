import { fetchOfficialCardImage, getCardIdFromRequest } from "../../_lib/official-card-site.js"

const cacheHeaders = {
  "Cache-Control": "public, max-age=3600, must-revalidate",
  "Vercel-CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
}

export async function GET(request: Request) {
  const id = getCardIdFromRequest(request.url)

  if (!id) {
    return Response.json({ error: "カードIDの形式が正しくありません。" }, { status: 400 })
  }

  try {
    const { body, contentType } = await fetchOfficialCardImage(id)
    return new Response(body, {
      headers: {
        ...cacheHeaders,
        "Content-Type": contentType,
      },
    })
  } catch (error) {
    console.error("Official card image fetch failed", error)
    return Response.json(
      { error: "カード画像を取得できませんでした。" },
      { status: 502 },
    )
  }
}
