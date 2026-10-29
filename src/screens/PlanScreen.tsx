import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, cardShadow, layout } from '../theme';
import type { Trip } from '../types';
import { TripHeader } from '../components/TripHeader';

export function PlanScreen({
  trip,
  draft,
  onDraft,
  onAdd,
  onLike,
  onInvite,
}: {
  trip: Trip;
  draft: string;
  onDraft: (value: string) => void;
  onAdd: () => void;
  onLike: (id: string) => void;
  onInvite: () => void;
}) {
  return (
    <View style={layout.fill}>
      <ScrollView style={layout.fill} contentContainerStyle={layout.scroll} showsVerticalScrollIndicator={false}>
        <TripHeader trip={trip} onInvite={onInvite} />
        <Text style={layout.section}>Proposed stops</Text>
        {trip.waypoints.map((stop) => (
          <View key={stop.id} style={styles.card}>
            <Image source={{ uri: stop.image }} style={styles.photo} />
            <View style={styles.body}>
              <Text style={styles.title}>{stop.title}</Text>
              <Text style={styles.meta}>
                {stop.detail} · Proposed by {stop.proposedBy}
              </Text>
              <TouchableOpacity style={styles.likeRow} onPress={() => onLike(stop.id)} activeOpacity={0.7}>
                <Ionicons
                  name={stop.liked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={stop.liked ? '#E26D5A' : C.muted}
                />
                <Text style={styles.likeCount}>{stop.likes}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Suggest a new waypoint..."
          placeholderTextColor={C.faint}
          value={draft}
          onChangeText={onDraft}
          onSubmitEditing={onAdd}
          returnKeyType="done"
        />
        <TouchableOpacity style={styles.add} onPress={onAdd} activeOpacity={0.85}>
          <Ionicons name="add" size={22} color={C.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    ...cardShadow,
  },
  photo: {
    width: '100%',
    height: 168,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: C.ink,
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: C.muted,
  },
  likeRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  likeCount: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.cream,
  },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.white,
    paddingHorizontal: 16,
    fontSize: 15,
    color: C.ink,
  },
  add: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
