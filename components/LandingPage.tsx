import React, { useState, useCallback } from 'react'
import { Platform, Alert } from 'react-native'
import { useColorScheme } from '@/hooks/useColorScheme';
import { YStack, Text, Stack, ScrollView, XStack, isWeb } from 'tamagui'
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated'

import { NewTaskModal } from '@/components/cardModals/NewTaskModal/index'
import { TaskListModal } from '@/components/taskList/TaskListModal'
import { WatchlistModal } from '@/components/home/WatchlistModal'
import { QuoteModal } from '@/components/home/QuoteModal'
import { WifiModal } from '@/components/home/WifiModal'
import { EditTaskModal } from '@/components/cardModals/edits/EditTaskModal'
import { FloatingActionSection } from '@/components/home/float/FloatingActionSection'
import { AddVaultEntryModal } from '@/components/cardModals/creates/AddVaultEntryModal'
import { AddHabitModal } from '@/components/cardModals/creates/AddHabitModal'
import { AddNoteSheet } from '@/components/cardModals/creates/AddNoteSheet'
import { AddBillModal } from '@/components/cardModals/creates/AddBillModal'
import { AddPersonForm } from '@/components/crm/Forms/AddPersonForm';
import { EventModal } from './calendar/EventModal'
import { AddProjectModal } from './cardModals/creates/AddProjectModal'

import { useUserStore, useProjectStore as useProjectsStore, useEditTaskStore, CalendarEvent, useEditStockStore } from '@/store'
import { useProjectStore, useStoreHydrated } from '@/store/ToDo'
import { BackgroundSection } from '@/components/home/BackgroundSection'
import { StarsAnimation } from '@/components/home/StarsAnimation'
import { CardSection } from '@/components/home/CardSection'
import { TaskSection } from '@/components/home/TaskSection'
import { InitialSyncIndicator } from '@/components/home/InitialSyncIndicator';
import { AssetSection } from '@/components/home/AssetSection'
import { DailyQuoteDisplay } from '@/components/home/DailyQuoteDisplay'

import { isIpad } from '@/utils';
import type { Attachment, Tag } from '@/types'
import { formatBold, formatItalic, formatUnderline, formatCode, formatBullet } from '@/services';
import { createFormattingHandler } from '@/services';
import { useHabits } from '@/hooks';
import { useBills } from '@/hooks/useBills';
import { SettingsModal } from '@/components/cardModals/SettingsModal/SettingsModal';
import { useWallpaperStore } from '@/store';
import { debouncedNavigate } from '@/utils';

let wallpaperInitErrorPatched = false;

