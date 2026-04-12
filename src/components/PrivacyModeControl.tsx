import { cn } from '@/lib/utils';
import type { PrivacyMode } from '@/components/OnboardingFlow';
import { toast } from 'sonner';

interface Props {
  mode: PrivacyMode;
  onChange: (m: PrivacyMode) => void;
  compact?: boolean;
}

const MODES: { id: PrivacyMode; emoji: string; label: string; activeColor: string }[] = [
  { id: 'invisible', emoji: '🔴', label: 'Невидимка', activeColor: 'bg-red-500/20 border-red-500/40 text-red-300' },
  { id: 'observer', emoji: '🟡', label: 'Наблюдаю', activeColor: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
  { id: 'open', emoji: '🟢', label: 'Открыт', activeColor: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
];

export function PrivacyModeDot({ mode }: { mode: PrivacyMode }) {
  const colors: Record<PrivacyMode, string> = {
    invisible: 'bg-red-500',
    observer: 'bg-amber-500',
    open: 'bg-emerald-500',
  };
  return <span className={cn('w-2 h-2 rounded-full inline-block', colors[mode])} />;
}

export function PrivacyBanner({ mode }: { mode: PrivacyMode }) {
  if (mode === 'open') return null;
  const text = mode === 'invisible'
    ? 'Ты невидим — только собираешь свой граф'
    : 'Ты видишь других — они тебя нет';
  const bg = mode === 'invisible' ? 'bg-red-500/8 border-red-500/20' : 'bg-amber-500/8 border-amber-500/20';
  return (
    <div className={cn('px-4 py-2 rounded-xl border text-[12px] text-muted-foreground text-center', bg)}>
      {text}
    </div>
  );
}

export default function PrivacyModeControl({ mode, onChange, compact }: Props) {
  const handleChange = (m: PrivacyMode) => {
    if (m === mode) return;
    onChange(m);
    const label = MODES.find((x) => x.id === m)?.label || '';
    toast(`Режим изменён: ${label}`, { icon: MODES.find((x) => x.id === m)?.emoji });
  };

  return (
    <div className="flex rounded-xl bg-white/[0.04] border border-white/8 p-0.5">
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => handleChange(m.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all text-[12px] font-medium',
            mode === m.id ? m.activeColor + ' border' : 'text-muted-foreground border border-transparent',
            compact && 'py-1.5',
          )}
        >
          <span className="text-[10px]">{m.emoji}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
