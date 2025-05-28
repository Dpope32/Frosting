import React, { useState } from "react";
import { FlatList, View, Dimensions, Alert, Platform } from "react-native";
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
import { LongPressDelete } from "@/components/common/LongPressDelete";
import { useToastStore } from "@/store";
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
  const PADDING = isWeb? 30 : isIpad() ? 24 : 16;
  const GAP = isWeb? 10 : isIpad() ? 12 : 6;
  const NUM_COLUMNS = isWeb ? 4 : isIpad() ? 2 : 1;
  const CARD_WIDTH = isIpad() ? 300 : isWeb ?  (width - (12 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS
   : (width - (2 * PADDING) - ((NUM_COLUMNS - 1) * GAP)) / NUM_COLUMNS;
  const CARD_WIDTH_MOBILE = isIpad() ? 250 : "92%";
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
      <LongPressDelete onDelete={(onComplete) => {
        if (Platform.OS === 'web') {
          if (window.confirm('Delete this contact?')) {
            deletePerson(item.id);
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
                  deletePerson(item.id);
                  showToast('Contact deleted', 'success');
                  onComplete(true);
                }
              }
            ],
            { cancelable: true }
          );
        }
      }}>
        <View
          style={{
            width: isWeb ? CARD_WIDTH : CARD_WIDTH_MOBILE,
            marginLeft: isFirstInRow ? PADDING : GAP / 2,
            marginRight: isLastInRow ? PADDING : GAP / 2,
            marginBottom: GAP,
            alignSelf: NUM_COLUMNS === 1 ? "center" : "flex-start",
          }}
        >
          <PersonCard
            person={item}
            onEdit={handleEdit}
            isExpanded={expandedId === item.id}
            onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
          />
        </View>
      </LongPressDelete>
    );
  };

  return (
<<<<<<< HEAD
    <YStack flex={1} paddingTop={isWeb ? 90 : isIpad() ? 85 : 95} bg={isDark ? '#0a0a0a' : '$backgroundLight'}>
=======
    <YStack flex={1} paddingTop={isWeb ? 90 : isIpad() ? 85 : 95} bg={isDark ? '#0a0a0a' : '#f9f9f9'}>
>>>>>>> dac3674 (welp who fc)
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
          paddingHorizontal: isWeb ? 0 : isIpad() ? 8 : 8,
          paddingLeft: isWeb ? 0 : isIpad() ? 8 : 4,
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
