import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../utils/axios.config';
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  FormHelperText,
  Box,
  Typography,
  Snackbar,
  Alert,
  Paper,
  useTheme,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import RichTextEditor from './RichTextEditor';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../../context/AuthContext';

const CreatePostForm = ({ post, onClose, pageId }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState([]);
  const { user } = useAuth();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pagesRes, categoriesRes] = await Promise.all([
        axiosInstance.get('/pages/all-pages'),
        axiosInstance.get('/categories/categories'),
      ]);

      if (!pagesRes.data.success || !categoriesRes.data.success) {
        throw new Error('Failed to fetch required data');
      }

      setPages(pagesRes.data.pages || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        enqueueSnackbar('Failed to load data', { variant: 'error' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const validationSchema = Yup.object({
    title: Yup.object({
      en: Yup.string()
        .required('Title (English) is required')
        .max(500, 'Title must not exceed 500 characters')
        .matches(/^[^<>{}[\]\\]*$/, 'Title contains invalid characters')
        .trim(),
      bn: Yup.string()
        .required('Title (Bangla) is required')
        .max(500, 'Title must not exceed 500 characters')
        .trim(),
    }),
    pages: Yup.array()
      .of(Yup.string().matches(/^[0-9a-fA-F]{24}$/, 'Invalid page ID'))
      .min(1, 'At least one page is required')
      .required('Pages are required'),
    category: Yup.string()
      .matches(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
      .required('Category is required'),
  });

  const formik = useFormik({
    initialValues: {
      title: post?.title || { en: '', bn: '' },
      content: post?.content || { en: '', bn: '' },
      pages: post?.pages?.map((page) => page._id) || (pageId ? [pageId] : []),
      category: post?.category?._id || '',

      isFeatured: Boolean(post?.isFeatured),
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formattedValues = {
          ...values,
          pages: values.pages.map((page) => page.toString()),
          isFeatured: Boolean(values.isFeatured),
        };

        const endpoint = post ? `/posts/update/${post._id}` : '/posts/create';
        const method = post ? 'put' : 'post';

        const response = await axiosInstance[method](endpoint, formattedValues);

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to save post');
        }

        enqueueSnackbar(`Post ${post ? 'updated' : 'created'} successfully!`, {
          variant: 'success',
        });

        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } catch (error) {
        console.error('Error saving post:', error);
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to save post',
          { variant: 'error' }
        );
      } finally {
        setSubmitting(false);
      }
    },
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
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              mb: 4,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {post ? 'Edit Post' : 'Create Post'}
            </Typography>
            {onClose && (
              <Button
                variant="contained"
                onClick={onClose}
                color="error"
                sx={{ borderRadius: 100 }}
              >
                <Close />
              </Button>
            )}
          </Box>

          <form onSubmit={formik.handleSubmit}>
            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              error={formik.touched.pages && Boolean(formik.errors.pages)}
            >
              <InputLabel id="pages-label" color="info">
                Pages
              </InputLabel>
              <Select
                labelId="pages-label"
                multiple
                name="pages"
                value={formik.values.pages}
                onChange={(event) => {
                  const selectedPages = event.target.value.map((page) =>
                    page.toString()
                  );
                  formik.setFieldValue('pages', selectedPages);
                }}
                label="Pages"
                color="info"
              >
                {pages.map((page) => (
                  <MenuItem key={page._id} value={page._id.toString()}>
                    {page.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.pages && formik.errors.pages && (
                <FormHelperText>{formik.errors.pages}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              error={formik.touched.category && Boolean(formik.errors.category)}
            >
              <InputLabel id="category-label" color="info">
                Category
              </InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                label="Category"
                color="info"
              >
                <MenuItem value="">Select a category</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name.en || category.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.category && formik.errors.category && (
                <FormHelperText>{formik.errors.category}</FormHelperText>
              )}
            </FormControl>

            {/* Rest of the form fields with consistent spacing */}
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Title (English)"
                name="title.en"
                value={formik.values.title.en}
                onChange={formik.handleChange}
                error={
                  formik.touched.title?.en && Boolean(formik.errors.title?.en)
                }
                helperText={formik.touched.title?.en && formik.errors.title?.en}
                fullWidth
                color="info"
                sx={{ mb: 2 }}
              />

              <TextField
                label="Title (Bangla)"
                name="title.bn"
                value={formik.values.title.bn}
                onChange={formik.handleChange}
                error={
                  formik.touched.title?.bn && Boolean(formik.errors.title?.bn)
                }
                helperText={formik.touched.title?.bn && formik.errors.title?.bn}
                fullWidth
                color="info"
                sx={{ mb: 2 }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                English Content
              </Typography>
              <RichTextEditor
                name="content.en"
                value={formik.values.content.en}
                onChange={formik.handleChange}
                error={
                  formik.touched.content?.en &&
                  Boolean(formik.errors.content?.en)
                }
                helperText={
                  formik.touched.content?.en && formik.errors.content?.en
                }
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Bangla Content
              </Typography>
              <RichTextEditor
                name="content.bn"
                value={formik.values.content.bn}
                onChange={formik.handleChange}
                error={
                  formik.touched.content?.bn &&
                  Boolean(formik.errors.content?.bn)
                }
                helperText={
                  formik.touched.content?.bn && formik.errors.content?.bn
                }
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(formik.values.isFeatured)}
                    onChange={(e) => {
                      formik.setFieldValue('isFeatured', e.target.checked);
                    }}
                    color="secondary"
                  />
                }
                label={
                  <Typography>
                    {formik.values.isFeatured
                      ? 'Featured Post'
                      : 'Not Featured'}
                  </Typography>
                }
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={formik.isSubmitting}
              sx={{ width: '20%', borderRadius: 100 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {formik.isSubmitting
                  ? 'Saving...'
                  : post
                  ? 'Update Post'
                  : 'Create Post'}
              </Typography>
            </Button>
          </form>
        </>
      )}
    </Box>
  );
};

export default CreatePostForm;
