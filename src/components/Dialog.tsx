import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { C } from '../theme';

export function Dialog({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={dialogStyles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={dialogStyles.card}>{children}</View>
    </KeyboardAvoidingView>
  );
}

export const dialogStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(17, 28, 22, 0.58)',
    justifyContent: 'center',
    paddingHorizontal: 18,
    zIndex: 40,
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 8,
    maxHeight: '90%',
    shadowColor: '#1C1917',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: C.ink,
    letterSpacing: -0.3,
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: C.muted,
  },
  actions: {
    marginTop: 18,
  },
  center: {
    textAlign: 'center',
  },
});
