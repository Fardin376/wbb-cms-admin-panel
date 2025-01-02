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
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axiosInstance from '../../utils/axios.config';
import { useSnackbar } from 'notistack';
import CreateSocialLinksForm from './components/CreateSocialLinksForm';

const ViewSocialLinks = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchSocialLinks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/socials/all-social-links');
      setSocialLinks(response.data.data || []);
    } catch (error) {
      setError('Failed to fetch social links.');
      enqueueSnackbar('Error fetching social links.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const handleFormClose = async () => {
    setShowForm(false);
    setEditingLink(null);
    await fetchSocialLinks(); // Refresh social links after form closes
  };

  const toggleShowForm = (link) => {
    setEditingLink(link);
    setShowForm(!showForm);
  };

  const handleDeleteLink = async (link) => {
    if (
      window.confirm(
        `Are you sure you want to delete the social link "${link.nameEn}"?`
      )
    ) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/socials/${link.id}`);
        enqueueSnackbar('Social link deleted successfully', {
          variant: 'success',
        });
        fetchSocialLinks(); // Refresh links after deletion
      } catch (error) {
        enqueueSnackbar('Failed to delete social link', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ m: 2 }}>
      <Box sx={{ mb: 2 }}>
        {!showForm && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => toggleShowForm()}
            startIcon={<Add />}
            aria-label="Add social link"
          >
            Add Social Link
          </Button>
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        !showForm && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name (EN)</TableCell>
                  <TableCell>Name (BN)</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {socialLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>{link?.nameEn}</TableCell>
                    <TableCell>{link?.nameBn}</TableCell>
                    <TableCell>{link?.url}</TableCell>
                    <TableCell>{link?.status}</TableCell>
                    <TableCell>
                      <IconButton
                        color="info"
                        onClick={() => toggleShowForm(link)}
                        aria-label="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteLink(link)}
                        aria-label="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {showForm && (
        <CreateSocialLinksForm
          socialLink={editingLink}
          onClose={handleFormClose}
        />
      )}
    </Box>
  );
};

export default ViewSocialLinks;
