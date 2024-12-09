import React, { useState, useEffect } from 'react';
import { storage } from '../../../utils/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axiosInstance from '../../../utils/axios.config';
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Snackbar,
  Alert,
  Paper,
  useTheme,
  FormControlLabel,
  Checkbox,
  Switch,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';

const ImageUploader = ({ onUploadSuccess, onClose }) => {
  const theme = useTheme();
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [useFile, setUseFile] = useState(true);
  const [posts, setPosts] = useState([]);
  const [isPost, setIsPost] = useState(false);
  const [postId, setPostId] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [fileMetadata, setFileMetadata] = useState({
    size: 0,
    type: '',
    dimensions: { width: 0, height: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, userRes] = await Promise.all([
          axiosInstance.get('/posts/all-posts'),
          axiosInstance.get('/auth/users')
        ]);

        setPosts(postsRes.data.posts || []);
        
        const users = userRes.data.users;
        if (users?.length > 0) {
          setUserRole(users[0].role || 'Guest');
          setUserId(users[0]._id);
        }
      } catch (error) {
        handleError(error, 'Error fetching initial data');
      }
    };

    fetchData();
  }, []);

  const handleError = (error, defaultMessage = 'An error occurred') => {
    console.error(defaultMessage, error);
    
    if (error.response?.status === 401) {
      enqueueSnackbar('Session expired. Please login again.', { variant: 'error' });
      window.location.href = '/login';
      return;
    }

    const errorMessage = error.response?.data?.message 
      || error.message 
      || defaultMessage;
    
    enqueueSnackbar(errorMessage, { variant: 'error' });
  };

  const validateImageFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      enqueueSnackbar('Please upload a valid image file (JPEG, PNG, GIF, WEBP)', { variant: 'error' });
      return false;
    }

    if (file.size > maxSize) {
      enqueueSnackbar('File size should be less than 5MB', { variant: 'error' });
      return false;
    }

    return true;
  };

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      e.target.value = '';
      return;
    }

    const dimensions = await getImageDimensions(file);
    setFileMetadata({
      size: file.size,
      type: file.type,
      dimensions
    });

    setImageFile(file);
    setImageUrl('');
    setUseFile(true);
  };

  const validateUrl = (url) => {
    const urlPattern = /^https?:\/\/.+/;
    return urlPattern.test(url);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    if (url && !validateUrl(url)) {
      enqueueSnackbar('Please enter a valid URL starting with http:// or https://', { variant: 'warning' });
    }
    setImageUrl(url);
    setImageFile(null);
    setUseFile(false);
  };

  const validateForm = () => {
    if (!imageFile && !imageUrl) {
      enqueueSnackbar('Please upload a file or provide a URL', { variant: 'error' });
      return false;
    }

    if (!postId) {
      enqueueSnackbar('Please select a post for this image', { variant: 'error' });
      return false;
    }

    if (imageUrl && !validateUrl(imageUrl)) {
      enqueueSnackbar('Please enter a valid URL', { variant: 'error' });
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    try {
      setUploading(true);
      let firebaseUrl = imageUrl;

      if (useFile && imageFile) {
        try {
          const storageRef = ref(storage, `gallery/${Date.now()}-${imageFile.name}`);
          await uploadBytes(storageRef, imageFile);
          firebaseUrl = await getDownloadURL(storageRef);
        } catch (error) {
          throw new Error('Failed to upload to Firebase storage');
        }
      }

      const uploadData = {
        url: firebaseUrl,
        fileName: imageFile ? imageFile.name : 'External URL',
        usageTypes: {
          isPost: true,
          postId
        },
        uploadedBy: userId,
        metadata: useFile ? fileMetadata : undefined,
        status: 'active'
      };

      const response = await axiosInstance.post('/gallery/upload', uploadData);

      if (response.data.success) {
        enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
        onUploadSuccess();
        resetForm();
        onClose();
      }
    } catch (error) {
      handleError(error, 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setImageFile(null);
    setImageUrl('');
    setUseFile(true);
    setIsPost(false);
    setPostId('');
  };

  const handleCancel = () => {
    resetForm();
    enqueueSnackbar('Upload canceled', { variant: 'info' });
    onClose();
  };

  return (
    <Box
      component={Paper}
      sx={{
        mt: 2,
        mx: 4,
        mb: 2,
        py: 2,
        px: 4,
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
        Upload Image
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={useFile}
              onChange={() => setUseFile(!useFile)}
              color="secondary"
            />
          }
          label={useFile ? 'Upload File' : 'Enter URL'}
        />

        {useFile ? (
          <TextField
            type="file"
            onChange={handleFileChange}
            fullWidth
            disabled={uploading}
            inputProps={{
              accept: "image/jpeg,image/png,image/gif,image/webp"
            }}
            helperText="Accepted formats: JPEG, PNG, GIF, WEBP. Max size: 5MB"
          />
        ) : (
          <TextField
            label="Image URL"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={handleUrlChange}
            disabled={uploading}
            error={imageUrl && !validateUrl(imageUrl)}
            helperText={imageUrl && !validateUrl(imageUrl) ? "Please enter a valid URL" : ""}
            fullWidth
          />
        )}

        <FormControl fullWidth>
          <InputLabel>Select Post</InputLabel>
          <Select
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            disabled={uploading}
            fullWidth
            color="info"
          >
            <MenuItem value="">Select Post</MenuItem>
            {posts.map((post) => (
              <MenuItem key={post._id} value={post._id}>
                {post.title.en}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="subtitle1">
          <strong>Uploaded By: </strong> {userRole}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, width: '20%' }}>
          <Button
            disabled={uploading}
            variant="contained"
            color="secondary"
            onClick={handleUpload}
            sx={{ flex: 1 }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
          <Button
            disabled={uploading}
            variant="outlined"
            color="error"
            sx={{ flex: 1 }}
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ImageUploader;
