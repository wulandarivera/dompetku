import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";

import { COLORS, SIZES } from "../constants/theme";

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

const NotificationScreen = ({ navigation }) => {
  const [settings, setSettings] = useState({
    transactionAlerts: true,

    targetProgress: true,

    targetAchieved: true,

    lowBalance: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem("notificationSettings");

      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(newSettings)
      );

      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };

    saveSettings(newSettings);
  };

  const notificationItems = [
    {
      key: "transactionAlerts",

      title: "Transaksi",

      description: "Notifikasi setiap ada transaksi baru",

      icon: "swap-horizontal",

      color: COLORS.secondary,
    },

    {
      key: "targetProgress",

      title: "Progress Target",

      description: "Pembaruan progress target keuangan",

      icon: "trending-up",

      color: "#4CAF50",
    },

    {
      key: "targetAchieved",

      title: "Target Tercapai",

      description: "Notifikasi saat target tercapai",

      icon: "flag",

      color: "#FF9800",
    },

    {
      key: "lowBalance",

      title: "Saldo Rendah",

      description: "Peringatan saat saldo menipis",

      icon: "wallet",

      color: "#F44336",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Baru */}

        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Pengaturan Notifikasi</Text>
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="notifications" size={24} color={COLORS.white} />
            </View>

            <Text style={styles.headerDescription}>
              Atur notifikasi untuk mendapatkan informasi penting tentang
              keuangan Anda
            </Text>
          </View>
        </View>

        {/* Content */}

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {notificationItems.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.card,

                index === notificationItems.length - 1 && {
                  marginBottom: SIZES.padding * 2,
                },
              ]}
            >
              <View style={styles.cardContent}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.title}>{item.title}</Text>

                  <Text style={styles.description}>{item.description}</Text>
                </View>

                <Switch
                  value={settings[item.key]}
                  onValueChange={() => toggleSetting(item.key)}
                  trackColor={{
                    false: COLORS.lightGray,
                    true: `${item.color}50`,
                  }}
                  thumbColor={settings[item.key] ? item.color : COLORS.gray}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,

    backgroundColor: COLORS.primary,
  },

  container: {
    flex: 1,

    backgroundColor: COLORS.background,
  },

  header: {
    backgroundColor: COLORS.primary,

    paddingBottom: SIZES.padding * 2,
  },

  headerTop: {
    padding: SIZES.padding,

    paddingTop: Platform.OS === "android" ? SIZES.padding * 2 : SIZES.padding,

    alignItems: "center",
  },

  headerTitle: {
    fontSize: SIZES.large,

    fontWeight: "600",

    color: COLORS.white,
  },

  headerContent: {
    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: SIZES.padding,

    marginTop: SIZES.padding,

    gap: SIZES.padding,
  },

  headerIcon: {
    width: 48,

    height: 48,

    borderRadius: 24,

    backgroundColor: `${COLORS.white}20`,

    justifyContent: "center",

    alignItems: "center",
  },

  headerDescription: {
    flex: 1,

    fontSize: SIZES.font,

    color: COLORS.white,

    opacity: 0.8,

    lineHeight: 20,
  },

  content: {
    flex: 1,

    marginTop: -SIZES.padding,

    borderTopLeftRadius: SIZES.radius * 2,

    borderTopRightRadius: SIZES.radius * 2,

    backgroundColor: COLORS.background,
  },

  contentContainer: {
    padding: SIZES.padding,

    paddingTop: SIZES.padding * 1.5,
  },

  card: {
    backgroundColor: COLORS.white,

    borderRadius: SIZES.radius,

    marginBottom: SIZES.padding,

    padding: SIZES.padding,

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

  cardContent: {
    flexDirection: "row",

    alignItems: "center",

    gap: SIZES.padding,
  },

  iconContainer: {
    width: 48,

    height: 48,

    borderRadius: 24,

    justifyContent: "center",

    alignItems: "center",
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: SIZES.font,

    fontWeight: "600",

    color: COLORS.primary,

    marginBottom: 4,
  },

  description: {
    fontSize: SIZES.font * 0.85,

    color: COLORS.gray,
  },
});

export default NotificationScreen;
