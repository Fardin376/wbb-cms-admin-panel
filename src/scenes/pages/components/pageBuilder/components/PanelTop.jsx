import React, { useState } from 'react';
import {
  Button,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Save,
  Undo,
  Redo,
  Close,
} from '@mui/icons-material';
import BlockPanel from './BlockPanel';

const PanelTop = ({ onSave, editor, language, setLanguage, onClose }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleSaveAsClick = (lang) => {
    setSelectedLanguage(lang);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedLanguage);
      setOpenDialog(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      mb: 1,
      p: 1,
      borderBottom: 1,
      borderColor: 'divider',
    }}>
      <BlockPanel editor={editor} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
        <Button
          variant="outlined"
          color="success"
          onClick={handleMenuOpen}
          startIcon={<Save />}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save As'}
        </Button>
        
        {/* Rest of the buttons */}
        <IconButton
          color="warning"
          onClick={() => editor && editor.runCommand('core:undo')}
        >
          <Undo />
        </IconButton>
        <IconButton
          color="warning"
          onClick={() => editor && editor.runCommand('core:redo')}
        >
          <Redo />
        </IconButton>
        <IconButton color="error" onClick={onClose}>
          <Close />
        </IconButton>

        {/* Save Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Confirm Save</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to save the template in "
              {selectedLanguage === 'en' ? 'English' : 'Bangla'}"?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setOpenDialog(false)} 
              color="error"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSave}
              color="success"
              variant="contained"
              disabled={isSaving}
              startIcon={isSaving ? <CircularProgress size={20} /> : null}
            >
              {isSaving ? 'Saving...' : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Language Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleSaveAsClick('en')}>
            English Template
          </MenuItem>
          <MenuItem onClick={() => handleSaveAsClick('bn')}>
            Bangla Template
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default PanelTop;
