import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatIso, MONTH_NAMES, parseIso, todayIso, toIso } from '../dates';
import { C } from '../theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * A date-only input. Tapping it opens a month calendar; nothing can be typed.
 * `value` and `min` are YYYY-MM-DD strings ('' when empty).
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder,
  min,
}: {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  placeholder: string;
  min?: string;
}) {
  const [open, setOpen] = useState(false);
  const anchor = parseIso(value) ?? parseIso(min ?? '') ?? parseIso(todayIso())!;
  const [view, setView] = useState({ year: anchor.year, month: anchor.month });

  const toggle = () => {
    if (!open) {
      const target = parseIso(value) ?? parseIso(min ?? '') ?? parseIso(todayIso())!;
      setView({ year: target.year, month: target.month });
    }
    setOpen(!open);
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(view.year, view.month + delta, 1);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  };

  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const leading = new Date(view.year, view.month, 1).getDay();
  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const today = todayIso();
  const shown = formatIso(value);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={toggle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${label}${shown ? `, ${shown}` : ''}`}
      >
        <Text style={shown ? styles.value : styles.placeholder}>{shown || placeholder}</Text>
        <Ionicons name="calendar-outline" size={20} color={C.teal} />
      </TouchableOpacity>

      {open ? (
        <View style={styles.calendar}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.nav} onPress={() => shiftMonth(-1)} accessibilityLabel="Previous month">
              <Ionicons name="chevron-back" size={18} color={C.body} />
            </TouchableOpacity>
            <Text style={styles.month}>
              {MONTH_NAMES[view.month]} {view.year}
            </Text>
            <TouchableOpacity style={styles.nav} onPress={() => shiftMonth(1)} accessibilityLabel="Next month">
              <Ionicons name="chevron-forward" size={18} color={C.body} />
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            {WEEKDAYS.map((day, index) => (
              <Text key={`${day}-${index}`} style={styles.weekday}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((day, index) => {
              if (day === null) return <View key={`blank-${index}`} style={styles.cell} />;
              const iso = toIso(view.year, view.month, day);
              const disabled = min !== undefined && min !== '' && iso < min;
              const selected = iso === value;
              return (
                <View key={iso} style={styles.cell}>
                  <TouchableOpacity
                    style={[styles.day, selected && styles.daySelected, !selected && iso === today && styles.dayToday]}
                    disabled={disabled}
                    onPress={() => {
                      onChange(iso);
                      setOpen(false);
                    }}
                    accessibilityLabel={formatIso(iso)}
                  >
                    <Text style={[styles.dayText, selected && styles.dayTextSelected, disabled && styles.dayTextOff]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.body,
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 12,
    backgroundColor: C.field,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 16,
    color: C.ink,
  },
  placeholder: {
    fontSize: 16,
    color: C.faint,
  },
  calendar: {
    marginTop: 8,
    borderRadius: 14,
    backgroundColor: C.field,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nav: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: {
    fontSize: 15,
    fontWeight: '700',
    color: C.ink,
  },
  row: {
    flexDirection: 'row',
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
    paddingVertical: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 2,
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelected: {
    backgroundColor: C.teal,
  },
  dayToday: {
    borderWidth: 1,
    borderColor: C.teal,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.ink,
  },
  dayTextSelected: {
    color: C.white,
  },
  dayTextOff: {
    color: C.faint,
    opacity: 0.5,
  },
});
