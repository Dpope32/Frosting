import React, { useState } from 'react';
import { Platform } from 'react-native';
import { YStack, Text } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';

let useDrop: ((spec: any) => [any, any]) | null = null;

if (Platform.OS === 'web') {
  Promise.all([
    import('react-dnd')
  ]).then(([dndModule]) => {
    useDrop = dndModule.useDrop;
  });
}

interface WebTrashcanAreaProps {
  isVisible: boolean;
  onDeleteNote: (noteId: string) => void;
  isDark?: boolean;
}

const WebTrashcanArea: React.FC<WebTrashcanAreaProps> = ({
  isVisible,
  onDeleteNote,
  isDark = false
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && useDrop) {
      setIsLoaded(true);
      
      // Add CSS for smooth animations
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        .web-trashcan {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .web-trashcan:hover {
          transform: translateX(-50%) scale(1.1) !important;
        }
        .web-trashcan-body {
          transition: all 0.2s ease !important;
        }
        .web-trashcan-tooltip {
          animation: fadeInUp 0.2s ease forwards;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `;
      document.head.appendChild(styleTag);

      return () => {
        if (document.head.contains(styleTag)) {
          document.head.removeChild(styleTag);
        }
      };
    } else {
      setIsLoaded(true);
    }
  }, []);

  const [{ isOver }, dropRef] = useDrop ? useDrop({
    accept: 'note',
    drop: (item: { id: string }) => {
      console.log('Dropping note for deletion:', item.id);
      onDeleteNote(item.id);
    },
    collect: (monitor: any) => ({
      isOver: monitor.isOver(),
    }),
  }) : [{ isOver: false }, null];

  if (!isVisible || !isLoaded || typeof window === 'undefined' || !useDrop) return null;

  const trashCanStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: `translateX(-50%) scale(${isHovering || isOver ? 1.1 : 1})`,
    zIndex: 1000,
    transition: 'all 0.3s ease',
    opacity: isVisible ? 1 : 0,
    cursor: 'pointer',
  };

  const trashCanBodyStyle: React.CSSProperties = {
    width: 80,
    height: 90,
    backgroundColor: isHovering || isOver ? '#ef4444' : '#6b7280',
    borderRadius: '8px 8px 12px 12px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    border: `2px solid ${isHovering || isOver ? '#dc2626' : '#4b5563'}`,
  };

  const trashCanLidStyle: React.CSSProperties = {
    width: 90,
    height: 12,
    backgroundColor: isHovering || isOver ? '#dc2626' : '#4b5563',
    borderRadius: '6px',
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: 'translateX(-50%)',
    transition: 'all 0.2s ease',
    border: `1px solid ${isHovering || isOver ? '#b91c1c' : '#374151'}`,
  };

  const trashCanHandleStyle: React.CSSProperties = {
    width: 20,
    height: 8,
    backgroundColor: 'transparent',
    border: `2px solid ${isHovering || isOver ? '#dc2626' : '#4b5563'}`,
    borderRadius: '4px 4px 0 0',
    position: 'absolute',
    top: -16,
    left: '50%',
    transform: 'translateX(-50%)',
    transition: 'all 0.2s ease',
  };

  const stripesStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginTop: 15,
  };

  const stripeStyle: React.CSSProperties = {
    width: 3,
    height: 25,
    backgroundColor: isHovering || isOver ? '#dc2626' : '#9ca3af',
    borderRadius: '2px',
    transition: 'all 0.2s ease',
  };

  return (
    <div
      ref={dropRef}
      style={trashCanStyle}
      className="web-trashcan"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div style={trashCanBodyStyle} className="web-trashcan-body">
        <div style={trashCanLidStyle} />
        <div style={trashCanHandleStyle} />
        <div style={stripesStyle}>
          <div style={stripeStyle} />
          <div style={stripeStyle} />
          <div style={stripeStyle} />
        </div>
        {(isHovering || isOver) && (
          <div 
            className="web-trashcan-tooltip"
            style={{
              position: 'absolute',
              bottom: -30,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}>
            Drop to Delete
          </div>
        )}
      </div>
    </div>
  );
};

export default WebTrashcanArea; 