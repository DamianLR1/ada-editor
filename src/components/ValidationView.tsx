import { AlertTriangle, CircleAlert, CheckCircle2 } from 'lucide-react';
import type { ValidationIssue } from '../lib/validate';

interface Props {
  issues: ValidationIssue[];
}

export function ValidationView({ issues }: Props) {
  const errors = issues.filter((i) => i.severity === 'error');
  const warnings = issues.filter((i) => i.severity === 'warning');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-red-400">
          <CircleAlert size={15} /> {errors.length} error(es)
        </span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <AlertTriangle size={15} /> {warnings.length} advertencia(s)
        </span>
      </div>

      {issues.length === 0 && (
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-500/5 p-6 text-center text-emerald-400 text-sm flex flex-col items-center gap-2">
          <CheckCircle2 size={22} />
          No se encontraron referencias rotas (StageId, LevelId, RewardId, SpotId, variables, etc.)
        </div>
      )}

      <div className="space-y-2">
        {issues.map((issue, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 text-sm ${
              issue.severity === 'error' ? 'border-red-900/50 bg-red-500/5' : 'border-amber-900/50 bg-amber-500/5'
            }`}
          >
            <p className={issue.severity === 'error' ? 'text-red-300' : 'text-amber-300'}>{issue.message}</p>
            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">{issue.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
