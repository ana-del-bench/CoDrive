import { StyleSheet, Text, View } from 'react-native';
import { C } from '../theme';
import type { Crew } from '../types';

export function AvatarStack({ people, size = 28 }: { people: Crew[]; size?: number }) {
  return (
    <View style={styles.row}>
      {people.slice(0, 4).map((person, index) => (
        <View
          key={person.id}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: person.color,
              marginLeft: index === 0 ? 0 : -size * 0.32,
            },
          ]}
        >
          <Text style={[styles.text, { fontSize: size * 0.38 }]}>{person.initial}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: C.white,
    fontWeight: '700',
  },
});
