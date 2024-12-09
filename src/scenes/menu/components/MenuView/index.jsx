import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  useTheme,
  styled,
  Snackbar,
  Alert
} from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import {
  ExpandMore,
  ChevronRight,
  Add,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close,
  ArrowBack
} from '@mui/icons-material';
import axiosInstance from '../../../../utils/axios.config';
import MenuForm from '../MenuForm';

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  '& .MuiTreeItem-content': {
    borderRadius: theme.shape.borderRadius,
    padding: '4px 8px',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  '& .Mui-selected': {
    backgroundColor: `${theme.palette.primary.main}!important`,
    color: theme.palette.primary.contrastText,
  },
}));

const MenuView = () => {
  const theme = useTheme();
  const [menus, setMenus] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const buildMenuHierarchy = (items) => {
    const itemMap = new Map();
    const roots = [];

    // First pass: Create map of items with unique IDs
    items.forEach((item) => {
      if (!itemMap.has(item._id)) {
        itemMap.set(item._id, { ...item, children: [] });
      }
    });

    // Second pass: Build hierarchy
    items.forEach((item) => {
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId);
        // Check if child already exists to prevent duplicates
        if (!parent.children.some(child => child._id === item._id)) {
          parent.children.push(itemMap.get(item._id));
        }
      } else {
        // Only add to roots if not already present
        if (!roots.some(root => root._id === item._id)) {
          roots.push(itemMap.get(item._id));
        }
      }
    });

    return roots;
  };

  const fetchMenus = async () => {
    try {
      const response = await axiosInstance.get('/menu/get-all-menu-items');
      setMenus(buildMenuHierarchy(response.data.data));
    } catch (error) {
      console.error('Error fetching menus:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch menus',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setShowForm(true);
  };

  const handleDeleteMenu = async (menu) => {
    try {
      await axiosInstance.delete(`/menu/delete-menu-item/${menu._id}`);
      fetchMenus();
      setSnackbar({
        open: true,
        message: 'Menu deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete menu',
        severity: 'error'
      });
    }
  };

  const renderTreeItems = (items) => {
    return items.map((item) => {
      // Skip items without _id
      if (!item._id) return null;
      
      return (
        <StyledTreeItem
          key={item._id}
          nodeid={item._id.toString()}
          itemId={item._id.toString()}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {item.title?.en || 'Untitled'}
              </Typography>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(item);
                }}
                size="small"
                color="info"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMenu(item);
                }}
                size="small"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          {Array.isArray(item.children) && item.children.length > 0
            ? renderTreeItems(item.children)
            : null}
        </StyledTreeItem>
      );
    }).filter(Boolean); // Remove null items
  };

  return (
    <Box sx={{ m: 2 }}>
      {!showForm ? (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            setEditingMenu(null);
            setShowForm(true);
          }}
          sx={{ mb: 2 }}
          startIcon={<Add />}
        >
          Add Menu
        </Button>
      ) : (
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            setEditingMenu(null);
            setShowForm(false);
          }}
          startIcon={<ArrowBack />}
        >
          Back to List
        </Button>
      )}

      {showForm ? (
        <MenuForm
          menuItemToEdit={editingMenu}
          onSave={() => {
            setShowForm(false);
            fetchMenus();
          }}
        />
      ) : (
        <Paper sx={{ p: 2 }}>
          <SimpleTreeView
            aria-label="menu structure"
            defaultcollapseicon={<ExpandMore />}
            defaultexpandicon={<ChevronRight />}
            expanded={expanded}
            onNodeToggle={handleToggle}
            sx={{ flexGrow: 1 }}
          >
            {menus.length > 0 ? (
              renderTreeItems(menus)
            ) : (
              <Typography
                variant="body2"
                sx={{ p: 2, color: 'text.secondary' }}
              >
                No menu items found
              </Typography>
            )}
          </SimpleTreeView>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MenuView;
