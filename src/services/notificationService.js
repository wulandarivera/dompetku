import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Konfigurasi handler notifikasi
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  }),
});

class NotificationService {
  async init() {
    if (!Device.isDevice) {
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
        });
      }
    } catch (error) {
      console.error('Notification init error:', error);
    }
  }

  async getNotificationSettings() {
    try {
      const settings = await AsyncStorage.getItem('notificationSettings');
      return settings ? JSON.parse(settings) : {
        transactionAlerts: true,
        targetProgress: true,
        targetAchieved: true,
        lowBalance: true
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  async sendNotification(title, body, type) {
    try {
      const settings = await this.getNotificationSettings();
      if (!settings) return;

      // Cek apakah jenis notifikasi diizinkan
      if (!settings[type]) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Send notification error:', error);
    }
  }

  async sendTransactionNotification(type, amount) {
    const title = type === 'add' ? 'Pemasukan Baru 💰' : 'Pengeluaran Baru 💸';
    const body = `Rp ${amount.toLocaleString('id-ID')} telah ${type === 'add' ? 'ditambahkan' : 'dikeluarkan'}`;
    
    await this.sendNotification(title, body, 'transactionAlerts');
  }

  async sendTargetProgressNotification(targetName, progress) {
    await this.sendNotification(
      'Progress Target 🎯',
      `Target "${targetName}" telah mencapai ${progress}%`,
      'targetProgress'
    );
  }

  async sendTargetAchievedNotification(targetName) {
    await this.sendNotification(
      'Target Tercapai! 🎉',
      `Selamat! Target "${targetName}" telah tercapai`,
      'targetAchieved'
    );
  }

  async sendLowBalanceNotification(balance) {
    await this.sendNotification(
      'Peringatan Saldo ⚠️',
      `Saldo Anda tinggal Rp ${balance.toLocaleString('id-ID')}`,
      'lowBalance'
    );
  }
}

export const notificationService = new NotificationService(); 