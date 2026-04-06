import { PersonData } from '@/data/types';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PersonCardProps {
  person: PersonData;
}

export default function PersonCard({ person }: PersonCardProps) {
  const { requestAuth } = useAuth();

  if (person.isPlaceholder) {
    return (
      <div className="glass rounded-xl p-3 flex items-center gap-3 opacity-70">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-lg backdrop-blur-sm">
          ?
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{person.name}</p>
          <p className="text-xs text-muted-foreground/70">{person.role}</p>
        </div>
        <span className="text-[10px] text-muted-foreground/50 shrink-0">Присоединится позже</span>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-3 flex items-center gap-3">
      <img
        src={person.avatarUrl}
        alt={person.name}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{person.name}</p>
        <p className="text-xs text-muted-foreground">{person.role}</p>
      </div>
      <button
        onClick={() => requestAuth(`Чтобы написать ${person.name.split(' ')[0]} — войди за 10 секунд`)}
        className="shrink-0 p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
