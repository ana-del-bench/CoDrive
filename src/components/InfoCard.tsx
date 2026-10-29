import { StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';

export function InfoCard({
  kicker,
  title,
  note,
  trailing,
}: {
  kicker: string;
  title: string;
  note: string;
  trailing: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>{kicker}</Text>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.note}>{note}</Text>
        </View>
        <Text style={styles.trailing}>{trailing}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    backgroundColor: C.rest,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: C.muted,
  },
  row: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: C.ink,
  },
  note: {
    marginTop: 2,
    fontSize: 13,
    color: C.muted,
  },
  trailing: {
    fontSize: 15,
    fontWeight: '700',
    color: C.teal,
  },
});
