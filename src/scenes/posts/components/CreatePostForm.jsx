import React, { useState, useEffect, useCallback } from 'react';
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
import {
  migratePostImages,
  cleanupTempImages,
} from '../../../services/postImageService';

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
  content: Yup.object({
    en: Yup.string()
      .required('Content (English) is required')
      .min(50, 'Content must be at least 50 characters'),
    bn: Yup.string()
      .required('Content (Bangla) is required')
      .min(50, 'Content must be at least 50 characters'),
  }),
  pageIds: Yup.array()
    .min(1, 'At least one page is required')
    .required('Pages are required'),
  categoryId: Yup.number()
    .required('Category is required')
    .positive('Invalid category'),
  isFeatured: Yup.boolean(),
  status: Yup.string()
    .oneOf(['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED'])
    .required(),
});

const CreatePostForm = ({ post, onClose, pageId }) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [tempPostId] = useState(`temp-${Date.now()}`);

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

  const formik = useFormik({
    initialValues: {
      title: {
        en: post?.titleEn || '',
        bn: post?.titleBn || '',
      },
      content: {
        en: post?.contentEn || '',
        bn: post?.contentBn || '',
      },
      pageIds: post?.pages?.map((page) => page.id) || (pageId ? [pageId] : []),
      categoryId: post?.categoryId || '',
      isFeatured: Boolean(post?.isFeatured),
      status: post?.status || 'DRAFT',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        console.log('Submitting values:', values); // Add this for debugging

        const formattedValues = {
          titleEn: values.title.en.trim(),
          titleBn: values.title.bn.trim(),
          contentEn: values.content.en,
          contentBn: values.content.bn,
          pageIds: values.pageIds.map((id) => parseInt(id)),
          categoryId: parseInt(values.categoryId),
          isFeatured: values.isFeatured,
          status: values.status || 'DRAFT',
        };

        console.log('Formatted values:', formattedValues); // Add this for debugging

        const endpoint = post ? `/posts/update/${post.id}` : '/posts/create';
        const method = post ? 'put' : 'post';

        const response = await axiosInstance[method](endpoint, formattedValues);

        if (response.data.success) {
          if (!post) {
            try {
              // Migrate images from temp to permanent location
              const newPostId = response.data.post.id;
              const migratedContentEn = await migratePostImages(
                values.content.en,
                'temp',
                newPostId
              );
              const migratedContentBn = await migratePostImages(
                values.content.bn,
                'temp',
                newPostId
              );

              // Update post with migrated content
              await axiosInstance.put(`/posts/update/${newPostId}`, {
                ...formattedValues,
                contentEn: migratedContentEn,
                contentBn: migratedContentBn,
              });

              // Cleanup temp images
              await cleanupTempImages('temp');

              // Update postId immediately after creation or update
              await axiosInstance.patch(`/gallery/update-post/${newPostId}`);
            } catch (error) {
              console.error('Error handling post images:', error);
              enqueueSnackbar(
                'Post created but some images may need attention',
                {
                  variant: 'warning',
                }
              );
            }
          }

          enqueueSnackbar(
            `Post ${post ? 'updated' : 'created'} successfully!`,
            {
              variant: 'success',
            }
          );
          onClose();
        }
      } catch (error) {
        console.error('Error saving post:', error);
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to save post',
          { variant: 'error' }
        );
        // Log more error details
        if (error.response?.data?.details) {
          console.log('Validation error details:', error.response.data.details);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = useCallback(() => {
    if (formik.dirty) {
      if (
        window.confirm('You have unsaved changes. Do you want to discard them?')
      ) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [formik.dirty, onClose]);

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
                onClick={handleClose}
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
              error={formik.touched.pageIds && Boolean(formik.errors.pageIds)}
            >
              <InputLabel id="pages-label" color="info">
                Pages
              </InputLabel>
              <Select
                labelId="pages-label"
                multiple
                name="pageIds"
                value={formik.values.pageIds}
                onChange={(event) => {
                  formik.setFieldValue('pageIds', event.target.value);
                }}
                label="Pages"
                color="info"
              >
                {pages.map((page) => (
                  <MenuItem key={page.id} value={page.id}>
                    {page.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.pageIds && formik.errors.pageIds && (
                <FormHelperText>{formik.errors.pageIds}</FormHelperText>
              )}
            </FormControl>

            <FormControl
              fullWidth
              sx={{ mb: 2 }}
              error={
                formik.touched.categoryId && Boolean(formik.errors.categoryId)
              }
            >
              <InputLabel id="category-label" color="info">
                Category
              </InputLabel>
              <Select
                labelId="category-label"
                name="categoryId"
                value={formik.values.categoryId}
                onChange={formik.handleChange}
                label="Category"
                color="info"
              >
                <MenuItem value="">Select a category</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.nameEn}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.categoryId && formik.errors.categoryId && (
                <FormHelperText>{formik.errors.categoryId}</FormHelperText>
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
                postId={post?.id || tempPostId}
                isNewPost={!post}
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
                postId={post?.id || tempPostId}
                isNewPost={!post}
                error={
                  formik.touched.content?.bn &&
                  Boolean(formik.errors.content?.bn)
                }
                helperText={
                  formik.touched.content?.bn && formik.errors.content?.bn
                }
              />
            </Box>

            <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
              <FormControl fullWidth color="info">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  label="Status"
                >
                  {['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED'].map(
                    (status) => (
                      <MenuItem key={status} value={status}>
                        <Box
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: {
                                DRAFT: '#757575',
                                PUBLISHED: '#4caf50',
                                UNPUBLISHED: '#f44336',
                                ARCHIVED: '#9e9e9e',
                              }[status],
                            }}
                          />
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </Box>
                      </MenuItem>
                    )
                  )}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    name="isFeatured"
                    checked={formik.values.isFeatured}
                    onChange={(e) => {
                      formik.setFieldValue('isFeatured', e.target.checked);
                    }}
                    color="secondary"
                  />
                }
                label={
                  formik.values.isFeatured ? 'Featured Post' : 'Not Featured'
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
