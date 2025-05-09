import { Note } from '@/types/notes';

// Function to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 15);

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
    tags: [generateRandomTag(0), generateRandomTag(1)],
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

Or unordered lists:
- Item one
- Item two
- Item three

You can use **bold text** or *italic text* or ***bold and italic***.

## Code
> This is a codequote.
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
    attachments: [
      {
        id: generateId(),
        name: 'First Image',
        url: 'https://picsum.photos/400/300',
        type: 'image'
      },
      {
        id: generateId(),
        name: 'Second Image',
        url: 'https://picsum.photos/400/300',
        type: 'image'
      },
      {
        id: generateId(),
        name: 'Third Image',
        url: 'https://picsum.photos/400/300',
        type: 'image'
      }
    ]
  });
  
  // Note 5: Note with a single image
  notes.push({
    id: generateId(),
    title: 'Note with a Single Image',
    content: `This note contains a single image.

![Single Image](https://picsum.photos/600/400)

This demonstrates how the app handles a note with just one image attachment.`,
    tags: [generateRandomTag(0), generateRandomTag(2)],
    createdAt: generateRandomDate(),
    updatedAt: generateRandomDate(),
    attachments: [
      {
        id: generateId(),
        name: 'Single Image',
        url: 'https://picsum.photos/600/400',
        type: 'image'
      }
    ]
  });
  
  return notes;
};
