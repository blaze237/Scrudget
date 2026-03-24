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
import { useConfirm } from '../context/ConfirmContext';
import { theme, formatCurrency } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { state, dispatch } = useBudget();
  const { showConfirmDialog } = useConfirm();
  const [showAddModal, setShowAddModal] = useState(false);

  const totalBalance = state.budgets.reduce((sum, b) => sum + b.currentBalance, 0);

  const handleAddBudget = useCallback(
    (name: string, baseValue: number) => {
      dispatch({ type: 'ADD_BUDGET', payload: { name, baseValue } });
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
  }, [dispatch, state.budgets.length]);

  const handleDeleteBudget = useCallback(
    (budgetId: string, budgetName: string) => {
      showConfirmDialog(
        'Delete Budget',
        `Are you sure you want to delete "${budgetName}"? This cannot be undone.`,
        () => dispatch({ type: 'DELETE_BUDGET', payload: { budgetId } })
      );
    },
    [dispatch]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Budgets</Text>
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
            onPress={() => navigation.navigate('BudgetDetail', { budgetId: item.id })}
            onDelete={() => handleDeleteBudget(item.id, item.name)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No budgets yet</Text>
            <Text style={styles.emptySubtext}>Tap "Add Budget" to get started</Text>
          </View>
        }
      />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.resetBtn]}
            onPress={handleResetBudgets}
          >
            <Text style={styles.resetBtnText}>Reset Budgets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.addBtn]}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addBtnText}>Add Budget</Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        {state.budgets.length > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>All Budgets Balance:</Text>
            <Text
              style={[
                styles.totalAmount,
                { color: totalBalance >= 0 ? theme.colors.positive : theme.colors.negative },
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: theme.spacing.sm,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  emptySubtext: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginTop: theme.spacing.sm,
  },
  bottomSection: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  resetBtn: {
    borderColor: theme.colors.textSecondary,
    backgroundColor: 'transparent',
  },
  resetBtnText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  addBtn: {
    borderColor: theme.colors.accent,
    backgroundColor: 'transparent',
  },
  addBtnText: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  totalLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  totalAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
});
