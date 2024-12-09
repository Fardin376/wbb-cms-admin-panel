import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import default styles for the editor

const RichTextEditor = ({ name, value, onChange, error, helperText }) => {
  // Define custom toolbar options
  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }], // Use numeric font sizes
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ align: [] }],
      ['link'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['blockquote', 'code-block'],
      ['clean'], // This adds the "clear formatting" button
    ],
  };

  return (
    <div style={{ width: '900px' }}>
      <ReactQuill
        value={value}
        onChange={(content) => onChange({ target: { name, value: content } })}
        theme="snow"
        modules={modules} // Add custom toolbar
        style={{
          height: 'auto', // Let it grow based on content vertically

          backgroundColor: 'white', // Set editor background to white
          color: 'black', // Text color in the editor
        }}
        placeholder={
          name === 'content.en'
            ? 'write english content here...'
            : 'write bangla content here...'
        }
      />
      {error && <span style={{ color: 'red' }}>{helperText}</span>}
    </div>
  );
};

export default RichTextEditor;
