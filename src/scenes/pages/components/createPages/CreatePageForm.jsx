import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../utils/axios.config';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { tokens } from '../../../../theme';
import { Close } from '@mui/icons-material';
import slugify from 'slugify';

export default function CreatePageForm({ page, onClose }) {
  if (page && typeof page !== 'object') {
    console.error('Invalid page prop provided to CreatePageForm');
    return null;
  }

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [allMenus, setAllMenus] = useState([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [allLayouts, setAllLayouts] = useState([]);
  const [layout, setLayout] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (page) {
      try {
        setName(page.name || '');
        setSlug(page.slug || '');
        const layoutId = page.layout?._id;
        if (layoutId && typeof layoutId === 'string') {
          setLayout(layoutId);
        }
      } catch (error) {
        console.error('Error setting initial form values:', error);
        setMessage('Error loading page data');
      }
    }
  }, [page]);

  const fetchAllMenus = async () => {
    try {
      const response = await axiosInstance.get(
        '/menu/get-all-active-menu-items',
        {
          params: { isActive: true },
        }
      );
      setAllMenus(response.data.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMessage('Failed to fetch menu items.');
    }
  };

  const fetchAllLayouts = async () => {
    try {
      const response = await axiosInstance.get('/layouts/all-layouts');
      setAllLayouts(response.data?.layouts || []);
    } catch (error) {
      console.error('Error fetching layouts:', error);
      setMessage('Failed to fetch layouts.');
    }
  };

  useEffect(() => {
    fetchAllMenus();
    fetchAllLayouts();
  }, []);

  const handleSlugChange = (e) => {
    const selectedSlug = e.target.value.trim();
    if (!selectedSlug || /^[a-z0-9-/]+$/.test(selectedSlug)) {
      setSlug(selectedSlug);
      setErrors((prev) => ({ ...prev, slug: '' }));
    } else {
      setErrors((prev) => ({ ...prev, slug: 'Invalid slug format' }));
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    
    if (newName.trim()) {
      if (!slug) {
        const generatedSlug = slugify(newName, { 
          lower: true, 
          strict: true,
          remove: /[*+~.()'"!:@]/g
        });
        setSlug(generatedSlug);
      }
      setErrors((prev) => ({ ...prev, name: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!slug.trim()) newErrors.slug = 'Slug is required';
    if (!/^[a-z0-9-/]+$/.test(slug)) newErrors.slug = 'Invalid slug format';
    if (!layout) newErrors.layout = 'Layout is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const pageData = {
        name: name.trim(),
        slug: slug.trim(),
        layout: layout,
      };

      if (!pageData.name || !pageData.slug || !pageData.layout) {
        throw new Error('Missing required fields');
      }

      const response = await axiosInstance({
        method: page ? 'put' : 'post',
        url: page ? `/pages/update/${page._id}` : '/pages/create',
        data: pageData,
        timeout: 5000,
      });

      if (response.data.success) {
        setMessage('Page saved successfully');
        if (onClose && typeof onClose === 'function') {
          setTimeout(onClose, 1500);
        }
      }
    } catch (error) {
      console.error('Error saving page:', error);
      setMessage(
        error.response?.data?.message || 
        error.message || 
        'An error occurred while saving the page'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component={Paper}
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
          {page ? 'Edit Page' : 'Create Page'}
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

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          label="Page Name (English)"
          variant="outlined"
          fullWidth
          value={name}
          onChange={handleNameChange}
          color="info"
          required
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mb: 2 }}
        />

        <FormControl 
          fullWidth 
          color="info" 
          error={!!errors.slug}
          sx={{ mb: 2 }}
        >
          <InputLabel>Menu Slug</InputLabel>
          <Select
            value={slug}
            onChange={handleSlugChange}
            label="Menu Slug"
            required
          >
            <MenuItem value="">Select a menu slug</MenuItem>
            {allMenus.map((menu) => (
              <MenuItem 
                key={menu._id} 
                value={menu.slug}
                disabled={!menu.isActive}
              >
                {menu.slug} ({menu.name})
              </MenuItem>
            ))}
          </Select>
          {errors.slug && (
            <Typography color="error" variant="caption">
              {errors.slug}
            </Typography>
          )}
          <Typography variant="caption" sx={{ mt: 1, color: 'text.secondary' }}>
            Note: Pages must be associated with an existing menu item
          </Typography>
        </FormControl>

        <FormControl fullWidth color="info">
          <InputLabel>Layout</InputLabel>
          <Select
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
            label="Layout"
            required
          >
            <MenuItem value="">None</MenuItem>
            {allLayouts.map((layoutItem) => (
              <MenuItem key={layoutItem._id} value={layoutItem._id}>
                {layoutItem.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          color="secondary"
          disabled={isSubmitting}
          sx={{
            mt: 3,
            width: '20%',
            borderRadius: 100,
          }}
        >
          {isSubmitting ? 'Saving...' : page ? 'Update Page' : 'Create Page'}
        </Button>
        {message && (
          <Typography
            color={message.includes('success') ? 'green' : 'error'}
            sx={{ mt: 2 }}
          >
            {message}
          </Typography>
        )}
      </form>
    </Box>
  );
}
