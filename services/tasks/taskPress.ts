import { useEditStockStore } from '@/store';

export interface ActionHandlers {
  setVaultModalOpen: (open: boolean) => void;
  setHabitModalOpen: (open: boolean) => void;
  setNoteModalOpen: (open: boolean) => void;
  setBillModalOpen: (open: boolean) => void;
  setSelectedDate: (date: Date) => void;
  setEventModalOpen: (open: boolean) => void;
  setSheetOpen: (open: boolean) => void;
  setContactModalOpen: (open: boolean) => void;
  setProjectModalOpen: (open: boolean) => void;
}

export const createActionHandler = (handlers: ActionHandlers) => {
  return (action: string) => {
    switch (action) {
      case 'bt_password':
        handlers.setVaultModalOpen(true);
        break;
      case 'bt_habit':
        handlers.setHabitModalOpen(true);
        break;
      case 'bt_note':
        handlers.setNoteModalOpen(true);
        break;
      case 'bt_bill':
        handlers.setBillModalOpen(true);
        break;
      case 'bt_event':
        handlers.setSelectedDate(new Date());
        handlers.setEventModalOpen(true);
        break;
      case 'bt_todo':
        handlers.setSheetOpen(true);
        break;
      case 'bt_contact':
        handlers.setContactModalOpen(true);
        break;
      case 'bt_stock':
        useEditStockStore.getState().openModal(undefined, true);
        break;
      case 'bt_project':
        handlers.setProjectModalOpen(true);
        break;
    }
  };
};
