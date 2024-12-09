import React, { useRef, useEffect, useState } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import '../../../styles/editor.css';
import blocksBasic from 'grapesjs-blocks-basic';
import axiosInstance from '../../../../../utils/axios.config';

// Add this function before the Canvas component
const setupImageHandling = (editor, saveTemplate) => {
  // Handle image upload
  editor.on('asset:upload:start', () => console.log('Upload started'));
  editor.on('asset:upload:end', () => console.log('Upload completed'));
  editor.on('asset:upload:error', (err) => console.error('Upload error:', err));

  // Handle image addition
  editor.on('asset:add', (asset) => {
    const selectedComponent = editor.getSelected();
    const src = asset.get('src');
    console.log('Asset added:', src);

    if (selectedComponent && selectedComponent.get('type') === 'image') {
      // Update existing image
      selectedComponent.set({
        attributes: {
          src: src,
          alt: asset.get('name')
        },
        src: src
      });
      console.log('Updated existing image');
    } else {
      // Find featured image or create new one
      const featuredImage = editor.DomComponents.getWrapper().find('.featured-image')[0];
      
      if (featuredImage) {
        featuredImage.set({
          attributes: {
            src: src,
            alt: asset.get('name')
          },
          src: src
        });
        editor.select(featuredImage);
        console.log('Updated featured image');
      } else {
        // Create new image component
        const imageComponent = {
          type: 'image',
          attributes: {
            src: src,
            alt: asset.get('name'),
            'data-gjs-type': 'image',
            class: 'content-image'
          },
          src: src,
          style: {
            'max-width': '100%',
            'width': '300px',
            'height': 'auto',
            'display': 'block',
            'margin': '10px auto'
          }
        };

        const addedComponent = editor.addComponents(imageComponent)[0];
        editor.select(addedComponent);
        console.log('Added new image component');
      }
    }

    // Save after image update
    setTimeout(() => saveTemplate(editor), 500);
  });

  // Handle double-click on image to open Asset Manager
  editor.on('component:dblclick', (component) => {
    if (component.get('type') === 'image') {
      editor.AssetManager.open();
    }
  });

  // Configure image components when selected
  editor.on('component:selected', (component) => {
    if (component.get('type') === 'image') {
      component.set({
        resizable: {
          tl: true, tr: true, bl: true, br: true,
          tc: true, bc: true, cl: true, cr: true
        },
        toolbar: [
          { command: 'tlb-move' },
          { command: 'tlb-clone' },
          { command: 'tlb-delete' },
          {
            command: {
              run: function(editor) {
                editor.AssetManager.open();
              }
            },
            attributes: { class: 'fa fa-upload' },
            label: 'Change Image'
          }
        ]
      });
    }
  });

  // Handle image drop
  editor.on('block:drag:stop', (component) => {
    if (component.get('type') === 'image') {
      component.set({
        resizable: true,
        style: {
          'max-width': '100%',
          'width': '300px',
          'height': 'auto',
          'display': 'block',
          'margin': '10px auto'
        }
      });
    }
  });
};

