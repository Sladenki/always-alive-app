import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type PrivacyMode = 'invisible' | 'observer' | 'open';

interface OnboardingFlowProps {
  onComplete: (data: {
    role: 'student' | 'resident';
    uni?: string;
    privacyMode: PrivacyMode;
  }) => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<'student' | 'resident' | null>(null);
  const [uni, setUni] = useState('');
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>('observer');
  const [showUniPicker, setShowUniPicker] = useState(false);

  // Step 1 auto-advance
  useEffect(() => {
    if (step !== 1) return;
    const t = setTimeout(() => setStep(2), 2000);
    return () => clearTimeout(t);
  }, [step]);

  const handleRoleSelect = (r: 'student' | 'resident') => {
    setRole(r);
    if (r === 'student') {
      setShowUniPicker(true);
    } else {
      setStep(3);
    }
  };

  const handleUniDone = () => {
    setShowUniPicker(false);
    setStep(3);
  };

  const handleFinish = () => {
    if (!role) return;
    onComplete({ role, uni: role === 'student' ? uni || 'КГТУ' : undefined, privacyMode });
  };

  const UNIS = ['КГТУ', 'БФУ им. Канта', 'Другой вуз'];

  const MODES: { id: PrivacyMode; emoji: string; color: string; title: string; desc: string }[] = [
    { id: 'invisible', emoji: '🔴', color: 'border-red-500/30 bg-red-500/5', title: 'Невидимка', desc: 'Только для себя. Никто меня не видит.' },
    { id: 'observer', emoji: '🟡', color: 'border-amber-500/30 bg-amber-500/5', title: 'Наблюдатель', desc: 'Вижу пересечения. Меня не видно.' },
    { id: 'open', emoji: '🟢', color: 'border-emerald-500/30 bg-emerald-500/5', title: 'Открыт', desc: 'Хочу знакомиться прямо сейчас.' },
  ];

  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-background">
      {/* Step 1: Welcome */}
      {step === 1 && (
        <div
          className="flex flex-col items-center animate-fade-up cursor-pointer"
          onClick={() => setStep(2)}
        >
          <div className="relative w-32 h-32 flex items-center justify-center mb-8">
            {/* Map silhouette placeholder — pulsing dot */}
            <div className="absolute w-full h-full rounded-full bg-primary/5 animate-breathe" />
            <div className="absolute w-16 h-16 rounded-full bg-primary/10 animate-breathe" style={{ animationDelay: '0.5s' }} />
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse-subtle" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">Nexus</h1>
          <p className="mt-3 text-base text-muted-foreground font-medium">Твой город. Твои люди.</p>
        </div>
      )}

      {/* Step 2: Role */}
      {step === 2 && !showUniPicker && (
        <div className="w-full max-w-sm px-6 animate-fade-up">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Ты...</h2>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleRoleSelect('student')}
              className={cn(
                'w-full py-5 px-6 rounded-2xl text-left transition-all active:scale-[0.98]',
                'glass glass-hover',
              )}
            >
              <span className="text-2xl mr-3">🎓</span>
              <span className="text-lg font-semibold text-foreground">Студент</span>
              <p className="text-sm text-muted-foreground mt-1 ml-10">КГТУ, БФУ или другой вуз</p>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('resident')}
              className={cn(
                'w-full py-5 px-6 rounded-2xl text-left transition-all active:scale-[0.98]',
                'glass glass-hover',
              )}
            >
              <span className="text-2xl mr-3">🏙️</span>
              <span className="text-lg font-semibold text-foreground">Житель города</span>
              <p className="text-sm text-muted-foreground mt-1 ml-10">Просто живу в Калининграде</p>
            </button>
          </div>
        </div>
      )}

      {/* Step 2b: University picker */}
      {step === 2 && showUniPicker && (
        <div className="w-full max-w-sm px-6 animate-fade-up">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Какой вуз?</h2>
          <div className="space-y-2">
            {UNIS.map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUni(u)}
                className={cn(
                  'w-full py-4 px-5 rounded-2xl text-left transition-all active:scale-[0.98]',
                  uni === u ? 'bg-primary/15 border border-primary/40' : 'glass glass-hover',
                )}
              >
                <span className="text-base font-medium text-foreground">{u}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleUniDone}
            disabled={!uni}
            className="mt-6 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 transition-all active:scale-[0.97]"
          >
            Далее →
          </button>
        </div>
      )}

      {/* Step 3: Privacy */}
      {step === 3 && (
        <div className="w-full max-w-sm px-6 animate-fade-up">
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">Как ты хочешь начать?</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Выбери уровень видимости</p>
          <div className="space-y-2.5">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPrivacyMode(m.id)}
                className={cn(
                  'w-full py-4 px-5 rounded-2xl text-left transition-all active:scale-[0.98] border',
                  privacyMode === m.id ? m.color + ' ring-1 ring-white/10' : 'border-white/5 bg-white/[0.02]',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{m.emoji}</span>
                  <div>
                    <p className="font-semibold text-foreground">{m.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{m.desc}</p>
                  </div>
                </div>
                {m.id === 'observer' && privacyMode !== m.id && (
                  <span className="text-[10px] text-muted-foreground/60 ml-9 mt-1 block">По умолчанию</span>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleFinish}
            className="mt-6 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold transition-all active:scale-[0.97]"
          >
            Начать →
          </button>
          <p className="text-center text-[11px] text-muted-foreground/60 mt-3">
            Изменишь в любой момент в профиле
          </p>
        </div>
      )}
    </div>
  );
}
