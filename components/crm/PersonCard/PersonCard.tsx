import React from "react";
import { Theme } from "tamagui";
import { View, StyleProp, ViewStyle, Platform, useColorScheme } from "react-native";
import type { Person } from "@/types";
import { styles } from "./styles";
import { webStyles } from "./webStyles";
import CollapsedView from './CollapsedView';
import { getColorForPerson } from './utils';

export type PersonCardProps = {
  person: Person;
  onEdit: (person: Person) => void;
  containerStyle?: StyleProp<ViewStyle>;
  isExpanded?: boolean;
  onPress?: () => void;
};

export function PersonCard({ person, onEdit, containerStyle, isExpanded = false, onPress }: PersonCardProps) {
  const nicknameColor = getColorForPerson(person.id || person.name);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const applyWebStyle = (styleKey: string) =>
    Platform.OS === 'web' ? (webStyles[styleKey as keyof typeof webStyles] as any) : {};

  return (
    <Theme name="dark">
      <View style={[styles.container, containerStyle]}>
        <CollapsedView
          key={`collapsed-${person.id}`}
          person={person}
          onPress={onPress || (() => {})}
          isDark={isDark}
          nicknameColor={nicknameColor}
          applyWebStyle={applyWebStyle}
        />
      </View>
    </Theme>
  );
}
