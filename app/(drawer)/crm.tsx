import React, { useState } from "react";
import { FlatList, View, Dimensions } from "react-native";
import { YStack, isWeb, Button } from "tamagui";
import { PersonEmpty } from "@/components/crm/PersonEmpty";
import { usePeopleStore } from "@/store/People";
import { PersonCard } from "@/components/crm/PersonCard/PersonCard";
import { AddPersonForm } from "@/components/crm/Forms/AddPersonForm";
import { EditPersonForm } from "@/components/crm/Forms/EditPersonForm";
import type { Person } from "@/types";
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from "@/store/UserStore";
import { handleImportContacts } from "@/services";
import { isIpad } from "@/utils";
import { DevButtons } from "@/components/crm/devButtons";
import { MaterialIcons } from "@expo/vector-icons";
import ExpandedView from "@/components/crm/PersonCard/ExpandedView";
import { getColorForPerson } from "@/components/crm/PersonCard/utils";
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
  const PADDING = isWeb ? 32 : isIpad() ? 24 : 16;
  const GAP = isWeb ? 14 : isIpad() ? 12 : 8; 
  const NUM_COLUMNS = isWeb ? 4 : isIpad() ? 1 : 1; 
  
  // Completely redone width calculations for proper responsive design
  const getCardWidth = () => {
    if (isWeb) {
      const availableWidth = width - (2 * PADDING);
      const totalGapWidth = (NUM_COLUMNS - 1) * GAP;
      return Math.min(380, (availableWidth - totalGapWidth) / NUM_COLUMNS); // Reduced max width to 380px
    }
    if (isIpad()) {
      return "92%";
    }
    return "92%";
  };
  
  const CARD_WIDTH = getCardWidth();

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
    const isLastInRow = index % NUM_COLUMNS === NUM_COLUMNS - 1;

    return (
      <View
        style={{
          width: isWeb ? CARD_WIDTH : CARD_WIDTH,
          marginLeft: isFirstInRow ? (isWeb ? GAP : 8) : GAP / 2,
          marginRight: isLastInRow ? (isWeb ? GAP : 8) : GAP / 2,
          marginBottom: GAP,
          alignSelf: NUM_COLUMNS === 1 ? "center" : "flex-start",
          maxWidth: isWeb ? 400 : undefined,
        }}
      >
        <PersonCard
          person={item}
          onEdit={handleEdit}
          isExpanded={expandedId === item.id}
          onPress={() => {
            console.log('🔍 [CRM] PersonCard onPress for:', item.name, 'current expandedId:', expandedId, 'item.id:', item.id);
            const newExpandedId = expandedId === item.id ? null : item.id;
            console.log('🔍 [CRM] Setting expandedId to:', newExpandedId);
            setExpandedId(newExpandedId);
          }}
        />
      </View>
    );
  };

  return (
    <YStack flex={1} paddingTop={isWeb ? 90 : isIpad() ? 85 : 95} bg={isDark ? '#0a0a0a' : '$backgroundLight'}>
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
          paddingHorizontal: isWeb ? PADDING : isIpad() ? 12 : 8,
          justifyContent: isWeb ? 'flex-start' : 'center',
        }}
        columnWrapperStyle={isWeb && NUM_COLUMNS > 1 ? {
          justifyContent: 'flex-start',
          paddingHorizontal: 0,
        } : undefined}
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

      {expandedId && (() => {
        const expandedPerson = allContacts.find(person => person.id === expandedId);
        if (!expandedPerson) return null;

        const nicknameColor = getColorForPerson(expandedPerson.id || expandedPerson.name);
        const fullAddress = expandedPerson.address?.street || '';

        return (
          <ExpandedView
            isExpanded={true}
            person={expandedPerson}
            isDark={isDark}
            nicknameColor={nicknameColor}
            fullAddress={fullAddress}
            onClose={() => setExpandedId(null)}
            onEdit={handleEdit}
          />
        );
      })()}
    </YStack>
  );
}