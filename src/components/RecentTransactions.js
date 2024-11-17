import React from "react";

import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

import { COLORS, SIZES } from "../constants/theme";

import { Ionicons } from "@expo/vector-icons";

import { useApp } from "../context/AppContext";

const RecentTransactions = ({ onViewAll, showAll = false }) => {
  const { state } = useApp();
  const { transactions } = state;

  const displayTransactions = showAll ? transactions : transactions.slice(0, 5);

  const formatDate = (date) => {
    const d = new Date(date);

    return d.toLocaleDateString("id-ID", {
      day: "2-digit",

      month: "short",

      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaksi Terakhir</Text>

        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAll}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsList}>
        {displayTransactions.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada transaksi</Text>
        ) : (
          displayTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <View
                  style={[
                    styles.iconContainer,

                    {
                      backgroundColor:
                        transaction.type === "add"
                          ? "rgba(0, 200, 83, 0.1)"
                          : "rgba(255, 71, 87, 0.1)",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      transaction.type === "add"
                        ? "trending-up"
                        : "trending-down"
                    }
                    size={20}
                    color={
                      transaction.type === "add" ? COLORS.secondary : COLORS.red
                    }
                  />
                </View>

                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {transaction.category_name}

                    {transaction.category_detail
                      ? ` - ${transaction.category_detail}`
                      : ""}
                  </Text>

                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.created_at)}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.transactionAmount,

                  {
                    color:
                      transaction.type === "add"
                        ? COLORS.secondary
                        : COLORS.red,
                  },
                ]}
              >
                {transaction.type === "add" ? "+" : "-"} Rp{" "}
                {transaction.amount.toLocaleString("id-ID")}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,

    marginTop: SIZES.padding,

    paddingHorizontal: SIZES.padding,

    paddingVertical: SIZES.padding,

    borderRadius: SIZES.radius,
  },

  header: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: SIZES.padding,
  },

  title: {
    fontSize: SIZES.medium,

    fontWeight: "bold",

    color: COLORS.primary,
  },

  viewAll: {
    fontSize: SIZES.font,

    color: COLORS.secondary,
  },

  transactionsList: {
    gap: SIZES.base,
  },

  emptyText: {
    textAlign: "center",

    color: COLORS.gray,

    fontSize: SIZES.font,
  },

  transactionItem: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingVertical: SIZES.base,

    borderBottomWidth: 1,

    borderBottomColor: COLORS.lightGray,
  },

  transactionLeft: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  iconContainer: {
    width: 40,

    height: 40,

    borderRadius: 20,

    justifyContent: "center",

    alignItems: "center",

    marginRight: SIZES.base * 2,
  },

  transactionInfo: {
    flex: 1,
  },

  transactionTitle: {
    fontSize: SIZES.font,

    fontWeight: "600",

    color: COLORS.primary,

    marginBottom: 4,
  },

  transactionDate: {
    fontSize: SIZES.font * 0.9,

    color: COLORS.gray,
  },

  transactionAmount: {
    fontSize: SIZES.font,

    fontWeight: "bold",
  },
});

export default RecentTransactions;
