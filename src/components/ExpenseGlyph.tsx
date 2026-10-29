import { StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ExpenseIcon } from '../types';

const TONE = {
  food: { bg: '#FDE8D8', color: '#E07A3D' },
  snorkel: { bg: '#DDF3EF', color: '#0E9F8A' },
  stay: { bg: '#E8E4F8', color: '#6B5BD6' },
  treat: { bg: '#FDE7F0', color: '#D4537E' },
  gas: { bg: '#E5EEF8', color: '#3A78C2' },
} as const;

export function ExpenseGlyph({ kind }: { kind: ExpenseIcon }) {
  const tone = TONE[kind];

  return (
    <View style={[styles.glyph, { backgroundColor: tone.bg }]}>
      {kind === 'gas' ? (
        <MaterialCommunityIcons name="gas-station" size={18} color={tone.color} />
      ) : (
        <Ionicons
          name={
            kind === 'food'
              ? 'restaurant-outline'
              : kind === 'snorkel'
                ? 'water-outline'
                : kind === 'stay'
                  ? 'bed-outline'
                  : 'ice-cream-outline'
          }
          size={18}
          color={tone.color}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glyph: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
