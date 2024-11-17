import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
import { notificationService } from '../services/notificationService';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { state, actions } = useApp();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const settingsMenu = [
    {
      icon: 'notifications-outline',
      title: 'Notifikasi',
      subtitle: 'Atur notifikasi aplikasi',
      color: COLORS.secondary,
      onPress: () => navigation.navigate('Notifications')
    },
    {
      icon: 'lock-closed-outline',
      title: 'Ubah Password',
      subtitle: 'Ganti kata sandi akun',
      color: '#4CAF50',
      onPress: () => navigation.navigate('ChangePassword')
    },
    {
      icon: 'help-circle-outline',
      title: 'Bantuan',
      subtitle: 'Pusat bantuan',
      color: '#FF9800',
      onPress: () => navigation.navigate('Help')
    },
    {
      icon: 'information-circle-outline',
      title: 'Tentang Aplikasi',
      subtitle: 'Informasi aplikasi',
      color: '#2196F3',
      onPress: () => navigation.navigate('About')
    }
  ];

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await notificationService.init();
      } catch (error) {
        console.error('Setup notifications error:', error);
        Alert.alert(
          'Notifikasi',
          'Gagal mengaktifkan notifikasi. Beberapa fitur mungkin tidak berfungsi.'
        );
      }
    };

    setupNotifications();
  }, []);

  const getUserData = async () => {
    try {
      setIsLoading(true);
      const user = await authService.getCurrentUser();
      if (user) {
        setUserData({
          name: user.user_metadata?.name || 'Pengguna',
          email: user.email
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await authService.signOut();
              actions.resetState();
              navigation.navigate('Auth');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Gagal melakukan logout');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Profile Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>{userData?.name || 'Pengguna'}</Text>
          <Text style={styles.userEmail}>{userData?.email || 'email@example.com'}</Text>
        </View>

        {/* Settings Menu */}
        <View style={styles.menuCard}>
          {settingsMenu.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem,
                index === settingsMenu.length - 1 && { borderBottomWidth: 0 }
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.versionText}>Versi 1.0.0</Text>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.logoutIconContainer}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.white} />
            </View>
            <Text style={styles.logoutText}>Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    flexGrow: 1,
    paddingBottom: SIZES.padding,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    alignItems: 'center',
    margin: SIZES.padding,
    marginBottom: SIZES.padding,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  userName: {
    fontSize: SIZES.large,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.base,
  },
  userEmail: {
    fontSize: SIZES.font,
    color: COLORS.gray,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    overflow: 'hidden',
    margin: SIZES.padding,
    marginTop: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
    marginLeft: SIZES.padding,
  },
  menuTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: SIZES.font * 0.85,
    color: COLORS.gray,
  },
  bottomSection: {
    padding: SIZES.padding,
    paddingBottom: Platform.OS === 'ios' ? SIZES.padding * 4 : SIZES.padding * 2,
    alignItems: 'center',
  },
  versionText: {
    fontSize: SIZES.font * 0.9,
    color: COLORS.gray,
    marginBottom: SIZES.padding * 1.5,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.base,
    paddingRight: SIZES.padding * 2,
    borderRadius: SIZES.radius * 2,
    gap: SIZES.base,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.red,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.red,
    marginLeft: SIZES.base,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
