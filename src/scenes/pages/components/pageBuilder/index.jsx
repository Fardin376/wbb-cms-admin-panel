import React, { useState } from 'react';
import { Box } from '@mui/material';
import PanelTop from './components/PanelTop';
import Canvas from './components/Canvas';
import axiosInstance from '../../../../utils/axios.config';
import { useSnackbar } from 'notistack';

const PageBuilder = ({ pageId, onClose }) => {
  const [editor, setEditor] = useState(null);
  const [language, setLanguage] = useState('en');
  const { enqueueSnackbar } = useSnackbar();

  const handleError = (error, defaultMessage = 'An error occurred') => {
    console.error(defaultMessage, error);

    if (error.response?.status === 401) {
      enqueueSnackbar('Session expired. Please login again.', {
        variant: 'error',
      });
      window.location.href = '/login';
      return;
    }

    const errorMessage =
      error.response?.data?.message || error.message || defaultMessage;

    enqueueSnackbar(errorMessage, { variant: 'error' });
  };

  const handleSave = async (selectedLanguage) => {
    if (!editor) return;

    try {
      // Get the editor content
      const html = editor.getHtml().trim();
      const css = editor.getCss().trim();
      const js = editor.getJs().trim();

      // Basic validation
      if (!html) {
        throw new Error('Template content cannot be empty');
      }

      // Create chunks if content is large
      const templateData = {
        html,
        css,
        js,
        lastModified: new Date()
      };

      const response = await axiosInstance.put(
        `/pages/update-template/${pageId}`,
        {
          template: templateData,
          language: selectedLanguage
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // Increase timeout to 60 seconds
        }
      );

      if (response.data.success) {
        enqueueSnackbar('Template saved successfully', { variant: 'success' });
        setLanguage(selectedLanguage); // Update the current language
      } else {
        throw new Error(response.data.message || 'Failed to save template');
      }
    } catch (error) {
      handleError(error, 'Failed to save template');
      throw error;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '',
      }}
    >
      <PanelTop
        editor={editor}
        language={language}
        setLanguage={setLanguage}
        onClose={onClose}
        onSave={handleSave}
      />
      <Canvas
        editor={editor}
        setEditor={setEditor}
        pageId={pageId}
        language={language}
      />
    </Box>
  );
};

export default PageBuilder;
