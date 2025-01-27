import { Alert } from 'react-native';

interface S3Object {
  key: string;
  uri: string;
  lastModified?: Date;
}

const S3_BUCKET_URL = process.env.EXPO_PUBLIC_S3_BUCKET_URL;
if (!S3_BUCKET_URL) {
  throw new Error('EXPO_PUBLIC_S3_BUCKET_URL environment variable is not set');
}

export const initUserStorage = async (username: string): Promise<boolean> => {
  const folders = ['profile', 'photos', 'family', 'vacation'];
  let success = true;
  
  for (const folder of folders) {
    const path = `users/${username}/${folder}/`;
    try {
      // Create the folder in S3
      const response = await fetch(`${S3_BUCKET_URL}/${path}`, {
        method: 'PUT',
        headers: { 
          'x-amz-acl': 'private',
          // Add content-length 0 to properly create directory marker
          'Content-Length': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      console.error(`Failed to create folder: ${path}`, err);
      success = false;
      Alert.alert('Storage Setup Error', 'Failed to initialize storage. Please try again.');
    }
  }
  
  return success;
};

export const uploadProfilePicture = async (username: string, imageUri: string): Promise<string | null> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    const uploadPath = `users/${username}/profile/avatar.jpg`;
    const uploadUrl = `${S3_BUCKET_URL}/${uploadPath}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'image/jpeg',
        'x-amz-acl': 'private'
      }
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`HTTP error! status: ${uploadResponse.status}`);
    }
    
    return uploadUrl;
  } catch (err) {
    console.error('Failed to upload profile picture:', err);
    Alert.alert('Upload Error', 'Failed to upload profile picture. Please try again.');
    return null;
  }
};

export const listUserPhotos = async (username: string, folder?: string): Promise<S3Object[]> => {
  try {
    const prefix = folder ? `users/${username}/${folder}/` : `users/${username}/photos/`;
    const response = await fetch(`${S3_BUCKET_URL}?list-type=2&prefix=${prefix}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    const contents = xmlDoc.getElementsByTagName('Contents');
    const objects: S3Object[] = [];

    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      const key = content.getElementsByTagName('Key')[0]?.textContent;
      const lastModified = content.getElementsByTagName('LastModified')[0]?.textContent;

      if (key && !key.endsWith('/')) { // Skip folder markers
        objects.push({
          key,
          uri: `${S3_BUCKET_URL}/${key}`,
          lastModified: lastModified ? new Date(lastModified) : undefined
        });
      }
    }

    return objects;
  } catch (err) {
    console.error('Failed to list photos:', err);
    Alert.alert('Error', 'Failed to load photos. Please try again.');
    return [];
  }
};

export const listUserFolders = async (username: string): Promise<string[]> => {
  try {
    const prefix = `users/${username}/`;
    const response = await fetch(`${S3_BUCKET_URL}?list-type=2&prefix=${prefix}&delimiter=/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    const prefixes = xmlDoc.getElementsByTagName('CommonPrefixes');
    const folders: string[] = [];

    for (let i = 0; i < prefixes.length; i++) {
      const prefix = prefixes[i].getElementsByTagName('Prefix')[0]?.textContent;
      if (prefix) {
        // Extract folder name from prefix (e.g., "users/username/photos/" -> "photos")
        const folderName = prefix.split('/').slice(-2)[0];
        if (folderName) {
          folders.push(folderName);
        }
      }
    }

    return folders;
  } catch (err) {
    console.error('Failed to list folders:', err);
    Alert.alert('Error', 'Failed to load folders. Please try again.');
    return [];
  }
};
