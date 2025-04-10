import React, { useRef, useEffect, useState, memo, useCallback } from 'react';
import { Platform, StyleSheet, ScrollView, LayoutChangeEvent } from 'react-native';
import { XStack, Stack, StackProps, View } from 'tamagui';
import { NoteCard } from '@/components/notes/NoteCard';
import type { Note } from '@/types/notes';
import { TrashcanArea } from './TrashcanArea'; // Import TrashcanArea
import { SharedValue } from 'react-native-reanimated';

// Define more specific types for react-dnd
// Define connector types locally as 'any' to bypass module resolution issue
type ConnectDragSource = any;
type ConnectDropTarget = any;
type ConnectDragPreview = any;
// import type { ConnectDragSource, ConnectDropTarget, ConnectDragPreview } from 'react-dnd';


type DragSourceMonitor<DragObject = unknown, DropResult = unknown> = any; // Replace 'any' with actual type if available
type DropTargetMonitor<DragObject = unknown, DropResult = unknown> = any; // Replace 'any' with actual type if available
type DropTargetHookSpec<DragObject = unknown, DropResult = unknown, CollectedProps = unknown> = any; // Replace 'any' with actual type if available
type DragSourceHookSpec<DragObject = unknown, DropResult = unknown, CollectedProps = unknown> = any; // Replace 'any' with actual type if available
type DragObjectWithType = { type: string }; // Base type for dragged items

// Dynamically import react-dnd stuff only on web
let DndProvider: React.ComponentType<{ backend: any; children: React.ReactNode }> | null = null;
// Correct types for useDrag and useDrop return values (connector functions)
let useDrag: (<DragObject extends DragObjectWithType, DropResult, CollectedProps>(
  spec: DragSourceHookSpec<DragObject, DropResult, CollectedProps>
) => [CollectedProps, ConnectDragSource, ConnectDragPreview]) | null = null;
let useDrop: (<DragObject extends DragObjectWithType, DropResult, CollectedProps>(
  spec: DropTargetHookSpec<DragObject, DropResult, CollectedProps>
) => [CollectedProps, ConnectDropTarget]) | null = null;
let HTML5Backend: any = null;

if (Platform.OS === 'web') {
  Promise.all([
    import('react-dnd'),
    import('react-dnd-html5-backend')
  ]).then(([dndModule, backendModule]) => {
    DndProvider = dndModule.DndProvider;
    useDrag = dndModule.useDrag;
    useDrop = dndModule.useDrop;
    HTML5Backend = backendModule.HTML5Backend;
  });
}

const ITEM_TYPE = 'note';

interface DragItem {
  id: string;
  index: number;
  type: typeof ITEM_TYPE; // Ensure type is part of the interface
}

interface DraggableNoteProps extends StackProps {
  note: Note;
  index: number;
  moveNote: (dragIndex: number, hoverIndex: number) => void;
  onCardPress: () => void;
  onEdit?: (note: Note) => void;
  onDragStateChange: (isDragging: boolean, noteId: string) => void; // Callback for drag state
}

// Define collected props type for useDrag
interface DraggableNoteCollectedProps {
  isDragging: boolean;
}

const DraggableNote: React.FC<DraggableNoteProps> = memo(({ note, index, moveNote, onCardPress, onEdit, onDragStateChange, ...rest }) => {
  const ref = useRef<HTMLDivElement>(null); // Use specific HTML element type

  const [{ isDragging }, drag, preview] = useDrag ? useDrag<DragItem, void, DraggableNoteCollectedProps>({
    type: ITEM_TYPE,
    item: { id: note.id, index, type: ITEM_TYPE }, // Added type property
    collect: (monitor: DragSourceMonitor<DragItem, void>) => ({
      isDragging: monitor.isDragging(),
    }),
    // Optional: Callback when dragging starts/ends
    // end: (item, monitor) => {
    //   if (!monitor.didDrop()) {
    //     // Handle case where drag ends without dropping on a target
    //     onDragStateChange(false, item.id);
    //   }
    // }
  }) : [{ isDragging: false }, null, null]; // Provide default values matching the expected tuple structure

  // Effect to report drag state changes
  useEffect(() => {
    onDragStateChange(isDragging, note.id);
  }, [isDragging, note.id, onDragStateChange]);

  // Define collected props type for useDrop (empty for hover-only)
  interface DraggableNoteDropCollectedProps {}

  const [, drop] = useDrop ? useDrop<DragItem, void, DraggableNoteDropCollectedProps>({
    accept: ITEM_TYPE, // Accept other notes for reordering
    hover: (item: DragItem, monitor: DropTargetMonitor<DragItem, void>) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = (ref.current as any)?.getBoundingClientRect();
      if (!hoverBoundingRect) {
        return;
      }
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) {
        return;
      }
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveNote(dragIndex, hoverIndex);
      item.index = hoverIndex; 
    },
  }) : [{}, null]; 

  drag && drag(ref); 
  drop && drop(ref); 


  const opacity = isDragging ? 0.5 : 1;


  return (
    <Stack
      ref={ref} 
      className="draggable-note"
      style={{ opacity }}
      {...rest}
    >
      <NoteCard
        note={note}
        onPress={onCardPress}
        isDragging={isDragging}
        onEdit={onEdit}
      />
    </Stack>
  );
});

