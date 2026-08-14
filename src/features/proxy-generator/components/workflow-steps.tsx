import { LockKeyhole } from "lucide-react"

const WORKFLOW_STEPS = [
  { number: "01", label: "画像を追加", active: true },
  { number: "02", label: "枚数を調整", active: false },
  { number: "03", label: "PDFを書き出す", active: false },
]

function WorkflowStep({ number, label, active }: (typeof WORKFLOW_STEPS)[number]) {
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
      <span
        className={
          active ? "text-xs font-semibold text-slate-800" : "text-xs font-medium text-slate-400"
        }
      >
        {label}
      </span>
    </li>
  )
}

export function WorkflowSteps() {
  return (
    <>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workflow</p>
        <ol className="mt-5 space-y-5">
          {WORKFLOW_STEPS.map((step) => (
            <WorkflowStep key={step.number} {...step} />
          ))}
        </ol>
      </div>
      <div className="mt-7 flex items-start gap-2 rounded-xl border border-slate-200/70 bg-white/70 p-3 text-[11px] leading-4 text-slate-500">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span>画像はサーバーへ送信されず、このブラウザ内で処理されます。</span>
      </div>
    </>
  )
}
