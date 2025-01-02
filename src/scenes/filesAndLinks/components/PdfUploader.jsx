import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axios.config';
import { useAuth } from '../../../context/AuthContext';
import {
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Paper,
  useTheme,
  CircularProgress,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  Clear,
  PictureAsPdf,
  Error,
  CheckCircle,
  Science,
  MenuBook,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';

const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: theme.palette.background.default,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.dark,
  },
  '&.dragover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.success.main,
  },
}));

const PdfUploader = ({ onUploadSuccess }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [file, setFile] = useState(null);
  const [postId, setPostId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);

  const getPosts = async () => {
    const response = await axiosInstance.get('/posts/all-posts');
    setPosts(response.data.posts);
  };

  const getCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories/categories');
      setCategories(response.data.categories);
    } catch (error) {
      enqueueSnackbar('Failed to fetch categories', { variant: 'error' });
    }
  };

  useEffect(() => {
    getPosts();
    getCategories();

    return () => {
      setUploadProgress(0);
      setLoading(false);
    };
  }, []);

  const validateFile = async (file) => {
    const errors = {};

    if (!file) {
      errors.file = 'Please select a PDF file';
      return errors;
    }

    // Check file type
    if (file.type !== 'application/pdf') {
      errors.file = 'Only PDF files are allowed';
      return errors;
    }

    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      errors.file = 'File size must be less than 10MB';
      return errors;
    }

    // Verify PDF header
    try {
      const firstBytes = await readFileHeader(file, 5);
      const header = new Uint8Array(firstBytes);
      if (
        header[0] !== 0x25 ||
        header[1] !== 0x50 ||
        header[2] !== 0x44 ||
        header[3] !== 0x46
      ) {
        errors.file = 'Invalid PDF file format';
      }
    } catch (error) {
      errors.file = 'Could not validate PDF file';
    }

    return errors;
  };

  const readFileHeader = (file, bytes) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file.slice(0, bytes));
    });
  };

  const validateForm = () => {
    const errors = {};

    if (!postId) errors.post = 'Please select a post';
    if (!categoryId) errors.category = 'Please select a category';
    if (!file) errors.file = 'Please select a PDF file';

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelection(droppedFile);
  };

  const handleFileSelection = (selectedFile) => {
    const fileErrors = validateFile(selectedFile);

    if (Object.keys(fileErrors).length > 0) {
      setErrors(fileErrors);
      enqueueSnackbar(fileErrors.file, { variant: 'error' });
      return;
    }

    setFile(selectedFile);
    setErrors({});
    enqueueSnackbar('File selected successfully', { variant: 'success' });
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileSelection(selectedFile);
  };

  const handleUpload = async (postId, categoryId) => {
    if (!validateForm()) return; // Stop if validation fails
    console.log('Post ID:', postId); // Debugging
    console.log('Category ID:', categoryId); // Debugging
    try {
      setLoading(true);

      // Ensure required fields are populated
      const metadata = {
        postId: postId || null, // Send null if not selected
        categoryId: categoryId || null, // Send null if not selected
        isPublication: false, // Default value
        isResearch: false, // Default value
        fileName: file.name.split('.pdf')[0], // Default to file name without extension
      };

      const formData = new FormData();
      formData.append('pdfFile', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await axiosInstance.post('/pdfs/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onUploadSuccess(response.data.pdf);
        enqueueSnackbar('PDF uploaded successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      enqueueSnackbar('Upload failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPostId('');
    setCategoryId('');
    setErrors({});
  };

  return (
    <Fade in>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Upload PDF Document
        </Typography>

        <UploadBox
          className={isDragOver ? 'dragover' : ''}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('pdf-upload').click()}
          sx={{ mb: 3 }}
          role="button"
          aria-label="Upload PDF"
          tabIndex={0}
        >
          <input
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {file ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <PictureAsPdf color="primary" />
              <Box sx={{ flexGrow: 1, maxWidth: '60%' }}>
                <Typography noWrap>{file.name}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </Typography>
              </Box>
              <Tooltip title="Remove file">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                >
                  <Clear />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box>
              <CloudUpload
                sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}
              />
              <Typography>
                Drag and drop your PDF here or click to browse
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Maximum file size: 10MB
              </Typography>
            </Box>
          )}
        </UploadBox>

        {loading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" align="center" display="block">
              Uploading: {uploadProgress}%
            </Typography>
          </Box>
        )}

        <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.post}>
          <InputLabel labelId="post-label" color="info">
            Posts
          </InputLabel>
          <Select
            value={postId}
            labelId="post-label"
            name="posts"
            label="Posts"
            color="info"
            onChange={(e) => setPostId(e.target.value)}
            disabled={loading}
          >
            {posts.map((post) => (
              <MenuItem key={post.id} value={post.id}>
                {post.titleEn}
              </MenuItem>
            ))}
          </Select>
          {errors.post && (
            <Typography variant="caption" color="error">
              {errors.post}
            </Typography>
          )}
        </FormControl>

        <FormControl fullWidth sx={{ mb: 3 }} error={!!errors.category}>
          <InputLabel labelId="category-label" color="info">
            Category
          </InputLabel>
          <Select
            value={categoryId}
            labelId="category-label"
            name="category"
            label="Category"
            color="info"
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loading}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                <Chip
                  label={category.nameEn}
                  size="small"
                  icon={
                    category.nameEn.toLowerCase() === 'research' ? (
                      <Science />
                    ) : (
                      <MenuBook />
                    )
                  }
                  variant="outlined"
                />
              </MenuItem>
            ))}
          </Select>
          {errors.category && (
            <Typography variant="caption" color="error">
              {errors.category}
            </Typography>
          )}
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleUpload(postId, categoryId)}
            disabled={loading || !file || !postId || !categoryId}
            startIcon={
              loading ? <CircularProgress size={20} /> : <CloudUpload />
            }
          >
            {loading ? `Uploading... ${uploadProgress}%` : 'Upload PDF'}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={resetForm}
            disabled={loading}
          >
            Reset
          </Button>
        </Box>
      </Paper>
    </Fade>
  );
};

PdfUploader.propTypes = {
  onUploadSuccess: PropTypes.func,
};

export default PdfUploader;
