import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { C } from '../theme';

export type MapStop = { latitude: number; longitude: number; color: string; label: string };
export type MapPlace = { latitude: number; longitude: number };
/** A stretch of the route in one driver's colour. */
export type MapSection = { color: string; path: [number, number][] };

// The map is drawn on a 390 x 420 sheet. Zooming and panning move a window over that sheet.
const VIEW_W = 390;
const VIEW_H = 420;
const CENTER = { x: VIEW_W / 2, y: VIEW_H / 2 };
// Where the route may be drawn, leaving room for the buttons at the top and the routing card at the bottom.
const AREA = { left: 52, right: 338, top: 84, bottom: 290 };

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 16;
const BUTTON_STEP = 1.6;
/** How far in the recenter button zooms when it jumps to you. */
const LOCATE_ZOOM = 4;
/**
 * The route line grows and shrinks with the zoom, but slower than the map itself:
 * 4x closer makes it 2x thicker on screen, so it never turns into a wide band.
 */
const LINE_GROWTH = 0.5;

type Camera = { cx: number; cy: number; z: number };
const HOME: Camera = { cx: CENTER.x, cy: CENTER.y, z: 1 };

const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

type Projector = (lat: number, lon: number) => { x: number; y: number };

/** Fits real coordinates into the map area, keeping the shape of the land. */
function fit(stops: MapStop[], path: [number, number][]): Projector {
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
  return (lat, lon) => ({
    x: cx + (lon - midLon) * squeeze * scale,
    y: cy - (lat - midLat) * scale,
  });
}

function line(points: { x: number; y: number }[]) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
}

type Model = {
  pins: { x: number; y: number; color: string; label: string }[];
  drawn: string | null;
  /** The route in one colour per driver, when there is more than one driver. */
  sections: { d: string; color: string }[];
  routed: boolean;
  me: { x: number; y: number } | null;
};

function buildModel(stops: MapStop[], path: [number, number][], me: MapPlace | null, sections: MapSection[]): Model {
  const place = fit(stops, path);
  const pins = stops.map((stop) => ({ ...place(stop.latitude, stop.longitude), color: stop.color, label: stop.label }));
  const road = path.length >= 2 ? path.map(([lat, lon]) => place(lat, lon)) : pins;
  return {
    pins,
    drawn: road.length >= 2 ? line(road) : null,
    sections: sections
      .filter((section) => section.path.length >= 2)
      .map((section) => ({ d: line(section.path.map(([lat, lon]) => place(lat, lon))), color: section.color })),
    routed: path.length >= 2,
    me: me ? place(me.latitude, me.longitude) : null,
  };
}

/**
 * The trip map. With no stops it shows the sample North Shore picture. With stops it draws them where they
 * really are, joined by the driving route, or by straight dashes while the route is not known.
 * Drag to pan and pinch to zoom, or use the + and - buttons. The target button jumps to your location,
 * or back to the whole route when there is no location.
 */
