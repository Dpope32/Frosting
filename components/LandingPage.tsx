import React, { useState, useCallback, useRef } from 'react'
import { Platform } from 'react-native'
import { useColorScheme } from '@/hooks/useColorScheme';
import { YStack, Text, Stack, ScrollView, XStack, isWeb } from 'tamagui'
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { NewTaskModal } from './cardModals/NewTaskModal/index'
import { PortfolioModal } from './cardModals/PortfolioModal'
import { TaskListModal } from './taskList/TaskListModal'
import { WatchlistModal } from './cardModals/WatchlistModal'
import { QuoteModal } from './cardModals/QuoteModal'
import { WifiModal } from './cardModals/WifiModal'
import { EditTaskModal } from './cardModals/EditTaskModal'
import { FloatingActionSection } from './home/float/FloatingActionSection'
import { AddVaultEntryModal } from './cardModals/AddVaultEntryModal'
import { AddHabitModal } from './cardModals/AddHabitModal'
import { AddNoteSheet } from './notes/AddNoteSheet'
import { AddBillModal } from './cardModals/AddBillModal'
import { EventModal } from './calendar/EventModal'

import { useUserStore } from '@/store/UserStore'
import { useProjectStore, useStoreHydrated } from '@/store/ToDo'
import { useEditTaskStore } from '@/store/EditTaskStore'
import { BackgroundSection } from '@/components/home/BackgroundSection'
import { StarsAnimation } from '@/components/home/StarsAnimation'
import { CardSection } from '@/components/home/CardSection'
import { TaskSection } from '@/components/home/TaskSection'
import { AssetSection } from '@/components/home/AssetSection'
import { isIpad } from '@/utils/deviceUtils';
import { CalendarEvent } from '@/store/CalendarStore'