export const LandingPage = React.memo(() => {
  const userHydrated = useUserStore(s => s.hydrated)
  const projectHydrated = useStoreHydrated()
  const todaysTasks = useProjectStore(s => s.todaysTasks || [])
  const toggleTaskCompletion = useProjectStore(s => s.toggleTaskCompletion)
  const deleteTask = useProjectStore(s => s.deleteTask)
  const { addBill } = useBills();
  const isEditModalOpen = useEditTaskStore(s => s.isOpen)
  const closeEditModal = useEditTaskStore(s => s.closeModal)
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  const showQuoteOnHome = useUserStore(s => s.preferences.showQuoteOnHome || false)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const router = useRouter()
  const backgroundColor = React.useMemo(() => 
    isDark ? "rgba(14, 14, 15, 0.95)" : "rgba(0, 0, 0, 0.45)", 
    [isDark]
  )
  const [isMounted, setIsMounted] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [taskListModalOpen, setTaskListModalOpen] = useState(false)
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [wifiModalOpen, setWifiModalOpen] = useState(false)
  const [vaultModalOpen, setVaultModalOpen] = useState(false)
  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [billModalOpen, setBillModalOpen] = useState(false)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventTime, setNewEventTime] = useState('')
  const [selectedType, setSelectedType] = useState<CalendarEvent['type']>('personal')
  const [notifyOnDay, setNotifyOnDay] = useState(false)
  const [notifyBefore, setNotifyBefore] = useState(false)
  const [notifyBeforeTime, setNotifyBeforeTime] = useState('1h')
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState<Tag[]>([]);
  const [noteAttachments, setNoteAttachments] = useState<Attachment[]>([]);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const handleBold = createFormattingHandler(formatBold, selection, setNoteContent);
  const handleItalic = createFormattingHandler(formatItalic, selection, setNoteContent);
  const handleUnderline = createFormattingHandler(formatUnderline, selection, setNoteContent);
  const handleCode = createFormattingHandler(formatCode, selection, setNoteContent);
  const handleBullet = createFormattingHandler(formatBullet, selection, setNoteContent);
  const openStockModal = useEditStockStore(s => s.openModal)
  const { addHabit } = useHabits();
  const projects = useProjectsStore(s => s.projects);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [wallpaperErrorChecked, setWallpaperErrorChecked] = useState(false);

  // Effect hooks
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
      setBillModalOpen(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])
  
  React.useEffect(() => {
    if (wallpaperErrorChecked) return;
    setWallpaperErrorChecked(true);
    const store = useWallpaperStore.getState();
    if (!wallpaperInitErrorPatched) {
      const origInit = store.initializeCache;
      store.initializeCache = async function patchedInit() {
        try {
          await origInit();
        } catch (e) {
          if (typeof window !== 'undefined' && Platform.OS === 'web' && window.confirm) {
            if (window.confirm('No wallpaper is set or there was an error initializing wallpaper storage. Set a new one in Settings?')) {
              setSettingsModalOpen(true);
            }
          } else if (Platform.OS !== 'web' && Alert && Alert.alert) {
            Alert.alert(
              'Wallpaper Error',
              'No wallpaper is set or there was an error initializing wallpaper storage. Set a new one in Settings?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => setSettingsModalOpen(true) },
              ]
            );
          }
        }
      };
      wallpaperInitErrorPatched = true;
    }
    store.initializeCache().catch((e) => {});
  }, [wallpaperErrorChecked]);
  
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
    debouncedNavigate('/modals/temperature');
    if (Platform.OS !== 'web') {Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
  }
  const handlePortfolioPress = () => { 
     router.push('/modals/portfolio')
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

  const handleActionPress = useCallback((action: string) => {
    switch (action) {
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
      case 'bt_contact':
        setContactModalOpen(true);
        break;
      case 'bt_stock':
        console.log('FAB: Opening ADD stock modal');
        useEditStockStore.getState().openModal(undefined, true);
        break;
      case 'bt_project':
        setProjectModalOpen(true);
        break;
    }
  }, []);

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
    ptop = isDark ? 100 : 90;
  }
  const filteredProjects = projects.filter((project) => project.status !== 'completed')

  return (
    <Stack flex={1} backgroundColor="black">
      <BackgroundSection />
      <StarsAnimation />
      <ScrollView flex={1} paddingHorizontal={isWeb ? "$4" : isIpad() ? "$4" : "$2"} paddingBottom={120} showsVerticalScrollIndicator={false} >
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

        {showQuoteOnHome && <DailyQuoteDisplay />}
         
          {Platform.OS === 'web' ?  (
            <Animated.View entering={FadeIn.duration(600)}>
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
            </Animated.View>
          ) : (
            <Stack position="absolute" bottom={0} left={0} right={0} padding="$4"  >
              <Text color="#dbd0c6" fontSize={12} fontFamily="$body" marginTop="$2" textAlign="center" opacity={0}>Version 1.1.70</Text>
            </Stack>
          )}
        </YStack>
        <Stack height={180} />
      </ScrollView>
      <InitialSyncIndicator isDark={isDark} />
      <FloatingActionSection onActionPress={handleActionPress} isDark={isDark} />
      {isMounted && (
        <>
          <WatchlistModal open={watchlistModalOpen} onOpenChange={setWatchlistModalOpen} />
          <QuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
          <WifiModal open={wifiModalOpen} onOpenChange={setWifiModalOpen}/>
          {sheetOpen && <NewTaskModal open={sheetOpen} onOpenChange={setSheetOpen} isDark={isDark} />}
          {taskListModalOpen && <TaskListModal open={taskListModalOpen} onOpenChange={setTaskListModalOpen} />}
          {isEditModalOpen && <EditTaskModal open={isEditModalOpen} isDark={isDark} onOpenChange={closeEditModal} />}
          <AddVaultEntryModal isVisible={vaultModalOpen} onClose={() => setVaultModalOpen(false)} onSubmit={(entry) => { setVaultModalOpen(false); }} />
          <AddHabitModal  isVisible={habitModalOpen} onClose={() => setHabitModalOpen(false)} onSave={addHabit}/>
          <AddNoteSheet 
            isModalOpen={noteModalOpen} 
            selectedNote={null}  
            editTitle={noteTitle} 
            editContent={noteContent} 
            editTags={noteTags}
            editAttachments={noteAttachments} 
            handleCloseModal={() => { setNoteModalOpen(false); setNoteTitle(''); setNoteContent(''); setNoteTags([]); setNoteAttachments([]); }} 
            setEditTitle={setNoteTitle}
            setEditContent={setNoteContent} 
            handleTagsChange={setNoteTags}
            handleSaveNote={() => {
              const noteStore = require('@/store/NoteStore').useNoteStore.getState();
              const { showToast } = require('@/store/ToastStore').useToastStore.getState();
              if (noteTitle.trim() || noteContent.trim()) {
                noteStore.addNote({
                  title: noteTitle,
                  content: noteContent,
                  tags: noteTags,
                  attachments: noteAttachments
                });
                showToast('Note created successfully', 'success');
              } else {
                showToast('Cannot save an empty note', 'error');
              }
              setNoteModalOpen(false);
              setNoteTitle('');
              setNoteContent('');
              setNoteTags([]);
              setNoteAttachments([]);
            }} 
            handleDeleteNote={() => {}} 
            handleRemoveAttachment={() => {}} 
            handleBold={handleBold}
            handleItalic={handleItalic}
            handleUnderline={handleUnderline}
            handleBullet={handleBullet}
            handleCode={handleCode}
            handleImagePick={() => {}}
            onSelectionChange={e => setSelection(e.nativeEvent.selection)}
          />
          {contactModalOpen && <AddPersonForm isVisible={contactModalOpen} onClose={() => setContactModalOpen(false)} />}
          <AddBillModal 
            isVisible={billModalOpen} 
            onClose={() => setBillModalOpen(false)}
            onSubmit={(entry) => { 
              console.log('🏠 LandingPage: onSubmit called with:', entry);
              addBill(entry);
              setBillModalOpen(false);
            }}
          />
          <AddProjectModal open={projectModalOpen} onOpenChange={setProjectModalOpen} isDark={isDark} />
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
          <SettingsModal open={settingsModalOpen} onOpenChange={setSettingsModalOpen} />
        </>
      )}
    </Stack>
  )
})

LandingPage.displayName = 'LandingPage'