export function TripMap({
  stops,
  path,
  me,
  sections,
}: { stops?: MapStop[]; path?: [number, number][] | null; me?: MapPlace | null; sections?: MapSection[] } = {}) {
  const live = Boolean(stops && stops.length > 0);
  const model = useMemo(() => (live && stops ? buildModel(stops, path ?? [], me ?? null, sections ?? []) : null), [live, stops, path, me, sections]);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [camera, setCamera] = useState<Camera>(HOME);
  const cameraRef = useRef(camera);
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const last = useRef<{ count: number; x: number; y: number; spread: number } | null>(null);

  const move = (next: Camera) => {
    cameraRef.current = next;
    setCamera(next);
  };

  // Screen pixels per map unit when zoomed all the way out: the sheet fills the view.
  const baseScale = (w: number, h: number) => Math.max(w / VIEW_W, h / VIEW_H);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        last.current = null;
      },
      onPanResponderMove: (event: { nativeEvent: { touches: { locationX: number; locationY: number }[] } }) => {
        const touches = event.nativeEvent.touches;
        const { w, h } = sizeRef.current;
        if (touches.length === 0 || w === 0) return;

        const x = touches.reduce((sum, touch) => sum + touch.locationX, 0) / touches.length;
        const y = touches.reduce((sum, touch) => sum + touch.locationY, 0) / touches.length;
        const spread =
          touches.length >= 2
            ? Math.hypot(touches[0].locationX - touches[1].locationX, touches[0].locationY - touches[1].locationY)
            : 0;

        const before = last.current;
        last.current = { count: Math.min(touches.length, 2), x, y, spread };
        // A finger was added or lifted: start measuring again from here instead of jumping.
        if (!before || before.count !== last.current.count) return;

        const current = cameraRef.current;
        const base = baseScale(w, h);
        const oldScale = base * current.z;
        const z = before.count === 2 && before.spread > 0 ? clampZoom((current.z * spread) / before.spread) : current.z;
        const newScale = base * z;
        // The map point that was under the fingers stays under the fingers.
        const pointX = current.cx + (before.x - w / 2) / oldScale;
        const pointY = current.cy + (before.y - h / 2) / oldScale;
        move({ cx: pointX - (x - w / 2) / newScale, cy: pointY - (y - h / 2) / newScale, z });
      },
      onPanResponderRelease: () => {
        last.current = null;
      },
      onPanResponderTerminate: () => {
        last.current = null;
      },
    }),
  ).current;

  const zoomBy = (factor: number) => move({ ...cameraRef.current, z: clampZoom(cameraRef.current.z * factor) });
  const recenter = () => {
    if (model?.me) move({ cx: model.me.x, cy: model.me.y, z: LOCATE_ZOOM });
    else move(HOME);
  };

  const ready = size.w > 0 && size.h > 0;
  const scale = ready ? baseScale(size.w, size.h) * camera.z : 1;
  const viewW = size.w / scale;
  const viewH = size.h / scale;
  const viewBox = `${camera.cx - viewW / 2} ${camera.cy - viewH / 2} ${viewW} ${viewH}`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View
        style={StyleSheet.absoluteFill}
        onLayout={(event: { nativeEvent: { layout: { width: number; height: number } } }) =>
          setSize({ w: event.nativeEvent.layout.width, h: event.nativeEvent.layout.height })
        }
        {...responder.panHandlers}
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {ready ? (
            <Svg width="100%" height="100%" viewBox={viewBox}>
              {/* Far larger than the screen, so there is always green to pan across. */}
              <Rect x={-1_000_000} y={-1_000_000} width={2_000_000} height={2_000_000} fill="#D7E6C6" />
              <Ellipse cx="30" cy="60" rx="130" ry="80" fill="#EAF3E0" />
              <Ellipse cx="320" cy="30" rx="150" ry="90" fill="#C5D9B0" />
              <Ellipse cx="210" cy="210" rx="180" ry="100" fill="#C9DEB6" />
              <Ellipse cx="70" cy="340" rx="160" ry="90" fill="#E4F0D8" />
              <Ellipse cx="340" cy="300" rx="130" ry="110" fill="#B7D0A2" />
              <Ellipse cx="370" cy="16" rx="80" ry="56" fill="#C5DDD4" />
              {model ? <Live model={model} zoom={camera.z} /> : <Sample zoom={camera.z} />}
            </Svg>
          ) : null}
        </View>
      </View>

      <View style={styles.controls} pointerEvents="box-none">
        <MapButton icon="plus" label="Zoom in" onPress={() => zoomBy(BUTTON_STEP)} />
        <MapButton icon="minus" label="Zoom out" onPress={() => zoomBy(1 / BUTTON_STEP)} />
        <MapButton icon="crosshairs-gps" label="Go to my location" onPress={recenter} />
      </View>
    </View>
  );
}

function MapButton({ icon, label, onPress }: { icon: 'plus' | 'minus' | 'crosshairs-gps'; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85} accessibilityLabel={label}>
      <MaterialCommunityIcons name={icon} size={20} color={C.teal} />
    </TouchableOpacity>
  );
}

