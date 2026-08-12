import {
  ArrowUpRight,
  Check,
  FileOutput,
  ImagePlus,
  Info,
  Layers3,
  LockKeyhole,
  Maximize2,
  Minus,
  Plus,
  Printer,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-sky-100/50 blur-3xl" />
      </div>

      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft">
              <Layers3 className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold tracking-tight text-slate-900">プロキシプリント</p>
                <Badge variant="muted" className="hidden py-0.5 uppercase tracking-[0.16em] sm:inline-flex">
                  beta
                </Badge>
              </div>
              <p className="text-[11px] font-medium text-slate-400">デュエル・マスターズ用 PDF 作成ツール</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span className="hidden sm:inline">ブラウザ内で完結</span>
            <span className="sm:hidden">ローカル処理</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-8 max-w-2xl">
          <Badge>
            <Sparkles className="mr-1.5 h-3 w-3" />
            かんたん 3 ステップ
          </Badge>
          <h1 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-4xl">
            カード画像を、<span className="text-brand-600">印刷できる形</span>に。
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            画像を追加して枚数を指定するだけ。実カードサイズに合わせた A4 レイアウトで、プロキシを準備できます。
          </p>
        </section>

        <section aria-labelledby="add-images-heading">
          <Card className="overflow-hidden border-brand-100/80 shadow-card">
            <CardContent className="p-0">
              <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
                <div className="relative p-6 sm:p-8">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <ImagePlus className="h-4 w-4" />
                        </div>
                        <h2 id="add-images-heading" className="text-base font-bold text-slate-900">
                          画像を追加
                        </h2>
                      </div>
                      <p className="mt-2 pl-10 text-xs leading-5 text-slate-500">
                        カード画像をまとめて追加できます。追加方法は次のアップデートで対応予定です。
                      </p>
                    </div>
                    <Badge variant="muted" className="shrink-0">
                      準備中
                    </Badge>
                  </div>

                  <div className="relative flex min-h-[180px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-brand-200 bg-brand-50/35 px-6 py-8 text-center">
                    <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(#b8d1ff_0.7px,transparent_0.7px)] [background-size:14px_14px]" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-soft">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <p className="relative mt-4 text-sm font-semibold text-slate-800">ここにカード画像を追加</p>
                    <p className="relative mt-1 text-xs text-slate-500">ドラッグ＆ドロップ / ファイル選択 / ペースト</p>
                    <Button disabled variant="outline" size="sm" className="relative mt-5 bg-white">
                      <Plus className="h-3.5 w-3.5" />
                      画像を選択
                    </Button>
                  </div>
                </div>

                <aside className="flex min-w-[240px] flex-col justify-between border-t border-slate-100 bg-slate-50/70 p-6 lg:w-64 lg:border-l lg:border-t-0">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workflow</p>
                    <ol className="mt-5 space-y-5">
                      <WorkflowStep number="01" label="画像を追加" active />
                      <WorkflowStep number="02" label="枚数を調整" />
                      <WorkflowStep number="03" label="PDFを書き出す" />
                    </ol>
                  </div>
                  <div className="mt-7 flex items-start gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-3 text-[11px] leading-4 text-slate-500">
                    <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span>画像はサーバーへ送信されず、このブラウザ内で処理されます。</span>
                  </div>
                </aside>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <Card className="shadow-card">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">カード一覧</CardTitle>
                  <Badge variant="muted">0 件</Badge>
                </div>
                <CardDescription className="mt-1">追加した画像の枚数をここで調整できます。</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium text-slate-400">合計枚数</p>
                <p className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">
                  0 <span className="text-xs font-medium text-slate-400">/ 60 枚</span>
                </p>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-6 sm:p-8">
              <EmptyQueue />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Printer className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base">印刷設定</CardTitle>
                    <CardDescription className="mt-0.5">出力レイアウトの概要</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <SettingRow label="用紙" value="A4 / 縦" />
                <SettingRow label="配置" value="3 列 × 3 行" />
                <SettingRow label="カードサイズ" value="63 × 88 mm" />
                <SettingRow label="カード間隔" value="1 mm" />
                <SettingRow label="印刷面" value="片面" />
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex w-full items-start gap-2 rounded-xl bg-brand-50/70 p-3 text-[11px] leading-4 text-brand-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>印刷時は「実際のサイズ」を選択してください。</span>
                </div>
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-slate-800 bg-slate-900 text-white shadow-card">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300">
                    <FileOutput className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">PDF を作成</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">画像を 1 枚以上追加すると利用できます。</p>
                  </div>
                </div>
                <Button disabled variant="secondary" size="lg" className="mt-5 w-full bg-white/10 text-slate-500">
                  PDFを書き出す
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <footer className="mt-10 flex flex-col gap-2 border-t border-slate-200/70 pt-5 text-[11px] font-medium text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>カード画像は端末内でのみ扱われます。</p>
          <p className="flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            画像追加機能を準備中
          </p>
        </footer>
      </main>
    </div>
  )
}

function WorkflowStep({ number, label, active = false }: { number: string; label: string; active?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={
          active
            ? "flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-[10px] font-bold text-white"
            : "flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-400"
        }
      >
        {number}
      </span>
      <span className={active ? "text-xs font-semibold text-slate-800" : "text-xs font-medium text-slate-400"}>{label}</span>
    </li>
  )
}

function EmptyQueue() {
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
        枚数は 0〜4 枚で調整
        <Plus className="h-3 w-3" />
      </div>
    </div>
  )
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  )
}

export default App
