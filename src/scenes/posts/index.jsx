import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  useTheme,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, Add, Star, StarBorder } from '@mui/icons-material';
import axiosInstance from '../../utils/axios.config';
import { tokens } from '../../theme';
import CreatePostForm from './components/CreatePostForm';
import CreateCategoryForm from './components/CreateCategoryForm';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useSnackbar } from 'notistack';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedPage, setSelectedPage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pages, setPages] = useState([]);
  const [categories, setCategories] = useState([]);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // Add category fetching
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/categories/categories');
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (error.response?.status === 401) {
          window.location.href = '/login';
        }
      }
    };
    fetchCategories();
  }, []);

  // Update the category filter handler
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Handle create post
  const handleCreatePost = () => {
    setEditingPost(null);
    setShowForm(true);
  };

  // Add fetchPosts function
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/posts/all-posts', {
        params: {
          page,
          limit: 10,
          category: selectedCategory,
          pageId: selectedPage,
        },
      });
      setPosts(response.data.posts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(error.response?.data?.message || 'Failed to fetch posts');
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to fetch posts when filters change
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, selectedPage, page]);

  // Update handleFormClose to refresh posts
  const handleFormClose = async () => {
    setShowForm(false);
    setEditingPost(null);
    await fetchPosts(); // Refresh posts after form closes
  };

  // Handle category form close
  const handleCategoryFormClose = () => {
    setShowCategoryForm(false);
  };

  // Add these functions
  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleDeletePost = (post) => {
    setPostToDelete(post);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/posts/delete/${postToDelete._id}`);
      await fetchPosts();
      enqueueSnackbar('Post deleted successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting post:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to delete post',
        { variant: 'error' }
      );
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const handleStatusChange = async (postId, currentStatus) => {
    try {
      const response = await axiosInstance.patch(`/posts/toggle-status/${postId}`, {
        isActive: !currentStatus
      });

      if (response.data.success) {
        setPosts(posts.map(post => 
          post._id === postId ? { ...post, isActive: !currentStatus } : post
        ));
        
        enqueueSnackbar('Post status updated successfully', {
          variant: 'success',
          autoHideDuration: 3000
        });
      }
    } catch (error) {
      console.error('Error updating post status:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update post status',
        { variant: 'error' }
      );
    }
  };

  const handleFeaturedChange = async (postId, currentFeatured) => {
    try {
      const response = await axiosInstance.patch(`/posts/toggle-featured/${postId}`, {
        isFeatured: !currentFeatured
      });

      if (response.data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post._id === postId 
              ? { ...post, isFeatured: !currentFeatured }
              : post
          )
        );
        
        enqueueSnackbar('Featured status updated successfully', {
          variant: 'success',
          autoHideDuration: 3000
        });

        await fetchPosts();
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Failed to update featured status',
        { variant: 'error' }
      );
    }
  };

  // Update FormControl for category filter
  return (
    <ErrorBoundary>
      <Box sx={{ m: 2 }}>
        {/* Page selector */}
        <FormControl sx={{ mb: 2, minWidth: 200 }}>
          <InputLabel>Filter by Page</InputLabel>
          <Select
            value={selectedPage}
            color="info"
            onChange={(e) => setSelectedPage(e.target.value)}
          >
            <MenuItem value="">All Pages</MenuItem>
            {pages.map((page) => (
              <MenuItem key={page._id} value={page._id}>
                {page.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ mb: 2, ml: 2, minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={selectedCategory}
            color="info"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category._id} value={category._id}>
                {category.name.en}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Create buttons */}
        {!showForm && !showCategoryForm && (
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowCategoryForm(true)}
              startIcon={<Add />}
            >
              Add Category
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCreatePost}
              startIcon={<Add />}
            >
              Create Post
            </Button>
          </Box>
        )}

        {/* Forms */}
        {showCategoryForm && (
          <ErrorBoundary>
            <CreateCategoryForm
              onClose={handleCategoryFormClose}
              pageId={selectedPage}
            />
          </ErrorBoundary>
        )}
        {showForm && (
          <ErrorBoundary>
            <CreatePostForm
              post={editingPost}
              onClose={handleFormClose}
              pageId={selectedPage}
            />
          </ErrorBoundary>
        )}

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title (EN)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Categories</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Page</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Author Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Featured</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts &&
                  posts.map((post) => (
                    <TableRow key={post._id}>
                      <TableCell>{post.title?.en || 'N/A'}</TableCell>
                      <TableCell>{post.category?.name?.en || 'N/A'}</TableCell>
                      <TableCell>
                        {post.pages.map((page) => page.name).join(', ') ||
                          'N/A'}
                      </TableCell>
                      <TableCell>{post.createdBy?.role || 'N/A'}</TableCell>
                      <TableCell>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(post.isActive)}
                              onChange={() =>
                                handleStatusChange(post._id, post.isActive)
                              }
                              color="secondary"
                            />
                          }
                          label={post.isActive ? 'Active' : 'Inactive'}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleFeaturedChange(post._id, post.isFeatured)}
                          color="secondary"
                        >
                          {Boolean(post.isFeatured) ? <Star /> : <StarBorder />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="info"
                          onClick={() => handleEditPost(post)}
                          sx={{
                            color: colors.primary,
                            '&:hover': {
                              color: colors.primary,
                            },
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePost(post)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              bgcolor: colors.primary[500],
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle sx={{ color: colors.gray[100] }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography color={colors.gray[100]}>
              Are you sure you want to delete the post "
              {postToDelete?.title?.en}"? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
              color="info"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              startIcon={<Delete />}
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
};

export default PostList;
