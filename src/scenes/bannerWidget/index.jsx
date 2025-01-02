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
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axiosInstance from '../../utils/axios.config';
import { tokens } from '../../theme';
import BannerUploader from './components/BannerUploader';
import { useSnackbar } from 'notistack';
import { deleteImage } from '../../services/imageService';

const ViewBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { enqueueSnackbar } = useSnackbar();

  // Fetch banners function
  const getBanners = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/banners/all-banners');
      if (response.data && response.data.banners) {
        setBanners(response.data.banners);
      } else {
        console.error('No banners found in the response.');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete banner function
  const handleDeleteBanner = async (bannerId, bannerUrl) => {
    try {
      // Attempt to delete the image from Firebase Storage
      const imageDeleted = await deleteImage(bannerUrl);

      if (!imageDeleted) {
        enqueueSnackbar('Failed to delete the image from Firebase Storage.', {
          variant: 'warning',
        });
      }

      // Delete the banner metadata from the database
      await axiosInstance.delete(`/banners/${bannerId}`);
      enqueueSnackbar('Banner deleted successfully', { variant: 'success' });

      // Refresh banners list
      getBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete banner',
        { variant: 'error' }
      );

      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  // Toggle uploader visibility
  const handleToggleUploader = () => {
    setShowUploader((prev) => !prev);
  };

  const handleDeleteClick = (banner) => {
    setSelectedBanner(banner);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await handleDeleteBanner(selectedBanner.id, selectedBanner.url);
    } finally {
      setDeleteDialogOpen(false);
      setSelectedBanner(null);
    }
  };

  const handleStatusChange = async (bannerId, currentStatus) => {
    try {
      const newStatus =
        currentStatus === 'PUBLISHED' ? 'UNPUBLISHED' : 'PUBLISHED';
      const response = await axiosInstance.patch(
        `/banners/toggle-status/${bannerId}`,
        {
          status: newStatus,
        }
      );

      if (response.data.success) {
        setBanners((prevBanners) =>
          prevBanners.map((banner) =>
            banner.id === bannerId ? { ...banner, status: newStatus } : banner
          )
        );

        enqueueSnackbar('Banner status updated successfully', {
          variant: 'success',
          autoHideDuration: 3000,
        });
      }
    } catch (error) {
      console.error('Error updating banner status:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update banner status',
        { variant: 'error' }
      );
    }
  };

  useEffect(() => {
    getBanners();
  }, []);

  return (
    <Box sx={{ m: 2 }}>
      {/* Button to open banner uploader */}
      {!showUploader && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleToggleUploader}
          startIcon={<Add />}
          sx={{ marginBottom: '1rem', backgroundColor: colors.primary }}
        >
          Upload Banner
        </Button>
      )}

      {/* Conditionally render BannerUploader if visible */}
      {showUploader && (
        <BannerUploader
          onUploadSuccess={getBanners}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Loading state */}
      {loading ? (
        <CircularProgress size={24} color='secondary'/>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Banner</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Uploaded By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners &&
                banners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell width="20%">
                      <img
                        src={banner.url}
                        alt={banner.title || 'Banner Image'}
                        width="100%"
                      />
                    </TableCell>
                    <TableCell>{banner.titleEn || 'Untitled'}</TableCell>
                    <TableCell>{banner.uploadedBy.username}</TableCell>
                    <TableCell>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={banner.status === 'PUBLISHED'}
                            onChange={() =>
                              handleStatusChange(banner.id, banner.status)
                            }
                            color="secondary"
                          />
                        }
                        label={
                          banner.status === 'PUBLISHED'
                            ? 'PUBLISHED'
                            : 'UNPUBLISHED'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(banner)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this banner?
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

export default ViewBanner;
