import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { useApp } from '../context/AppContext';

const BalanceCard = ({ onPressAdd, onPressSubtract, balanceScale, rotateAnim }) => {
  const { state } = useApp();
  const { balance } = state;

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: balanceScale }] }
      ]}
    >
      <View style={styles.topSection}>
        <View>
          <Text style={styles.balanceLabel}>Total Saldo</Text>
          <Text style={styles.balanceAmount}>
            Rp {balance.toLocaleString('id-ID')}
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onPressAdd}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, { backgroundColor: `${COLORS.secondary}20` }]}>
            <Ionicons 
              name="trending-up" 
              size={24} 
              color={COLORS.secondary} 
            />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Pemasukan</Text>
            <Text style={styles.actionSubtitle}>Tambah transaksi</Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={COLORS.gray} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={onPressSubtract}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrapper, { backgroundColor: `${COLORS.red}20` }]}>
            <Ionicons 
              name="trending-down" 
              size={24} 
              color={COLORS.red} 
            />
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Pengeluaran</Text>
            <Text style={styles.actionSubtitle}>Catat pengeluaran</Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={COLORS.gray} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  topSection: {
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  balanceLabel: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: SIZES.extraLarge,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actionsContainer: {
    padding: SIZES.padding * 0.5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding * 0.75,
    borderRadius: SIZES.radius,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: SIZES.font * 0.85,
    color: COLORS.gray,
  }
});

export default BalanceCard; 














