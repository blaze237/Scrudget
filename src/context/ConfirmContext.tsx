import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useScrudget } from './ScrudgetContext';

interface ConfirmConfig {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmContextType {
  showConfirmDialog: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { colors } = useScrudget();
  const [config, setConfig] = useState<ConfirmConfig | null>(null);

  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    setConfig({ title, message, onConfirm, onCancel });
  };

  const handleConfirm = () => {
    if (config?.onConfirm) config.onConfirm();
    setConfig(null);
  };

  const handleCancel = () => {
    if (config?.onCancel) config.onCancel();
    setConfig(null);
  };

  return (
    <ConfirmContext.Provider value={{ showConfirmDialog }}>
      {children}
      {config && (
        <Modal visible transparent animationType="fade">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
          >
            <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{config.title}</Text>
              <Text style={[styles.message, { color: colors.textSecondary }]}>{config.message}</Text>
              <View style={styles.buttons}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.textSecondary }]} onPress={handleCancel}>
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>No</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.accent }]} onPress={handleConfirm}>
                  <Text style={[styles.confirmText, { color: '#ffffff' }]}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextType {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    borderRadius: 16,
    padding: 24,
    width: '85%',
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
