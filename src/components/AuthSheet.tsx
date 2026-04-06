import { useAuth } from '@/contexts/AuthContext';
import { X, Send, Mail } from 'lucide-react';
import { useState } from 'react';

export default function AuthSheet() {
  const { showAuthSheet, authPrompt, closeAuthSheet, login } = useAuth();
  const [step, setStep] = useState<'prompt' | 'register'>('prompt');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'student' | 'resident' | ''>('');
  const [uni, setUni] = useState('');

  if (!showAuthSheet) return null;

  const handleTelegramLogin = () => {
    setStep('register');
  };

  const handleFinish = () => {
    if (!name || !role) return;
    const displayRole = role === 'student' ? `Студент ${uni || 'БФУ'}` : 'Житель Калининграда';
    login(name, displayRole);
    setStep('prompt');
    setName('');
    setRole('');
    setUni('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={closeAuthSheet} />
      <div className="relative w-full max-w-md glass-strong rounded-t-2xl p-6 animate-slide-up">
        <button onClick={closeAuthSheet} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        {step === 'prompt' && (
          <div className="space-y-4">
            <p className="text-foreground font-semibold text-lg">{authPrompt}</p>
            <button
              onClick={handleTelegramLogin}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
              Войти через Telegram
            </button>
            <button className="w-full py-2 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-colors">
              <Mail className="w-4 h-4" />
              Войти через Email
            </button>
          </div>
        )}

        {step === 'register' && (
          <div className="space-y-4">
            <p className="text-foreground font-semibold text-lg">Расскажи о себе</p>
            <input
              type="text"
              placeholder="Как тебя зовут?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-3 px-4 rounded-xl bg-muted text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRole('student')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  role === 'student' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                🎓 Студент
              </button>
              <button
                onClick={() => setRole('resident')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  role === 'resident' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                🏠 Житель
              </button>
            </div>
            {role === 'student' && (
              <select
                value={uni}
                onChange={(e) => setUni(e.target.value)}
                className="w-full py-3 px-4 rounded-xl bg-muted text-foreground outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Какой вуз?</option>
                <option value="БФУ им. Канта">БФУ им. Канта</option>
                <option value="КГТУ">КГТУ</option>
                <option value="БВМИ">БВМИ</option>
                <option value="Другой">Другой</option>
              </select>
            )}
            <button
              onClick={handleFinish}
              disabled={!name || !role}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 transition-opacity"
            >
              Готово →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
