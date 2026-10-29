import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { C } from '../theme';
import { PrimaryButton } from '../components/Buttons';
import { Dialog, dialogStyles } from '../components/Dialog';
import { InfoCard } from '../components/InfoCard';

export function ConnectionDialog({ driverName, onClose }: { driverName: string; onClose: () => void }) {
  return (
    <Dialog onClose={onClose}>
      <View style={styles.iconWrap}>
        <View style={styles.bluetooth}>
          <MaterialCommunityIcons name="bluetooth" size={22} color="#3A78C2" />
        </View>
      </View>
      <Text style={[dialogStyles.title, dialogStyles.center]}>Connection Lost</Text>
      <Text style={styles.hint}>
        Live maps are out of reach. CoDrive will keep using cached offline maps for this journey. Updates return
        when Wi-Fi or cellular data is back. Crew nearby can still sync over Bluetooth.
      </Text>
      <InfoCard kicker="LOCAL PEER CONNECTED" title={driverName} note="Nearby · cached maps on" trailing="Bluetooth" />
      <View style={dialogStyles.actions}>
        <PrimaryButton label="Got it" onPress={onClose} />
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  bluetooth: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5F0FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: C.muted,
  },
});