export function LandingPage() {
  const userHydrated = useUserStore(s => s.hydrated)
  const projectHydrated = useStoreHydrated()
  const todaysTasks = useProjectStore(s => s.todaysTasks)
  const toggleTaskCompletion = useProjectStore(s => s.toggleTaskCompletion)
  const deleteTask = useProjectStore(s => s.deleteTask)
  const isEditModalOpen = useEditTaskStore(s => s.isOpen)
  const closeEditModal = useEditTaskStore(s => s.closeModal)
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const router = useRouter()
  const backgroundColor = isDark ? "rgba(14, 14, 15, 0.95)" : "rgba(0, 0, 0, 0.45)"
  const [isMounted, setIsMounted] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)
  const [taskListModalOpen, setTaskListModalOpen] = useState(false)
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [wifiModalOpen, setWifiModalOpen] = useState(false)
  const [vaultModalOpen, setVaultModalOpen] = useState(false)
  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [billModalOpen, setBillModalOpen] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventTime, setNewEventTime] = useState('')
  const [selectedType, setSelectedType] = useState<CalendarEvent['type']>('personal')
  const [notifyOnDay, setNotifyOnDay] = useState(false)
  const [notifyBefore, setNotifyBefore] = useState(false)
  const [notifyBeforeTime, setNotifyBeforeTime] = useState('1h')
  const [editingEvent, setEditingEvent] = useState<any>(null)

  // Effect hooks
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
      setBillModalOpen(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (!userHydrated) {
    return (
      <Stack flex={1} backgroundColor="black" alignItems="center" justifyContent="center">
        <Text color="white">Loading...</Text>
      </Stack>
    )
  }
  

  const handleNewTaskPress = () => { 
    setSheetOpen(true) 
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const handleTemperaturePress = () => {
    router.push('/modals/temperature');
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const handlePortfolioPress = () => { 
     setPortfolioModalOpen(true) 
     if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
    }
  const handleQuotePress = () => { 
    setQuoteModalOpen(true) 
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const handleWifiPress = () => { 
    setWifiModalOpen(true) 
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }

  const handleActionPress = (name: string) => {
    switch (name) {
      case 'bt_password':
        setVaultModalOpen(true);
        break;
      case 'bt_habit':
        setHabitModalOpen(true);
        break;
      case 'bt_note':
        setNoteModalOpen(true);
        break;
      case 'bt_bill':
        setBillModalOpen(true);
        break;
      case 'bt_event':
        setSelectedDate(new Date());
        setEventModalOpen(true);
        break;
      case 'bt_todo':
        setSheetOpen(true);
        break;
    }
  };

  // Calculate YStack padding top in a readable way
  let ptop: number;
  if (isIpad()) {
    // ipad
    ptop = isDark ? 30 : 30;
  } else if (isWeb) {
    // web
    ptop = 100;
  } else {
    // mobile
    ptop = 100;
  }

  return (
    <Stack flex={1} backgroundColor="black">
      <BackgroundSection />
      <StarsAnimation /> 
      <ScrollView flex={1} paddingHorizontal={isWeb ? "$4" : isIpad() ? "$4" : "$2"} paddingBottom="$3" showsVerticalScrollIndicator={false} >
        <YStack pt={ptop} gap="$3" >
          {!isWeb && (
            <Stack 
              borderRadius={16} p="$3" width="100%" backgroundColor={backgroundColor} 
              borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.0)"}  borderWidth={1}
            >
              <CardSection 
                onPortfolioPress={handlePortfolioPress} 
                onTemperaturePress={handleTemperaturePress} 
                onQuotePress={handleQuotePress}
                onWifiPress={handleWifiPress}
                isDark={isDark}
              />
            </Stack>
          )}
          <Stack 
            backgroundColor={backgroundColor} 
            borderRadius={16} 
            padding="$3" 
            borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.0)"} 
            borderWidth={1}
            marginBottom="$4" 
            style={Platform.OS === 'web'  ? { backdropFilter: 'blur(12px)',
                  boxShadow: isDark  ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)'   : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)' } 
              : {  shadowColor: isDark ? "#000" : "rgba(0, 0, 0, 0.15)", 
                  shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35,  shadowRadius: 12  }
            }
          >
            {projectHydrated ? (
              <TaskSection 
                todaysTasks={todaysTasks} 
                toggleTaskCompletion={toggleTaskCompletion} 
                deleteTask={deleteTask} 
                onAddTaskPress={handleNewTaskPress} 
                onTaskListPress={() => setTaskListModalOpen(true)} 
              />
            ) : (
              <Stack alignItems="center" justifyContent="center" height={120}>
                <Text color="white">Loading tasks...</Text>
              </Stack>
            )}
          </Stack>
         
          {Platform.OS === 'web' ?  (
            <Stack 
              backgroundColor={backgroundColor} 
              borderRadius={16} 
              padding="$4" 
              marginTop="$2" 
              borderColor={isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.1)"} 
              borderWidth={1} 
              minWidth={300}
              style={{
                backdropFilter: 'blur(12px)',
                boxShadow: isDark 
                  ? '0px 4px 24px rgba(0, 0, 0, 0.45), inset 0px 0px 1px rgba(255, 255, 255, 0.12)' 
                  : '0px 4px 24px rgba(0, 0, 0, 0.15), inset 0px 0px 1px rgba(255, 255, 255, 0.2)'
              }}
            >
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontFamily="$body" color="#dbd0c6" fontSize={20} fontWeight="bold" marginBottom="$2" paddingLeft="$4" style={{ textShadowColor: 'rgba(219, 208, 198, 0.15)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 4 }}>
                  Asset Tracker
                </Text>
              </XStack>
              <Stack padding="$2" minHeight={100}>
                <AssetSection onAddToWatchlist={() => setWatchlistModalOpen(true)} />
              </Stack>
            </Stack>
          ) : (
            <Stack position="absolute" bottom={0} left={0} right={0} padding="$4"  >
              <Text color="#dbd0c6" fontSize={12} fontFamily="$body" marginTop="$2" textAlign="center" opacity={0}>Version 1.1.70</Text>
            </Stack>
          )}
        </YStack>
      </ScrollView>
      {isMounted && (
        <>
          <PortfolioModal open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen} />
          <WatchlistModal open={watchlistModalOpen} onOpenChange={setWatchlistModalOpen} />
          <QuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
          <WifiModal open={wifiModalOpen} onOpenChange={setWifiModalOpen}/>
          {sheetOpen && <NewTaskModal open={sheetOpen} onOpenChange={setSheetOpen} isDark={isDark} />}
          {taskListModalOpen && <TaskListModal open={taskListModalOpen} onOpenChange={setTaskListModalOpen} />}
          {isEditModalOpen && <EditTaskModal open={isEditModalOpen} onOpenChange={closeEditModal} />}
          <AddVaultEntryModal isVisible={vaultModalOpen} onClose={() => setVaultModalOpen(false)} onSubmit={(entry) => { setVaultModalOpen(false); }} />
          <AddHabitModal  isVisible={habitModalOpen} onClose={() => setHabitModalOpen(false)} onSave={(name, category, notificationTimeLabel, notificationTimeValue) => { setHabitModalOpen(false)}}/>
          <AddNoteSheet  isModalOpen={noteModalOpen} selectedNote={null}  editTitle="" editContent="" editTags={[]}
            editAttachments={[]} handleCloseModal={() => setNoteModalOpen(false)} setEditTitle={() => {}} setEditContent={() => {}} handleTagsChange={() => {}}
            handleSaveNote={() => setNoteModalOpen(false)} handleDeleteNote={() => {}} handleRemoveAttachment={() => {}} handleBold={() => {}} handleItalic={() => {}}
            handleUnderline={() => {}} handleBullet={() => {}} handleCode={() => {}} handleImagePick={() => {}}
          />
          <AddBillModal 
            isVisible={billModalOpen} onClose={() => {setBillModalOpen(false)}}
            onSubmit={(entry: { name: string; amount: number; dueDate: number }) => { setBillModalOpen(false) }}
          />
          <EventModal 
            isEventModalVisible={eventModalOpen}
            isViewEventModalVisible={false}
            selectedDate={selectedDate}
            newEventTitle={newEventTitle}
            setNewEventTitle={setNewEventTitle}
            newEventTime={newEventTime}
            setNewEventTime={setNewEventTime}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            notifyOnDay={notifyOnDay}
            setNotifyOnDay={setNotifyOnDay}
            notifyBefore={notifyBefore}
            setNotifyBefore={setNotifyBefore}
            notifyBeforeTime={notifyBeforeTime}
            setNotifyBeforeTime={setNotifyBeforeTime}
            editingEvent={editingEvent}
            handleAddEvent={() => { setEventModalOpen(false)}}
            handleEditEvent={() => {}}
            handleDeleteEvent={() => {}}
            resetForm={() => {
              setNewEventTitle('');
              setNewEventTime('');
              setSelectedType('personal');
              setNotifyOnDay(false);
              setNotifyBefore(false);
              setNotifyBeforeTime('1h');
              setEditingEvent(null);
            }}
            closeEventModals={() => setEventModalOpen(false)}
            openEventModal={() => setEventModalOpen(true)}
            isDark={isDark}
            primaryColor={primaryColor}
          />
        </>
      )}
        <FloatingActionSection onActionPress={handleActionPress} isDark={isDark} />
    </Stack>
  )
}
