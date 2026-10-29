import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { C } from '../theme';

export function Ring({ progress }: { progress: number }) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const pct = Math.round(clamped * 100);

  return (
    <View style={styles.ring}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#E6E1D8" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={C.teal}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.label}>
        <Text style={styles.text}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: C.teal,
  },
});
