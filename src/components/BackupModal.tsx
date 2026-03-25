import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Clipboard,
  ScrollView,
} from 'react-native';
import { useScrudget } from '../context/ScrudgetContext';

interface BackupModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function BackupModal({ visible, onClose }: BackupModalProps) {
  const { state, dispatch, colors } = useScrudget();
  const [importText, setImportText] = useState('');

  const exportData = () => {
    const data = JSON.stringify({
      scrudgets: state.scrudgets,
      expenses: state.expenses,
      periods: state.periods,
    }, null, 2);
    Clipboard.setString(data);
    if (Platform.OS === 'web') {
      alert('Backup data copied to clipboard!');
    } else {
      Alert.alert('Success', 'Backup data copied to clipboard!');
    }
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (parsed.scrudgets && parsed.expenses && parsed.periods) {
        if (Platform.OS === 'web') {
            if (window.confirm('This will OVERWRITE all current data. Are you sure?')) {
                dispatch({ 
                    type: 'LOAD_DATA', 
                    payload: { 
                        scrudgets: parsed.scrudgets, 
                        expenses: parsed.expenses, 
                        periods: parsed.periods, 
                        themePref: state.themePreference 
                    } 
                });
                onClose();
            }
        } else {
            Alert.alert(
                'Overwrite Data',
                'This will replace all current scrudgets and expenses. Continue?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Import', 
                        onPress: () => {
                            dispatch({ 
                                type: 'LOAD_DATA', 
                                payload: { 
                                    scrudgets: parsed.scrudgets, 
                                    expenses: parsed.expenses, 
                                    periods: parsed.periods, 
                                    themePref: state.themePreference 
                                } 
                            });
                            onClose();
                        }
                    }
                ]
            );
        }
      } else {
        throw new Error('Invalid data format');
      }
    } catch (e) {
      if (Platform.OS === 'web') {
        alert('Invalid backup data. Please check and try again.');
      } else {
        Alert.alert('Error', 'Invalid backup data. Please check and try again.');
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}
      >
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Cloud Sync & Backup</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Use this to manually backup your data or move it to another device.
          </Text>

          <TouchableOpacity style={[styles.exportBtn, { backgroundColor: colors.accent }]} onPress={exportData}>
            <Text style={styles.exportBtnText}>Copy Backup Data (JSON)</Text>
          </TouchableOpacity>

          <View style={[styles.separator, { backgroundColor: colors.border }]} />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Import Data</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="Paste your backup JSON here..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={importText}
            onChangeText={setImportText}
          />

          <View style={styles.buttons}>
            <TouchableOpacity 
              style={[styles.cancelBtn, { borderColor: colors.border }]} 
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.importBtn,
                { backgroundColor: colors.negative },
                !importText.trim() && styles.disabledBtn,
              ]}
              onPress={handleImport}
              disabled={!importText.trim()}
            >
              <Text style={styles.importBtnText}>Import</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
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
    width: '90%',
    borderWidth: 1,
    maxWidth: 500,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exportBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  exportBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    height: 120,
    textAlignVertical: 'top',
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  importBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  importBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
