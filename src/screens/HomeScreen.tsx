import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBudget } from '../context/BudgetContext';
import BudgetCard from '../components/BudgetCard';
import AddBudgetModal from '../components/AddBudgetModal';
import EditBudgetModal from '../components/EditBudgetModal';
import ActionMenuModal from '../components/ActionMenuModal';
import { useConfirm } from '../context/ConfirmContext';
import { formatCurrency } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { state, dispatch, colors } = useBudget();
  const { showConfirmDialog } = useConfirm();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<{ id: string, name: string, baseValue: number, color: string } | null>(null);

  const totalBalance = state.budgets.reduce((sum, b) => sum + b.currentBalance, 0);

  const handleAddBudget = useCallback(
    (name: string, baseValue: number, color: string) => {
      dispatch({ type: 'ADD_BUDGET', payload: { name, baseValue, color } });
    },
    [dispatch]
  );

  const handleEditBudget = useCallback(
    (id: string, name: string, baseValue: number, color: string) => {
      dispatch({ type: 'EDIT_BUDGET', payload: { budgetId: id, name, baseValue, color } });
    },
    [dispatch]
  );

  const handleResetBudgets = useCallback(() => {
    if (state.budgets.length === 0) return;
    showConfirmDialog(
      'Reset All Budgets',
      'This will reset all budget balances to their base values and archive the current period. Continue?',
      () => dispatch({ type: 'RESET_ALL_BUDGETS' })
    );
  }, [dispatch, state.budgets.length, showConfirmDialog]);

  const handleDeleteBudget = useCallback(() => {
    if (!selectedBudget) return;
    showConfirmDialog(
      'Delete Budget',
      `Are you sure you want to delete "${selectedBudget.name}"? This cannot be undone.`,
      () => {
        dispatch({ type: 'DELETE_BUDGET', payload: { budgetId: selectedBudget.id } });
        setSelectedBudget(null);
      }
    );
  }, [dispatch, selectedBudget, showConfirmDialog]);

  const openActionMenu = (budget: any) => {
    setSelectedBudget({ id: budget.id, name: budget.name, baseValue: budget.baseValue, color: budget.color || '#fff' });
    setShowActionMenu(true);
  };

  const onActionMenuEdit = () => {
    setShowActionMenu(false);
    setTimeout(() => setShowEditModal(true), 300); // Wait for modal close animation
  };

  const onActionMenuDelete = () => {
    setShowActionMenu(false);
    setTimeout(() => handleDeleteBudget(), 300);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={state.themePreference === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitleSpacer} />
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Budgets</Text>
        <TouchableOpacity style={styles.themeToggle} onPress={() => dispatch({ type: 'TOGGLE_THEME' })}>
          <Text style={{ fontSize: 24, color: colors.textPrimary }}>
            {state.themePreference === 'light' ? '🌙' : '☀️'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Budget List */}
      <FlatList
        data={state.budgets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <BudgetCard
            name={item.name}
            balance={item.currentBalance}
            color={item.color || '#cccccc'}
            onPress={() => navigation.navigate('BudgetDetail', { budgetId: item.id })}
            onDelete={() => openActionMenu(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No budgets yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Tap "Add Budget" to get started</Text>
          </View>
        }
      />

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.resetBtn, { borderColor: colors.border }]}
            onPress={handleResetBudgets}
          >
            <Text style={[styles.resetBtnText, { color: colors.textSecondary }]}>Reset Budgets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.addBtn, { borderColor: colors.accent }]}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={[styles.addBtnText, { color: colors.accent }]}>Add Budget</Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        {state.budgets.length > 0 && (
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>All Budgets Balance:</Text>
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

      <AddBudgetModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddBudget}
      />

      {selectedBudget && (
        <EditBudgetModal
          visible={showEditModal}
          budgetId={selectedBudget.id}
          initialName={selectedBudget.name}
          initialAmount={selectedBudget.baseValue.toString()}
          initialColor={selectedBudget.color}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditBudget}
        />
      )}

      {selectedBudget && (
        <ActionMenuModal
          visible={showActionMenu}
          title={selectedBudget.name}
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
  headerTitleSpacer: {
    width: 32,
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
