import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Chip, Avatar
} from '@mui/material';
import { Add, Edit, Delete, Refresh, PersonAdd, LockReset } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
// Xóa import Layout
import { getUsers, getUser, createUser, updateUser, deleteUser, resetPassword } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openResetDialog, setOpenResetDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'Operator', // Đã cập nhật theo enum backend
    password: '',
    confirmPassword: '',
    isActive: true
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    userId: null,
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [resetError, setResetError] = useState('');
  const { user: currentUser } = useAuth();

  const {
    data: users = [],
    isLoading,
    isError,
    refetch
  } = useQuery('users', getUsers);

  // Thêm bổ sung vào createMutation
  const createMutation = useMutation(createUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
      handleCloseDialog();
      // Hiển thị thông báo thành công
      alert('Tạo người dùng thành công!');
    },
    onError: (error) => {
      console.error('Create user error:', error);
      console.error('Error response:', error.response);

      // Xử lý đối tượng lỗi
      let errorMessage = 'Đã xảy ra lỗi khi tạo người dùng';

      // Kiểm tra chi tiết lỗi từ backend
      if (error.response) {
        if (error.response.status === 500) {
          errorMessage = 'Lỗi server: Vui lòng kiểm tra log server để biết thêm chi tiết. Có thể username hoặc email đã tồn tại!';
        } else if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.detail) {
            if (typeof error.response.data.detail === 'string') {
              errorMessage = error.response.data.detail;
            } else if (Array.isArray(error.response.data.detail)) {
              errorMessage = error.response.data.detail
                .map(err => `${err.loc.join('.')} - ${err.msg}`)
                .join(', ');
            } else {
              errorMessage = JSON.stringify(error.response.data.detail);
            }
          } else {
            errorMessage = JSON.stringify(error.response.data);
          }
        }
      }

      setError(errorMessage);
    }
  });

  const updateMutation = useMutation(
    ({ userId, userData }) => updateUser(userId, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        handleCloseDialog();
      },
      onError: (error) => {
        console.error('Update user error:', error);
        console.error('Response data:', error.response?.data);

        // Xử lý đối tượng lỗi
        let errorMessage = 'Đã xảy ra lỗi khi cập nhật người dùng';
        if (error.response?.data?.detail) {
          // Kiểm tra nếu detail là một đối tượng
          if (typeof error.response.data.detail === 'object') {
            // Nếu là mảng các lỗi (thường từ Pydantic validation)
            if (Array.isArray(error.response.data.detail)) {
              errorMessage = error.response.data.detail
                .map(err => `${err.loc.join('.')} - ${err.msg}`)
                .join(', ');
            } else {
              // Nếu là đối tượng lỗi khác
              errorMessage = JSON.stringify(error.response.data.detail);
            }
          } else {
            // Nếu là chuỗi đơn giản
            errorMessage = error.response.data.detail;
          }
        }
        setError(errorMessage);
      }
    }
  );

  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.invalidateQueries('users');
    },
    onError: (error) => {
      console.error('Delete user error:', error);

      // Xử lý đối tượng lỗi tương tự
      let errorMessage = 'Đã xảy ra lỗi khi xóa người dùng';
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'object') {
          if (Array.isArray(error.response.data.detail)) {
            errorMessage = error.response.data.detail
              .map(err => `${err.loc.join('.')} - ${err.msg}`)
              .join(', ');
          } else {
            errorMessage = JSON.stringify(error.response.data.detail);
          }
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      setError(errorMessage);
    }
  });

  const resetPasswordMutation = useMutation(
    ({ token, newPassword }) => resetPassword(token, newPassword),
    {
      onSuccess: () => {
        handleCloseResetDialog();
        alert('Đặt lại mật khẩu thành công!');
      },
      onError: (error) => {
        console.error('Reset password error:', error);

        // Xử lý đối tượng lỗi
        let errorMessage = 'Đã xảy ra lỗi khi đặt lại mật khẩu';
        if (error.response?.data?.detail) {
          if (typeof error.response.data.detail === 'object') {
            if (Array.isArray(error.response.data.detail)) {
              errorMessage = error.response.data.detail
                .map(err => `${err.loc.join('.')} - ${err.msg}`)
                .join(', ');
            } else {
              errorMessage = JSON.stringify(error.response.data.detail);
            }
          } else {
            errorMessage = error.response.data.detail;
          }
        }
        setResetError(errorMessage);
      }
    }
  );

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
      username: '',
      email: '',
      role: 'Operator', // Đã cập nhật theo enum backend
      password: '',
      confirmPassword: '',
      isActive: true
    });
    setOpenDialog(true);
    setError('');
  };

  const handleOpenEditDialog = (user) => {
    setDialogMode('edit');
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.is_active !== undefined ? user.is_active : user.isActive,
      password: '', // Không hiển thị mật khẩu
      confirmPassword: ''
    });
    setOpenDialog(true);
    setError('');
  };

  const handleOpenResetDialog = (user) => {
    setSelectedUser(user);
    setResetPasswordData({
      userId: user.id,
      password: '',
      confirmPassword: ''
    });
    setOpenResetDialog(true);
    setResetError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleCloseResetDialog = () => {
    setOpenResetDialog(false);
    setResetError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleResetInputChange = (e) => {
    const { name, value } = e.target;
    setResetPasswordData({
      ...resetPasswordData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.username || formData.username.trim() === '') {
      setError('Tên đăng nhập không được để trống');
      return;
    }

    if (!formData.email || formData.email.trim() === '') {
      setError('Email không được để trống');
      return;
    }

    if (dialogMode === 'add' && (!formData.password || formData.password.trim() === '')) {
      setError('Mật khẩu không được để trống');
      return;
    }

    if (dialogMode === 'add' && formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    // Chuẩn bị dữ liệu theo format backend mong đợi
    const userData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      role: formData.role,
      is_active: formData.isActive // THAY ĐỔI: Đổi tên trường từ isActive thành is_active
    };


    // Chỉ thêm password nếu có giá trị
    if (formData.password && formData.password.trim() !== '') {
      userData.password = formData.password.trim();
    }

    console.log('Sending user data:', userData);

    if (dialogMode === 'add') {
      createMutation.mutate(userData);
    } else {
      updateMutation.mutate({
        userId: selectedUser.id,
        userData: userData
      });
    }
  };

  const handleResetPassword = () => {
    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setResetError('Mật khẩu không khớp');
      return;
    }

    resetPasswordMutation.mutate({
      token: `reset_${resetPasswordData.userId}`,
      newPassword: resetPasswordData.password
    });
  };

  const handleDeleteUser = (id) => {
    if (id === currentUser.id) {
      alert('Bạn không thể xóa tài khoản của chính mình.');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      deleteMutation.mutate(id);
    }
  };

  // Cập nhật hàm để phù hợp với enum role mới
  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'error';
      case 'Supervisor':
        return 'warning';
      case 'TeamLead':
        return 'primary';
      case 'Operator':
        return 'info';
      default:
        return 'default';
    }
  };

  // Cập nhật hàm để phù hợp với enum role mới
  const getRoleLabel = (role) => {
    switch (role) {
      case 'Admin':
        return 'Quản trị viên';
      case 'Supervisor':
        return 'Giám sát';
      case 'TeamLead':
        return 'Trưởng nhóm';
      case 'Operator':
        return 'Vận hành';
      default:
        return role || 'Không xác định';
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Quản lý người dùng
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PersonAdd />}
              onClick={handleOpenAddDialog}
              sx={{ mr: 1 }}
            >
              Thêm người dùng
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
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
            <Alert severity="error">Đã xảy ra lỗi khi tải dữ liệu người dùng</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tên người dùng</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Vai trò</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.id}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  mr: 1,
                                  bgcolor: user.id === currentUser?.id ? 'primary.main' : 'default'
                                }}
                              >
                                {user.username?.charAt(0).toUpperCase()}
                              </Avatar>
                              {user.username}
                            </Box>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={getRoleLabel(user.role)}
                              color={getRoleColor(user.role)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                user.is_active === false || user.isActive === false ? 'Đã khóa' : 'Hoạt động'
                              }
                              color={
                                user.is_active === false || user.isActive === false ? 'default' : 'success'
                              }
                              variant="outlined"
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="info"
                              onClick={() => handleOpenResetDialog(user)}
                            >
                              <LockReset />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenEditDialog(user)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={user.id === currentUser?.id}
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Không có người dùng nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={users.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Số hàng mỗi trang:"
              />
            </>
          )}
        </Paper>
      </Box>

      {/* Dialog thêm/sửa người dùng */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          
        </DialogTitle>{dialogMode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa người dùng'}
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <TextField
            margin="dense"
            name="username"
            label="Tên đăng nhập"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.username}
            onChange={handleInputChange}
            disabled={dialogMode === 'edit'}
            sx={{ mb: 2, mt: 2 }}
          />

          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Vai trò</InputLabel>
            <Select
              name="role"
              value={formData.role}
              label="Vai trò"
              onChange={handleInputChange}
            >
              <MenuItem value="Admin">Quản trị viên</MenuItem>
              <MenuItem value="Supervisor">Giám sát</MenuItem>
              <MenuItem value="TeamLead">Trưởng nhóm</MenuItem>
              <MenuItem value="Operator">Vận hành</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              name="isActive"
              value={formData.isActive}
              label="Trạng thái"
              onChange={handleInputChange}
            >
              <MenuItem value={true}>Hoạt động</MenuItem>
              <MenuItem value={false}>Khóa</MenuItem>
            </Select>
          </FormControl>
  {/* Thêm trường nhập mật khẩu và xác nhận mật khẩu khi thêm người dùng mới */}
  {dialogMode === 'add' && (
      <>
        <TextField
          margin="dense"
          name="password"
          label="Mật khẩu"
          type="password"
          fullWidth
          variant="outlined"
          value={formData.password}
          onChange={handleInputChange}
          required
          sx={{ mb: 2 }}
        />

        <TextField
          margin="dense"
          name="confirmPassword"
          label="Xác nhận mật khẩu"
          type="password"
          fullWidth
          variant="outlined"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          sx={{ mb: 2 }}
          error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
          helperText={
            formData.password !== formData.confirmPassword && formData.confirmPassword !== '' 
              ? 'Mật khẩu không khớp' 
              : ''
          }
        />
      </>
    )}
        
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
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
        </DialogActions>
      </Dialog>

      {/* Dialog đặt lại mật khẩu */}
      <Dialog open={openResetDialog} onClose={handleCloseResetDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Đặt lại mật khẩu cho {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}

          <TextField
            margin="dense"
            name="password"
            label="Mật khẩu mới"
            type="password"
            fullWidth
            variant="outlined"
            value={resetPasswordData.password}
            onChange={handleResetInputChange}
            sx={{ mb: 2, mt: 2 }}
          />

          <TextField
            margin="dense"
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            variant="outlined"
            value={resetPasswordData.confirmPassword}
            onChange={handleResetInputChange}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog} color="inherit">Hủy</Button>
          <Button
            onClick={handleResetPassword}
            color="primary"
            variant="contained"
            disabled={resetPasswordMutation.isLoading}
          >
            {resetPasswordMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Đặt lại mật khẩu'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UsersPage;