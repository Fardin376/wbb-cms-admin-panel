import { ref, deleteObject, listAll } from 'firebase/storage';
import { storage } from './firebaseConfig';

export const deleteFirebaseImage = async (url) => {
  try {
    if (!url || typeof url !== 'string') {
      console.warn('Invalid URL provided for deletion');
      return false;
    }

    // Verify this is a Firebase Storage URL
    if (!url.includes('firebasestorage.googleapis.com')) {
      console.warn('Not a Firebase Storage URL');
      return false;
    }

    const decodedUrl = decodeURIComponent(url);
    const startIndex = decodedUrl.indexOf('/o/') + 3;
    const endIndex = decodedUrl.indexOf('?');
    
    if (startIndex <= 2 || endIndex === -1) {
      console.warn('Invalid Firebase URL format');
      return false;
    }

    const fullPath = decodedUrl.substring(startIndex, endIndex);
    if (!fullPath) {
      console.warn('Could not extract file path from URL');
      return false;
    }

    const imageRef = ref(storage, fullPath);
    await deleteObject(imageRef);
    return true;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.warn('File already deleted or does not exist in Firebase');
      return true; // Consider it a success if the file doesn't exist
    }
    console.error('Error deleting image from Firebase:', error);
    return false;
  }
};

export const extractPathFromUrl = (url) => {
  const decodedUrl = decodeURIComponent(url);
  const startIndex = decodedUrl.indexOf('/o/') + 3;
  const endIndex = decodedUrl.indexOf('?');
  return decodedUrl.substring(startIndex, endIndex);
};

export const deletePostFolder = async (postId) => {
  try {
    const folderRef = ref(storage, `posts/${postId}/images`);
    const { items } = await listAll(folderRef);
    await Promise.all(items.map(item => deleteObject(item)));
    return true;
  } catch (error) {
    console.error('Error deleting post folder from Firebase:', error);
    return false;
  }
};
