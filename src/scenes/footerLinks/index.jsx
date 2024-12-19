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
import FooterLinksForm from './components/CreateFooterLinksForm';

const ViewFooterLinks = () => {
  const [footerLinks, setFooterLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchFooterLinks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/links/all-footer-links');
      setFooterLinks(response.data.footers || []);
    } catch (error) {
      setError('Failed to fetch footer links.');
      enqueueSnackbar('Error fetching footer links.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFooterLinks();
  }, []);

  const handleFormClose = async () => {
    setShowForm(false);
    setEditingLink(null);
    await fetchFooterLinks(); // Refresh posts after form closes
  };

  const toggleShowForm = (link = null) => {
    setEditingLink(link);
    setShowForm(!showForm);
  };

  const handleDeleteLink = async (link) => {
    if (
      window.confirm(
        `Are you sure you want to delete the link "${link.label}"?`
      )
    ) {
      setLoading(true);
      try {
        await axiosInstance.delete(`/links/footer-links/${link._id}`);
        enqueueSnackbar('Footer link deleted successfully', {
          variant: 'success',
        });
        fetchFooterLinks(); // Refresh links after deletion
      } catch (error) {
        enqueueSnackbar('Failed to delete footer link', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ m: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Footer Links
      </Typography>
      <Box sx={{ mb: 2 }}>
        {!showForm && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => toggleShowForm()}
            startIcon={<Add />}
            aria-label="Add footer link"
          >
            Add Footer Link
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
                  <TableCell>Position</TableCell>
                  <TableCell>Name (EN)</TableCell>
                  <TableCell>Name (BN)</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {footerLinks.map((link) => (
                  <TableRow key={link._id}>
                    <TableCell>{link?.position}</TableCell>
                    <TableCell>{link?.name?.en}</TableCell>
                    <TableCell>{link?.name?.bn}</TableCell>
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
        <FooterLinksForm footerLink={editingLink} onClose={handleFormClose} />
      )}
    </Box>
  );
};

export default ViewFooterLinks;
