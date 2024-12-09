import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Snackbar,
  Alert,
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
import { useAuth } from '../../../context/AuthContext';

const CreateCategoryForm = ({ category, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [existingCategories, setExistingCategories] = useState([]);

  const handleSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosInstance.get('/categories/categories');
      setExistingCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      handleSnackbar('Error fetching categories', 'error');
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const validationSchema = Yup.object({
    name: Yup.object().shape({
      en: Yup.string()
        .required('Category Name (English) is required')
        .min(2, 'Name must be at least 2 characters')
        .matches(
          /^[a-zA-Z0-9\s-_]+$/,
          'Only letters, numbers, spaces, hyphens and underscores allowed'
        ),
      bn: Yup.string()
        .required('Category Name (Bangla) is required')
        .min(2, 'Name must be at least 2 characters'),
    }),
    type: Yup.string()
      .required('Category type is required')
      .oneOf(
        ['research', 'publications', 'news', 'articles', 'other'],
        'Type must be one of: research, publications, news, articles, other'
      ),
    createdBy: Yup.string().required('Creator is required'),
  });

  const getDefaultCategoryName = (type) => {
    const categoryNames = {
      research: { en: 'Research', bn: 'গবেষণা' },
      publications: { en: 'Publications', bn: 'প্রকাশনা' },
      news: { en: 'News', bn: 'সংবাদ' },
      articles: { en: 'Articles', bn: 'প্রবন্ধ' },
    };
    return categoryNames[type] || { en: '', bn: '' };
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        handleSnackbar('You are not authorized to create categories', 'error');
        return;
      }

      if (!values.type) {
        handleSnackbar('Please select a category type', 'error');
        return;
      }

      if (!values.name.en || !values.name.bn) {
        handleSnackbar('Both English and Bangla names are required', 'error');
        return;
      }

      const categoriesArray = Array.isArray(existingCategories) ? existingCategories : [];

      const isCategoryExists = categoriesArray.some(
        (cat) =>
          cat.name.en.toLowerCase() === values.name.en.toLowerCase() ||
          cat.name.bn === values.name.bn
      );

      if (isCategoryExists) {
        handleSnackbar('Category already exists!', 'warning');
        return;
      }

      setLoading(true);
      const endpoint = category
        ? `update/${category._id}`
        : 'create-categories';
      const response = await axiosInstance.post(`/categories/${endpoint}`, {
        ...values,
        createdBy: user?.id,
      });

      if (response.data.success) {
        handleSnackbar(
          category
            ? 'Category updated successfully!'
            : 'Category created successfully!',
          'success'
        );
        onClose();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      handleSnackbar(
        `Failed to ${category ? 'update' : 'create'} category: ${
          error.message
        }`,
        'error'
      );
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: category?.name || { en: '', bn: '' },
      type: category?.type || '',
      createdBy: user?.id,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, actions) => {
      const submissionValues = {
        ...values,
        createdBy: user.id,
      };
      return handleSubmit(submissionValues, actions);
    },
  });

  useEffect(() => {
    if (user?.id) {
      formik.setFieldValue('createdBy', user.id);
    }
  }, [user]);

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    if (selectedType !== 'other') {
      const defaultName = getDefaultCategoryName(selectedType);
      formik.setValues({
        ...formik.values,
        type: selectedType,
        name: defaultName,
      });
    } else {
      formik.setValues({
        ...formik.values,
        type: selectedType,
        name: { en: '', bn: '' },
      });
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

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
          {category ? 'Edit Category' : 'Create Category'}
        </Typography>
        <Button
          variant="contained"
          onClick={onClose}
          color="error"
          sx={{ borderRadius: 100 }}
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
        <FormControl
          fullWidth
          sx={{ mb: 2 }}
          disabled={user?.role !== 'admin' && user?.role !== 'superadmin'}
        >
          <InputLabel>Type</InputLabel>
          <Select
            name="type"
            color="info"
            value={formik.values.type}
            onChange={handleTypeChange}
            error={formik.touched.type && Boolean(formik.errors.type)}
          >
            <MenuItem value="research">Research</MenuItem>
            <MenuItem value="publications">Publications</MenuItem>
            <MenuItem value="news">News</MenuItem>
            <MenuItem value="articles">Articles</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          {formik.touched.type && formik.errors.type && (
            <FormHelperText error>{formik.errors.type}</FormHelperText>
          )}
        </FormControl>
        <TextField
          label="Category Name (English)"
          name="name.en"
          value={formik.values.name.en}
          onChange={formik.handleChange}
          error={formik.touched.name?.en && Boolean(formik.errors.name?.en)}
          helperText={formik.touched.name?.en && formik.errors.name?.en}
          fullWidth
          color="info"
          disabled={formik.values.type !== 'other'}
        />
        <TextField
          label="Category Name (Bangla)"
          name="name.bn"
          value={formik.values.name.bn}
          onChange={formik.handleChange}
          error={formik.touched.name?.bn && Boolean(formik.errors.name?.bn)}
          helperText={formik.touched.name?.bn && formik.errors.name?.bn}
          fullWidth
          color="info"
          disabled={formik.values.type !== 'other'}
        />
        <TextField
          label="Creator"
          value={user?.role || ''}
          InputProps={{
            readOnly: true,
          }}
          fullWidth
          color="info"
          sx={{ mb: 2 }}
        />

        <Box sx={{ mb: 2 }}>
          <Typography color="error">
            {Object.keys(formik.errors).map((key) => (
              <div key={key}>
                {typeof formik.errors[key] === 'object' &&
                formik.errors[key] !== null
                  ? Object.entries(formik.errors[key]).map(
                      ([subKey, error]) => (
                        <div key={`${key}-${subKey}`}>{error}</div>
                      )
                    )
                  : formik.errors[key]}
              </div>
            ))}
          </Typography>
        </Box>

        {user?.role !== 'admin' && user?.role !== 'superadmin' ? (
          <Typography color="error">
            You are not authorized to create categories
          </Typography>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            type="submit"
            disabled={loading || formik.isSubmitting}
            sx={{
              width: '20%',
              borderRadius: 100,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {loading || formik.isSubmitting
                ? 'Saving...'
                : category
                ? 'Update Category'
                : 'Create Category'}
            </Typography>
          </Button>
        )}
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateCategoryForm;
