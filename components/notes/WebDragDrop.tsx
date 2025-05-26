import React, { useRef, useEffect, useState, memo } from 'react';
import { Platform, StyleSheet, ScrollView } from 'react-native';
import { XStack, Stack, StackProps } from 'tamagui';
import { NoteCard } from '@/components/notes/NoteCard';
import type { Note } from '@/types';

type DragSourceMonitor = any;
type DropTargetMonitor = any;
let DndProvider: React.ComponentType<{backend: any; children: React.ReactNode}> | null = null;
let useDrag: ((spec: any) => [{ isDragging: boolean }, any, any]) | null = null;
let useDrop: ((spec: any) => [any, any]) | null = null;
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
}

interface DraggableNoteProps extends StackProps {
  note: Note;
  index: number;
  moveNote: (dragIndex: number, hoverIndex: number) => void;
  onCardPress: () => void;
  onEdit?: (note: Note) => void;
}

const DraggableNote: React.FC<DraggableNoteProps> = memo(({ note, index, moveNote, onCardPress, onEdit, ...rest }) => {
  const ref = useRef<any>(null); 
  
  const [{ isDragging }, dragRef] = useDrag ? useDrag({
    type: ITEM_TYPE,
    item: { id: note.id, index } as DragItem,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }) : [{ isDragging: false }, null];

  const [, dropRef] = useDrop ? useDrop({
    accept: ITEM_TYPE,
    hover: (item: DragItem, monitor: DropTargetMonitor) => {
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

  const setupRef = (el: any) => {
    ref.current = el;
    if (dragRef) dragRef(el);
    if (dropRef) dropRef(el);
  };

  const opacity = isDragging ? 0.5 : 1;

  return (
    <Stack
      ref={setupRef}
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
}

const WebDragDrop: React.FC<WebDragDropProps> = ({
  notes,
  onMoveNote,
  onSelectNote,
  onEditNote,
  numColumns,
  bottomPadding
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && DndProvider && HTML5Backend && useDrag && useDrop) {
      setIsLoaded(true);
    } else if (Platform.OS !== 'web') {
      setIsLoaded(true);
    }
  }, []);

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
    flexBasis: `${90 / numColumns}%`,
    marginBottom: 16,
  };

  if (!isLoaded || Platform.OS !== 'web' || !DndProvider || !HTML5Backend) {
    return (
      <ContentWrapper>
        <XStack
          flexWrap="wrap"
          paddingBottom={bottomPadding}
          paddingTop={30}
          alignItems="flex-start"
          gap={12}
          paddingHorizontal={12}
        >
          {notes.map((note) => (
             <Stack
               key={note.id}
               {...itemStackProps}
             >
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
              {...itemStackProps} 
            />
          ))}
        </XStack>
      </ContentWrapper>
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
});

export default WebDragDrop;