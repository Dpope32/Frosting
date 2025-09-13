import React, { memo } from "react";
// @ts-ignore
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  View,
  TouchableOpacity,
  Image,
  Platform,
  Pressable,
  Text,
} from "react-native";
import { XStack, YStack } from "tamagui";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ChangeLogButton } from "./changeLogButton";
import { LegalButton } from "./LegalButton";
// @ts-ignore
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import * as Haptics from "expo-haptics";
import { debouncedNavigate } from "@/utils";
import { useHabits } from "@/hooks/useHabits";
import { RecentGithubCells } from "@/components/habits/RecentGithubCells";
import { useUserStore } from "@/store";
import { useToastStore } from "@/store/ToastStore";
import { DRAWER_ICONS } from "@/constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// @ts-ignore
import { DrawerActions } from "@react-navigation/native";

export const DrawerContent = memo(
  ({
    props,
    username,
    profilePicture,
    styles,
    isWeb,
    isIpadDevice,
    premium,
  }: {
    props: DrawerContentComponentProps;
    username: string | undefined;
    profilePicture: string | undefined | null;
    styles: any;
    isWeb: boolean;
    isIpadDevice: boolean;
    premium: boolean;
  }) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { primaryColor } = useUserStore((s) => s.preferences);
    const { habits, getRecentHistory, toggleHabit, isHabitDoneToday } =
      useHabits();
    const todayDate = new Date();
    const today = `${todayDate.getFullYear()}-${String(
      todayDate.getMonth() + 1
    ).padStart(2, "0")}-${String(todayDate.getDate()).padStart(2, "0")}`;
    const imageSource = profilePicture
      ? { uri: profilePicture }
      : require("@/assets/images/adaptive-icon.png");
    const { showToast } = useToastStore();

    const handleHabitToggle = (habitId: string) => {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        showToast("Success", "success", { position: "top-right" });
      }
      toggleHabit(habitId);
    };

    const inactiveColor = isWeb
      ? isDark
        ? "rgba(255,255,255,0.45)"
        : "rgba(0,0,0,0.4)"
      : isDark
      ? "#555"
      : "#333";
    const adjustColor = (hex: string, percent: number): string => {
      const p = Math.max(-1, Math.min(1, percent));
      const cleanHex = hex.replace("#", "");
      const num = parseInt(
        cleanHex.length === 3
          ? cleanHex
              .split("")
              .map((c) => c + c)
              .join("")
          : cleanHex,
        16
      );
      let r = (num >> 16) & 0xff;
      let g = (num >> 8) & 0xff;
      let b = num & 0xff;
      r = Math.round(r + (p < 0 ? r * p : (255 - r) * p));
      g = Math.round(g + (p < 0 ? g * p : (255 - g) * p));
      b = Math.round(b + (p < 0 ? b * p : (255 - b) * p));
      const toHex = (v: number) => v.toString(16).padStart(2, "0");
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    const drawerActiveBackgroundColor = adjustColor(primaryColor, -0.8);

    const renderIcon = (route: string, color: string) => {
      const icon = DRAWER_ICONS[route];
      if (icon.type === "material") {
        return (
          <MaterialIcons
            name={icon.name as any}
            size={24}
            color={color}
            style={{ marginRight: 4 }}
          />
        );
      }
      return (
        <MaterialCommunityIcons
          name={icon.name as any}
          size={24}
          color={color}
          style={{ marginRight: 4 }}
        />
      );
    };

    const drawerRoutes = [
      { name: "(tabs)/index", label: "Home", route: "(tabs)/index" },
      { name: "calendar", label: "Calendar", route: "calendar" },
      { name: "crm", label: "CRM", route: "crm" },
      { name: "vault", label: "Vault", route: "vault" },
      { name: "bills", label: "Bills", route: "bills" },
      { name: "notes", label: "Notes", route: "notes" },
      { name: "habits", label: "Habits", route: "habits" },
      { name: "projects", label: "Projects", route: "projects" },
    ];

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => debouncedNavigate("/modals/sync")}>
            <Image source={imageSource} style={styles.profileImage} />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.username}>{username || "User"}</Text>
            {premium && (
              <MaterialIcons
                name="verified"
                size={16}
                color="#0cbfe9"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
          {!isWeb && !isIpadDevice && (
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                }
                props.navigation.closeDrawer();
              }}
              style={{
                padding: isIpadDevice ? 8 : 8,
                marginLeft: 16,
                ...(isWeb
                  ? ({
                      borderRadius: 8,
                      transition: "all 0.2s ease",
                    } as any)
                  : {}),
              }}
            >
              <Ionicons
                name="caret-back"
                size={isWeb ? 24 : 20}
                color={isDark ? "#fff" : "#000"}
              />
            </Pressable>
          )}
        </View>
        <View style={styles.content}>
          <DrawerContentScrollView
            {...props}
            contentContainerStyle={styles.scrollViewContent}
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {drawerRoutes.map((route) => {
              const currentRoute = props.state.routes[props.state.index];
              const isActive = currentRoute.name === route.name;
              return (
                <DrawerItem
                  key={route.name}
                  label={route.label}
                  onPress={() => {
                    props.navigation.dispatch(DrawerActions.jumpTo(route.name));
                  }}
                  icon={({ color }: { color: string }) =>
                    renderIcon(route.route, isActive ? "#fff" : color)
                  }
                  activeTintColor="#fff"
                  inactiveTintColor={inactiveColor}
                  activeBackgroundColor={drawerActiveBackgroundColor}
                  focused={isActive}
                  style={{
                    paddingVertical: 0,
                    paddingLeft: 0,
                    marginBottom: isWeb ? 4 : 6,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: isActive ? "#fff" : "transparent",
                    backgroundColor: isActive
                      ? drawerActiveBackgroundColor
                      : "transparent",
                    minHeight: isWeb ? 36 : 40,
                  }}
                  labelStyle={{
                    fontSize: isIpadDevice ? 20 : 18,
                    fontWeight: isWeb ? "400" : "700",
                    lineHeight: isIpadDevice ? 22 : 20,
                    marginLeft: -8,
                    color: isActive ? "#fff" : inactiveColor,
                  }}
                />
              );
            })}

            {habits.length > 0 && (isWeb || isIpadDevice) && (
              <YStack marginHorizontal={-16} paddingTop={16} gap={4}>
                {habits.slice(0, 3).map((habit, index) => (
                  <YStack key={habit.id} paddingHorizontal={isWeb ? 0 : 8}>
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: isIpadDevice ? 13 : 14,
                        fontWeight: "600",
                        color: isDark ? "#999" : "#666",
                        marginBottom: 6,
                        textAlign: isIpadDevice ? "center" : "left",
                        marginLeft: isIpadDevice ? 0 : 18,
                        flexShrink: 0,
                        width: "100%",
                      }}
                    >
                      {habit.title}
                    </Text>
                    <RecentGithubCells
                      history={getRecentHistory(habit)}
                      today={today}
                      compact={true}
                      showTitle={false}
                      multiRow={true}
                      onTodayClick={() => handleHabitToggle(habit.id)}
                      todayCompleted={isHabitDoneToday(habit.id)}
                      uniqueId={habit.id}
                    />
                  </YStack>
                ))}
              </YStack>
            )}
          </DrawerContentScrollView>
        </View>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          marginBottom={isWeb ? 16 :32}
          paddingHorizontal={isWeb ? 2 : isIpadDevice ? 20 : 16}
        >
          <ChangeLogButton />
          <LegalButton />
        </XStack>
      </View>
    );
  }
);
