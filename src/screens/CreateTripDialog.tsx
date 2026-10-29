import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PrimaryButton, QuietButton } from '../components/Buttons';
import { Dialog, dialogStyles } from '../components/Dialog';
import { Field } from '../components/Field';
import { C } from '../theme';

export function CreateTripDialog({
  editing,
  name,
  start,
  end,
  startDate,
  endDate,
  budget,
  image,
  onName,
  onStart,
  onEnd,
  onStartDate,
  onEndDate,
  onBudget,
  onImage,
  onSubmit,
  onClose,
  canSubmit,
  submitting,
  error,
}: {
  editing: boolean;
  name: string;
  start: string;
  end: string;
  startDate: string;
  endDate: string;
  budget: string;
  image: string | null;
  onName: (value: string) => void;
  onStart: (value: string) => void;
  onEnd: (value: string) => void;
  onStartDate: (value: string) => void;
  onEndDate: (value: string) => void;
  onBudget: (value: string) => void;
  onImage: (uri: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  canSubmit: boolean;
  submitting?: boolean;
  error?: string | null;
}) {
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const choosePhoto = async () => {
    setBusy(true);
    setNote(null);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setNote('Photo access is off, so this trip will keep its current picture.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) onImage(result.assets[0].uri);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
        <Text style={dialogStyles.title}>{editing ? 'Edit Trip' : 'Start a New Trip'}</Text>
        <Text style={dialogStyles.sub}>
          {editing
            ? 'Update the name, dates, budget, or picture.'
            : 'Name the road, set a budget, then bring your crew along.'}
        </Text>
        <Field label="Trip name" value={name} onChangeText={onName} placeholder="North Shore Getaway" />
        <Field label="Start" value={start} onChangeText={onStart} placeholder="Ala Moana" />
        <Field label="End" value={end} onChangeText={onEnd} placeholder="Turtle Bay" />
        <Field label="Start date" value={startDate} onChangeText={onStartDate} placeholder="Apr 04, 2026" />
        <Field label="End date" value={endDate} onChangeText={onEndDate} placeholder="Apr 07, 2026" />
        <Field label="Budget" value={budget} onChangeText={onBudget} placeholder="500" keyboardType="decimal-pad" />
        <Text style={styles.pictureLabel}>Picture</Text>
        <TouchableOpacity onPress={choosePhoto} activeOpacity={0.85} disabled={busy} accessibilityLabel="Add a trip picture">
          {image ? (
            <Image source={{ uri: image }} style={styles.picture} />
          ) : (
            <View style={styles.pictureEmpty}>
              <Ionicons name="image-outline" size={22} color={C.teal} />
              <Text style={styles.pictureText}>{busy ? 'Opening…' : 'Add a picture'}</Text>
            </View>
          )}
        </TouchableOpacity>
        {image ? <Text style={styles.change}>Tap the picture to change it</Text> : null}
        {note ? <Text style={styles.note}>{note}</Text> : null}
        {error ? <Text style={styles.note}>{error}</Text> : null}
        <View style={dialogStyles.actions}>
          <PrimaryButton
            label={editing ? 'Save' : submitting ? 'Creating…' : 'Create Trip'}
            onPress={onSubmit}
            disabled={!canSubmit || busy || submitting}
            loading={submitting}
          />
          <QuietButton label="Cancel" onPress={onClose} />
        </View>
      </ScrollView>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  pictureLabel: {
    marginTop: 14,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: C.body,
  },
  picture: {
    width: '100%',
    height: 140,
    borderRadius: 14,
  },
  pictureEmpty: {
    height: 88,
    borderRadius: 12,
    backgroundColor: C.field,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pictureText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.teal,
  },
  change: {
    marginTop: 6,
    fontSize: 12,
    color: C.muted,
  },
  note: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: C.muted,
  },
});
