import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  Paper,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Editor from '@monaco-editor/react';
import { Close, Warning } from '@mui/icons-material';
import axiosInstance from '../../../../utils/axios.config';
import { useSnackbar } from 'notistack';
import DOMPurify from 'dompurify';
import { defaultLayouts } from '../../../../utils/defaultLayouts';

const PageLayoutForm = ({ layout, onClose, onSubmitSuccess }) => {
  const [activeEditor, setActiveEditor] = useState('html');
  const [code, setCode] = useState({
    html: ``,
    css: ``,
  });
  const [identifier, setIdentifier] = useState('');
  const [layoutName, setLayoutName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('blogPost');
  const [templateChangeDialog, setTemplateChangeDialog] = useState({
    open: false,
    newTemplate: '',
  });

  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const getCurrentUser = async () => {
    try {
      const response = await axiosInstance.get('/auth/check-auth');
      if (response.data?.success) {
        setUserRole(response.data.user.role);
        setUserId(response.data.user.id);
      }
    } catch (error) {
      enqueueSnackbar('Failed to fetch user information', { variant: 'error' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          getCurrentUser(),
          axiosInstance
            .get('/pages/all-pages')
            .then((response) => setPages(response.data.pages || [])),
        ]);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (layout) {
      setLayoutName(layout.name || '');
      setIdentifier(layout.identifier || '');
      const content = layout?.content;
      let detectedTemplate = 'blogPost';
      if (content?.html?.includes('class="content-wrapper"')) {
        detectedTemplate = 'landing';
      }
      setSelectedTemplate(detectedTemplate);
      setCode({
        html: layout?.content?.html || defaultLayouts[detectedTemplate]?.html,
        css: layout?.content?.css || defaultLayouts[detectedTemplate]?.css,
      });
    }
  }, [layout]);

  const handleTemplateChangeClick = (template) => {
    if (layout) {
      setTemplateChangeDialog({
        open: true,
        newTemplate: template,
      });
    } else {
      applyTemplateChange(template);
    }
  };

  const applyTemplateChange = (template) => {
    setSelectedTemplate(template);
    setCode({
      html: defaultLayouts[template].html,
      css: defaultLayouts[template].css,
    });
    setTemplateChangeDialog({ open: false, newTemplate: '' });
  };

  const validateForm = () => {
    const errors = {};
    if (!layoutName.trim()) errors.name = 'Name is required';
    if (!identifier.trim()) errors.identifier = 'Identifier is required';
    if (!/^[a-z0-9-]+$/.test(identifier)) {
      errors.identifier =
        'Identifier can only contain lowercase letters, numbers, and hyphens';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setError(formErrors);
      setIsLoading(false);
      return;
    }

    try {
      const layoutData = {
        name: layoutName,
        identifier: identifier.toLowerCase(),
        content: JSON.stringify({ html: code.html, css: code.css }),
        createdBy: userId,
      };

      const response = await axiosInstance[layout ? 'put' : 'post'](
        layout ? `/layouts/update/${layout._id}` : '/layouts/create',
        layoutData
      );

      if (response.data.success) {
        enqueueSnackbar(
          layout
            ? 'Layout updated successfully!'
            : 'Layout created successfully!',
          { variant: 'success', autoHideDuration: 3000 }
        );
        onClose();
        onSubmitSuccess?.();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Error saving layout';
      enqueueSnackbar(errorMessage, { variant: 'error' });
      setError({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreviewContent = () => {
    const sanitizedHtml = DOMPurify.sanitize(code.html);
    const sanitizedCss = DOMPurify.sanitize(code.css);

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta http-equiv="Content-Security-Policy" 
                content="default-src 'self';
                         style-src 'self' 'unsafe-inline';
                         img-src * data: https: http:;
                         script-src 'self' 'unsafe-inline';
                         font-src 'self' https: data:;">
          <style>${sanitizedCss}</style>
        </head>
        <body>${sanitizedHtml}</body>
      </html>
    `;
  };

  const renderTemplateChangeDialog = () => (
    <Dialog
      open={templateChangeDialog.open}
      onClose={() => setTemplateChangeDialog({ open: false, newTemplate: '' })}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Confirm Template Change
      </DialogTitle>
      <DialogContent>
        <Typography>
          Changing the template will replace the current HTML and CSS content.
          This action cannot be undone. Are you sure you want to continue?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() =>
            setTemplateChangeDialog({ open: false, newTemplate: '' })
          }
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={() => applyTemplateChange(templateChangeDialog.newTemplate)}
          color="warning"
          variant="contained"
        >
          Change Template
        </Button>
      </DialogActions>
    </Dialog>
  );

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
          {layout ? 'Edit Page Layout' : 'Create Page Layout'}
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
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          justifyContent: 'center',
        }}
      >
        <TextField
          label="Layout Name"
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value)}
          fullWidth
          required
          color="info"
        />

        <TextField
          label="Layout Identifier"
          value={identifier}
          onChange={(e) => {
            const value = e.target.value.toLowerCase();
            if (value === '' || /^[a-z0-9-]*$/.test(value)) {
              setIdentifier(value);
            }
          }}
          helperText="Unique identifier (lowercase letters, numbers, and hyphens only)"
          placeholder="e.g., blog-post-layout"
          fullWidth
          required
          color="info"
        />

        <FormControl fullWidth sx={{ mb: 2 }} color="info">
          <InputLabel id="template-select-label">Layout Template</InputLabel>
          <Select
            labelId="template-select-label"
            value={selectedTemplate}
            onChange={(e) => handleTemplateChangeClick(e.target.value)}
            label="Layout Template"
          >
            <MenuItem value="landing">Landing Page</MenuItem>
            <MenuItem value="blogPost">Blog Post</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="User Role"
          value={userRole.toUpperCase()}
          color="info"
          fullWidth
          variant="outlined"
          InputProps={{ readOnly: true }}
        />

        <ToggleButtonGroup
          value={activeEditor}
          exclusive
          onChange={(_, value) => value && setActiveEditor(value)}
          sx={{ mb: 2 }}
        >
          <ToggleButton value="html">HTML</ToggleButton>
          <ToggleButton value="css">CSS</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ mb: 1 }}>
          <Typography variant="h6">{activeEditor.toUpperCase()}</Typography>
          <Editor
            height="300px"
            defaultLanguage={activeEditor}
            value={code[activeEditor]}
            onChange={(value) =>
              setCode((prev) => ({ ...prev, [activeEditor]: value || '' }))
            }
            theme={theme.palette.mode === 'light' ? 'vs-dark' : 'vs-light'}
          />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Live Preview
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: '500px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <iframe
            title="Live Preview"
            srcDoc={generatePreviewContent()}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#fff',
            }}
          />
        </Box>

        <Button
          variant="contained"
          type="submit"
          color="secondary"
          disabled={isLoading}
          sx={{
            mt: 3,
            width: '20%',
            borderRadius: 100,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {isLoading ? 'Saving...' : layout ? 'Edit Layout' : 'Save Layout'}
          </Typography>
        </Button>
      </form>
      {renderTemplateChangeDialog()}
    </Box>
  );
};

export default PageLayoutForm;
