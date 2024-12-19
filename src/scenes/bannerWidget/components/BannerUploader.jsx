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
  Switch,
  CircularProgress,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../context/AuthContext';

const BannerUploader = ({ onUploadSuccess, onClose }) => {
  const theme = useTheme();
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerUrl, setBannerUrl] = useState('');
  const [useFile, setUseFile] = useState(true);
  const [title, setTitle] = useState('');
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
    if (!validateForm()) return;

    try {
      setUploading(true);
      let firebaseUrl = bannerUrl;

      if (useFile && bannerFile) {
        const storageRef = ref(
          storage,
          `banners/${Date.now()}-${bannerFile.name}`
        );
        await uploadBytes(storageRef, bannerFile);
        firebaseUrl = await getDownloadURL(storageRef);
      }

      const uploadData = {
        url: firebaseUrl,
        fileName: bannerFile ? bannerFile.name : 'External URL',
        uploadedBy: user._id,
        title,
        status: 'unpublished',
      };

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
      handleError(error, 'Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setBannerFile(null);
    setBannerUrl('');
    setTitle('');
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

      <TextField
        label="Banner Title"
        placeholder="Enter banner title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
        disabled={uploading}
      />

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
          inputProps={{ accept: 'image/jpeg,image/png,image/webp' }}
          helperText="Accepted formats: JPEG, PNG, WEBP. Max size: 8MB."
          disabled={uploading}
        />
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
        >
          {uploading ? <CircularProgress size={24} /> : 'Upload'}
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