interface WebDragDropProps {
  notes: Note[];
  onMoveNote: (dragIndex: number, hoverIndex: number) => void;
  onSelectNote: (note: Note) => void;
  onEditNote?: (note: Note) => void;
  numColumns: number;
  bottomPadding: number;
  isTrashcanVisible: SharedValue<boolean>;
  handleAttemptDelete: (noteId: string) => void;
  onLayoutTrashcan: (event: LayoutChangeEvent) => void;
  onDragStateChange: (isDragging: boolean, noteId: string | null) => void;
}

interface TrashcanDropCollectedProps {
  isOverTrashcan: boolean;
}

const WebDragDrop: React.FC<WebDragDropProps> = ({
  notes,
  onMoveNote,
  onSelectNote,
  onEditNote,
  numColumns,
  bottomPadding,
  isTrashcanVisible,
  handleAttemptDelete,
  onLayoutTrashcan,
  onDragStateChange,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false); 

  useEffect(() => {
    setIsClient(true); 
    if (Platform.OS === 'web' && DndProvider && HTML5Backend && useDrag && useDrop) {
      setIsLoaded(true);
    } else if (Platform.OS !== 'web') {
      setIsLoaded(false);
    }
  }, []); 

  useEffect(() => {
    if (isClient && Platform.OS === 'web' && DndProvider && HTML5Backend && useDrag && useDrop) {
      setIsLoaded(true);
    } else if (isClient && Platform.OS !== 'web') {
      setIsLoaded(false);
    }
  }, [isClient]); 

  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        .draggable-note {
          cursor: grab;
        }
        .draggable-note:active {
          cursor: grabbing;
        }
        .note-container {
          width: 100%; 
          padding: 0 16px;  
        }
        .scrollable-container {
          height: 100%;
          overflow-y: auto;
          flex: 1;
          width: 100%; 
        }
        .note-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        .note-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          padding: 4px 10px;
          margin-right: 6px;
          margin-bottom: 6px;
          font-size: 12px;
          font-weight: 600;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
      `;
      document.head.appendChild(styleTag);

      return () => {
        if (document.head.contains(styleTag)) {
           document.head.removeChild(styleTag);
        }
      };
    }
  }, []);


  const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
      if (Platform.OS === 'web') {
      return (
        <div className="scrollable-container">
          {children}
        </div>
      );
    }
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        {children}
      </ScrollView>
    );
  };

  const itemStackProps: StackProps = {
    flexBasis: `${95 / numColumns}%`, 
    marginBottom: 16,
  };

  const [{ isOverTrashcan }, trashcanDropRef] = useDrop && isLoaded ? useDrop<DragItem, void, TrashcanDropCollectedProps>({
    accept: ITEM_TYPE, 
    drop: (item: DragItem) => { 
      handleAttemptDelete(item.id);
      onDragStateChange(false, null); 
    },
    collect: (monitor: DropTargetMonitor<DragItem, void>) => ({
      isOverTrashcan: monitor.isOver(), 
    }),
  }) : [{ isOverTrashcan: false }, null]; 


  if (!isClient || !isLoaded || Platform.OS !== 'web' || !DndProvider || !HTML5Backend || !useDrag || !useDrop) {
    return (
       <ContentWrapper>
         <XStack 
           flexWrap="wrap"
           paddingBottom={bottomPadding}
           paddingTop={30}
           alignItems="flex-start"
           gap={16} 
           paddingHorizontal={16} 
         >
           {notes.map((note) => (
             <Stack key={note.id} {...itemStackProps}>
               <NoteCard
                 note={note}
                 onPress={() => onSelectNote(note)}
                 onEdit={onEditNote ? () => onEditNote(note) : undefined}
               />
             </Stack>
           ))}
         </XStack>
       </ContentWrapper>
     );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ContentWrapper>
        <XStack 
          flexWrap="wrap"
          paddingBottom={bottomPadding}
          paddingTop={30}
          alignItems="flex-start" 
          gap={16} 
          paddingHorizontal={16} 
        >
          {notes.map((note, index) => (
            <DraggableNote
              key={note.id}
              note={note}
              index={index}
              moveNote={onMoveNote}
              onCardPress={() => onSelectNote(note)}
              onEdit={onEditNote ? () => onEditNote(note) : undefined}
              onDragStateChange={onDragStateChange}
              {...itemStackProps}
            />
          ))}
        </XStack>
      </ContentWrapper>

      <div ref={trashcanDropRef} style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100px', 
        zIndex: 10,
        pointerEvents: isTrashcanVisible.value ? 'auto' : 'none', 
      }}>
        <TrashcanArea
          isVisible={isTrashcanVisible.value} 
          onLayout={onLayoutTrashcan} 
          isHovering={isOverTrashcan} 
        />
      </div> 
    </DndProvider> 
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  trashcanWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 10,
  },
});

export default WebDragDrop; 