const Canvas = ({ editor, setEditor, pageId }) => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Separate layout fetching logic
  const fetchLayoutContent = async () => {
    try {
      const response = await axiosInstance.get(`/pages/${pageId}`);
      if (response.data.success) {
        const { layout } = response.data.page;
        const { html, css } = typeof layout.content === 'string'
          ? JSON.parse(layout.content)
          : layout.content;
        return { html, css };
      }
      throw new Error(response.data.message || 'Failed to fetch page layout');
    } catch (error) {
      console.error('Error fetching page layout:', error);
      throw error;
    }
  };

  const saveTemplate = async (editorInstance) => {
    try {
      const html = editorInstance.getHtml();
      const css = editorInstance.getCss();
      const js = editorInstance.getJs();

      // Get all image components
      const imageComponents = editorInstance.DomComponents.getWrapper().find('img');
      const assets = [];
      let processedHtml = html;

      // Process each image component
      imageComponents.forEach(comp => {
        const src = comp.get('src');
        if (src && !src.includes('placeholder.com')) {
          const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
          
          // Extract the path part after the base URL
          const pathMatch = src.match(new RegExp(`${baseUrl}(.+)$`));
          const relativeSrc = pathMatch ? pathMatch[1] : src;

          assets.push({
            src: relativeSrc,
            type: 'image',
            name: comp.get('attributes').alt || relativeSrc.split('/').pop()
          });

          // Update HTML to use relative paths
          processedHtml = processedHtml.replace(
            new RegExp(src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
            relativeSrc
          );
        }
      });

      const template = {
        html: processedHtml.trim(),
        css: css.trim(),
        js: js.trim(),
        assets: assets
      };

      const response = await axiosInstance.put(`/pages/update-template/${pageId}`, {
        template,
        language: 'en'
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeEditor = async () => {
      try {
        // Don't set loading if editor already exists
        if (!editor) {
          setIsLoading(true);
        }

        // Wait for the ref to be available
        if (!canvasRef.current) {
          console.log('Waiting for container...');
          return;
        }

        // Cleanup existing editor
        if (editor) {
          editor.destroy();
          setEditor(null);
        }

        console.log('Initializing editor...');

        // Initialize editor with default configuration
        const editorConfig = {
          container: canvasRef.current,
          fromElement: false,
          height: '100vh',
          width: 'auto',
          storageManager: false,
          plugins: [blocksBasic],
          pluginsOpts: {
            [blocksBasic]: {
              blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image'],
              flexGrid: true,
            },
          },
          canvas: {
            styles: [
              'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
            ],
          },
          // Update asset manager configuration
          assetManager: {
            upload: true,
            dropzone: true,
            embedAsBase64: false,
            autoAdd: false,
            dropzoneContent: 'Drop files here or click to upload',
            uploadFile: async function(e) {
              try {
                const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
                const formData = new FormData();
                
                for (const file of files) {
                  formData.append('files', file);
                }

                const response = await axiosInstance.post('/pages/upload-asset', formData, {
                  headers: { 'Content-Type': 'multipart/form-data' },
                });

                if (response.data.success) {
                  const assets = response.data.urls.map(url => {
                    // Ensure we're using just the path without any base URL
                    const imagePath = url.url.startsWith('/') ? url.url : `/${url.url}`;
                    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
                    
                    return {
                      src: `${baseUrl}${imagePath}`,
                      name: url.name,
                      type: 'image'
                    };
                  });

                  // Add assets to Asset Manager
                  const editor = this.em.get('Editor');
                  if (editor && editor.AssetManager) {
                    assets.forEach(asset => editor.AssetManager.add(asset));
                  }

                  return assets;
                }
                throw new Error('Upload failed');
              } catch (error) {
                console.error('Error uploading files:', error);
                throw error;
              }
            }
          },
          // Simplified component defaults
          components: {
            defaults: {
              image: {
                model: {
                  defaults: {
                    tagName: 'img',
                    draggable: true,
                    resizable: true,
                    style: {
                      'max-width': '100%',
                      'width': '300px'
                    }
                  }
                }
              }
            }
          }
        };

        const editorInstance = grapesjs.init(editorConfig);
        
        // Add this to ensure AssetManager is properly initialized
        editorInstance.on('load', () => {
          console.log('Editor loaded, initializing asset manager...');
          const am = editorInstance.AssetManager;
          if (am) {
            am.render();
          }
        });

        // Pass saveTemplate to setupImageHandling
        setupImageHandling(editorInstance, saveTemplate);

        // Add autosave functionality
        editorInstance.on('storage:store', async () => {
          if (mounted) {
            try {
              await saveTemplate(editorInstance);
            } catch (error) {
              console.error('Autosave failed:', error);
            }
          }
        });

        // Add a new event handler for component changes
        editorInstance.on('component:update', (component) => {
          if (component.get('type') === 'image') {
            console.log('Image component updated:', component.attributes);
            setTimeout(() => saveTemplate(editorInstance), 500);
          }
        });

        // Add a handler for when images are dropped into the editor
        editorInstance.on('block:drag:stop', (component) => {
          if (component.get('type') === 'image') {
            const src = component.get('src');
            console.log('Image dropped:', src);
            
            // Ensure the image is properly configured
            component.set({
              selectable: true,
              hoverable: true,
              draggable: true,
              resizable: true,
              editable: true
            });
          }
        });

        // Add these event handlers after initializing the editor
        editorInstance.on('component:selected', component => {
          if (component.get('type') === 'image') {
            // Ensure image component is properly configured when selected
            component.set({
              resizable: true,
              style: { ...component.get('style'), 'max-width': '100%' }
            });
          }
        });

        // Add this event handler for when an image component is selected
        editorInstance.on('component:selected', (component) => {
          if (component.get('type') === 'image') {
            // Make sure the image is properly configured
            component.set({
              resizable: {
                tl: true, tr: true, bl: true, br: true,
                tc: true, bc: true, cl: true, cr: true
              },
              style: { 
                ...component.get('style'),
                'max-width': '100%',
                height: 'auto'
              },
              toolbar: [
                { command: 'tlb-move', attributes: { class: 'fa fa-arrows' } },
                { command: 'tlb-clone', attributes: { class: 'fa fa-clone' } },
                { command: 'tlb-delete', attributes: { class: 'fa fa-trash-o' } },
                {
                  command: 'custom-image-properties',
                  attributes: {
                    class: 'fa fa-cog',
                    title: 'Settings'
                  }
                }
              ]
            });
          }
        });

        // Add a custom command for image properties
        editorInstance.Commands.add('custom-image-properties', {
          run(editor, sender, options) {
            const component = editor.getSelected();
            if (component && component.get('type') === 'image') {
              editor.StyleManager.select(component);
            }
          }
        });

        // Add this to handle image drops
        editorInstance.on('block:drag:stop', (component) => {
          if (component.get('type') === 'image') {
            component.set({
              style: { 
                width: '300px',
                height: 'auto',
                'max-width': '100%',
                display: 'block',
                margin: '10px auto'
              },
              resizable: true,
              draggable: true,
              hoverable: true,
              selectable: true
            });
          }
        });

        try {
          console.log('Fetching layout content...');
          const layoutContent = await fetchLayoutContent();
          
          if (layoutContent && mounted) {
            console.log('Setting components and styles...');
            editorInstance.setComponents(layoutContent.html || '');
            
            const cssContent = `
              ${layoutContent.css || ''}
              
              /* Default styles */
              body {
                margin: 0;
                font-family: 'Roboto', sans-serif;
              }
              
              header {
                text-align: center;
                padding: 20px;
                background-color: #f4f4f4;
              }
              
              main {
                padding: 20px;
              }
            `;
            editorInstance.setStyle(cssContent);

            // Configure component settings
            editorInstance.on('component:selected', (component) => {
              component.set('resizable', true);
            });

            if (mounted) {
              setEditor(editorInstance);
              setIsLoading(false);
              console.log('Editor initialized successfully');
            }
          }
        } catch (loadError) {
          if (mounted) {
            editorInstance.setComponents('<p>Failed to load layout. Please try again.</p>');
            throw loadError;
          }
        }
      } catch (error) {
        if (mounted) {
          setError(error);
          setIsLoading(false);
          console.error('Editor initialization failed:', error);
        }
      }
    };

    // Initial initialization
    initializeEditor();

    // Cleanup function
    return () => {
      mounted = false;
      if (editor) {
        editor.destroy();
        setEditor(null);
      }
    };
  }, [pageId]); // Remove containerReady dependency

  if (error) {
    return (
      <div className="editor-error">
        <h3>Error loading editor</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="editor-loading">
          <p>Loading editor...</p>
        </div>
      )}
      <div
        ref={canvasRef}
        className="editor-canvas"
        style={{
          flex: 1,
          height: '100%',
          position: 'relative',
          overflow: 'auto',
          display: isLoading ? 'none' : 'block',
        }}
      />
    </>
  );
};

export default Canvas;
