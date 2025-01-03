import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../../../utils/axios.config';
import { useSnackbar } from 'notistack';

const FooterLinksForm = ({ footerLink, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const validationSchema = Yup.object({
    position: Yup.string()
      .required('Position is required')
      .oneOf(['LEFT', 'CENTER'], 'Invalid position selected'),

    nameEn: Yup.string().required('Name (English) is required'),
    nameBn: Yup.string().required('Name (Bangla) is required'),

    url: Yup.string().required('URL is required').url('Invalid URL format'),
    serial: Yup.number()
      .required('Serial is required')
      .min(1, 'Serial must be at least 1'),
    status: Yup.string()
      .required('Status is required')
      .oneOf(['PUBLISHED', 'UNPUBLISHED'], 'Invalid status selected'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      const endpoint = footerLink
        ? `/links/footer-links/${footerLink.id}`
        : '/links/create-footer-links';
      const method = footerLink ? 'patch' : 'post';

      const response = await axiosInstance[method](endpoint, values);

      if (response?.data?.success) {
        enqueueSnackbar(response.data.message, { variant: 'success' });
        onClose();
      } else {
        throw new Error(
          response?.data?.message || 'Unexpected response format'
        );
      }
    } catch (error) {
      console.error('Error saving footer link:', error);
      enqueueSnackbar(
        `Failed to ${footerLink ? 'update' : 'create'} footer link: ${
          error.response?.data?.message || error.message
        }`,
        { variant: 'error' }
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      position: footerLink?.position || '',
      nameEn: footerLink?.nameEn || '',
      nameBn: footerLink?.nameBn || '',
      url: footerLink?.url || '',
      serial: footerLink?.serial || '',
      status: footerLink?.status || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  return (
    <Box
      sx={{
        mt: 0,
        mx: 4,
        mb: 2,
        py: 2,
        px: 4,
        color: 'text.primary',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      }}
      component={Paper}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {footerLink ? 'Edit Footer Link' : 'Create Footer Link'}
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          color="error"
          sx={{ borderRadius: 100 }}
          aria-label="Close form"
        >
          <Close />
        </Button>
      </Box>

      <form
        onSubmit={formik.handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <FormControl fullWidth sx={{ mb: 2 }} color="info">
          <InputLabel>Position</InputLabel>
          <Select
            name="position"
            label="Position"
            value={formik.values.position}
            onChange={formik.handleChange}
            error={formik.touched.position && Boolean(formik.errors.position)}
            aria-label="Position"
          >
            <MenuItem value="LEFT">Left</MenuItem>
            <MenuItem value="CENTER">Center</MenuItem>
          </Select>
          {formik.touched.position && formik.errors.position && (
            <FormHelperText error>{formik.errors.position}</FormHelperText>
          )}
        </FormControl>

        <TextField
          label="Name (English)"
          name="nameEn"
          value={formik.values.nameEn}
          onChange={formik.handleChange}
          error={formik.touched.nameEn && Boolean(formik.errors.nameEn)}
          helperText={formik.touched.nameEn && formik.errors.nameEn}
          fullWidth
          aria-label="Name (English)"
          color="info"
        />
        <TextField
          label="Name (Bangla)"
          name="nameBn"
          value={formik.values.nameBn}
          onChange={formik.handleChange}
          error={formik.touched.nameBn && Boolean(formik.errors.nameBn)}
          helperText={formik.touched.nameBn && formik.errors.nameBn}
          fullWidth
          aria-label="Name (Bangla)"
          color="info"
        />

        <TextField
          label="URL"
          name="url"
          value={formik.values.url}
          onChange={formik.handleChange}
          error={formik.touched.url && Boolean(formik.errors.url)}
          helperText={formik.touched.url && formik.errors.url}
          fullWidth
          aria-label="URL"
          color="info"
        />

        <TextField
          label="Serial"
          name="serial"
          type="number"
          value={formik.values.serial}
          onChange={formik.handleChange}
          error={formik.touched.serial && Boolean(formik.errors.serial)}
          helperText={formik.touched.serial && formik.errors.serial}
          fullWidth
          aria-label="Serial"
          color="info"
        />
        <FormControl fullWidth sx={{ mb: 2 }} color="info">
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={formik.values.status}
            onChange={formik.handleChange}
            error={formik.touched.status && Boolean(formik.errors.status)}
            label="Status"
          >
            <MenuItem value="PUBLISHED">Published</MenuItem>
            <MenuItem value="UNPUBLISHED">Unpublished</MenuItem>
          </Select>
          {formik.touched.status && formik.errors.status && (
            <FormHelperText error>{formik.errors.status}</FormHelperText>
          )}
        </FormControl>

        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={loading || formik.isSubmitting}
          sx={{ borderRadius: 100, width: '20%' }}
          aria-label="Submit form"
        >
          {loading || formik.isSubmitting ? 'Saving...' : 'Submit'}
        </Button>
      </form>
    </Box>
  );
};

export default FooterLinksForm;
