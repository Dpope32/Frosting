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

// Synchronous imports for better production support
if (Platform.OS === 'web') {
  try {
    const dndModule = require('react-dnd');
    const backendModule = require('react-dnd-html5-backend');
    DndProvider = dndModule.DndProvider;
    useDrag = dndModule.useDrag;
    useDrop = dndModule.useDrop;
    HTML5Backend = backendModule.HTML5Backend;
  } catch (error) {
    console.log('Drag and drop libraries not available:', error);
  }
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
      const threshold = 5;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY - threshold) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY + threshold) {
        return;
      }
      
      requestAnimationFrame(() => {
        moveNote(dragIndex, hoverIndex);
        item.index = hoverIndex;
      });
    },
  }) : [{}, null]; 

  const setupRef = (el: any) => {
    ref.current = el;
    if (dragRef) dragRef(el);
    if (dropRef) dropRef(el);
  };

  const opacity = isDragging ? 0.5 : 1;

  console.log(`DraggableNote ${index} received props:`, {
    flexBasis: rest.flexBasis,
    flexShrink: rest.flexShrink,
    marginBottom: rest.marginBottom,
    opacity
  });

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
          padding: 0;  
        }
        .scrollable-container {
          height: 100%;
          overflow-y: auto;
          flex: 1;
          width: 100%; 
          padding: 0;
        }
        .note-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        .note-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          padding: 4px 2px;
          margin-right: 6px;
          margin-bottom: 0px;
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
    flexBasis: numColumns === 1 ? '100%' : numColumns === 2 ? '50%' : '32%',
    marginBottom: 16,
    flexShrink: 0,
  };

  // Add debugging logs
  console.log('WebDragDrop Debug:', {
    numColumns,
    flexBasis: itemStackProps.flexBasis,
    columnGap: numColumns === 1 ? 0 : numColumns === 2 ? 16 : 8,
    notesCount: notes.length,
    hasDragAndDrop: Platform.OS === 'web' && DndProvider && HTML5Backend && useDrag && useDrop
  });

  // Check if drag and drop is available
  const hasDragAndDrop = Platform.OS === 'web' && DndProvider && HTML5Backend && useDrag && useDrop;

  if (!hasDragAndDrop) {
    console.log('Using non-drag version');
    return (
      <ContentWrapper>
        <XStack
          flexWrap="wrap"
          paddingBottom={bottomPadding}
          paddingTop={10}
          alignItems="flex-start"
          columnGap={numColumns === 1 ? 0 : numColumns === 2 ? 16 : 4}
          paddingHorizontal={0}
        >
          {notes.map((note, index) => {
            const stackProps: StackProps = {
              flexBasis: (numColumns === 1 ? '100%' : numColumns === 2 ? '50%' : '32%') as any,
              marginBottom: 16,
              flexShrink: 0,
            };
            console.log(`Note ${index} props:`, stackProps);
            const stackRef = React.useRef<HTMLDivElement>(null);
            React.useEffect(() => {
              if (stackRef.current) {
                const rect = stackRef.current.getBoundingClientRect();
                console.log(`Note ${index} actual width:`, rect.width, 'flexBasis:', stackProps.flexBasis);
              }
            });
            
            return (
              <Stack
                key={note.id}
                {...stackProps}
                ref={stackRef}
              >
                <NoteCard
                  note={note}
                  onPress={() => onSelectNote(note)}
                  onEdit={onEditNote ? () => onEditNote(note) : undefined}
                />
              </Stack>
            );
          })}
        </XStack>
      </ContentWrapper>
    );
  }

  console.log('Using drag and drop version');
  const Provider = DndProvider as React.ComponentType<{backend: any; children: React.ReactNode}>;
  
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      console.log('XStack container actual width:', rect.width);
    }
  });
  
  return (
    <Provider backend={HTML5Backend!}>
      <ContentWrapper>
        <XStack
          ref={containerRef}
          flexWrap="wrap"
          paddingBottom={bottomPadding}
          paddingTop={10}
          alignItems="flex-start"
          columnGap={numColumns === 1 ? 0 : numColumns === 2 ? 16 : 16}
          paddingHorizontal={0}
        >
          {notes.map((note, index) => {
            console.log(`Draggable Note ${index} props:`, itemStackProps);
            
            return (
              <DraggableNote
                key={note.id}
                note={note}
                index={index}
                moveNote={onMoveNote}
                onCardPress={() => onSelectNote(note)}
                onEdit={onEditNote ? () => onEditNote(note) : undefined}
                {...itemStackProps} 
              />
            );
          })}
        </XStack>
      </ContentWrapper>
    </Provider>
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