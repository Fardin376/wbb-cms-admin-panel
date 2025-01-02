import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
  InputLabel,
  CircularProgress,
  Alert,
  Box,
  FormControl,
  styled,
  Select,
  selectClasses,
  Typography,
  Paper,
  Snackbar,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import slugify from 'slugify';
import axiosInstance from '../../../../utils/axios.config';

const MenuForm = ({ onSave, menuItemToEdit }) => {
  const [allMenus, setAllMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [previewSlug, setPreviewSlug] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const slug = slugify(values.title.en, { lower: true });
      
      const menuData = {
        titleEn: values.title.en.trim(),
        titleBn: values.title.bn.trim(),
        slug,
        parentId: values.parentId ? Number(values.parentId) : null, // Ensure parentId is number
        isExternalLink: Boolean(values.isExternalLink),
        url: values.isExternalLink ? values.url : null,
        isActive: Boolean(values.isActive),
        order: Number(values.order) || 0
      };

      const endpoint = menuItemToEdit?.id  // Change _id to id
        ? `/menu/update-menu/${menuItemToEdit.id}`
        : '/menu/create-menu';
      
      const response = await axiosInstance[menuItemToEdit?.id ? 'patch' : 'post'](
        endpoint,
        menuData
      );

      setSnackbar({
        open: true,
        message: `Menu item ${menuItemToEdit?.id ? 'updated' : 'created'} successfully!`,
        severity: 'success'
      });
      onSave(response.data);
    } catch (err) {
      console.error('Error details:', err.response?.data);
      const errorMessage = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Error saving menu item';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const validationSchema = Yup.object({
    title: Yup.object({
      en: Yup.string()
        .required('English title is required')
        .min(1, 'Title must not be empty')
        .max(200, 'Title must be at most 200 characters'),
      bn: Yup.string()
        .required('Bengali title is required')
        .min(1, 'Title must not be empty')
        .max(200, 'Title must be at most 200 characters')
    }),
    url: Yup.string().when('isExternalLink', {
      is: true,
      then: () => Yup.string()
        .url('Must be a valid URL')
        .required('URL is required for external links')
        .matches(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 'Invalid URL format'),
      otherwise: () => Yup.mixed().nullable()
    }),
    parentId: Yup.number()  // Change to number
      .nullable()
      .test('no-self-parent', 'A menu item cannot be its own parent or child', 
        function(value) {
          if (!value || !menuItemToEdit) return true;
          return value !== menuItemToEdit.id;  // Change _id to id
      }),
    isExternalLink: Yup.boolean(),
    isActive: Yup.boolean(),
    order: Yup.number().min(0)
  });

  const formik = useFormik({
    initialValues: {
      title: { 
        en: menuItemToEdit?.titleEn || '', 
        bn: menuItemToEdit?.titleBn || '' 
      },
      parentId: menuItemToEdit?.parentId || '',
      isExternalLink: menuItemToEdit?.isExternalLink || false,
      url: menuItemToEdit?.url || '',
      isActive: menuItemToEdit?.isActive ?? true,
      order: menuItemToEdit?.order || 0
    },
    validationSchema,
    onSubmit: handleSubmit,
    enableReinitialize: true
  });

  const buildMenuHierarchy = (items, parentId = null) => {
    return items
      .filter((item) => item.parentId === parentId)
      .map((item) => ({
        ...item,
        children: buildMenuHierarchy(items, item.id), // Change _id to id
      }));
  };

  const fetchAllMenus = async () => {
    try {
      const response = await axiosInstance.get('/menu/get-all-menu-items');
      setAllMenus(buildMenuHierarchy(response.data.data));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch menu items.',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchAllMenus();
  }, []);

  useEffect(() => {
    const generatePreviewSlug = async () => {
      let slug = slugify(formik.values.title.en, { lower: true, strict: true });
      
      if (formik.values.parentId) {
        try {
          const response = await axiosInstance.get(`/menu/get-menu/${formik.values.parentId}`);
          if (response.data.success) {
            const parentSlug = response.data.data.slug;
            slug = `${parentSlug}/${slug}`;
          }
        } catch (error) {
          console.error('Error fetching parent menu:', error);
          setSnackbar({
            open: true,
            message: 'Error fetching parent menu',
            severity: 'error'
          });
        }
      }

      slug = slug.startsWith('/') ? slug : `/${slug}`;
      setPreviewSlug(slug);
    };

    if (formik.values.title.en) {
      generatePreviewSlug();
    }
  }, [formik.values.title.en, formik.values.parentId]);

  const filterValidParentOptions = (items, currentMenuId) => {
    const isInvalidParent = (item) => {
      if (!item) return false;
      if (item.id === currentMenuId) return true; // Change _id to id
      if (item.parentId === currentMenuId) return true;
      return item.children?.some(child => isInvalidParent(child));
    };

    return items.filter(item => !isInvalidParent(item));
  };

  const renderMenuOptions = (items = [], depth = 0) => {
    const validItems = menuItemToEdit 
      ? filterValidParentOptions(items, menuItemToEdit.id) // Change _id to id
      : items;

    return validItems.reduce((acc, item) => {
      acc.push(
        <MenuItem
          key={item.id} // Change _id to id
          value={item.id} // Change _id to id
          style={{
            paddingLeft: depth * 20,
          }}
        >
          {item.titleEn} {/* Change title.en to titleEn */}
        </MenuItem>
      );
      if (item.children?.length > 0) {
        acc = acc.concat(renderMenuOptions(item.children, depth + 1));
      }
      return acc;
    }, []);
  };

  const validateForm = () => {
    const errors = {};
    if (!formik.values.title.en) errors.titleEn = 'English title is required';
    if (!formik.values.title.bn) errors.titleBn = 'Bengali title is required';
    if (formik.values.isExternalLink && !formik.values.url) {
      errors.url = 'URL is required for external links';
    }
    if (formik.values.url && !formik.values.isExternalLink) {
      errors.url = 'Please check "Is External Link" for URLs';
    }
    return errors;
  };

  return (
    <Box
      component={Paper}
      sx={{
        p: 4,
        width: '100%',
        maxWidth: '800px',
        mx: 'auto',
        mt: 1,
        borderRadius: 2,
      }}
    >
      <form onSubmit={formik.handleSubmit}>
        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            fullWidth
            name="title.en"
            label="English Title"
            value={formik.values.title.en}
            onChange={formik.handleChange}
            error={formik.touched.title?.en && Boolean(formik.errors.title?.en)}
            helperText={formik.touched.title?.en && formik.errors.title?.en}
            color="info"
          />

          <TextField
            fullWidth
            name="title.bn"
            label="Bengali Title"
            value={formik.values.title.bn}
            onChange={formik.handleChange}
            error={formik.touched.title?.bn && Boolean(formik.errors.title?.bn)}
            helperText={formik.touched.title?.bn && formik.errors.title?.bn}
            color="info"
          />

          <FormControl fullWidth color="info">
            <InputLabel>Parent Menu</InputLabel>
            <Select
              name="parentId"
              value={
                formik.values.parentId === null ? '' : formik.values.parentId
              }
              onChange={formik.handleChange}
              error={formik.touched.parentId && Boolean(formik.errors.parentId)}
            >
              <MenuItem value="" style={{ fontStyle: 'italic' }}>
                None
              </MenuItem>
              {renderMenuOptions(allMenus)}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            name="url"
            label="URL"
            value={formik.values.url}
            onChange={formik.handleChange}
            error={formik.touched.url && Boolean(formik.errors.url)}
            helperText={formik.touched.url && formik.errors.url}
            color="info"
            disabled={!formik.values.isExternalLink}
          />

          <Box display="flex" gap={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.isExternalLink}
                  onChange={formik.handleChange}
                  name="isExternalLink"
                  color="info"
                />
              }
              label="Is External Link"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formik.values.isActive}
                  onChange={formik.handleChange}
                  name="isActive"
                  color="info"
                />
              }
              label="Active"
            />
          </Box>

          <TextField
            fullWidth
            name="order"
            label="Order"
            type="number"
            value={formik.values.order}
            onChange={formik.handleChange}
            error={formik.touched.order && Boolean(formik.errors.order)}
            helperText={formik.touched.order && formik.errors.order}
            color="info"
          />

          <TextField
            label="Generated Slug"
            value={previewSlug}
            InputProps={{ readOnly: true }}
            helperText="This slug will be automatically generated"
            fullWidth
            sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}
            color="info"
          />

          <Box display="flex" justifyContent="flex-start" mt={2}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              disabled={loading}
              sx={{ width: '20%', borderRadius: 100 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {loading ? (
                  <CircularProgress size={24} />
                ) : menuItemToEdit ? (
                  'Update Menu'
                ) : (
                  'Create Menu'
                )}
              </Typography>
            </Button>
          </Box>

          {snackbar.open && (
            <Snackbar
              open={snackbar.open}
              autoHideDuration={6000}
              onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
              <Alert
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                severity={snackbar.severity}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          )}
        </Box>
      </form>
    </Box>
  );
};

MenuForm.propTypes = {
  onSave: PropTypes.func,
  menuItemToEdit: PropTypes.shape({
    id: PropTypes.number, // Change _id to id and type to number
    titleEn: PropTypes.string, // Change nested title object to separate fields
    titleBn: PropTypes.string,
    slug: PropTypes.string,
    url: PropTypes.string,
    isExternalLink: PropTypes.bool,
    isActive: PropTypes.bool,
    parentId: PropTypes.number, // Change type to number
    order: PropTypes.number
  }),
};

export default MenuForm;
