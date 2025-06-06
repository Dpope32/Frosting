import { Note } from '@/types';

// Function to generate a random ID
export const generateId = () => Math.random().toString(36).substring(2, 15);

// Function to generate a random date within the last 30 days
const generateRandomDate = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
  return new Date(randomTime).toISOString();
};

// Function to generate a random tag
const generateRandomTag = (index: number) => {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF3333', '#33FFF3'];
  const tagNames = ['Work', 'Personal', 'Ideas', 'Todo', 'Important', 'Project'];
  
  return {
    id: `tag-${index}`,
    name: tagNames[index % tagNames.length],
    color: colors[index % colors.length]
  };
};

// Function to generate test notes
export const generateTestNotes = (): Note[] => {
  const notes: Note[] = [];
  
  // Note 1: Small text
  notes.push({
    id: generateId(),
    title: 'Small Note',
    content: 'This is a small note with just a few lines of text. Its good for quick reminders or simple thoughts.',
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    attachments: []
  });
  
  // Note 2: Medium text
  notes.push({
    id: generateId(),
    title: 'Medium Note',
    content: `This is a medium-sized note with more content.
    
It has multiple paragraphs and some formatting.

- Bullet point 1
- Bullet point 2
- Bullet point 3

This note demonstrates how a note with moderate content looks in the app.`,
    tags: [generateRandomTag(2)],
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    attachments: []
  });
  
  // Note 2.5: Task List with Checkboxes
  notes.push({
    id: generateId(),
    title: 'Weekend Todo List',
    content: `# Weekend Plans

## Groceries
- [x] Buy milk
- [x] Get bread
- [ ] Pick up vegetables
- [ ] Grab some snacks

## House Tasks
- [x] Do laundry
- [ ] Clean kitchen
- [ ] Vacuum living room
- [ ] Organize closet

## Personal
- [ ] Call mom
- [x] Finish reading book
- [ ] Plan next week
- [ ] Exercise for 30 min

***Note: Check off items as you complete them!***`,
    tags: [generateRandomTag(1), generateRandomTag(4)],
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    attachments: []
  });
  
  // Note 3: Large text
  notes.push({
    id: generateId(),
    title: 'Large Note',
    content: `# Large Note with Markdown

This is a large note that demonstrates various markdown features.

## Headings

### Subheadings

## Lists
1. First item
2. Second item
3. Third item

### Or unordered lists:
- Item one
- Item two
- Item three

### Interactive Checkboxes
- [x] Completed task
- [x] Another finished item
- [ ] Still need to do this
- [ ] And this one too

You can use **bold text** or *italic text* or ***bold and italic***.

## Code
> This is a blockquote.
> It can span multiple lines.

## Links
You can add [links](https://example.com) to your notes.

## Tables
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`,
    tags: [generateRandomTag(3), generateRandomTag(4)],
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    attachments: []
  });
  
  // Note 3.5: Meeting Notes
  notes.push({
    id: generateId(),
    title: 'Project Meeting Notes',
    content: `# Team Sync - March 15th

## Attendees
- Sarah (PM)
- Mike (Dev)
- Lisa (Design)

## Action Items
- [x] Set up dev environment - **Mike**
- [ ] Schedule client call - **Sarah**

## Next Meeting
**Date:** March 22nd  
**Time:** 2:00 PM  
**Location:** Conference Room B

## Notes
The project is progressing well. Need to focus on user experience for the next sprint.`,
    tags: [generateRandomTag(0), generateRandomTag(3)],
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    attachments: []
  });
  
  // Note 4: Note with multiple images
  notes.push({
    id: generateId(),
    title: 'Note with Multiple Images',
    content: `### Multi-Image Example


>This note demonstrates how the app handles multiple image attachments.
>Each image appears in the gallery view while keeping the description
>text contained in this code block.
`,
    tags: [generateRandomTag(5)],
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    attachments: (() => {
      const ids = [generateId(), generateId(), generateId()];
      const names = ['First Image', 'Second Image', 'Third Image'];
      return ids.map((id, idx) => ({
        id,
        name: names[idx],
        type: 'image',
        url: `https://picsum.photos/seed/${id}/400/300`,
      }));
    })()
  });
  
  // Note 5: Note with a single image
  notes.push({
    id: generateId(),
    title: 'Note with a Single Image',
    content: `![Single Image](https://picsum.photos/600/400)`,
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    attachments: (() => {
      const id = generateId();
      return [{
        id,
        name: 'Single Image',
        type: 'image',
        url: `https://picsum.photos/seed/${id}/600/400`,
      }];
    })()
  });
  
  return notes;
};
