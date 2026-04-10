import { useEffect, useMemo } from 'react';
import { Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { DayRouteStop } from '@/data/dayRouteData';
import { getNearMissForStop } from '@/data/dayRouteData';

interface DayRouteLayerProps {
  stops: DayRouteStop[];
  onStopClick: (stop: DayRouteStop) => void;
}

function dotSize(durationMin: number): number {
  if (durationMin >= 90) return 36;
  if (durationMin >= 60) return 30;
  if (durationMin >= 30) return 26;
  return 22;
}

function stopIcon(stop: DayRouteStop, index: number) {
  const size = dotSize(stop.durationMin);
  const half = size / 2;
  const hasNearMiss = getNearMissForStop(stop.id).length > 0;
  const amberPulse = hasNearMiss
    ? `<div style="position:absolute;left:50%;top:50%;width:${size + 12}px;height:${size + 12}px;margin-left:-${(size + 12) / 2}px;margin-top:-${(size + 12) / 2}px;border-radius:50%;background:rgba(245,158,11,0.25);animation:route-dot-pulse 2s ease-in-out infinite"></div>`
    : '';

  const html = `
<div style="position:relative;width:${size + 16}px;height:${size + 16}px">
  ${amberPulse}
  <div style="position:absolute;left:50%;top:50%;width:${size}px;height:${size}px;margin-left:-${half}px;margin-top:-${half}px;border-radius:50%;background:#00d4aa;border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 16px rgba(0,212,170,0.5);display:flex;align-items:center;justify-content:center;font-size:${size > 28 ? 13 : 11}px;font-weight:700;color:#0f172a;cursor:pointer">${index + 1}</div>
</div>`;
  return L.divIcon({
    html,
    className: 'map-marker-wrap',
    iconSize: [size + 16, size + 16],
    iconAnchor: [(size + 16) / 2, (size + 16) / 2],
  });
}

function timeLabelIcon(stop: DayRouteStop) {
  const html = `
<div style="white-space:nowrap;text-align:center;pointer-events:none">
  <div style="font-size:10px;font-weight:600;color:#94a3b8;line-height:1.2">${stop.startTime} — ${stop.endTime}</div>
  <div style="font-size:9px;color:#64748b;margin-top:1px;max-width:100px;overflow:hidden;text-overflow:ellipsis">${stop.label}</div>
</div>`;
  return L.divIcon({
    html,
    className: 'map-marker-wrap',
    iconSize: [110, 30],
    iconAnchor: [55, -dotSize(stop.durationMin) / 2 - 4],
  });
}

/** Arrow icon placed at midpoint of each segment */
function arrowIcon(fromPos: [number, number], toPos: [number, number]) {
  const angle = Math.atan2(toPos[0] - fromPos[0], toPos[1] - fromPos[1]) * (180 / Math.PI);
  // Leaflet lat/lng: angle from north
  const cssAngle = -angle + 90;
  const html = `<div style="font-size:12px;color:#00d4aa;transform:rotate(${cssAngle}deg);opacity:0.8;pointer-events:none">▶</div>`;
  return L.divIcon({
    html,
    className: 'map-marker-wrap',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function DayRouteLayer({ stops, onStopClick }: DayRouteLayerProps) {
  const map = useMap();
  
  const positions = useMemo(
    () => stops.map((s) => [s.lat, s.lng] as [number, number]),
    [stops],
  );

  const icons = useMemo(() => stops.map((s, i) => stopIcon(s, i)), [stops]);
  const labelIcons = useMemo(() => stops.map((s) => timeLabelIcon(s)), [stops]);

  const midpoints = useMemo(() => {
    const mids: { pos: [number, number]; icon: L.DivIcon }[] = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const a = positions[i];
      const b = positions[i + 1];
      const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      mids.push({ pos: mid, icon: arrowIcon(a, b) });
    }
    return mids;
  }, [positions]);

  // Fit bounds when route first shown
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }
  }, [positions, map]);

  if (stops.length === 0) return null;

  return (
    <>
      {/* Animated dashed route line */}
      {positions.length >= 2 && (
        <Polyline
          positions={positions}
          pathOptions={{
            color: '#00d4aa',
            weight: 2.5,
            opacity: 0.85,
            dashArray: '8 6',
            lineCap: 'round',
            lineJoin: 'round',
            className: 'day-route-line-animated',
          }}
        />
      )}

      {/* Direction arrows at midpoints */}
      {midpoints.map((m, i) => (
        <Marker key={`arrow-${i}`} position={m.pos} icon={m.icon} interactive={false} />
      ))}

      {/* Time labels below dots */}
      {stops.map((s, i) => (
        <Marker
          key={`label-${s.id}`}
          position={[s.lat, s.lng]}
          icon={labelIcons[i]}
          interactive={false}
          zIndexOffset={800}
        />
      ))}

      {/* Stop dots */}
      {stops.map((s, i) => (
        <Marker
          key={s.id}
          position={[s.lat, s.lng]}
          icon={icons[i]}
          zIndexOffset={900}
          eventHandlers={{ click: () => onStopClick(s) }}
        />
      ))}
    </>
  );
}
