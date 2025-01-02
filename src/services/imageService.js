import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from 'firebase/storage';
import { storage } from './firebaseConfig';
import axiosInstance from '../utils/axios.config';

export const uploadImage = async (file, postId = 'temp', fileName) => {
  try {
    console.log('Starting upload for:', fileName);

    const storageRef = ref(storage, `posts/${postId}/images/${fileName}`);
    console.log('Storage ref created:', storageRef.fullPath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    // Return a promise that resolves with the URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Error uploading image:', error);
          reject(error); // Reject the promise on error
        },
        async () => {
          try {
            const firebaseUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Image URL retrieved:', firebaseUrl);

            // Save the image metadata
            const response = await axiosInstance.post('/gallery/upload', {
              url: firebaseUrl,
              fileName: fileName,
              postId: postId === 'temp' ? null : postId,
              isPost: true,
            });

            if (!response.data.success) {
              throw new Error('Failed to save image metadata');
            }

            console.log('Image metadata saved successfully');
            resolve(firebaseUrl); // Resolve the promise with the URL
          } catch (error) {
            console.error('Error saving image metadata:', error);
            reject(error); // Reject the promise on error
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadGalleryImage = async (file) => {
  try {
    const storageRef = ref(storage, `gallery/${file.name}`);
    console.log('Storage ref created:', storageRef.fullPath);

    const uploadTask = uploadBytesResumable(storageRef, file);

    // Return a promise that resolves with the URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Error uploading image:', error);
          reject(error); // Reject the promise on error
        },
        async () => {
          try {
            const firebaseUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Image URL retrieved:', firebaseUrl);

            const response = await axiosInstance.post('/gallery/upload', {
              url: firebaseUrl,
              fileName: file.name,
              isPost: false,
            });

            if (!response.data.success) {
              throw new Error('Failed to save image metadata');
            }

            console.log('Image metadata saved successfully');
            resolve(firebaseUrl); // Resolve the promise with the URL
          } catch (error) {
            console.error('Error saving image metadata:', error);
            reject(error); // Reject the promise on error
          }
        }
      );
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (url) => {
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
