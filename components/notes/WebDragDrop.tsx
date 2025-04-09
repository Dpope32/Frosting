import React, { useRef, useEffect, useState } from 'react';
import { View, Platform, DimensionValue, StyleSheet, ScrollView } from 'react-native';
import { XStack } from 'tamagui';
import { NoteCard } from '@/components/notes/NoteCard';
import type { Note } from '@/types/notes';

// Type definitions for react-dnd
type DragSourceMonitor = any;
type DropTargetMonitor = any;
type XYCoord = { x: number; y: number };

// Define these variables with explicit types to avoid "implicit any" errors
let DndProvider: React.ComponentType<{backend: any; children: React.ReactNode}> | null = null;
let useDrag: ((spec: any) => [{ isDragging: boolean }, any, any]) | null = null;
let useDrop: ((spec: any) => [any, any]) | null = null;
let HTML5Backend: any = null;

// Import react-dnd modules only on web platform
if (Platform.OS === 'web') {
  // Use dynamic imports
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

interface DraggableNoteProps {
  note: Note;
  index: number;
  moveNote: (dragIndex: number, hoverIndex: number) => void;
  onPress: () => void;
  onEdit?: (note: Note) => void;
}

const DraggableNote: React.FC<DraggableNoteProps> = ({ note, index, moveNote, onPress, onEdit }) => {
  const ref = useRef<View | null>(null);
  
  // Check if useDrag is available before using it
  const [{ isDragging }, dragRef] = useDrag ? useDrag({
    type: ITEM_TYPE,
    item: { id: note.id, index } as DragItem,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }) : [{ isDragging: false }, () => {}];

  // Check if useDrop is available before using it
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

      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveNote(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  }) : [{}, () => {}];

  // Setup the drag and drop refs
  const setupRef = (el: any) => {
    ref.current = el;
    
    // Apply the drag and drop refs if they're available
    if (dragRef && dropRef) {
      dragRef(dropRef(el));
    }
  };

  return (
    <View 
      ref={setupRef} 
      style={styles.draggableItem}
      className="draggable-note"
    >
      <NoteCard
        note={note}
        onPress={onPress}
        isDragging={isDragging}
        onEdit={onEdit}
      />
    </View>
  );
};

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
    // Set loaded state once DndProvider and HTML5Backend are available
    if (Platform.OS === 'web') {
      const checkLoaded = () => {
        if (DndProvider && HTML5Backend) {
          setIsLoaded(true);
          return;
        }
        setTimeout(checkLoaded, 50);
      };
      checkLoaded();
    }
  }, []);

  // Apply web-specific styles for drag cursors and font fixes
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Add a style tag to the document head with CSS for the draggable items
      const styleTag = document.createElement('style');
      styleTag.innerHTML = `
        body {
          background-color: #f5f5f5;
        }
        .draggable-note {
          cursor: grab;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .draggable-note.dragging {
          cursor: grabbing;
        }
        .note-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .scrollable-container {
          height: 100%;
          overflow-y: auto;
          flex: 1;
        }
        /* Fix font consistency */
        .note-text {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }
        /* Improve tag styling */
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
        document.head.removeChild(styleTag);
      };
    }
  }, []);

  // ContentWrapper to handle proper scrolling on web
  const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
    if (Platform.OS === 'web') {
      return (
        <div className="scrollable-container">
          <div className="note-container">
            {children}
          </div>
        </div>
      );
    }
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.noteContainer}>
          {children}
        </View>
      </ScrollView>
    );
  };

  // Render regular grid if not on web or if DnD hasn't loaded yet
  if (!isLoaded || Platform.OS !== 'web' || !DndProvider || !HTML5Backend) {
    return (
      <ContentWrapper>
        <XStack 
          flexWrap="wrap" 
          paddingBottom={bottomPadding}
          paddingTop={30}
          gap={16}
        >
          {notes.map((note) => (
            <View key={note.id} style={styles.noteCardWrapper}>
              <NoteCard
                note={note}
                onPress={() => onSelectNote(note)}
                onEdit={onEditNote ? () => onEditNote(note) : undefined}
              />
            </View>
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
          gap={16}
        >
          {notes.map((note, index) => (
            <DraggableNote
              key={note.id}
              note={note}
              index={index}
              moveNote={onMoveNote}
              onPress={() => onSelectNote(note)}
              onEdit={onEditNote}
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
  noteContainer: {
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingHorizontal: 15,
  },
  draggableItem: {
    width: '100%',
    marginBottom: 16,
  },
  noteCardWrapper: {
    width: '100%',
    marginBottom: 16,
  }
});

export default WebDragDrop;