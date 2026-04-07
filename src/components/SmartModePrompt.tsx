import { MapPin, Sparkles } from 'lucide-react';
import { useLocation } from '@/contexts/LocationContext';

export default function SmartModePrompt() {
  const { shouldPromptSmart, setMode, dismissSmartPrompt, requestGeo } = useLocation();

  if (!shouldPromptSmart) return null;

  const handleEnable = () => {
    setMode('smart');
    requestGeo();
    dismissSmartPrompt();
  };

  return (
    <div className="fixed inset-0 z-[4600] flex items-end justify-center bg-black/60 backdrop-blur-[3px]">
      <div className="w-full max-w-md rounded-t-[1.75rem] border border-white/10 bg-gradient-to-b from-[#1b1e2a] via-[#171923] to-[#12141c] px-6 pt-8 pb-10 shadow-[0_-24px_64px_rgba(0,0,0,0.55)] animate-in slide-in-from-bottom-8 duration-300">
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-teal-400" />
          </div>
        </div>

        <h3 className="text-center text-lg font-bold text-foreground">
          Хочешь, мы будем делать это автоматически?
        </h3>
        <p className="text-center text-sm text-muted-foreground mt-3 leading-relaxed px-2">
          Мы соберём твой день и покажем, где ты пересекался с людьми. Никаких форм — всё работает
          само.
        </p>

        <div className="flex items-center gap-3 mt-5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/5">
          <MapPin className="w-5 h-5 text-teal-400 shrink-0" />
          <p className="text-xs text-muted-foreground leading-snug">
            Геолокация используется только для определения мест. Мы не храним координаты — только
            факт посещения.
          </p>
        </div>

        <button
          type="button"
          onClick={handleEnable}
          className="mt-6 w-full py-3.5 rounded-2xl bg-teal-500 text-[#0f172a] font-semibold transition-transform active:scale-[0.97]"
        >
          Включить
        </button>
        <button
          type="button"
          onClick={dismissSmartPrompt}
          className="mt-3 w-full py-2.5 text-sm text-muted-foreground font-medium hover:text-foreground transition-colors"
        >
          Не сейчас
        </button>
      </div>
    </div>
  );
}
