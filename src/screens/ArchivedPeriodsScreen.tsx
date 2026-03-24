import React, { useMemo } from 'react';
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
import { theme, formatCurrency } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ArchivedPeriods'>;

export default function ArchivedPeriodsScreen({ route, navigation }: Props) {
  const { budgetId } = route.params;
  const { state } = useBudget();

  const budget = state.budgets.find((b) => b.id === budgetId);

  const archivedPeriods = useMemo(
    () =>
      state.periods
        .filter((p) => p.budgetId === budgetId && p.endDate !== null)
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [state.periods, budgetId]
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Past Periods</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={archivedPeriods}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.periodCard}
            onPress={() =>
              navigation.navigate('PeriodDetail', {
                budgetId,
                periodId: item.id,
              })
            }
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.periodDates}>
                {formatDate(item.startDate)} — {item.endDate ? formatDate(item.endDate) : 'Now'}
              </Text>
              <Text style={styles.periodInfo}>
                Started: £ {item.startingBalance.toFixed(2)}
              </Text>
            </View>
            <View style={styles.rightSection}>
              <Text
                style={[
                  styles.periodBalance,
                  {
                    color:
                      (item.finalBalance ?? 0) >= 0
                        ? theme.colors.positive
                        : theme.colors.negative,
                  },
                ]}
              >
                {formatCurrency(item.finalBalance ?? 0)}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No archived periods</Text>
          </View>
        }
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
    paddingVertical: theme.spacing.sm,
    flexGrow: 1,
  },
  periodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 16,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.xs,
  },
  periodDates: {
    color: theme.colors.textPrimary,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    marginBottom: 4,
  },
  periodInfo: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodBalance: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  chevron: {
    color: theme.colors.accent,
    fontSize: 22,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
});
