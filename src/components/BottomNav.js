import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../constants/theme';

const BottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'statistics', icon: 'stats-chart', label: 'Statistik' },
    { id: 'history', icon: 'time', label: 'Riwayat' },
    { id: 'planning', icon: 'calendar', label: 'Planning' },
  ];

  return (
    <View style={styles.bottomNav}>
      {tabs.map((tab) => (
        <TouchableOpacity 
          key={tab.id}
          style={styles.navItem} 
          onPress={() => onTabChange(tab.id)}
        >
          <Ionicons 
            name={activeTab === tab.id ? tab.icon : `${tab.icon}-outline`}
            size={24} 
            color={activeTab === tab.id ? COLORS.primary : COLORS.gray} 
          />
          <Text style={[
            styles.navText,
            { color: activeTab === tab.id ? COLORS.primary : COLORS.gray }
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: SIZES.padding,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    marginTop: SIZES.base / 2,
  },
});

export default BottomNav; 






























