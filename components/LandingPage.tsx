import React, { useState } from 'react'
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
import { EditTaskModal } from './cardModals/edits/EditTaskModal'
import { FloatingActionSection } from './home/float/FloatingActionSection'
import { AddVaultEntryModal } from './cardModals/AddVaultEntryModal'
import { AddHabitModal } from './cardModals/AddHabitModal'
import { AddNoteSheet } from './notes/AddNoteSheet'
import { AddBillModal } from './cardModals/creates/AddBillModal'
import { AddPersonForm } from './crm/Forms/AddPersonForm';
import { EventModal } from './calendar/EventModal'
import { AddProjectModal } from './cardModals/AddProjectModal'

import { useUserStore } from '@/store/UserStore'
import { useProjectStore, useStoreHydrated } from '@/store/ToDo'
import { useProjectStore as useProjectsStore } from '@/store/ProjectStore'
import { useEditTaskStore } from '@/store/EditTaskStore'
import { BackgroundSection } from '@/components/home/BackgroundSection'
import { StarsAnimation } from '@/components/home/StarsAnimation'
import { CardSection } from '@/components/home/CardSection'
import { TaskSection } from '@/components/home/TaskSection'
import { AssetSection } from '@/components/home/AssetSection'
import { isIpad } from '@/utils/deviceUtils';
import { CalendarEvent } from '@/store/CalendarStore'
import type { Attachment } from '@/types/notes';
import type { Tag } from '@/types/tag';
import { formatBold, formatItalic, formatUnderline, formatCode, formatBullet } from '@/services/noteService';
import { createFormattingHandler } from '@/services/noteService2';
import { useEditStockStore } from '@/store/EditStockStore'
import { EditStockModal } from './cardModals/edits/EditStockModal'
import { useHabits } from '@/hooks/useHabits';

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
  const isStockModalOpen = useEditStockStore(s => s.isOpen)
  const openStockModal = useEditStockStore(s => s.openModal)
  const { addHabit } = useHabits();
  const projects = useProjectsStore(s => s.projects);

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
      case 'bt_contact':
        setContactModalOpen(true);
        break;
      case 'bt_stock':
        openStockModal()
        break
      case 'bt_project':
        setProjectModalOpen(true);
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
            marginBottom="$2" 
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
        <Stack height={180} />
      </ScrollView>
      {isMounted && (
        <>
          <PortfolioModal open={portfolioModalOpen} onOpenChange={setPortfolioModalOpen} />
          <WatchlistModal open={watchlistModalOpen} onOpenChange={setWatchlistModalOpen} />
          <QuoteModal open={quoteModalOpen} onOpenChange={setQuoteModalOpen} />
          <WifiModal open={wifiModalOpen} onOpenChange={setWifiModalOpen}/>
          {sheetOpen && <NewTaskModal open={sheetOpen} onOpenChange={setSheetOpen} isDark={isDark} />}
          {taskListModalOpen && <TaskListModal open={taskListModalOpen} onOpenChange={setTaskListModalOpen} />}
          {isEditModalOpen && <EditTaskModal open={isEditModalOpen} isDark={isDark} onOpenChange={closeEditModal} />}
          {isStockModalOpen && <EditStockModal />}
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
            isVisible={billModalOpen} onClose={() => {setBillModalOpen(false)}}
            onSubmit={(entry: { name: string; amount: number; dueDate: number }) => { setBillModalOpen(false) }}
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
        </>
      )}
        <FloatingActionSection onActionPress={handleActionPress} isDark={isDark} />
    </Stack>
  )
}
