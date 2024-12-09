export const handleError = (error, enqueueSnackbar) => {
  const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
  
  if (error.response?.status === 401) {
    enqueueSnackbar('Session expired. Please login again.', { variant: 'error' });
    window.location.href = '/login';
    return;
  }
  
  enqueueSnackbar(errorMessage, { variant: 'error' });
  console.error('Error:', error);
}; 