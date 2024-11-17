import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { authService } from '../services/authService';

const Header = ({ onProfilePress }) => {
  const { state } = useApp();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    getUserName();
  }, []);

  const getUserName = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user && user.user_metadata && user.user_metadata.name) {
        setUserName(user.user_metadata.name);
      }
    } catch (error) {
      console.error('Error getting user name:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons 
            name="wallet-outline" 
            size={24} 
            color={COLORS.primary} 
            style={styles.icon}
          />
          <View>
            <Text style={styles.appName}>DOMPETKU</Text>
            <Text style={styles.userName}>{userName || 'Pengguna'}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.profileButton}
          onPress={onProfilePress}
        >
          <Ionicons 
            name="menu-outline" 
            size={28} 
            color={COLORS.primary} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.base,
  },
  icon: {
    marginRight: SIZES.base,
  },
  appName: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginBottom: 2,
  },
  userName: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.primary,
  },
  profileButton: {
    padding: SIZES.base,
  }
});

export default Header;
