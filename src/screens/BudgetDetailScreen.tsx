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
import EditExpenseModal from '../components/EditExpenseModal';
import ActionMenuModal from '../components/ActionMenuModal';
import { useConfirm } from '../context/ConfirmContext';
import { formatCurrency } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'BudgetDetail'>;

export default function BudgetDetailScreen({ route, navigation }: Props) {
  const { budgetId } = route.params;
  const { state, dispatch, colors } = useBudget();
  const { showConfirmDialog } = useConfirm();
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<{ id: string, name: string, amount: number } | null>(null);

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

  const handleEditExpense = useCallback(
    (expenseId: string, name: string, amount: number) => {
      dispatch({ type: 'EDIT_EXPENSE', payload: { expenseId, name, amount } });
    },
    [dispatch]
  );

  const handleDeleteExpense = useCallback(() => {
    if (!selectedExpense) return;
    showConfirmDialog(
      'Delete Expense',
      `Delete "${selectedExpense.name}"?`,
      () => {
        dispatch({ type: 'DELETE_EXPENSE', payload: { expenseId: selectedExpense.id } });
        setSelectedExpense(null);
      }
    );
  }, [dispatch, selectedExpense, showConfirmDialog]);

  const openActionMenu = (expense: any) => {
    setSelectedExpense({ id: expense.id, name: expense.name, amount: expense.amount });
    setShowActionMenu(true);
  };

  const onActionMenuEdit = () => {
    setShowActionMenu(false);
    setTimeout(() => setShowEditModal(true), 300);
  };

  const onActionMenuDelete = () => {
    setShowActionMenu(false);
    setTimeout(() => handleDeleteExpense(), 300);
  };

  if (!budget) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.negative }]}>Budget not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ backgroundColor: budget.color || colors.surface }}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: '#1a2430', fontWeight: '600' }]}>‹ Budgets</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: '#1a2430' }]}>{budget.name}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      {/* Expense List */}
      <FlatList
        data={currentExpenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <ExpenseRow
            name="Budget Base"
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
            onAction={() => openActionMenu(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No expenses yet</Text>
          </View>
        }
      />

      {/* Archived Periods Link */}
      {archivedPeriods.length > 0 && (
        <TouchableOpacity
          style={[styles.archiveLink, { borderTopColor: colors.border }]}
          onPress={() => navigation.navigate('ArchivedPeriods', { budgetId })}
        >
          <Text style={[styles.archiveLinkText, { color: colors.accent }]}>
            View Past Periods ({archivedPeriods.length})
          </Text>
        </TouchableOpacity>
      )}

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.addExpenseBtn, { borderColor: colors.negative }]}
          onPress={() => setShowExpenseModal(true)}
        >
          <Text style={[styles.addExpenseBtnText, { color: colors.negative }]}>Add Expense</Text>
        </TouchableOpacity>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Base:{' '}
              <Text style={{ color: colors.positive }}>
                + £ {budget.baseValue.toFixed(2)}
              </Text>
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Expenses:{' '}
              <Text style={{ color: colors.negative }}>
                - £ {totalExpenses.toFixed(2)}
              </Text>
            </Text>
          </View>
          <View style={styles.balanceSection}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Balance</Text>
            <Text
              style={[
                styles.balanceAmount,
                { color: budget.currentBalance >= 0 ? colors.positive : colors.negative },
              ]}
            >
              {formatCurrency(budget.currentBalance)}
            </Text>
          </View>
        </View>
      </View>

      <AddExpenseModal
        visible={showExpenseModal}
        budgetId={budgetId}
        onClose={() => setShowExpenseModal(false)}
        onSave={handleAddExpense}
      />

      {selectedExpense && (
        <EditExpenseModal
          visible={showEditModal}
          expenseId={selectedExpense.id}
          initialName={selectedExpense.name}
          initialAmount={selectedExpense.amount.toString()}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditExpense}
        />
      )}

      {selectedExpense && (
        <ActionMenuModal
          visible={showActionMenu}
          title={selectedExpense.name}
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
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    flex: 1,
  },
  backText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
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
    fontSize: 16,
  },
  errorText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 100,
  },
  archiveLink: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  archiveLinkText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  addExpenseBtn: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    marginTop: 16,
  },
  addExpenseBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
  },
  summaryLabel: {
    fontSize: 13,
    lineHeight: 20,
  },
  balanceSection: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
});
