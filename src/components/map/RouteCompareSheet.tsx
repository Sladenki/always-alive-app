import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { DayRouteStop } from '@/data/dayRouteData';
import { mockDayRoute, mockMaximRoute } from '@/data/dayRouteData';

interface RouteCompareSheetProps {
  open: boolean;
  onClose: () => void;
}

function findOverlaps(a: DayRouteStop[], b: DayRouteStop[]): string[] {
  const labelsA = new Set(a.map((s) => s.label));
  return b.filter((s) => labelsA.has(s.label)).map((s) => s.label);
}

export default function RouteCompareSheet({ open, onClose }: RouteCompareSheetProps) {
  const myRoute = mockDayRoute;
  const theirRoute = mockMaximRoute;
  const overlaps = findOverlaps(myRoute, theirRoute);

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        overlayClassName="z-[2300]"
        className="z-[2300] max-h-[85vh] overflow-y-auto max-w-md mx-auto left-0 right-0 rounded-t-3xl bg-[#161a28] border border-white/[0.06] pb-28 pt-2 data-[state=open]:!animate-none shadow-[0_-20px_60px_rgba(0,0,0,0.45)]"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" aria-hidden />
        <SheetHeader className="text-left space-y-1">
          <SheetTitle className="text-lg">Сравнить дни</SheetTitle>
          <p className="text-xs text-muted-foreground">Твой маршрут vs Максим</p>
        </SheetHeader>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* My route */}
          <div>
            <p className="text-xs font-semibold text-[#00d4aa] mb-2">Ты</p>
            <div className="space-y-1.5">
              {myRoute.map((s) => {
                const isOverlap = overlaps.includes(s.label);
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl px-2.5 py-2 text-[11px] border ${
                      isOverlap
                        ? 'bg-white/[0.08] border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                        : 'bg-[#1e2130]/80 border-white/[0.04]'
                    }`}
                  >
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      {isOverlap && <span>✨</span>}
                      {s.icon} {s.label}
                    </span>
                    <span className="text-muted-foreground block mt-0.5">{s.startTime} — {s.endTime}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Their route */}
          <div>
            <p className="text-xs font-semibold text-violet-400 mb-2 flex items-center gap-1.5">
              <img src="https://i.pravatar.cc/150?img=3" alt="" className="w-4 h-4 rounded-full" />
              Максим
            </p>
            <div className="space-y-1.5">
              {theirRoute.map((s) => {
                const isOverlap = overlaps.includes(s.label);
                return (
                  <div
                    key={s.id}
                    className={`rounded-xl px-2.5 py-2 text-[11px] border ${
                      isOverlap
                        ? 'bg-white/[0.08] border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.08)]'
                        : 'bg-[#1e2130]/80 border-white/[0.04]'
                    }`}
                  >
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      {isOverlap && <span>✨</span>}
                      {s.icon} {s.label}
                    </span>
                    <span className="text-muted-foreground block mt-0.5">{s.startTime} — {s.endTime}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {overlaps.length > 0 && (
          <div className="mt-5 rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-foreground">
              ✨ Вы оба были в {overlaps.join(' и ')} сегодня
            </p>
            <button
              type="button"
              className="mt-3 w-full py-3 rounded-xl bg-violet-500 text-white font-semibold text-sm transition-transform active:scale-[0.97]"
            >
              Это судьба — написать
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
