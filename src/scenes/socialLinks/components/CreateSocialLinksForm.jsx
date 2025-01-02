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

const CreateSocialLinksForm = ({ socialLink, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const validationSchema = Yup.object({
    nameEn: Yup.string().required('Name is required'),
    nameBn: Yup.string().required('Name is required'),
    url: Yup.string().required('url is required'),
    status: Yup.string()
      .required('Status is required')
      .oneOf(['PUBLISHED', 'UNPUBLISHED'], 'Invalid status selected'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      const endpoint = socialLink
        ? `/socials/${socialLink.id}`
        : '/socials/create-social-links';
      const method = socialLink ? 'patch' : 'post';

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
      console.error('Error saving route:', error);
      enqueueSnackbar(
        `Failed to ${socialLink ? 'update' : 'create'} route: ${
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
      nameEn: socialLink?.nameEn || '',
      nameBn: socialLink?.nameBn || '',
      url: socialLink?.url || '',
      status: socialLink?.status || '',
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
          {socialLink ? 'Edit Link' : 'Create Link'}
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
          label="Url"
          name="url"
          value={formik.values.url}
          onChange={formik.handleChange}
          error={formik.touched.url && Boolean(formik.errors.url)}
          helperText={formik.touched.url && formik.errors.url}
          fullWidth
          aria-label="Url"
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

export default CreateSocialLinksForm;
