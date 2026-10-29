import { ScrollView, Text, View } from 'react-native';
import { PrimaryButton, QuietButton } from '../components/Buttons';
import { Dialog, dialogStyles } from '../components/Dialog';
import { Field } from '../components/Field';

export function CreateTripDialog({
  name,
  start,
  end,
  startDate,
  endDate,
  onName,
  onStart,
  onEnd,
  onStartDate,
  onEndDate,
  onCreate,
  onClose,
  canCreate,
}: {
  name: string;
  start: string;
  end: string;
  startDate: string;
  endDate: string;
  onName: (value: string) => void;
  onStart: (value: string) => void;
  onEnd: (value: string) => void;
  onStartDate: (value: string) => void;
  onEndDate: (value: string) => void;
  onCreate: () => void;
  onClose: () => void;
  canCreate: boolean;
}) {
  return (
    <Dialog onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
        <Text style={dialogStyles.title}>Start a New Trip</Text>
        <Text style={dialogStyles.sub}>Name the road, then bring your crew along.</Text>
        <Field label="Trip name" value={name} onChangeText={onName} placeholder="North Shore Getaway" />
        <Field label="Start" value={start} onChangeText={onStart} placeholder="Ala Moana" />
        <Field label="End" value={end} onChangeText={onEnd} placeholder="Turtle Bay" />
        <Field label="Start date" value={startDate} onChangeText={onStartDate} placeholder="Apr 04, 2026" />
        <Field label="End date" value={endDate} onChangeText={onEndDate} placeholder="Apr 07, 2026" />
        <View style={dialogStyles.actions}>
          <PrimaryButton label="Create Trip" onPress={onCreate} disabled={!canCreate} />
          <QuietButton label="Cancel" onPress={onClose} />
        </View>
      </ScrollView>
    </Dialog>
  );
}
