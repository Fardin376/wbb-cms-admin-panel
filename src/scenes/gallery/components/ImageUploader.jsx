import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../../context/AuthContext';
import {
  uploadGalleryImage,
  uploadImage,
} from '../../../services/imageService';

const ImageUploader = ({ onUploadSuccess, onClose }) => {
  const theme = useTheme();
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [useFile, setUseFile] = useState(true);
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [fileMetadata, setFileMetadata] = useState({
    size: 0,
    type: '',
    dimensions: { width: 0, height: 0 },
  });
  const [fileType, setFileType] = useState('image'); // new state for file type

  const handleError = (error, defaultMessage = 'An error occurred') => {
    console.error(defaultMessage, error);

    if (error.response?.status === 401) {
      enqueueSnackbar('Session expired. Please login again.', {
        variant: 'error',
      });
      window.location.href = '/login';
      return;
    }

    const errorMessage =
      error.response?.data?.message || error.message || defaultMessage;

    enqueueSnackbar(errorMessage, { variant: 'error' });
  };

  const validateFile = (file) => {
    const validImageTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    const maxSize = fileType === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024; // 5MB for images, 100MB for videos

    if (fileType === 'image' && !validImageTypes.includes(file.type)) {
      enqueueSnackbar(
        'Please upload a valid image file (JPEG, PNG, GIF, WEBP)',
        { variant: 'error' }
      );
      return false;
    }

    if (fileType === 'video' && !validVideoTypes.includes(file.type)) {
      enqueueSnackbar('Please upload a valid video file (MP4, WebM, OGG)', {
        variant: 'error',
      });
      return false;
    }

    if (file.size > maxSize) {
      enqueueSnackbar(
        `File size should be less than ${maxSize / (1024 * 1024)}MB`,
        { variant: 'error' }
      );
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

    if (!validateFile(file)) {
      e.target.value = '';
      return;
    }

    let dimensions = { width: 0, height: 0 };
    if (fileType === 'image') {
      dimensions = await getImageDimensions(file);
    }

    setFileMetadata({
      size: file.size,
      type: file.type,
      dimensions,
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
      enqueueSnackbar(
        'Please enter a valid URL starting with http:// or https://',
        { variant: 'warning' }
      );
    }
    setImageUrl(url);
    setImageFile(null);
    setUseFile(false);
  };

  const validateForm = () => {
    if (!imageFile && !imageUrl) {
      enqueueSnackbar('Please upload a file or provide a URL', {
        variant: 'error',
      });
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

      // Handle file upload if a file is selected
      if (useFile && imageFile) {
        // Uploading the image
        await uploadGalleryImage(imageFile);
      } else {
        // Handling external URL
        const fileName = 'external-media';

        // If fileType is not set, default to 'image'
        const type = fileType || 'image';

        await axiosInstance.post('/gallery/upload', {
          url: imageUrl,
          fileName,
          fileType: type,
        });
      }

      enqueueSnackbar('File uploaded successfully', { variant: 'success' });
      onUploadSuccess(); // Callback for successful upload
      onClose(); // Close the modal or form after success
    } catch (error) {
      handleError(error, 'Failed to upload file');
    } finally {
      setUploading(false); // Set uploading state to false after completion
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
        Upload Media
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>File Type</InputLabel>
          <Select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            label="File Type"
          >
            <MenuItem value="image">Image</MenuItem>
            <MenuItem value="video">Video</MenuItem>
          </Select>
        </FormControl>

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
              accept:
                fileType === 'image'
                  ? 'image/jpeg,image/png,image/gif,image/webp'
                  : 'video/mp4,video/webm,video/ogg',
            }}
            helperText={
              fileType === 'image'
                ? 'Accepted formats: JPEG, PNG, GIF, WEBP. Max size: 5MB'
                : 'Accepted formats: MP4, WebM, OGG. Max size: 100MB'
            }
          />
        ) : (
          <TextField
            label={`${
              fileType.charAt(0).toUpperCase() + fileType.slice(1)
            } URL`}
            placeholder={`https://example.com/${fileType}.${
              fileType === 'image' ? 'jpg' : 'mp4'
            }`}
            value={imageUrl}
            onChange={handleUrlChange}
            disabled={uploading}
            error={imageUrl && !validateUrl(imageUrl)}
            helperText={
              imageUrl && !validateUrl(imageUrl)
                ? 'Please enter a valid URL'
                : ''
            }
            fullWidth
          />
        )}

        <Typography variant="subtitle1">
          <strong>Uploaded By: </strong> {user.role}
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
