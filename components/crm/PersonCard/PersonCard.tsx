import React, { useMemo, useEffect } from "react";
import { useCRMStore } from "@/store/CRMStore";
import { Theme } from "tamagui";
import { View, StyleProp, ViewStyle, Platform, useColorScheme, Alert } from "react-native";
import type { Person } from "@/types";
import { styles } from "./styles";
import { webStyles } from "./webStyles";
import CollapsedView from './CollapsedView';
import ExpandedView from './ExpandedView';
import { getColorForPerson } from './utils';
import { LongPressDelete } from "@/components/common/LongPressDelete";
import { usePeopleStore } from "@/store/People";
import { useToastStore } from "@/store";

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
  const deletePerson = usePeopleStore(state => state.deletePerson);
  const showToast = useToastStore(state => state.showToast);

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
    <LongPressDelete onDelete={(onComplete) => {
      if (Platform.OS === 'web') {
        if (window.confirm('Delete this contact?')) {
          deletePerson(person.id!);
          showToast('Contact deleted', 'success');
          onComplete(true);
        } else {
          onComplete(false);
        }
      } else {
        Alert.alert(
          'Delete Contact',
          'Are you sure you want to delete this contact?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => onComplete(false) },
            { text: 'Delete', style: 'destructive', onPress: () => {
                deletePerson(person.id!);
                showToast('Contact deleted', 'success');
                onComplete(true);
              }
            }
          ],
          { cancelable: true }
        );
      }
    }}>
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
    </LongPressDelete>
  );
}
