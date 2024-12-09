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
  Box,
  Button,
  Typography,
  useTheme,
  TablePagination,
  Tooltip,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Add,
  Search,
  FilterList,
} from '@mui/icons-material';
import { StatusToggle } from '../../../components';
import { useSnackbar } from 'notistack';
import PageLayoutForm from './components/PageLayoutForm';
import axiosInstance from '../../../utils/axios.config';
import { tokens } from '../../../theme';
import PreviewSection from './components/PreviewSection';

const ViewLayoutsList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [layouts, setLayouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  // New state for enhanced features
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLayouts, setFilteredLayouts] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState(null);

  useEffect(() => {
    fetchLayouts();
  }, []);

  useEffect(() => {
    const filtered = layouts.filter(
      (layout) =>
        layout.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layout.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layout.createdBy?.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
    );
    setFilteredLayouts(filtered);
    setPage(0);
  }, [searchQuery, layouts]);

  const fetchLayouts = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/layouts/all-layouts');
      setLayouts(response.data?.layouts || []);
    } catch (error) {
      console.error('Error fetching layouts:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to fetch layouts',
        {
          variant: 'error',
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (layoutId, currentStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/layouts/toggle-status/${layoutId}`,
        { isActive: !currentStatus }
      );

      if (response.data.success) {
        fetchLayouts();
      }
    } catch (error) {
      enqueueSnackbar('Failed to update status', { variant: 'error' });
    }
  };

  const handleEdit = (layout) => {
    setSelectedLayout(layout);
    setShowForm(true);
  };

  const handleDeleteClick = (layout) => {
    setLayoutToDelete(layout);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axiosInstance.delete(
        `/layouts/delete/${layoutToDelete._id}`
      );

      if (response.data.success) {
        setLayouts((prevLayouts) =>
          prevLayouts.filter((layout) => layout._id !== layoutToDelete._id)
        );
        setFilteredLayouts((prevFiltered) =>
          prevFiltered.filter((layout) => layout._id !== layoutToDelete._id)
        );

        if (selectedLayout?._id === layoutToDelete._id) {
          setSelectedLayout(null);
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error('Error deleting layout:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete layout',
        {
          variant: 'error',
        }
      );
    } finally {
      setDeleteDialogOpen(false);
      setLayoutToDelete(null);
      enqueueSnackbar('Layout deleted successfully', {
        variant: 'success',
        autoHideDuration: 3000,
      });
      fetchLayouts();
    }
  };

  const handleView = (layout) => {
    const { html, css } = JSON.parse(layout.content);
    const combinedContent = `
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
    setPreviewContent(combinedContent);
    setShowPreview(true);
  };

  return (
    <Box m="20px">
      {showPreview ? (
        <PreviewSection
          previewContent={previewContent}
          onClose={() => setShowPreview(false)}
        />
      ) : !showForm ? (
        <Box>
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4" fontWeight="bold" color={colors.gray[100]}>
              Page Layouts
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowForm(true)}
              startIcon={<Add />}
              sx={{
                backgroundColor: colors.primary,
                '&:hover': { backgroundColor: colors.primary },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Create Layout
              </Typography>
            </Button>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search layouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {loading ? (
            <Typography>Loading...</Typography>
          ) : filteredLayouts.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Layout Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Identifier
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      Created By
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLayouts
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((layout) => (
                      <TableRow key={layout._id}>
                        <TableCell>{layout.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={layout.identifier}
                            size="small"
                            sx={{ backgroundColor: colors.gray[700] }}
                          />
                        </TableCell>
                        <TableCell>
                          {layout.createdBy?.username || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <StatusToggle
                            isActive={layout.isActive}
                            itemId={layout._id}
                            endpoint="layouts"
                            onToggle={() =>
                              handleStatusToggle(layout._id, layout.isActive)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Edit Layout">
                              <IconButton
                                color="info"
                                onClick={() => handleEdit(layout)}
                                sx={{
                                  color: colors.primary,
                                  '&:hover': { color: colors.primary },
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Layout">
                              <IconButton
                                color="error"
                                onClick={() => handleDeleteClick(layout)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Preview Layout">
                              <IconButton
                                onClick={() => handleView(layout)}
                                sx={{
                                  color: colors.secondary,
                                  '&:hover': { color: colors.secondary },
                                }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredLayouts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
              />
            </TableContainer>
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              minHeight="200px"
              sx={{
                backgroundColor: colors.gray[800],
                borderRadius: '8px',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" color={colors.gray[100]} mb={2}>
                No layouts found
              </Typography>
              <Typography variant="body1" color={colors.gray[300]}>
                {searchQuery
                  ? 'Try adjusting your search criteria'
                  : 'Create your first layout by clicking the button above'}
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <PageLayoutForm
          layout={selectedLayout}
          onClose={() => {
            setShowForm(false);
            setSelectedLayout(null);
          }}
          onSubmitSuccess={() => {
            fetchLayouts();
            setShowForm(false);
            setSelectedLayout(null);
          }}
        />
      )}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: colors.primary[400],
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.gray[100] }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography color={colors.gray[100]}>
            Are you sure you want to delete the layout "{layoutToDelete?.name}"?
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

export default ViewLayoutsList;