function Live({ model, zoom }: { model: Model; zoom: number }) {
  // Lines are drawn in map units, which the zoom magnifies. Dividing by the zoom to a fractional power
  // leaves them growing more slowly than the map. Pins and labels are shrunk by the full zoom to stay one size.
  const k = Math.pow(zoom, -LINE_GROWTH);
  const keep = 1 / zoom;
  return (
    <>
      {model.drawn ? (
        <>
          <Path d={model.drawn} stroke="#F7FBF3" strokeWidth={16 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {model.sections.length >= 2 ? (
            // One colour per driver: a change of colour is a change of driver.
            model.sections.map((section, index) => (
              <Path
                key={`${section.color}-${index}`}
                d={section.d}
                stroke={section.color}
                strokeWidth={8 * k}
                fill="none"
                strokeLinecap="butt"
                strokeLinejoin="round"
              />
            ))
          ) : (
            <Path
              d={model.drawn}
              stroke="#E2B045"
              strokeWidth={8 * k}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={model.routed ? undefined : `${k} ${14 * k}`}
            />
          )}
        </>
      ) : null}
      {model.pins.map((pin, index) => {
        const width = pin.label.length * 6.6 + 18;
        const above = index % 2 === 0;
        return (
          <G key={`${pin.label}-${index}`} transform={`translate(${pin.x} ${pin.y}) scale(${keep})`}>
            <Rect x={-width / 2} y={above ? -36 : 16} width={width} height={20} rx={8} fill="#FFFFFF" />
            <SvgText x={0} y={above ? -22 : 30} fontSize="11" fontWeight="700" textAnchor="middle" fill={C.ink}>
              {pin.label}
            </SvgText>
            <Circle cx={0} cy={0} r={9} fill="#FFFFFF" />
            <Circle cx={0} cy={0} r={6} fill={pin.color} />
          </G>
        );
      })}
      {model.me ? (
        <G transform={`translate(${model.me.x} ${model.me.y}) scale(${keep})`}>
          <Circle cx={0} cy={0} r={16} fill="#2F80ED" fillOpacity={0.18} />
          <Circle cx={0} cy={0} r={8} fill="#FFFFFF" />
          <Circle cx={0} cy={0} r={5.5} fill="#2F80ED" />
        </G>
      ) : null}
    </>
  );
}

const ROUTE = 'M64 318 Q108 286 132 258 Q168 214 176 184 Q198 146 228 128 Q262 108 286 96';

const STOPS = [
  { x: 64, y: 318, color: '#E26D5A', label: 'Pipeline', lx: 16, ly: 284 },
  { x: 132, y: 258, color: '#E2B045', label: 'Haleiwa', lx: 8, ly: 198 },
  { x: 176, y: 184, color: '#3AA99A', label: "Shark's", lx: 192, ly: 160 },
  { x: 228, y: 128, color: '#5B7CFA', label: 'Sunset', lx: 168, ly: 96 },
  { x: 286, y: 96, color: '#8B6CC4', label: 'Turtle Bay', lx: 196, ly: 62 },
];

/** The sample picture shown before a trip has any routed stops. It zooms the same way as a real route. */
function Sample({ zoom }: { zoom: number }) {
  const k = Math.pow(zoom, -LINE_GROWTH);
  const keep = 1 / zoom;
  return (
    <>
      <Path d={ROUTE} stroke="#F7FBF3" strokeWidth={16 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Path d={ROUTE} stroke="#E2B045" strokeWidth={8 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {STOPS.map((stop) => {
        const width = stop.label.length * 6.6 + 18;
        return (
          <G key={stop.label} transform={`translate(${stop.x} ${stop.y}) scale(${keep})`}>
            <Rect x={stop.lx - stop.x} y={stop.ly - stop.y} width={width} height={20} rx={8} fill="#FFFFFF" />
            <SvgText
              x={stop.lx - stop.x + width / 2}
              y={stop.ly - stop.y + 14}
              fontSize="11"
              fontWeight="700"
              textAnchor="middle"
              fill={C.ink}
            >
              {stop.label}
            </SvgText>
            <Circle cx={0} cy={0} r={9} fill="#FFFFFF" />
            <Circle cx={0} cy={0} r={6} fill={stop.color} />
          </G>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    top: 112,
    right: 16,
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
