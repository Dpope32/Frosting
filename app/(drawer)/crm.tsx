import React, { useState, useEffect } from "react";
import { FlatList, View, Dimensions, Alert, Platform } from "react-native";
import { H4, Separator, YStack, Button, isWeb } from "tamagui";
import { PersonEmpty } from "@/components/crm/PersonEmpty";
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { usePeopleStore } from "@/store/People";
import { PersonCard } from "@/components/crm/PersonCard/PersonCard";
import { AddPersonForm } from "@/components/crm/Forms/AddPersonForm";
import { EditPersonForm } from "@/components/crm/Forms/EditPersonForm";
import type { Person } from "@/types/people";
import { generateTestContacts } from "@/components/crm/testContacts";
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from "@/store/UserStore";
import { handleDebugPress, handleImportContacts } from "@/services/peopleService";
import { isIpad } from "@/utils/deviceUtils";
import { DevButtons } from "@/components/crm/devButtons";
const { width } = Dimensions.get("window");


export default function CRM() {
  const { contacts, updatePerson } = usePeopleStore();
  const allContacts = Object.values(contacts);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const PADDING = Platform.OS === 'web' ? 16 : isIpad() ? 24 : 8;
  const GAP = Platform.OS === 'web' ? 24 : isIpad() ? 12 : 6; 
  const NUM_COLUMNS = Platform.OS === 'web' ? 4 : isIpad() ? 2 : 2;
  const CARD_WIDTH = isIpad() ? 300 : (width - (2 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS;
  const CARD_WIDTH_MOBILE = isIpad() ? 250 : "45%";
  const handleEdit = (person: Person) => {
    setSelectedPerson(person);
    setEditModalVisible(true);
  };

  const handleSaveEdit = (updatedPerson: Person) => {
    updatePerson(updatedPerson.id, updatedPerson);
    handleCloseEdit();
  };

  const handleCloseEdit = () => {
    setEditModalVisible(false);
    setSelectedPerson(null);
    setExpandedId(null);
  };

  const renderItem = ({ item, index }: { item: Person; index: number }) => {
    const isFirstInRow = index % NUM_COLUMNS === 0;
    const isLastInRow = index % NUM_COLUMNS === NUM_COLUMNS;
    
    return (
      <View
        style={{
          width: isWeb ? CARD_WIDTH : CARD_WIDTH_MOBILE,
          marginLeft: isFirstInRow ? PADDING : GAP / 1,
          paddingLeft: isWeb ? 24 : 0,
          marginRight: isLastInRow ? PADDING : GAP / 2,
          marginBottom: GAP / 2,
        }}
      >
        <PersonCard
          person={item}
          onEdit={handleEdit}
          isExpanded={expandedId === item.id}
          onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
        />
      </View>
    );
  };

  return (
    <YStack flex={1} paddingTop={isWeb ? 90 : isIpad() ? 85 : 95}>
      {__DEV__ && (
         <DevButtons />
      )}
      <FlatList
        key={`crm-${NUM_COLUMNS}`}
        data={allContacts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 8 : isIpad() ? 8 : 8,
          paddingLeft: isWeb ? 8 : isIpad() ? 8 : 12,
        }}
        ListEmptyComponent={
          <PersonEmpty 
            isDark={isDark}
            primaryColor={primaryColor}
            isWeb={isWeb}
            onImportContacts={!isWeb ? handleImportContacts : undefined}
          />
        }
      />
      <Button
        onPress={() => setContactModalOpen(true)}
        position="absolute"
        bottom={40}
        right={24}
        zIndex={1000}
        size="$4"
        circular
        bg={primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </Button>
      <AddPersonForm isVisible={contactModalOpen} onClose={() => setContactModalOpen(false)} />
      {selectedPerson && (
        <EditPersonForm
          person={selectedPerson}
          visible={isEditModalVisible}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      )}
    </YStack>
  );
}
