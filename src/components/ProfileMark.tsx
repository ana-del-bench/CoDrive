import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';

export function ProfileMark({ uri, size }: { uri: string | null; size: number }) {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }

  return (
    <View style={[styles.anonymous, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="person" size={Math.round(size * 0.55)} color={C.white} />
    </View>
  );
}

const styles = StyleSheet.create({
  anonymous: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.teal,
  },
});
