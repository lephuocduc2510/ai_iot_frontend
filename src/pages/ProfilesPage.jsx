import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getProfiles, createProfile, getProfileById, updateProfile, deleteProfile } from '../api/profileApi';
import { useAuth } from '../hooks/useAuth';

const ProfilesPage = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [error, setError] = useState('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);

  // Fetch profiles
  const {
    data: profiles = [],
    isLoading,
    isError,
    refetch
  } = useQuery('profiles', getProfiles);

  // Create profile mutation
  const createMutation = useMutation(createProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('profiles');
      handleCloseDialog();
      alert('Tạo hồ sơ thành công!');
    },
    onError: (error) => {
      console.error('Create profile error:', error);
      let errorMessage = 'Đã xảy ra lỗi khi tạo hồ sơ';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      }
      setError(errorMessage);
    }
  });

  // Update profile mutation
  const updateMutation = useMutation(
    ({ profileId, profileData }) => updateProfile(profileId, profileData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profiles');
        handleCloseDialog();
        alert('Cập nhật hồ sơ thành công!');
      },
      onError: (error) => {
        console.error('Update profile error:', error);
        let errorMessage = 'Đã xảy ra lỗi khi cập nhật hồ sơ';
        if (error.response?.data?.detail) {
          errorMessage = typeof error.response.data.detail === 'string' 
            ? error.response.data.detail 
            : JSON.stringify(error.response.data.detail);
        }
        setError(errorMessage);
      }
    }
  );

  // Delete profile mutation
  const deleteMutation = useMutation(deleteProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('profiles');
      setDeleteConfirmDialog(false);
      alert('Xóa hồ sơ thành công!');
    },
    onError: (error) => {
      console.error('Delete profile error:', error);
      let errorMessage = 'Đã xảy ra lỗi khi xóa hồ sơ';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      }
      alert(`Lỗi: ${errorMessage}`);
    }
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
    setOpenDialog(true);
    setError('');
  };

  const handleOpenEditDialog = (profile) => {
    setDialogMode('edit');
    setSelectedProfile(profile);
    setFormData({
      name: profile.name,
      description: profile.description || '',
      is_active: profile.is_active
    });
    setOpenDialog(true);
    setError('');
  };

  const handleOpenViewDialog = (profile) => {
    setDialogMode('view');
    setSelectedProfile(profile);
    setFormData({
      name: profile.name,
      description: profile.description || '',
      is_active: profile.is_active
    });
    setOpenDialog(true);
    setError('');
  };

  const handleOpenDeleteConfirm = (profile) => {
    setProfileToDelete(profile);
    setDeleteConfirmDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.name || formData.name.trim() === '') {
      setError('Tên hồ sơ không được để trống');
      return;
    }

    // Create or update profile data
    const profileData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      is_active: formData.is_active
    };

    console.log('Sending profile data:', profileData);
    
    if (dialogMode === 'add') {
      createMutation.mutate(profileData);
    } else if (dialogMode === 'edit') {
      updateMutation.mutate({
        profileId: selectedProfile.id,
        profileData: profileData
      });
    }
  };

  const handleDeleteConfirm = () => {
    if (profileToDelete) {
      deleteMutation.mutate(profileToDelete.id);
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Quản lý hồ sơ
          </Typography>
          <Box>
            {isAdmin && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenAddDialog}
                sx={{ mr: 1 }}
              >
                Thêm hồ sơ
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        <Paper sx={{ width: '100%', mb: 2 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Alert severity="error">Đã xảy ra lỗi khi tải dữ liệu hồ sơ</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tên hồ sơ</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Người tạo</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profiles
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>{profile.id}</TableCell>
                          <TableCell>{profile.name}</TableCell>
                          <TableCell>
                            <Tooltip title={profile.description || 'Không có mô tả'}>
                              <span>
                                {profile.description 
                                  ? (profile.description.length > 50 
                                      ? profile.description.substring(0, 50) + '...' 
                                      : profile.description) 
                                  : '-'}
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={profile.is_active ? 'Hoạt động' : 'Vô hiệu'}
                              color={profile.is_active ? 'success' : 'default'}
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{profile.created_by || 'Không xác định'}</TableCell>
                          <TableCell>
                            {profile.created_at 
                              ? new Date(profile.created_at).toLocaleString('vi-VN') 
                              : 'Không xác định'}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              color="info" 
                              onClick={() => handleOpenViewDialog(profile)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                            
                            {isAdmin && (
                              <>
                                <IconButton 
                                  color="primary" 
                                  onClick={() => handleOpenEditDialog(profile)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton 
                                  color="error" 
                                  onClick={() => handleOpenDeleteConfirm(profile)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    {profiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          Không có hồ sơ nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={profiles.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số hàng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
              />
            </>
          )}
        </Paper>
      </Box>

      {/* Dialog thêm/sửa hồ sơ */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' 
            ? 'Thêm hồ sơ mới' 
            : dialogMode === 'edit' 
              ? 'Chỉnh sửa hồ sơ' 
              : 'Chi tiết hồ sơ'}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            margin="dense"
            name="name"
            label="Tên hồ sơ"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            disabled={dialogMode === 'view'}
            sx={{ mb: 2, mt: 2 }}
          />

          <TextField
            margin="dense"
            name="description"
            label="Mô tả"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange}
            disabled={dialogMode === 'view'}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="is_active"
              value={formData.is_active}
              label="Trạng thái"
              onChange={handleInputChange}
              disabled={dialogMode === 'view'}
            >
              <MenuItem value={true}>Hoạt động</MenuItem>
              <MenuItem value={false}>Vô hiệu</MenuItem>
            </Select>
          </FormControl>

          {dialogMode === 'view' && selectedProfile && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Thông tin thêm
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>ID:</strong> {selectedProfile.id}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Người tạo:</strong> {selectedProfile.created_by || 'Không xác định'}
              </Typography>
              <Typography variant="body2">
                <strong>Ngày tạo:</strong> {selectedProfile.created_at 
                  ? new Date(selectedProfile.created_at).toLocaleString('vi-VN') 
                  : 'Không xác định'}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            {dialogMode === 'view' ? 'Đóng' : 'Hủy'}
          </Button>
          {dialogMode !== 'view' && (
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                dialogMode === 'add' ? 'Thêm' : 'Cập nhật'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteConfirmDialog} onClose={() => setDeleteConfirmDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa hồ sơ "{profileToDelete?.name}" không?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfilesPage;