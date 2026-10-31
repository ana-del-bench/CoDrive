import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { C } from '../theme';

const ROUTE = 'M64 318 Q108 286 132 258 Q168 214 176 184 Q198 146 228 128 Q262 108 286 96';

const STOPS = [
  { x: 64, y: 318, color: '#E26D5A', label: 'Pipeline', lx: 16, ly: 284 },
  { x: 132, y: 258, color: '#E2B045', label: 'Haleiwa', lx: 8, ly: 198 },
  { x: 176, y: 184, color: '#3AA99A', label: "Shark's", lx: 192, ly: 160 },
  { x: 228, y: 128, color: '#5B7CFA', label: 'Sunset', lx: 168, ly: 96 },
  { x: 286, y: 96, color: '#8B6CC4', label: 'Turtle Bay', lx: 196, ly: 62 },
];

export type MapStop = { latitude: number; longitude: number; color: string; label: string };

const VIEW_W = 390;
const VIEW_H = 420;
// Where the route may be drawn, leaving room for the buttons at the top and the routing card at the bottom.
const AREA = { left: 52, right: 338, top: 84, bottom: 290 };

/** Fits real coordinates into the map area, keeping the shape of the land. */
function fit(stops: MapStop[], path: [number, number][]) {
  const points: [number, number][] = [...path, ...stops.map((stop): [number, number] => [stop.latitude, stop.longitude])];
  const lats = points.map((point) => point[0]);
  const lons = points.map((point) => point[1]);
  const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const midLon = (Math.min(...lons) + Math.max(...lons)) / 2;
  const squeeze = Math.cos((midLat * Math.PI) / 180);
  const width = (Math.max(...lons) - Math.min(...lons)) * squeeze;
  const height = Math.max(...lats) - Math.min(...lats);
  const boxW = AREA.right - AREA.left;
  const boxH = AREA.bottom - AREA.top;
  const scale = width === 0 && height === 0 ? 1 : Math.min(width === 0 ? Infinity : boxW / width, height === 0 ? Infinity : boxH / height);
  const cx = (AREA.left + AREA.right) / 2;
  const cy = (AREA.top + AREA.bottom) / 2;
  return (lat: number, lon: number) => ({
    x: cx + (lon - midLon) * squeeze * scale,
    y: cy - (lat - midLat) * scale,
  });
}

function line(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
}

/**
 * With no stops it shows the sample North Shore picture. With stops it draws them where they really are,
 * joined by the driving route, or by straight dashes while the route is not known.
 */
export function TripMap({ stops, path }: { stops?: MapStop[]; path?: [number, number][] | null } = {}) {
  if (stops && stops.length > 0) return <LiveMap stops={stops} path={path ?? []} />;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox="0 0 390 420" preserveAspectRatio="xMidYMid slice">
        <Rect width="390" height="420" fill="#D7E6C6" />
        <Ellipse cx="30" cy="60" rx="130" ry="80" fill="#EAF3E0" />
        <Ellipse cx="320" cy="30" rx="150" ry="90" fill="#C5D9B0" />
        <Ellipse cx="210" cy="210" rx="180" ry="100" fill="#C9DEB6" />
        <Ellipse cx="70" cy="340" rx="160" ry="90" fill="#E4F0D8" />
        <Ellipse cx="340" cy="300" rx="130" ry="110" fill="#B7D0A2" />
        <Ellipse cx="370" cy="16" rx="80" ry="56" fill="#C5DDD4" />
        <Path d={ROUTE} stroke="#F7FBF3" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={ROUTE} stroke="#E2B045" strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {STOPS.map((stop) => {
          const width = stop.label.length * 6.6 + 18;
          return (
            <G key={stop.label}>
              <Rect x={stop.lx} y={stop.ly} width={width} height={20} rx={8} fill="#FFFFFF" />
              <SvgText
                x={stop.lx + width / 2}
                y={stop.ly + 14}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                fill={C.ink}
              >
                {stop.label}
              </SvgText>
              <Circle cx={stop.x} cy={stop.y} r={9} fill="#FFFFFF" />
              <Circle cx={stop.x} cy={stop.y} r={6} fill={stop.color} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

function LiveMap({ stops, path }: { stops: MapStop[]; path: [number, number][] }) {
  const place = fit(stops, path);
  const pins = stops.map((stop) => ({ ...stop, ...place(stop.latitude, stop.longitude) }));
  const road = path.length >= 2 ? path.map(([lat, lon]) => place(lat, lon)) : pins;
  const drawn = road.length >= 2 ? line(road) : null;

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice">
        <Rect width={VIEW_W} height={VIEW_H} fill="#D7E6C6" />
        <Ellipse cx="30" cy="60" rx="130" ry="80" fill="#EAF3E0" />
        <Ellipse cx="320" cy="30" rx="150" ry="90" fill="#C5D9B0" />
        <Ellipse cx="210" cy="210" rx="180" ry="100" fill="#C9DEB6" />
        <Ellipse cx="70" cy="340" rx="160" ry="90" fill="#E4F0D8" />
        <Ellipse cx="340" cy="300" rx="130" ry="110" fill="#B7D0A2" />
        <Ellipse cx="370" cy="16" rx="80" ry="56" fill="#C5DDD4" />
        {drawn ? (
          <>
            <Path d={drawn} stroke="#F7FBF3" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <Path
              d={drawn}
              stroke="#E2B045"
              strokeWidth={8}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={path.length >= 2 ? undefined : '1 14'}
            />
          </>
        ) : null}
        {pins.map((stop, index) => {
          const width = stop.label.length * 6.6 + 18;
          const lx = Math.min(Math.max(stop.x - width / 2, 8), VIEW_W - width - 8);
          const ly = index % 2 === 0 ? stop.y - 36 : stop.y + 16;
          return (
            <G key={`${stop.label}-${index}`}>
              <Rect x={lx} y={ly} width={width} height={20} rx={8} fill="#FFFFFF" />
              <SvgText x={lx + width / 2} y={ly + 14} fontSize="11" fontWeight="700" textAnchor="middle" fill={C.ink}>
                {stop.label}
              </SvgText>
              <Circle cx={stop.x} cy={stop.y} r={9} fill="#FFFFFF" />
              <Circle cx={stop.x} cy={stop.y} r={6} fill={stop.color} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
