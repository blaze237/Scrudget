import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useScrudget } from '../context/ScrudgetContext';
import ScrudgetCard from '../components/ScrudgetCard';
import AddScrudgetModal from '../components/AddScrudgetModal';
import EditScrudgetModal from '../components/EditScrudgetModal';
import ActionMenuModal from '../components/ActionMenuModal';
import { useConfirm } from '../context/ConfirmContext';
import { formatCurrency } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { state, dispatch, colors } = useScrudget();
  const { showConfirmDialog } = useConfirm();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedScrudget, setSelectedScrudget] = useState<{ id: string, name: string, baseValue: number, color: string } | null>(null);

  const totalBalance = state.scrudgets.reduce((sum, b) => sum + b.currentBalance, 0);

  const handleAddScrudget = useCallback(
    (name: string, baseValue: number, color: string) => {
      dispatch({ type: 'ADD_SCRUDGET', payload: { name, baseValue, color } });
    },
    [dispatch]
  );

  const handleEditScrudget = useCallback(
    (id: string, name: string, baseValue: number, color: string) => {
      dispatch({ type: 'EDIT_SCRUDGET', payload: { scrudgetId: id, name, baseValue, color } });
    },
    [dispatch]
  );

  const handleResetScrudgets = useCallback(() => {
    if (state.scrudgets.length === 0) return;
    showConfirmDialog(
      'Reset All Scrudgets',
      'This will reset all scrudget balances to their base values and archive the current period. Continue?',
      () => dispatch({ type: 'RESET_ALL_SCRUDGETS' })
    );
  }, [dispatch, state.scrudgets.length, showConfirmDialog]);

  const handleDeleteScrudget = useCallback(() => {
    if (!selectedScrudget) return;
    showConfirmDialog(
      'Delete Scrudget',
      `Are you sure you want to delete "${selectedScrudget.name}"? This cannot be undone.`,
      () => {
        dispatch({ type: 'DELETE_SCRUDGET', payload: { scrudgetId: selectedScrudget.id } });
        setSelectedScrudget(null);
      }
    );
  }, [dispatch, selectedScrudget, showConfirmDialog]);

  const openActionMenu = (scrudget: any) => {
    setSelectedScrudget({ id: scrudget.id, name: scrudget.name, baseValue: scrudget.baseValue, color: scrudget.color || '#fff' });
    setShowActionMenu(true);
  };

  const onActionMenuEdit = () => {
    setShowActionMenu(false);
    setTimeout(() => setShowEditModal(true), 300); // Wait for modal close animation
  };

  const onActionMenuDelete = () => {
    setShowActionMenu(false);
    setTimeout(() => handleDeleteScrudget(), 300);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={state.themePreference === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Image source={require('../../assets/icon.png')} style={{ width: 32, height: 32, borderRadius: 8 }} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Scrudgets</Text>
        <TouchableOpacity style={styles.themeToggle} onPress={() => dispatch({ type: 'TOGGLE_THEME' })}>
          <Text style={{ fontSize: 24, color: colors.textPrimary }}>
            {state.themePreference === 'light' ? '🌙' : '☀️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrudget List */}
      <FlatList
        data={state.scrudgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ScrudgetCard
            name={item.name}
            balance={item.currentBalance}
            color={item.color || '#cccccc'}
            onPress={() => navigation.navigate('ScrudgetDetail', { scrudgetId: item.id })}
            onDelete={() => openActionMenu(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No scrudgets yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tap "Add Scrudget" to get started</Text>
          </View>
        }
      />

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.resetBtn, { borderColor: colors.border }]}
            onPress={handleResetScrudgets}
          >
            <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Reset Scrudgets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.addBtn, { borderColor: colors.accent }]}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={[styles.addBtnText, { color: colors.accent }]}>Add Scrudget</Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        {state.scrudgets.length > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>All Scrudgets Balance:</Text>
            <Text
              style={[
                styles.totalAmount,
                { color: totalBalance >= 0 ? colors.positive : colors.negative },
              ]}
            >
              {formatCurrency(totalBalance)}
            </Text>
          </View>
        )}
      </View>

      <AddScrudgetModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddScrudget}
      />

      {selectedScrudget && (
        <EditScrudgetModal
          visible={showEditModal}
          scrudgetId={selectedScrudget.id}
          initialName={selectedScrudget.name}
          initialAmount={selectedScrudget.baseValue.toString()}
          initialColor={selectedScrudget.color}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditScrudget}
        />
      )}

      {selectedScrudget && (
        <ActionMenuModal
          visible={showActionMenu}
          title={selectedScrudget.name}
          onClose={() => setShowActionMenu(false)}
          onEdit={onActionMenuEdit}
          onDelete={onActionMenuDelete}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  themeToggle: {
    width: 32,
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  resetBtn: {
    backgroundColor: 'transparent',
  },
  resetBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  addBtn: {
    backgroundColor: 'transparent',
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
});
