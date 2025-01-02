import React, { useState, useEffect, useRef, useMemo } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Box, FormHelperText, CircularProgress, Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { uploadImage } from '../../../services/imageService';

const RichTextEditor = ({
  value,
  onChange,
  name,
  error,
  helperText,
  postId,
  isNewPost,
}) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const toolbarOptions = useMemo(
    () => [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ['clean'],
      ['link', 'image'],
    ],
    []
  );

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const imageHandler = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.click();

        input.onchange = async () => {
          const files = input.files;
          if (!files.length) {
            enqueueSnackbar('No files selected.', { variant: 'error' });
            return;
          }

          console.log('Files selected:', files); // Logs files array

          try {
            setUploading(true);

            for (const file of files) {
              console.log('File:', file); // Logs each file object
              if (!file || !file.name) {
                console.error('Invalid file:', file);
                continue; // Skip this file if it's invalid
              }

              const fileName = `${Date.now()}-${file.name}`;
              console.log('Generated file name:', fileName); // Should show the file name

              const url = await uploadImage(file, postId, fileName);

              const range = quillRef.current.getSelection();
              quillRef.current.insertEmbed(range.index, 'image', url);

              enqueueSnackbar(`Image "${file.name}" uploaded successfully!`, {
                variant: 'success',
              });
            }
          } catch (error) {
            enqueueSnackbar('Image upload failed. Please try again.', {
              variant: 'error',
            });
          } finally {
            setUploading(false);
          }
        };
      };

      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: { image: imageHandler },
          },
        },
      });

      quillRef.current.on('text-change', () => {
        onChange({ target: { name, value: quillRef.current.root.innerHTML } });
      });
    }

    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [
    value,
    onChange,
    name,
    toolbarOptions,
    enqueueSnackbar,
    postId,
    isNewPost,
  ]);

  const handleImageDelete = async () => {
    const range = quillRef.current.getSelection();
    if (!range) {
      enqueueSnackbar('Please select an image to delete.', { variant: 'info' });
      return;
    }

    const [blot] = quillRef.current.getLeaf(range.index);
    if (blot && blot.domNode.tagName === 'IMG') {
      const imageUrl = blot.domNode.src;

      try {
        await deleteImage(imageUrl);
        quillRef.current.deleteText(range.index, 1);
        enqueueSnackbar('Image deleted successfully!', { variant: 'success' });
      } catch (error) {
        enqueueSnackbar('Failed to delete image. Please try again.', {
          variant: 'error',
        });
      }
    } else {
      enqueueSnackbar('No image selected for deletion.', { variant: 'info' });
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        ref={editorRef}
        sx={{
          '& .ql-toolbar .ql-snow': {
            backgroundColor: '#fff',
            color: '#000',
          },

          '& .ql-container': {
            minHeight: '200px',
            fontSize: '1rem',
            backgroundColor: '#fff', // Set editor background to white
            color: '#000', // Set text color to black
          },
          '& .ql-editor': {
            minHeight: '300px',
            backgroundColor: '#fff', // Ensure the editor remains white
            color: '#000', // Ensure text remains black
          },
        }}
      />

      {uploading && (
        <CircularProgress
          size={24}
          color="secondary"
          sx={{ margin: '16px auto', display: 'block' }}
        />
      )}

      <Button
        variant="outlined"
        color="error"
        onClick={handleImageDelete}
        sx={{ mt: 2 }}
      >
        Delete Selected Image
      </Button>

      {error && helperText && (
        <FormHelperText error>{helperText}</FormHelperText>
      )}
    </Box>
  );
};

export default RichTextEditor;
