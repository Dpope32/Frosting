import React, { useRef } from 'react';
import { View } from 'react-native';
import { XStack } from 'tamagui';
import { NoteCard } from '@/components/notes/NoteCard';
import type { Note } from '@/types/notes';
import type { DragSourceMonitor, DropTargetMonitor } from 'react-dnd' with { 'resolution-mode': 'import' };

let DndProvider: any;
let useDrag: any;
let useDrop: any;
let HTML5Backend: any;

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  Promise.resolve().then(async () => {
    const dndModule = await import('react-dnd');
    const backendModule = await import('react-dnd-html5-backend');
    
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
}

const DraggableNote: React.FC<DraggableNoteProps> = ({ note, index, moveNote, onPress }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, dragRef] = useDrag({
    type: ITEM_TYPE,
    item: { id: note.id, index } as DragItem,
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, dropRef] = useDrop({
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
      
      moveNote(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const combinedRef = (el: HTMLDivElement | null) => {
    if (el) {
      dragRef(el);
      dragRef(el);
      dropRef(el);
    }
  };

  return (
    <View style={{ width: '50%', padding: 5 }}>
      <div ref={combinedRef} style={{ width: '100%' }}>
        <NoteCard
          note={note}
          onPress={onPress}
          isDragging={isDragging}
        />
      </div>
    </View>
  );
};

interface WebDragDropProps {
  notes: Note[];
  onMoveNote: (dragIndex: number, hoverIndex: number) => void;
  onSelectNote: (note: Note) => void;
  numColumns: number;
  bottomPadding: number;
}

const WebDragDrop: React.FC<WebDragDropProps> = ({ 
  notes, 
  onMoveNote, 
  onSelectNote,
  numColumns,
  bottomPadding 
}) => {
  if (!DndProvider) {
    return (
      <XStack flexWrap="wrap" paddingBottom={bottomPadding}>
        {notes.map((note) => (
          <View key={note.id} style={{ width: '50%', padding: 5 }}>
            <NoteCard
              note={note}
              onPress={() => onSelectNote(note)}
            />
          </View>
        ))}
      </XStack>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <XStack flexWrap="wrap" paddingBottom={bottomPadding}>
        {notes.map((note, index) => (
          <DraggableNote
            key={note.id}
            note={note}
            index={index}
            moveNote={onMoveNote}
            onPress={() => onSelectNote(note)}
          />
        ))}
      </XStack>
    </DndProvider>
  );
};

export default WebDragDrop;