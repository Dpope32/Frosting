import React, { useMemo, useEffect } from "react";
import { useCRMStore } from "@/store/CRMStore";
import { Theme } from "tamagui";
import { View, StyleProp, ViewStyle, Platform, useColorScheme, Alert } from "react-native";
import type { Person } from "@/types";
import { styles } from "./styles";
import { webStyles } from "./webStyles";
import CollapsedView from './CollapsedView';
import { getColorForPerson } from './utils';
import { usePeopleStore } from "@/store/People";
import { useToastStore } from "@/store";

export type PersonCardProps = {
  person: Person;
  onEdit: (person: Person) => void;
  containerStyle?: StyleProp<ViewStyle>;
  isExpanded?: boolean;
  onPress?: () => void;
};

export function PersonCard({ person, onEdit, containerStyle, isExpanded, onPress: propsOnPress }: PersonCardProps) {
  const { expandedPersonId, expandPersonCard, collapsePersonCard, openEditModal } = useCRMStore();
  const isExpandedFromStore = expandedPersonId === person.id;
  const actualIsExpanded = isExpanded !== undefined ? isExpanded : isExpandedFromStore;

  useEffect(() => {
    return () => {
      if (actualIsExpanded && !propsOnPress) collapsePersonCard();
    };
  }, [actualIsExpanded, collapsePersonCard, propsOnPress]);

  const handlePress = () => {
    if (propsOnPress) {
      propsOnPress();
    } else {
      if (actualIsExpanded) collapsePersonCard();
      else expandPersonCard(person.id!);
    }
  };

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
          onPress={handlePress}
          isDark={isDark}
          nicknameColor={nicknameColor}
          applyWebStyle={applyWebStyle}
        />
      </View>
    </Theme>
  );
}
