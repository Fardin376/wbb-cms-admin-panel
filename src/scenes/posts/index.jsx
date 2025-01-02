import React, { useState, useEffect, useCallback } from 'react';
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
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Star,
  StarBorder,
  Image,
} from '@mui/icons-material';
import axiosInstance from '../../utils/axios.config';
import { tokens } from '../../theme';
import CreatePostForm from './components/CreatePostForm';
import CreateCategoryForm from './components/CreateCategoryForm';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useSnackbar } from 'notistack';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../../services/firebaseConfig';

const extractImageUrls = (content) => {
  const regex = /<img[^>]+src="([^">]+)"/g;
  const urls = [];
  let match;
  while ((match = regex.exec(content))) {
    urls.push(match[1]);
  }
  console.log('Extracted URLs:', urls); // Debugging
  return urls;
};

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
  const [selectedPost, setSelectedPost] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
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

  // Add pages fetching
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await axiosInstance.get('/pages/all-pages');
        setPages(response.data.pages || []);
      } catch (error) {
        console.error('Error fetching pages:', error);
        enqueueSnackbar('Failed to load pages', { variant: 'error' });
      }
    };

    fetchPages();
  }, [enqueueSnackbar]);

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
  const handleEditPost = (postId) => {
    const postToEdit = posts.find((p) => p.id === postId);
    if (postToEdit) {
      const formattedPost = {
        ...postToEdit,
        title: {
          en: postToEdit.titleEn,
          bn: postToEdit.titleBn,
        },
        content: {
          en: postToEdit.contentEn,
          bn: postToEdit.contentBn,
        },
        id: postToEdit.id,
        pageIds: postToEdit.pages.map((page) => page.id),
        categoryId: postToEdit.categoryId,
      };
      setEditingPost(formattedPost);
      setShowForm(true);
    }
  };

  const confirmDelete = useCallback((post) => {
    if (post.isFeatured) {
      return window.confirm(
        'This is a featured post. Are you sure you want to delete it? This action cannot be undone.'
      );
    }
    return window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone.'
    );
  }, []);

  const handleDeletePost = useCallback(
    (post) => {
      if (confirmDelete(post)) {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
      }
    },
    [confirmDelete]
  );

  const deleteFirebaseImages = async (imageUrls) => {
    for (const url of imageUrls) {
      try {
        // Extract the path from the Firebase URL
        const decodedUrl = decodeURIComponent(url);
        const startIndex = decodedUrl.indexOf('/o/') + 3;
        const endIndex = decodedUrl.indexOf('?');
        const fullPath = decodedUrl.substring(startIndex, endIndex);

        // Create reference and delete
        const imageRef = ref(storage, fullPath);
        await deleteObject(imageRef);
      } catch (error) {
        console.error('Error deleting image from Firebase:', error);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axiosInstance.delete(
        `/posts/delete/${postToDelete.id}`
      );

      if (response.data.success && response.data.imageUrls?.length > 0) {
        // Delete images from Firebase storage
        await deleteFirebaseImages(response.data.imageUrls);
      }

      await fetchPosts();
      enqueueSnackbar('Post and associated images deleted successfully', {
        variant: 'success',
      });
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

  const handleStatusChange = async (postId, newStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/posts/update-status/${postId}`,
        {
          status: newStatus,
        }
      );

      if (response.data.success) {
        setPosts(
          posts.map((post) =>
            post.id === postId ? { ...post, status: newStatus } : post
          )
        );

        enqueueSnackbar(`Post status changed to ${getStatusLabel(newStatus)}`, {
          variant: 'success',
          autoHideDuration: 3000,
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
      const response = await axiosInstance.patch(
        `/posts/toggle-featured/${postId}`,
        {
          isFeatured: !currentFeatured,
        }
      );

      if (response.data.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, isFeatured: !currentFeatured }
              : post
          )
        );

        enqueueSnackbar('Featured status updated successfully', {
          variant: 'success',
          autoHideDuration: 3000,
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

  const categoryTypeColors = {
    NEWS: '#2196f3', // Blue
    ARTICLES: '#4caf50', // Green
    RESEARCH: '#9c27b0', // Purple
    PUBLICATIONS: '#ff9800', // Orange
    OTHER: '#757575', // Grey
  };

  const getStatusLabel = (status) => {
    const labels = {
      DRAFT: 'Draft',
      PUBLISHED: 'Published',
      UNPUBLISHED: 'Unpublished',
      ARCHIVED: 'Archived',
    };
    return labels[status] || status;
  };

  const getStatusChipColor = (status) => {
    const colors = {
      DRAFT: '#757575', // Grey
      PUBLISHED: '#4caf50', // Green
      UNPUBLISHED: '#f44336', // Red
      ARCHIVED: '#9e9e9e', // Dark Grey
    };
    return colors[status] || colors.DRAFT;
  };

  const handleOpenDialog = (post) => {
    const urls = extractImageUrls(post.contentEn || post.contentBn); // Check contentEn for now
    console.log('Opening dialog with URLs:', urls); // Debugging
    setImageUrls(urls);
    setSelectedPost(post);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPost(null);
    setImageUrls([]);
  };

  const handleSetCoverImage = async (url) => {
    if (selectedPost) {
      try {
        const response = await axiosInstance.patch(
          `/posts/${selectedPost.id}/set-cover-image`,
          { coverImage: url }
        );

        if (response.data.success) {
          enqueueSnackbar('Cover image updated successfully', {
            variant: 'success',
          });

          // Update the post in the local state
          setPosts((prevPosts) =>
            prevPosts.map((post) =>
              post.id === selectedPost.id ? { ...post, coverImage: url } : post
            )
          );
        } else {
          enqueueSnackbar('Failed to update cover image', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error setting cover image:', error);
        enqueueSnackbar('Error setting cover image', { variant: 'error' });
      } finally {
        handleCloseDialog();
      }
    }
  };

  // Render condition for the main content
  const renderMainContent = () => {
    if (showForm) {
      return (
        <ErrorBoundary>
          <CreatePostForm
            post={editingPost}
            onClose={handleFormClose}
            pageId={selectedPage}
          />
        </ErrorBoundary>
      );
    }

    if (showCategoryForm) {
      return (
        <ErrorBoundary>
          <CreateCategoryForm
            onClose={handleCategoryFormClose}
            pageId={selectedPage}
          />
        </ErrorBoundary>
      );
    }

    return (
      <>
        {/* Filters and buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }} color="info">
            <InputLabel>Filter by Page</InputLabel>
            <Select
              label="Filter by Page"
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
            >
              <MenuItem value="">All Pages</MenuItem>
              {pages.map((page) => (
                <MenuItem key={page.id} value={page.id}>
                  {page.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }} color="info">
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label="Filter by Category"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.nameEn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
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

        {/* Posts Table */}
        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title (EN)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Categories</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cover Image</TableCell>
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
                    <TableRow key={post.id}>
                      <TableCell>{post.titleEn || 'N/A'}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor:
                                categoryTypeColors[post.category?.type] ||
                                categoryTypeColors.OTHER,
                            }}
                          />
                          {post.category?.nameEn || 'N/A'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt="Cover"
                            style={{
                              width: 50,
                              height: 50,
                              objectFit: 'cover',
                              borderRadius: 4,
                            }}
                          />
                        ) : (
                          'No Cover Image'
                        )}
                      </TableCell>
                      <TableCell>
                        {post.pages.map((page) => page.name).join(', ') ||
                          'N/A'}
                      </TableCell>
                      <TableCell>{post.createdBy?.role || 'N/A'}</TableCell>
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={post.status}
                            onChange={(e) =>
                              handleStatusChange(post.id, e.target.value)
                            }
                            sx={{
                              '.MuiSelect-select': {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              },
                            }}
                          >
                            {[
                              'DRAFT',
                              'PUBLISHED',
                              'UNPUBLISHED',
                              'ARCHIVED',
                            ].map((status) => (
                              <MenuItem key={status} value={status}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      backgroundColor:
                                        getStatusChipColor(status),
                                    }}
                                  />
                                  {getStatusLabel(status)}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() =>
                            handleFeaturedChange(post.id, post.isFeatured)
                          }
                          color="secondary"
                        >
                          {Boolean(post.isFeatured) ? <Star /> : <StarBorder />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="info"
                          onClick={() => handleEditPost(post.id)}
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
                        <IconButton onClick={() => handleOpenDialog(post)}>
                          <Image fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </>
    );
  };

  return (
    <ErrorBoundary>
      <Box sx={{ m: 2 }}>
        {renderMainContent()}
        {/* Delete Dialog stays outside */}
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
              Are you sure you want to delete the post "{postToDelete?.titleEn}
              "? This action cannot be undone.
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

        <Dialog open={isDialogOpen} onClose={handleCloseDialog} fullWidth>
          <DialogTitle>Select a Cover Image</DialogTitle>
          <DialogContent>
            <ImageList cols={3} rowHeight={160}>
              {imageUrls.map((url, index) => (
                <ImageListItem
                  key={index}
                  onClick={() => handleSetCoverImage(url)}
                >
                  <img
                    src={url}
                    alt={`Cover ${index}`}
                    loading="lazy"
                    style={{ cursor: 'pointer' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </DialogContent>
        </Dialog>
      </Box>
    </ErrorBoundary>
  );
};

export default PostList;
