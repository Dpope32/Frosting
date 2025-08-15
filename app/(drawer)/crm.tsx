import React, { useState, useCallback } from "react";
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
import { addSyncLog } from '@/components/sync/syncUtils';
const { width } = Dimensions.get("window");


export default function CRM() {
  const { contacts, updatePerson, getActiveContacts } = usePeopleStore();
  const allContacts = getActiveContacts(); // Use getActiveContacts instead of Object.values(contacts)
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

  const handleSaveEdit = async (updatedPerson: Person) => {
    if (selectedPerson) {
      // Pass all the updated person data to ensure profile picture and other changes are applied
      const { id, createdAt, ...updates } = updatedPerson;
      await updatePerson(updatedPerson.id, updates);
    }
    handleCloseEdit();
  };

  const handleCloseEdit = () => {
    setEditModalVisible(false);
    setSelectedPerson(null);
    setExpandedId(null);
  };

  // Fix: Use useCallback to prevent function recreation on every render
  const handlePersonPress = useCallback((person: Person) => {
    // Debug logging for problematic contacts
    if (!person.id) {
      console.warn('⚠️ PersonCard: Contact has no ID:', person.name);
      return;
    }
    
      addSyncLog(`👆 PersonCard tap: ${person.name} ID: ${person.id}`, 'verbose');
    
    const newExpandedId = expandedId === person.id ? null : person.id;
    setExpandedId(newExpandedId);
  }, [expandedId]);

  const renderItem = useCallback(({ item, index }: { item: Person; index: number }) => {
    const isFirstInRow = index % NUM_COLUMNS === 0;
    const isLastInRow = index % NUM_COLUMNS === NUM_COLUMNS - 1;

    // Generate a fallback ID if missing (common issue with synced contacts)
    const personId = item.id || `fallback-${item.name}-${index}`;
    const personWithId = { ...item, id: personId };

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
          person={personWithId}
          onEdit={handleEdit}
          isExpanded={expandedId === personId}
          onPress={() => handlePersonPress(personWithId)}
        />
      </View>
    );
  }, [NUM_COLUMNS, CARD_WIDTH, GAP, isWeb, expandedId, handlePersonPress, handleEdit]);

  return (
    <YStack flex={1} paddingTop={isWeb ? 90 : isIpad() ? 85 : 95} bg={isDark ? '#0a0a0a' : '$backgroundLight'}>
      {__DEV__ && (
         <DevButtons />
      )}
      <FlatList
        key={`crm-${NUM_COLUMNS}`}
        data={allContacts}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id || `fallback-${item.name}-${index}`}
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
        const expandedPerson = allContacts.find(person => (person.id || `fallback-${person.name}`) === expandedId);
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