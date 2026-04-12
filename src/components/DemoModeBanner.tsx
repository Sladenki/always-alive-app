import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function DemoModeBanner({ className }: { className?: string }) {
  const { isDemoMode, requestAuth } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-3 py-2.5 border-b border-white/10',
        'bg-[#0f0f18]/95 backdrop-blur-md text-[13px] text-[#F1F5F9]/90',
        className,
      )}
      role="status"
    >
      <p className="leading-snug min-w-0 flex-1">
        Демо режим · Войди чтобы видеть свои данные
      </p>
      <button
        type="button"
        onClick={() => requestAuth('Войди — и это будет твой город, твои пересечения')}
        className="shrink-0 rounded-lg border border-[#7c3aed]/60 bg-[#7c3aed]/20 px-3 py-1.5 text-xs font-semibold text-[#F1F5F9] hover:bg-[#7c3aed]/35 transition-colors"
      >
        Войти
      </button>
    </div>
  );
}
