import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import CreatePageForm from './components/createPages/CreatePageForm';
import PageBuilder from './components/pageBuilder';
import { tokens } from '../../theme';
import axiosInstance from '../../utils/axios.config';
import { useSnackbar } from 'notistack';

const ViewPages = () => {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [editingPage, setEditingPage] = useState(null);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { enqueueSnackbar } = useSnackbar();

  // Function to fetch pages
  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pages/all-pages');

      if (response.data.success) {
        setPages(response.data.pages);
      } else {
        enqueueSnackbar('Failed to fetch pages', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to fetch pages',
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const openPageBuilder = (page) => {
    setSelectedPage(page);
  };

  const closePageBuilder = () => {
    setSelectedPage(null);
    fetchPages(); // Refresh the list after closing PageBuilder
  };

  const handleStatusChange = async (pageId, newStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/pages/update-status/${pageId}`,
        { status: newStatus.toUpperCase() }
      );

      if (response.data.success) {
        setPages((prevPages) =>
          prevPages.map((page) =>
            page.id === pageId
              ? { ...page, status: newStatus.toUpperCase() }
              : page
          )
        );
        enqueueSnackbar('Status updated successfully', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update status',
        { variant: 'error' }
      );
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPage(null);
    fetchPages();
  };

  const handleDeleteClick = (page) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axiosInstance.delete(
        `/pages/delete/${pageToDelete._id}`
      );

      if (response.data.success) {
        setPages((prevPages) =>
          prevPages.filter((page) => page.id !== pageToDelete.id)
        );
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete page',
        {
          variant: 'error',
        }
      );
    } finally {
      setDeleteDialogOpen(false);
      setPageToDelete(null);
      enqueueSnackbar('Page deleted successfully', {
        variant: 'success',
        autoHideDuration: 3000,
      });
      fetchPages();
    }
  };

  return (
    <Box sx={{ m: 2 }}>
      {!showForm && !selectedPage && (
        <>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowForm(true)}
            >
              <Add sx={{ fontSize: 28 }} />
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : pages.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Page Name</TableCell>
                    <TableCell>Slug</TableCell>
                    <TableCell>Layout</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                    <TableCell>PageBuilder</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell>{page.name}</TableCell>
                      <TableCell>{page.slug}</TableCell>
                      <TableCell>{page.layout?.name || 'No Layout'}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={page.status || 'DRAFT'}
                              onChange={(e) =>
                                handleStatusChange(page.id, e.target.value)
                              }
                            >
                              <MenuItem value="DRAFT">Draft</MenuItem>
                              <MenuItem value="PUBLISHED">Published</MenuItem>
                              <MenuItem value="ARCHIVED">Archived</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit Page">
                          <IconButton
                            color="info"
                            onClick={() => handleEdit(page)}
                            sx={{
                              color: colors.primary,
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Page">
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(page)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => openPageBuilder(page.id)}
                        >
                          Open PageBuilder
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No pages found.</Typography>
          )}
        </>
      )}

      {showForm && (
        <Box>
          <CreatePageForm page={editingPage} onClose={handleFormClose} />
        </Box>
      )}

      {selectedPage && (
        <Box>
          <PageBuilder pageId={selectedPage} onClose={closePageBuilder} />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: colors.primary[500],
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.gray[100] }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography color={colors.gray[100]}>
            Are you sure you want to delete the page "{pageToDelete?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            color="info"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            startIcon={<Delete />}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewPages;
