import React from "react";
import { isWeb } from "@tamagui/core";
import { View, TextInput } from "react-native";
import { isIpad } from "@/utils";

export const TitleContent = ({
  isDark,
  nameInputRef,
  taskName,
  handleTaskNameChange,
}: {
  isDark: boolean;
  nameInputRef: React.RefObject<TextInput>;
  taskName: string;
  handleTaskNameChange: (text: string) => void;
}) => {
  return (
    <View
      style={{
        width: "100%",
        alignSelf: "center",
        paddingTop: isWeb ? 20 : 18,
        paddingBottom: isWeb ? 8 : 6,
        paddingHorizontal: isWeb ? -8 : -4,
      }}
    >
      <View
        style={{
          width: "100%",
          alignSelf: "center",
          minHeight: isWeb ? 50 : 46,
          borderWidth: isDark ? 1 : 1.5,
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.2)"
            : "rgba(0, 0, 0, 0.12)",
          backgroundColor: isDark
            ? "rgba(0, 0, 0, 0.2)"
            : "rgba(248, 250, 252, 0.9)",
          borderRadius: isWeb ? 14 : 12,
          paddingHorizontal: isWeb ? 18 : 16,
          paddingVertical: isWeb ? 14 : 12,
          shadowColor: isDark ? "transparent" : "rgba(0, 0, 0, 0.08)",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0 : 0.1,
          shadowRadius: 4,
          elevation: isDark ? 0 : 2,
        }}
      >
        <TextInput
          ref={nameInputRef}
          placeholder={`New Task`}
          placeholderTextColor={
            isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.45)"
          }
          value={taskName}
          onChangeText={handleTaskNameChange}
          autoCapitalize="sentences"
          autoCorrect={true}
          spellCheck={true}
          style={{
            fontSize: isWeb ? 17 : isIpad() ? 16 : 15,
            fontFamily: "System",
            fontWeight: "400",
            color: isDark ? "#fff" : "#1f2937",
            minHeight: isWeb ? 20 : 18,
            textAlignVertical: "center",
            padding: 0,
            margin: 0,
            lineHeight: isWeb ? 24 : 20,
            ...(isWeb && {
              outline: "none",
              border: "none",
              boxShadow: "none",
              backgroundColor: "transparent",
            }),
          }}
          multiline={false}
          textContentType="none"
          autoComplete="off"
          selectionColor={
            isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(59, 130, 246, 0.4)"
          }
        />
      </View>
    </View>
  );
};
