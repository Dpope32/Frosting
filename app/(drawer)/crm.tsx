import React, { useState } from "react";
import { FlatList, View, Dimensions, Alert, Platform, TouchableOpacity, Text } from "react-native";

import { YStack, Button, isWeb } from "tamagui";
import { PersonEmpty } from "@/components/crm/PersonEmpty";
import { MaterialIcons } from '@expo/vector-icons';
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
import { useToastStore } from "@/store";
import ExpandedView from "@/components/crm/PersonCard/ExpandedView";
import { getColorForPerson } from "@/components/crm/PersonCard/utils";
const { width } = Dimensions.get("window");


export default function CRM() {
  const { contacts, updatePerson, deletePerson } = usePeopleStore();
  const showToast = useToastStore(state => state.showToast);
  const allContacts = Object.values(contacts);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  // Debug expanded view issues
  // console.log('🔍 [CRM] Render - expandedId:', expandedId, 'contactModalOpen:', contactModalOpen, 'isEditModalVisible:', isEditModalVisible);
  const PADDING = isWeb? 30 : isIpad() ? 24 : 16;
  const GAP = isWeb? 10 : isIpad() ? 8 : 6;
  const NUM_COLUMNS = isWeb ? 4 : isIpad() ? 1 : 1;
  const CARD_WIDTH = isIpad() ? 380 : isWeb ?  (width - (12 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS
   : (width - (2 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS;
  const CARD_WIDTH_MOBILE = isIpad() ? "92%" : "92%";
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
          width: isWeb ? CARD_WIDTH : CARD_WIDTH_MOBILE,
          marginLeft: isFirstInRow ? isIpad() ? 8 : PADDING : GAP / 2,
          marginRight: isLastInRow ? isIpad() ? PADDING : PADDING : GAP / 2,
          marginBottom: GAP,
          alignSelf: NUM_COLUMNS === 1 ? "center" : "flex-start",
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
          paddingTop: 4,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 0 : isIpad() ? 12 : 8,
          paddingLeft: isWeb ? 0 : isIpad() ? 12 : 4,
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