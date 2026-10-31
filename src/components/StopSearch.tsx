import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nearbyPlaces, searchAddresses, type AddressSuggestion, type PlaceKind } from '../api';
import { C } from '../theme';

const MIN_CHARS = 3;
const PAUSE_MS = 350;

const KINDS: { kind: PlaceKind; label: string }[] = [
  { kind: 'food', label: 'Food' },
  { kind: 'gas', label: 'Gas' },
  { kind: 'beach', label: 'Beaches' },
  { kind: 'sights', label: 'Sights' },
  { kind: 'lodging', label: 'Stays' },
];

type Anchor = { latitude: number; longitude: number };

/**
 * The "Suggest a new waypoint" box. Typing suggests real places (nearest to the trip first),
 * and the chips list food, gas, beaches and more near the end of the route.
 * Plain text still works: press done to suggest a stop that has no location.
 */
export function StopSearch({
  value,
  onChangeText,
  onSubmit,
  onPick,
  anchor,
}: {
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  onPick: (place: AddressSuggestion) => void;
  anchor: Anchor | null;
}) {
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [kind, setKind] = useState<PlaceKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped whenever a search starts or is cancelled, so late answers from older searches are ignored.
  const latest = useRef(0);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      latest.current += 1;
    },
    [],
  );

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    latest.current += 1;
    setResults([]);
    setKind(null);
    setLoading(false);
    setProblem(null);
  };

  const run = (task: () => Promise<{ results: AddressSuggestion[] }>, delay: number) => {
    if (timer.current) clearTimeout(timer.current);
    const ticket = ++latest.current;
    setLoading(true);
    setProblem(null);
    timer.current = setTimeout(async () => {
      try {
        const found = await task();
        if (ticket !== latest.current) return;
        setResults(found.results);
        if (found.results.length === 0) setProblem('Nothing found nearby.');
      } catch (error) {
        if (ticket !== latest.current) return;
        setResults([]);
        setProblem(error instanceof Error ? error.message : 'Search failed');
      } finally {
        if (ticket === latest.current) setLoading(false);
      }
    }, delay);
  };

  const change = (next: string) => {
    onChangeText(next);
    setKind(null);
    const query = next.trim();
    if (query.length < MIN_CHARS) {
      reset();
      return;
    }
    run(() => searchAddresses(query, anchor), PAUSE_MS);
  };

  const chooseKind = (next: PlaceKind) => {
    if (kind === next) {
      reset();
      return;
    }
    if (!anchor) {
      reset();
      setProblem('Add a start or stop with a location first, then we can search near it.');
      return;
    }
    setKind(next);
    setResults([]);
    run(() => nearbyPlaces(next, anchor), 0);
  };

  const pick = (place: AddressSuggestion) => {
    reset();
    setFocused(false);
    onPick(place);
  };

  // Typed suggestions close when the box loses focus; a tap on a suggestion gets a moment to land first.
  const blur = () => {
    setTimeout(() => {
      setFocused(false);
      if (kind === null) reset();
    }, 200);
  };

  const open = focused || kind !== null || results.length > 0 || problem !== null;

  return (
    <View style={styles.wrap}>
      {open ? (
        <View style={styles.panel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.chips}>
            {KINDS.map((item) => (
              <TouchableOpacity
                key={item.kind}
                onPress={() => chooseKind(item.kind)}
                activeOpacity={0.8}
                style={[styles.chip, kind === item.kind && styles.chipOn]}
              >
                <Text style={[styles.chipText, kind === item.kind && styles.chipTextOn]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            {loading ? <ActivityIndicator size="small" color={C.teal} style={styles.spinner} /> : null}
          </ScrollView>
          {results.length > 0 ? (
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {results.map((item) => (
                <TouchableOpacity key={item.id} style={styles.row} activeOpacity={0.7} onPress={() => pick(item)} accessibilityLabel={item.label}>
                  <Ionicons name="location-outline" size={18} color={C.teal} />
                  <View style={styles.copy}>
                    <Text style={styles.line1} numberOfLines={1}>
                      {item.line1 || item.label}
                    </Text>
                    {item.line2 ? (
                      <Text style={styles.line2} numberOfLines={1}>
                        {item.line2}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}
          {problem ? <Text style={styles.problem}>{problem}</Text> : null}
        </View>
      ) : null}
      <TextInput
        style={styles.input}
        placeholder="Suggest a new waypoint..."
        placeholderTextColor={C.faint}
        value={value}
        onChangeText={change}
        onFocus={() => setFocused(true)}
        onBlur={blur}
        onSubmitEditing={onSubmit}
        returnKeyType="done"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  panel: {
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: C.white,
    paddingVertical: 8,
  },
  chips: {
    paddingHorizontal: 10,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: C.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: C.teal,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.body,
  },
  chipTextOn: {
    color: C.white,
  },
  spinner: {
    marginLeft: 4,
  },
  list: {
    maxHeight: 220,
    marginTop: 6,
  },
  row: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copy: {
    flex: 1,
  },
  line1: {
    fontSize: 15,
    fontWeight: '600',
    color: C.ink,
  },
  line2: {
    marginTop: 1,
    fontSize: 12,
    color: C.muted,
  },
  problem: {
    marginTop: 8,
    paddingHorizontal: 14,
    fontSize: 12,
    lineHeight: 17,
    color: C.muted,
  },
  input: {
    height: 46,
    borderRadius: 23,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    fontSize: 15,
    color: C.ink,
  },
});
