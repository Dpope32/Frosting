import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { usePeopleStore } from "@/store";
import type { Tag } from '@/types';
import { generateId } from '@/constants';

const getRandomProfilePicture = () => {
  const gender = Math.random() > 0.5 ? "men" : "women";
  const number = Math.floor(Math.random() * 100);
  return `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
};

// Flag to prevent multiple simultaneous calls
let isGeneratingContacts = false;

export const generateTestContacts = () => {
  // Prevent multiple calls while contacts are being generated
  if (isGeneratingContacts) return;
  
  isGeneratingContacts = true;
  
  // Create a standard Tag object for test contacts
  const testTag: Tag = {
    id: generateId(),
    name: 'Test Contact',
    color: '#888888'
  };

  const testContacts = [
    {
      name: "John Smith",
      email: "john.smith@email.com",
      phoneNumber: "(555) 123-4567",
      birthday: "1985-03-15",
      occupation: "Software Engineer",
      relationship: "Friend",
      address: { street: "123 Main St", city: "Austin", state: "TX", zipCode: "78701", country: "USA" }
    },
    {
      name: "Emma Johnson",
      email: "emma.j@email.com",
      phoneNumber: "(555) 234-5678",
      birthday: "1990-07-22",
      occupation: "Marketing Manager",
      relationship: "Colleague",
      address: { street: "456 Oak Ave", city: "Austin", state: "TX", zipCode: "78702", country: "USA" }
    },
    {
      name: "Michael Chen",
      email: "m.chen@email.com",
      phoneNumber: "(555) 345-6789",
      birthday: "1988-11-30",
      occupation: "Data Scientist",
      relationship: "Professional",
      address: { street: "789 Pine Rd", city: "Austin", state: "TX", zipCode: "78703", country: "USA" }
    },
    {
      name: "Sarah Davis",
      email: "sarah.d@email.com",
      phoneNumber: "(555) 456-7890",
      birthday: "1992-05-18",
      occupation: "UX Designer",
      relationship: "Friend",
      address: { street: "321 Elm St", city: "Austin", state: "TX", zipCode: "78704", country: "USA" }
    },
    {
      name: "David Wilson",
      email: "d.wilson@email.com",
      phoneNumber: "(555) 567-8901",
      birthday: "1983-09-25",
      occupation: "Product Manager",
      relationship: "Business",
      address: { street: "654 Maple Dr", city: "Austin", state: "TX", zipCode: "78705", country: "USA" }
    },
    {
      name: "Lisa Anderson",
      email: "lisa.a@email.com",
      phoneNumber: "(555) 678-9012",
      birthday: "1987-12-10",
      occupation: "Graphic Designer",
      relationship: "Colleague",
      address: { street: "987 Cedar Ln", city: "Austin", state: "TX", zipCode: "78706", country: "USA" }
    },
    {
      name: "James Taylor",
      email: "j.taylor@email.com",
      phoneNumber: "(555) 789-0123",
      birthday: "1991-04-05",
      occupation: "Sales Manager",
      relationship: "Professional",
      address: { street: "147 Birch Rd", city: "Austin", state: "TX", zipCode: "78707", country: "USA" }
    },
    {
      name: "Maria Garcia",
      email: "m.garcia@email.com",
      phoneNumber: "(555) 890-1234",
      birthday: "1989-08-20",
      occupation: "HR Specialist",
      relationship: "Friend",
      address: { street: "258 Walnut Ave", city: "Austin", state: "TX", zipCode: "78708", country: "USA" }
    },
    {
      name: "Robert Brown",
      email: "r.brown@email.com",
      phoneNumber: "(555) 901-2345",
      birthday: "1986-02-15",
      occupation: "Financial Analyst",
      relationship: "Business",
      address: { street: "369 Spruce St", city: "Austin", state: "TX", zipCode: "78709", country: "USA" }
    },
    {
      name: "Jennifer Lee",
      email: "j.lee@email.com",
      phoneNumber: "(555) 012-3456",
      birthday: "1993-06-28",
      occupation: "Content Writer",
      relationship: "Colleague",
      address: { street: "741 Ash Dr", city: "Austin", state: "TX", zipCode: "78710", country: "USA" }
    }
  ];

  // Add only one contact on mobile to prevent UI issues
  if (Platform.OS !== "web") {
    // Pick a random contact from the list
    const randomIndex = Math.floor(Math.random() * testContacts.length);
    const randomContact = testContacts[randomIndex];
    
    usePeopleStore.getState().addPerson({
      ...randomContact,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [testTag],
      priority: Math.random() > 0.5,
      profilePicture: getRandomProfilePicture()
    });
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    isGeneratingContacts = false;
  } else {
    // On web, we can add all contacts with a small delay between each
    let index = 0;
    
    const addNextContact = () => {
      if (index < testContacts.length) {
        const contact = testContacts[index];
        
        usePeopleStore.getState().addPerson({
          ...contact,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [testTag],
          priority: Math.random() > 0.5,
          profilePicture: getRandomProfilePicture()
        });
        
        index++;
        setTimeout(addNextContact, 100); // Add next contact after 100ms
      } else {
        isGeneratingContacts = false;
      }
    };
    
    addNextContact();
  }
};
