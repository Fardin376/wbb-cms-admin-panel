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
import { Add, Delete, Image as ImageIcon } from '@mui/icons-material';
import axiosInstance from '../../utils/axios.config';
import { tokens } from '../../theme';
import ImageUploader from './components/ImageUploader';
import { useSnackbar } from 'notistack';
import { deleteFirebaseImage } from '../../services/firebase.utils';

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

  useEffect(() => {
    getImages();
  }, []);

  // Delete image function
  const handleDeleteImage = async (image) => {
    try {
      // Only allow deletion if image has no postId
      if (image.postId) {
        enqueueSnackbar('Cannot delete media attached to a post', {
          variant: 'warning',
        });
        return;
      }

      // Delete from Firebase first
      await deleteFirebaseImage(image.url);

      // Then delete from database
      await axiosInstance.delete(`/gallery/image/${image.id}`);

      enqueueSnackbar('Media deleted successfully', { variant: 'success' });
      getImages(); // Refresh list
    } catch (error) {
      console.error('Error deleting media:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete media',
        { variant: 'error' }
      );
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
      await handleDeleteImage(selectedImage);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedImage(null);
    }
  };

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
          Upload Media
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
                <TableCell sx={{ fontWeight: 'bold' }}>Media</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>File Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Uploaded By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {images?.map((image) => (
                <TableRow key={image.id}>
                  <TableCell width="20%">
                    {image.fileType === 'video' ? (
                      <video
                        src={image.url}
                        controls
                        style={{ width: '200px' }}
                      />
                    ) : (
                      <img
                        src={image.url}
                        alt={image.fileName}
                        style={{ width: '200px', height: 'auto' }}
                      />
                    )}
                  </TableCell>
                  <TableCell>{image.fileName}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color:
                          image.fileType === 'video'
                            ? colors.blueAccent[200]
                            : colors.greenAccent[200],
                        textTransform: 'capitalize',
                      }}
                    >
                      {image.fileType || 'image'}
                    </Typography>
                  </TableCell>
                  <TableCell>{image.uploadedBy?.role || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography
                      color={
                        image.status === 'ACTIVE'
                          ? 'success.main'
                          : 'error.main'
                      }
                    >
                      {image.status}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(image)}
                    >
                      <Delete />
                    </IconButton>
                    {image.isPost && image.post && (
                      <IconButton
                        color="secondary"
                        onClick={() =>
                          handleSetAsCover(image.id, image.post.id)
                        }
                        disabled={image.isCover}
                        title={
                          image.isCover
                            ? 'Already cover image'
                            : 'Set as cover image'
                        }
                      >
                        <ImageIcon />
                      </IconButton>
                    )}
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
          Are you sure you want to delete this{' '}
          {selectedImage?.fileType || 'file'}?
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
