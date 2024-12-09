import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  useTheme,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axiosInstance from '../../utils/axios.config';
import { tokens } from '../../theme';
import ImageUploader from './components/ImageUploader';
import { useSnackbar } from 'notistack';

const ViewGallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch images function
  const getImages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/gallery/images');
      if (response.data && response.data.images) {
        setImages(response.data.images);
      } else {
        console.error('No images found in the response.');
      }
    } catch (error) {
      console.error('Error fetching images:', error);
      if (error.response?.status === 401) {
        // Redirect to login if unauthorized
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete image function
  const handleDeleteImage = async (imageId) => {
    try {
      await axiosInstance.delete(`/gallery/image/${imageId}`);
      enqueueSnackbar('Image deleted successfully', { variant: 'success' });
      getImages(); // Refresh image list after delete
    } catch (error) {
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete image',
        { variant: 'error' }
      );
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  // Toggle image uploader visibility
  const handleToggleUploader = () => {
    setShowUploader((prev) => !prev);
  };

  const handleDeleteClick = (image) => {
    setSelectedImage(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await handleDeleteImage(selectedImage._id);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedImage(null);
    }
  };

  useEffect(() => {
    getImages();
  }, []);

  return (
    <Box sx={{ m: 2 }}>
      {/* Button to open image uploader */}
      {!showUploader && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleToggleUploader}
          startIcon={<Add />}
          sx={{ marginBottom: '1rem', backgroundColor: colors.primary }}
        >
          Upload Image
        </Button>
      )}

      {/* Conditionally render ImageUploader if visible */}
      {showUploader && (
        <ImageUploader
          onUploadSuccess={getImages}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Loading state */}
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Post</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Uploaded By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {images &&
                images.map((image) => (
                  <TableRow key={image._id}>
                    <TableCell width="20%">
                      <img
                        src={image.url} // Use the 'url' field to display the image
                        alt={image.fileName} // 'fileName' can be used for alt text
                        width="20%"
                      />
                    </TableCell>
                    <TableCell>
                      {image.usageTypes.isPost
                        ? `${
                            image.usageTypes.postId.title?.en.length > 40
                              ? image.usageTypes.postId.title.en.substring(
                                  0,
                                  40
                                ) + '...'
                              : image.usageTypes.postId.title.en
                          }`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {image.usageTypes.isPost &&
                      image.usageTypes.postId?.category
                        ? image.usageTypes.postId.category.name?.en ||
                          'Untitled Category'
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{image.uploadedBy.username}</TableCell>
                    <TableCell>
                      {image.status === 'inactive' ? (
                        <Typography color="error">Inactive</Typography>
                      ) : (
                        <Typography color="success">Active</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(image)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this image?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewGallery;
