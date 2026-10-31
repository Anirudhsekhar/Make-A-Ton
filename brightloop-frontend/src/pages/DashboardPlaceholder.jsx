import { LogOut, ShieldCheck } from 'lucide-react'
import Brand from '../components/Brand'
import { ROLE_LABELS } from '../config/roles'
import { useAuth } from '../context/AuthContext'

export default function DashboardPlaceholder({ title, description }) {
  const { firebaseUser, profile, role, logout } = useAuth()

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="art-grid absolute inset-0 opacity-30" />
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-loop/15 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-aqua/[0.07] blur-[120px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between border-b border-white/[0.06] px-5 py-4 sm:px-8">
        <Brand />
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-slate-300 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            {ROLE_LABELS[role] ?? role}
          </span>
          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-slate-400 transition-colors hover:border-white/[0.14] hover:text-slate-200"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-loop-bright/80">
          Protected workspace
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.045em] text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-slate-400">{description}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="auth-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Verified session
            </p>
            <dl className="mt-4 space-y-3 text-[12px]">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Email</dt>
                <dd className="truncate font-medium text-slate-200">{firebaseUser?.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Role</dt>
                <dd className="font-medium text-emerald-400">{ROLE_LABELS[role] ?? role}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">Profile</dt>
                <dd className="truncate font-medium text-slate-200">
                  {profile?.id ?? profile?.firebaseUid ?? 'Trusted profile'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Next step
            </p>
            <p className="mt-3 text-[12.5px] leading-relaxed text-slate-400">
              This {title.toLowerCase()} dashboard is a protected route placeholder. The real
              dashboard is intentionally not built yet. Wire the trusted profile service to unlock
              it with the verified role.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
