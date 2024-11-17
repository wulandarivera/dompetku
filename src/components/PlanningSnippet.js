import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { notificationService } from '../services/notificationService';

const PlanningSnippet = ({ plannings = [], balance = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [notifiedTargets, setNotifiedTargets] = useState(new Set());

  const calculateProgress = (target) => {
    const progress = Math.min(Math.round((balance / target) * 100), 100);
    return progress;
  };

  useEffect(() => {
    plannings.forEach(plan => {
      if (plan.status !== 'completed') {
        const progress = calculateProgress(plan.target_amount);
        
        if (progress === 100 && !notifiedTargets.has(plan.id)) {
          notificationService.sendTargetAchievedNotification(plan.name);
          
          setTimeout(() => {
            if (plan.status !== 'completed') {
              notificationService.sendNotification(
                'Peringatan Target 🎯',
                `Target "${plan.name}" sudah tercapai. Jangan lupa untuk menandainya selesai!`
              );
            }
          }, 24 * 60 * 60 * 1000);

          setNotifiedTargets(prev => new Set([...prev, plan.id]));
        }
      }
    });
  }, [balance, plannings]);

  const activePlannings = plannings.filter(plan => plan.status !== 'completed');

  if (!activePlannings || activePlannings.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Target Aktif</Text>
        <TouchableOpacity 
          onPress={() => setIsVisible(!isVisible)}
          style={[
            styles.toggleButton,
            isVisible ? styles.toggleButtonActive : styles.toggleButtonInactive
          ]}
        >
          <Ionicons 
            name={isVisible ? "lock-closed" : "lock-open"} 
            size={18} 
            color={isVisible ? COLORS.white : COLORS.primary} 
          />
          <Text style={[
            styles.toggleButtonText,
            isVisible ? styles.toggleButtonTextActive : styles.toggleButtonTextInactive
          ]}>
            {isVisible ? 'Sembunyikan' : 'Tampilkan'}
          </Text>
        </TouchableOpacity>
      </View>

      {isVisible && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.snippetScroll}
        >
          {activePlannings.map(plan => (
            <View key={plan.id} style={styles.progressCard}>
              <View style={[styles.progressCircle, { borderColor: plan.color }]}>
                <Text style={[styles.progressText, { color: plan.color }]}>
                  {calculateProgress(plan.target_amount)}%
                </Text>
              </View>
              <Text style={styles.planName} numberOfLines={1}>
                {plan.name}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: SIZES.padding,
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  title: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.base,
    borderRadius: SIZES.radius,
    borderWidth: 1,
    gap: SIZES.base / 2,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleButtonInactive: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
  },
  toggleButtonText: {
    fontSize: SIZES.font * 0.8,
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: COLORS.white,
  },
  toggleButtonTextInactive: {
    color: COLORS.primary,
  },
  snippetScroll: {
    flexGrow: 0,
  },
  progressCard: {
    alignItems: 'center',
    marginRight: SIZES.padding * 1.5,
    width: 80,
  },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  progressText: {
    fontSize: SIZES.font,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: SIZES.font * 0.85,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default PlanningSnippet; 