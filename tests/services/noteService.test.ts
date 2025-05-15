import { generateNoteId } from '../../services/notes/noteService';

describe('noteService', () => {
  describe('generateNoteId', () => {
    it('should generate a non-empty string ID', () => {
      const id = generateNoteId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should generate different IDs on subsequent calls', () => {
      const id1 = generateNoteId();
      const id2 = generateNoteId();
      expect(id1).not.toBe(id2);
    });

    // Basic check for alphanumeric characters (common for this type of generator)
    it('should generate an ID containing alphanumeric characters', () => {
      const id = generateNoteId();
      expect(id).toMatch(/^[a-z0-9]+$/);
    });
  });
}); 