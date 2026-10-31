import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, QuietButton } from '../components/Buttons';
import { Dialog, dialogStyles } from '../components/Dialog';
import { Field } from '../components/Field';
import { C } from '../theme';

/** The only thing a new trip needs is a name. Everything else is set on the Trip tab afterwards. */
export function CreateTripDialog({
  name,
  onName,
  onSubmit,
  onClose,
  canSubmit,
  submitting,
  error,
}: {
  name: string;
  onName: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  canSubmit: boolean;
  submitting?: boolean;
  error?: string | null;
}) {
  return (
    <Dialog onClose={onClose}>
      <Text style={dialogStyles.title}>Start a New Trip</Text>
      <Text style={dialogStyles.sub}>Name the road. You can add the route, dates, budget and drivers next.</Text>
      <Field
        label="Trip name"
        value={name}
        onChangeText={onName}
        placeholder="North Shore Getaway"
        maxLength={80}
        onSubmitEditing={canSubmit && !submitting ? onSubmit : undefined}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={dialogStyles.actions}>
        <PrimaryButton
          label={submitting ? 'Creating…' : 'Create Trip'}
          onPress={onSubmit}
          disabled={!canSubmit || submitting}
          loading={submitting}
        />
        <QuietButton label="Cancel" onPress={onClose} />
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  error: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: C.muted,
  },
});
