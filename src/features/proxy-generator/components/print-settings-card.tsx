import { Info, Printer } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 text-xs">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  )
}

export function PrintSettingsCard() {
  return (
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
          <span>
            印刷時は「実際のサイズ」または「100%」を選び、「ページに合わせる」などはオフにしてください。
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
