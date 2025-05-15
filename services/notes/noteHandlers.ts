import { useCallback } from 'react';
import type { Attachment } from '@/types/notes';
import type { Tag } from '@/types/tag';

export const createNoteHandlers = (
  setEditTags: (tags: Tag[]) => void,
  setEditAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>,
  setSelection: (selection: { start: number; end: number }) => void
) => {
  const handleTagsChange = useCallback((tags: Tag[]) => {
    setEditTags(tags);
  }, [setEditTags]);

  const handleAddAttachment = useCallback((attachment: Attachment) => {
    setEditAttachments(prev => [...prev, attachment]);
  }, [setEditAttachments]);

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setEditAttachments(prev => prev.filter(a => a.id !== attachmentId));
  }, [setEditAttachments]);

  const handleSelectionChange = useCallback((event: any) => {
    setSelection(event.nativeEvent.selection);
  }, [setSelection]);

  return {
    handleTagsChange,
    handleAddAttachment,
    handleRemoveAttachment,
    handleSelectionChange
  };
}; 