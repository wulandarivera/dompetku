import React, { useRef } from "react";

import { TouchableOpacity, Text, Animated, StyleSheet } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/theme";

const CategoryItem = ({ category, isSelected, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,

      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,

      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.categoryItem,

          isSelected && styles.selectedCategory,

          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={category.icon}
          size={24}
          color={isSelected ? COLORS.white : COLORS.primary}
        />

        <Text
          style={[
            styles.categoryText,

            isSelected && styles.selectedCategoryText,
          ]}
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "48%",

    marginBottom: SIZES.margin,
  },

  categoryItem: {
    padding: SIZES.padding,

    borderRadius: SIZES.radius,

    borderWidth: 1,

    borderColor: COLORS.primary + "40",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: COLORS.white,
  },

  selectedCategory: {
    backgroundColor: COLORS.primary,

    borderColor: COLORS.primary,
  },

  categoryText: {
    ...FONTS.medium,

    marginLeft: SIZES.base,

    color: COLORS.primary,

    fontSize: SIZES.font,
  },

  selectedCategoryText: {
    color: COLORS.white,
  },
});

export default CategoryItem;
