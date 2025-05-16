import React, { useMemo, useEffect } from "react";
import { useCRMStore } from "@/store/CRMStore";
import { Theme } from "tamagui";
import { View, StyleProp, ViewStyle, Platform, useColorScheme } from "react-native";
import type { Person } from "@/types";
import { styles } from "./styles";
import { webStyles } from "./webStyles";
import CollapsedView from './CollapsedView';
import ExpandedView from './ExpandedView';
import { getColorForPerson } from './utils';

export type PersonCardProps = {
  person: Person;
  onEdit: (person: Person) => void;
  containerStyle?: StyleProp<ViewStyle>;
  isExpanded?: boolean;
  onPress?: () => void;
};

export function PersonCard({ person, onEdit, containerStyle }: PersonCardProps) {
  const { expandedPersonId, expandPersonCard, collapsePersonCard, openEditModal } = useCRMStore();
  const isExpanded = expandedPersonId === person.id;

  useEffect(() => {
    return () => {
      if (isExpanded) collapsePersonCard();
    };
  }, [isExpanded, collapsePersonCard]);

  const handlePress = () => {
    if (isExpanded) collapsePersonCard();
    else expandPersonCard(person.id!);
  };

  const handleEdit = (person: Person) => {
    collapsePersonCard();
    openEditModal(person);
    onEdit(person);
  };

  const nicknameColor = getColorForPerson(person.id || person.name);
  const fullAddress = useMemo(() => person.address?.street || '', [person.address]);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const applyWebStyle = (styleKey: keyof typeof webStyles) =>
    Platform.OS === 'web' ? (webStyles[styleKey] as any) : {};

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
        <ExpandedView
          key={`expanded-${person.id}`}
          isExpanded={isExpanded}
          person={person}
          isDark={isDark}
          nicknameColor={nicknameColor}
          fullAddress={fullAddress}
          applyWebStyle={applyWebStyle}
          onClose={handlePress}
          onEdit={handleEdit}
        />
      </View>
    </Theme>
  );
}
