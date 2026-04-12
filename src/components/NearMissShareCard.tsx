import { useRef, useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  placeName: string;
  deltaMinutes: string;
  onClose: () => void;
}

export default function NearMissShareCard({ placeName, deltaMinutes, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const drawCard = (): HTMLCanvasElement | null => {
    const c = canvasRef.current;
    if (!c) return null;
    const ctx = c.getContext('2d');
    if (!ctx) return null;

    c.width = 400;
    c.height = 300;

    // Background
    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, 400, 300);

    // Teal route line
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(40, 180);
    ctx.quadraticCurveTo(120, 100, 200, 150);
    ctx.stroke();

    // Purple route line
    ctx.strokeStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(200, 150);
    ctx.quadraticCurveTo(280, 200, 360, 120);
    ctx.stroke();
    ctx.setLineDash([]);

    // Amber dot
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(200, 150, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b33';
    ctx.beginPath();
    ctx.arc(200, 150, 16, 0, Math.PI * 2);
    ctx.fill();

    // Text
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Мы почти встретились сегодня', 200, 50);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`в ${placeName} с разницей в ${deltaMinutes}`, 200, 75);

    // Logo
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('Nexus', 380, 285);

    return c;
  };

  const handleShare = async () => {
    const c = drawCard();
    if (!c) return;
    try {
      const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
      if (!blob) return;
      if (navigator.share) {
        const file = new File([blob], 'nexus-meet.png', { type: 'image/png' });
        await navigator.share({ files: [file], title: 'Nexus — Мы почти встретились' });
      } else {
        toast('Поделиться не поддерживается — скопируй изображение');
      }
    } catch { /* cancelled */ }
  };

  const handleCopy = async () => {
    const c = drawCard();
    if (!c) return;
    try {
      const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png'));
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      toast.success('Скопировано');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-[90%] max-w-[420px] space-y-3 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Preview */}
        <div className="rounded-2xl overflow-hidden bg-[#0a0a0f] border border-white/10">
          <canvas ref={canvasRef} className="w-full h-auto" style={{ aspectRatio: '400/300' }} />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 transition-transform active:scale-[0.97]"
          >
            <Share2 className="w-4 h-4" />
            Поделиться
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-3 rounded-xl glass font-semibold flex items-center justify-center gap-2 text-foreground transition-transform active:scale-[0.97]"
          >
            {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Скопировано' : 'Скопировать'}
          </button>
        </div>
      </div>
    </div>
  );
}
