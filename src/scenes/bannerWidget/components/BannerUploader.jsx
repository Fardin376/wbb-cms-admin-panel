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
  Switch,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../context/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../../../services/firebaseConfig';

const BannerUploader = ({ onUploadSuccess, onClose }) => {
  const theme = useTheme();
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [useFile, setUseFile] = useState(true);
  const [titleEn, setTitleEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionBn, setDescriptionBn] = useState('');
  const [status, setStatus] = useState('UNPUBLISHED');

  const [progress, setProgress] = useState('0');

  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleError = (error, defaultMessage) => {
    console.error(error);
    const errorMessage =
      error.response?.data?.message || error.message || defaultMessage;

    enqueueSnackbar(errorMessage, { variant: 'error' });
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 8 * 1024 * 1024; // 8MB

    if (!validTypes.includes(file.type)) {
      enqueueSnackbar('Accepted formats: JPEG, PNG, WEBP', {
        variant: 'error',
      });
      return false;
    }

    if (file.size > maxSize) {
      enqueueSnackbar('File size should not exceed 8MB', { variant: 'error' });
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setBannerFile(file);
    setBannerUrl('');
    setUseFile(true);
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setBannerUrl(url);
    setBannerFile(null);
    setUseFile(false);
  };

  const validateForm = () => {
    if (!bannerFile && !bannerUrl) {
      enqueueSnackbar('Please upload a file or enter a URL.', {
        variant: 'error',
      });
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!bannerFile && !bannerUrl) {
      enqueueSnackbar('Please upload a file or enter a URL.', {
        variant: 'error',
      });
      return;
    }

    try {
      setUploading(true);
      setProgress(0); // Reset progress

      let firebaseUrl = bannerUrl;

      if (useFile && bannerFile) {
        const storageRef = ref(
          storage,
          `banners/${Date.now()}-${bannerFile.name}`
        );
        console.log('Storage ref created:', storageRef.fullPath);

        const uploadTask = uploadBytesResumable(storageRef, bannerFile);

        // Wrap the upload task in a Promise to wait until it completes
        firebaseUrl = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setProgress(progress); // Update progress state
            },
            (error) => {
              console.error(
                'Error uploading banner:',
                error.code,
                error.message
              );
              enqueueSnackbar('Failed to upload banner', { variant: 'error' });
              reject(error); // Reject if an error occurs
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('Banner URL retrieved:', url);
                resolve(url); // Resolve with the download URL
              } catch (error) {
                console.error('Error retrieving banner URL:', error.message);
                reject(error); // Reject if URL retrieval fails
              }
            }
          );
        });
      }

      // Prepare the upload data
      const uploadData = {
        url: firebaseUrl,
        fileName: bannerFile ? bannerFile.name : 'External URL',
        titleEn,
        titleBn,
        descriptionEn,
        descriptionBn,
        status,
      };

      // Send the data to the backend
      const response = await axiosInstance.post('/banners/upload', uploadData);

      if (response.data.success) {
        enqueueSnackbar('Banner uploaded successfully!', {
          variant: 'success',
        });
        resetForm();
        onUploadSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar('Failed to upload banner', { variant: 'error' });
    } finally {
      setUploading(false);
      setProgress(0); // Reset progress on completion
    }
  };

  const resetForm = () => {
    setBannerFile(null);
    setBannerUrl('');
    setTitleEn('');
    setTitleBn('');
    setDescriptionEn('');
    setDescriptionBn('');
    setUseFile(true);
  };

  return (
    <Box
      component={Paper}
      sx={{
        mt: 2,
        mx: 4,
        mb: 2,
        py: 3,
        px: 4,
        borderRadius: '8px',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Typography variant="h4" sx={{ mb: 3 }}>
        Upload Banner
      </Typography>

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
        <Box>
          <TextField
            type="file"
            onChange={handleFileChange}
            inputProps={{ accept: 'image/jpeg,image/png,image/webp' }}
            helperText="Accepted formats: JPEG, PNG, WEBP. Max size: 8MB."
            disabled={uploading}
          />
          <TextField
            label="Title (English)"
            placeholder="Enter title in English"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={uploading}
          />

          <TextField
            label="Title (Bangla)"
            placeholder="Enter title in Bangla"
            value={titleBn}
            onChange={(e) => setTitleBn(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            disabled={uploading}
          />

          <TextField
            label="Description (English)"
            placeholder="Enter description in English"
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            multiline
            rows={20}
            fullWidth
            sx={{ mb: 2 }}
            disabled={uploading}
          />

          <TextField
            label="Description (Bangla)"
            placeholder="Enter description in Bangla"
            value={descriptionBn}
            onChange={(e) => setDescriptionBn(e.target.value)}
            multiline
            rows={20}
            fullWidth
            sx={{ mb: 2 }}
            disabled={uploading}
          />

          <FormControl fullWidth sx={{ mb: 2 }} color="info">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
              disabled={uploading}
            >
              <MenuItem value="UNPUBLISHED">Unpublished</MenuItem>
              <MenuItem value="PUBLISHED">Published</MenuItem>
            </Select>
          </FormControl>
        </Box>
      ) : (
        <TextField
          label="Banner URL"
          placeholder="https://example.com/banner.jpg"
          value={bannerUrl}
          onChange={handleUrlChange}
          fullWidth
          disabled={uploading}
        />
      )}

      <Typography variant="subtitle1">
        <strong>Uploaded By: </strong> {user.role}
      </Typography>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleUpload}
          disabled={uploading}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          {uploading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="textPrimary">
                {progress}%
              </Typography>
            </Box>
          ) : (
            'Upload'
          )}
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={onClose}
          disabled={uploading}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default BannerUploader;
