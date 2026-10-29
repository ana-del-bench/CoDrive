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

export function TripMap() {
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
