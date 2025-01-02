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
  Alert,
} from '@mui/material';
import { TreeView, TreeItem } from '@mui/x-tree-view';
import {
  ExpandMore,
  ChevronRight,
  Add,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack,
} from '@mui/icons-material';
import axiosInstance from '../../../../utils/axios.config';
import MenuForm from '../MenuForm';
import { useAuth } from '../../../../context/AuthContext';

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
  const { user } = useAuth();
  const theme = useTheme();
  const [menus, setMenus] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(true);

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const buildMenuHierarchy = (items) => {
    const itemMap = new Map();
    const roots = [];

    // First pass: Create map of items
    items.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: Build hierarchy
    items.forEach((item) => {
      const mappedItem = itemMap.get(item.id);
      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId);
        parent.children.push(mappedItem);
      } else {
        roots.push(mappedItem);
      }
    });

    return roots;
  };

  const fetchMenus = async () => {
    if (!user) return; // Don't fetch if not authenticated

    try {
      setLoading(true);
      const response = await axiosInstance.get('/menu/get-all-menu-items');
      if (response.data.success) {
        const hierarchicalMenus = buildMenuHierarchy(response.data.data);
        setMenus(hierarchicalMenus);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
      if (error.response?.status === 401) {
        // Handle unauthorized error
        setSnackbar({
          open: true,
          message: 'Please log in again to continue',
          severity: 'error',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMenus();
    }
  }, [user]);

  const handleEdit = (menu) => {
    setEditingMenu(menu);
    setShowForm(true);
  };

  const handleDeleteMenu = async (menu) => {
    try {
      await axiosInstance.delete(`/menu/delete-menu-item/${menu.id}`); // Change _id to id
      fetchMenus();
      setSnackbar({
        open: true,
        message: 'Menu deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete menu',
        severity: 'error',
      });
    }
  };

  const renderTreeItems = (items) => {
    return items.map((item) => (
      <StyledTreeItem
        key={item.id}          // Change _id to id
        nodeId={String(item.id)} // Change _id to id and convert to string
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {item.titleEn || 'Untitled'}
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
        {item.children &&
          item.children.length > 0 &&
          renderTreeItems(item.children)}
      </StyledTreeItem>
    ));
  };

  if (!user) {
    return <div>Please log in to view menus</div>;
  }

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
          <TreeView
            aria-label="menu structure"
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
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
          </TreeView>
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
