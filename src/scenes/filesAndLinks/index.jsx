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
  CircularProgress,
  Link,
  Tooltip,
  Chip,
  Fade,
  TablePagination,
} from '@mui/material';
import {
  Add,
  Delete,
  PictureAsPdf,
  Download,
  Science,
  MenuBook,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axiosInstance from '../../utils/axios.config';
import { tokens } from '../../theme';
import PdfUploader from './components/PdfUploader';

const ViewPdfs = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { enqueueSnackbar } = useSnackbar();

  const getPdfs = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/pdfs/all');
      if (response.data.success) {
        setPdfs(response.data.pdfs);
      } else {
        enqueueSnackbar('Failed to fetch PDFs', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        enqueueSnackbar(
          error.response?.data?.message || 'Error fetching PDFs',
          { variant: 'error' }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePdf = async (pdfId) => {
    try {
      const response = await axiosInstance.delete(`/pdfs/delete/${pdfId}`);
      if (response.data.success) {
        enqueueSnackbar('PDF deleted successfully', { variant: 'success' });
        getPdfs();
      } else {
        enqueueSnackbar('Failed to delete PDF', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting PDF:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      } else {
        enqueueSnackbar(error.response?.data?.message || 'Error deleting PDF', {
          variant: 'error',
        });
      }
    }
  };

  const handleToggleUploader = () => {
    setShowUploader((prev) => !prev);
  };

  const handleDownload = async (pdfId, fileName) => {
    try {
      // First try to get the file directly from the URL if available
      const pdf = pdfs.find((p) => p._id === pdfId);
      if (pdf?.url) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = pdf.url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        enqueueSnackbar('Download started!', { variant: 'success' });
        return;
      }

      // Fallback to server download endpoint if URL is not available
      enqueueSnackbar('Starting download...', { variant: 'info' });
      const response = await axiosInstance.get(`/pdfs/download/${pdfId}`, {
        responseType: 'blob',
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      if (!response.data) {
        throw new Error('No data received');
      }

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      enqueueSnackbar('Download completed!', { variant: 'success' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Download failed. Please try again.',
        { variant: 'error' }
      );
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    getPdfs();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '80vh',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="textSecondary">
          Loading PDFs...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ m: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            PDF Documents
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleToggleUploader}
            startIcon={showUploader ? null : <Add />}
          >
            {showUploader ? 'Cancel Upload' : 'Upload PDF'}
          </Button>
        </Box>

        <Fade in={showUploader}>
          <Box>
            {showUploader && (
              <PdfUploader
                onUploadSuccess={() => {
                  getPdfs();
                  setShowUploader(false);
                  enqueueSnackbar('PDF uploaded successfully', {
                    variant: 'success',
                  });
                }}
                onClose={() => {
                  setShowUploader(false);
                }}
              />
            )}
          </Box>
        </Fade>

        {pdfs.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              No PDFs Available
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Click the Upload button to add your first PDF document.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>
                      Document
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Post</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pdfs
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((pdf) => (
                      <TableRow
                        key={pdf._id}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <PictureAsPdf color="error" />
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500 }}
                              >
                                {pdf.fileName}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {formatFileSize(pdf.fileSize)}
                                {pdf.metadata?.compressionRatio > 0 && (
                                  <Tooltip title="Compression savings">
                                    <span
                                      style={{ marginLeft: 8, color: 'green' }}
                                    >
                                      (-{pdf.metadata.compressionRatio}%)
                                    </span>
                                  </Tooltip>
                                )}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {pdf.usageTypes.postId?.title?.en || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {pdf.usageTypes.categoryId?.name?.en || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={
                              pdf.usageTypes.isResearch ? (
                                <Science />
                              ) : (
                                <MenuBook />
                              )
                            }
                            label={
                              pdf.usageTypes.isResearch
                                ? 'Research'
                                : 'Publication'
                            }
                            color={
                              pdf.usageTypes.isResearch ? 'info' : 'secondary'
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Download PDF">
                              <IconButton
                                color="secondary"
                                onClick={() =>
                                  handleDownload(pdf._id, pdf.fileName)
                                }
                              >
                                <Download />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete PDF">
                              <IconButton
                                color="error"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      'Are you sure you want to delete this PDF?'
                                    )
                                  ) {
                                    handleDeletePdf(pdf._id);
                                  }
                                }}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={pdfs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ViewPdfs;
