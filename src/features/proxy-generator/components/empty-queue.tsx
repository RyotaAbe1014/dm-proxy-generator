import { Maximize2, Minus, Plus } from "lucide-react"

import { MAX_IMAGE_COPIES } from "../constants"

export function EmptyQueue() {
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
        各画像は 1〜{MAX_IMAGE_COPIES} 枚、合計 81 カード面まで
        <Plus className="h-3 w-3" />
      </div>
    </div>
  )
}
