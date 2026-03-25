import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatCurrency } from '../theme';
import { useScrudget } from '../context/ScrudgetContext';

interface ScrudgetCardProps {
  name: string;
  balance: number;
  color: string;
  onPress: () => void;
  onDelete?: () => void;
}

export default function ScrudgetCard({ name, balance, color, onPress, onDelete }: ScrudgetCardProps) {
  const { colors } = useScrudget();
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={[
          styles.cardMain, 
          { 
            backgroundColor: color, 
            borderColor: colors.border,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.name, { color: '#1a2430' }]}>{name}</Text>
        <View style={styles.balanceSection}>
          <Text
            style={[
              styles.balance,
              { color: balance >= 0 ? '#10b981' : '#ef4444' }, // Force slightly darker positive/negative for pastel
            ]}
          >
            {formatCurrency(balance)}
          </Text>
          <Text style={[styles.chevron, { color: '#1a2430' }]}>›</Text>
        </View>
      </TouchableOpacity>

      {onDelete && (
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: color, borderColor: colors.border }]}
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={[styles.actionIcon, { color: '#1a2430' }]}>⋮</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 4,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderRightWidth: 0,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  balanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balance: {
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 4,
  },
  actionBtn: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
});
