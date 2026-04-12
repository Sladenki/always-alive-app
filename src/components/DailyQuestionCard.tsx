import { useState, useMemo } from 'react';
import { toast } from 'sonner';

const QUESTIONS: Record<number, { q: string; answers: string[] }> = {
  1: { q: 'Какое место в Калининграде советуешь?', answers: ['Остров Канта', 'Типография', 'Парк Победы', 'Рыбная деревня'] },
  2: { q: 'Что делал сегодня утром?', answers: ['Учился', 'Работал', 'Гулял', 'Спал'] },
  3: { q: 'Куда пойдёшь в эту пятницу вечером?', answers: ['В кафе с друзьями', 'На мероприятие', 'Дома останусь', 'Ещё не знаю'] },
  4: { q: 'Твоё любимое место для работы?', answers: ['Кофейня', 'Антикафе', 'Библиотека', 'Дома'] },
  5: { q: 'Планы на выходные?', answers: ['Мероприятие', 'Природа', 'Отдых дома', 'Не знаю'] },
  6: { q: 'Где ты сейчас?', answers: ['Дома', 'В вузе', 'В кафе', 'На прогулке'] },
  0: { q: 'Лучшее событие этой недели?', answers: ['Хакатон', 'Встреча', 'Лекция', 'Ничего'] },
};

const DAYS_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export default function DailyQuestionCard() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [answered, setAnswered] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    return { day: d.getDay(), date: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}` };
  }, []);

  const data = QUESTIONS[today.day] || QUESTIONS[3];

  const handleSelect = (a: string) => {
    if (answered) return;
    const next = new Set(selected);
    if (next.has(a)) next.delete(a); else next.add(a);
    setSelected(next);
    if (!answered && next.size > 0) {
      setAnswered(true);
      toast('+1 XP за ответ', { icon: '⚡' });
    }
  };

  return (
    <div className="rounded-2xl glass p-4 border-l-[3px] border-l-teal-500/60">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Вопрос дня</h3>
        <span className="text-[11px] text-muted-foreground">{DAYS_RU[today.day]}, {today.date}</span>
      </div>
      <p className="text-[15px] text-foreground font-medium mb-3">{data.q}</p>
      <div className="flex flex-wrap gap-2">
        {data.answers.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => handleSelect(a)}
            className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all active:scale-[0.96] ${
              selected.has(a)
                ? 'bg-teal-500/20 border border-teal-500/40 text-teal-300'
                : 'bg-white/[0.04] border border-white/8 text-muted-foreground hover:text-foreground'
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      {answered && (
        <p className="text-[12px] text-muted-foreground mt-3 animate-fade-up">
          23 человека ответили · большинство идут на мероприятие
        </p>
      )}
    </div>
  );
}
