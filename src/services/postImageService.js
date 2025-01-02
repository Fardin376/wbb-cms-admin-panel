import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from 'firebase/storage';
import { storage } from './firebaseConfig';

/**
 * Upload an image for a post to Firebase Storage
 */
export const uploadToFirebase = async (file) => {
  if (!file) throw new Error('No file provided for upload.');

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Unsupported file type. Please upload a JPEG, PNG, or GIF.'
    );
  }

  const storageRef = ref(storage, `posts/images/${Date.now()}-${file.name}`);
  const uploadedFile = await uploadBytes(storageRef, file);
  return await getDownloadURL(uploadedFile.ref);
};

/**
 * Delete a post image from Firebase Storage
 */
export const deletePostImage = async (url) => {
  try {
    if (!url?.includes('firebasestorage.googleapis.com')) {
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
    const imageRef = ref(storage, fullPath);
    await deleteObject(imageRef);
    return true;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      console.warn('File already deleted or does not exist');
      return true;
    }
    console.error('Error deleting post image:', error);
    throw error;
  }
};

/**
 * Move images from temp to permanent location
 */
export const migratePostImages = async (content, oldPostId, newPostId) => {
  try {
    const urlRegex = /src="([^"]+)"/g;
    let match;
    let newContent = content;

    while ((match = urlRegex.exec(content)) !== null) {
      const oldUrl = match[1];
      if (oldUrl.includes(`posts/${oldPostId}/`)) {
        const newUrl = oldUrl.replace(
          `posts/${oldPostId}/`,
          `posts/${newPostId}/`
        );
        newContent = newContent.replace(oldUrl, newUrl);
      }
    }

    return newContent;
  } catch (error) {
    console.error('Error migrating post images:', error);
    throw error;
  }
};

/**
 * Clean up temporary post images
 */
export const cleanupTempImages = async (postId) => {
  try {
    const tempRef = ref(storage, `posts/images`);
    const items = await listAll(tempRef);
    await Promise.all(items.items.map((item) => deleteObject(item)));
    return true;
  } catch (error) {
    console.error('Error cleaning up temp images:', error);
    return false;
  }
};
