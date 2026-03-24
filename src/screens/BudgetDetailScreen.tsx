import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useBudget } from '../context/BudgetContext';
import ExpenseRow from '../components/ExpenseRow';
import AddExpenseModal from '../components/AddExpenseModal';
import { useConfirm } from '../context/ConfirmContext';
import { theme, formatCurrency, formatCurrencyShort } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetDetail'>;

export default function BudgetDetailScreen({ route, navigation }: Props) {
  const { budgetId } = route.params;
  const { state, dispatch } = useBudget();
  const { showConfirmDialog } = useConfirm();
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const budget = state.budgets.find((b) => b.id === budgetId);
  const currentExpenses = useMemo(
    () =>
      state.expenses
        .filter((e) => e.budgetId === budgetId && e.periodId === budget?.currentPeriodId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.expenses, budgetId, budget?.currentPeriodId]
  );

  const archivedPeriods = useMemo(
    () =>
      state.periods
        .filter((p) => p.budgetId === budgetId && p.endDate !== null)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [state.periods, budgetId]
  );

  const totalExpenses = currentExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleAddExpense = useCallback(
    (name: string, amount: number) => {
      dispatch({ type: 'ADD_EXPENSE', payload: { budgetId, name, amount } });
    },
    [dispatch, budgetId]
  );

  const handleDeleteExpense = useCallback(
    (expenseId: string, expenseName: string) => {
      showConfirmDialog(
        'Delete Expense',
        `Delete "${expenseName}"?`,
        () => dispatch({ type: 'DELETE_EXPENSE', payload: { expenseId } })
      );
    },
    [dispatch]
  );

  if (!budget) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Budget not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Budgets</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{budget.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Expense List */}
      <FlatList
        data={currentExpenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ExpenseRow
            name="Budget"
            amount={budget.baseValue}
            date={
              state.periods.find((p) => p.id === budget.currentPeriodId)?.startDate ||
              new Date().toISOString()
            }
            isIncome
          />
        }
        renderItem={({ item }) => (
          <ExpenseRow
            name={item.name}
            amount={item.amount}
            date={item.createdAt}
            onDelete={() => handleDeleteExpense(item.id, item.name)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No expenses yet</Text>
          </View>
        }
      />

      {/* Archived Periods Link */}
      {archivedPeriods.length > 0 && (
        <TouchableOpacity
          style={styles.archiveLink}
          onPress={() => navigation.navigate('ArchivedPeriods', { budgetId })}
        >
          <Text style={styles.archiveLinkText}>
            View Past Periods ({archivedPeriods.length})
          </Text>
        </TouchableOpacity>
      )}

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Add Expense Button */}
        <TouchableOpacity
          style={styles.addExpenseBtn}
          onPress={() => setShowExpenseModal(true)}
        >
          <Text style={styles.addExpenseBtnText}>Add Expense</Text>
        </TouchableOpacity>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>
              Budget:{' '}
              <Text style={{ color: theme.colors.positive }}>
                + £ {budget.baseValue.toFixed(2)}
              </Text>
            </Text>
            <Text style={styles.summaryLabel}>
              Expenses:{' '}
              <Text style={{ color: theme.colors.negative }}>
                - £ {totalExpenses.toFixed(2)}
              </Text>
            </Text>
          </View>
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text
              style={[
                styles.balanceAmount,
                {
                  color:
                    budget.currentBalance >= 0
                      ? theme.colors.positive
                      : theme.colors.negative,
                },
              ]}
            >
              {formatCurrency(budget.currentBalance)}
            </Text>
          </View>
        </View>
      </View>

      <AddExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSave={handleAddExpense}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    flex: 1,
  },
  backText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  errorText: {
    color: theme.colors.negative,
    fontSize: theme.fontSize.lg,
    textAlign: 'center',
    marginTop: 100,
  },
  archiveLink: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  archiveLinkText: {
    color: theme.colors.accent,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  addExpenseBtn: {
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.negative,
    marginTop: theme.spacing.md,
  },
  addExpenseBtnText: {
    color: theme.colors.negative,
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: theme.spacing.md,
  },
  summaryLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  balanceSection: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
  },
});
