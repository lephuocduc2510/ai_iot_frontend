import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Chip,
  FormHelperText
} from '@mui/material';
import { Add, Edit, Delete, Refresh, CheckCircle, Cancel, Group } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getAllDevices,
  createDevice,
  getDeviceById,
  getAllDeviceGroups,
  addDeviceToGroup
} from '../api/deviceApi';

const DevicesPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');

  // Cập nhật formData để khớp với schema của backend
  const [formData, setFormData] = useState({
    hostname: '',
    os_type: 'Linux',
    ip_address: '',
    status: 'active',
    device_group_id: null,
    ssh_port: ''
  });
  const [error, setError] = useState('');

  // Lấy danh sách thiết bị
  const {
    data: devices = [],
    isLoading,
    isError,
    refetch
  } = useQuery('devices', getAllDevices);

  // Lấy danh sách nhóm thiết bị
  const {
    data: deviceGroups = [],
    isLoading: isLoadingGroups
  } = useQuery('deviceGroups', getAllDeviceGroups);

  // Tạo thiết bị mới
  const createMutation = useMutation(createDevice, {
    onSuccess: () => {
      queryClient.invalidateQueries('devices');
      handleCloseDialog();
      // Thông báo thành công
      alert("Thêm thiết bị thành công");
    },
    onError: (error) => {
      console.error("Lỗi khi thêm thiết bị:", error);
      setError(error?.response?.data?.detail || 'Đã xảy ra lỗi khi tạo thiết bị');
    },
    // Thêm handler onSettled để đảm bảo xử lý kết thúc dù thành công hay thất bại
    onSettled: () => {
      // Đảm bảo trạng thái loading được reset
      console.log("Kết thúc request");
    }
  });

  // Giả định API cập nhật thiết bị (chưa có trong backend)
  const updateMutation = useMutation((data) => {
    return new Promise((resolve, reject) => {
      // Mô phỏng API call
      setTimeout(() => resolve({ success: true }), 500);
    });
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('devices');
      handleCloseDialog();
    },
    onError: (error) => {
      setError(error.response?.data?.detail || 'Đã xảy ra lỗi khi cập nhật thiết bị');
    }
  });

  // Giả định API xóa thiết bị (chưa có trong backend)
  const deleteMutation = useMutation((id) => {
    return new Promise((resolve, reject) => {
      // Mô phỏng API call
      setTimeout(() => resolve({ success: true }), 500);
    });
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('devices');
    },
    onError: (error) => {
      setError(error.response?.data?.detail || 'Đã xảy ra lỗi khi xóa thiết bị');
    }
  });

  // Thêm thiết bị vào nhóm
  const addToGroupMutation = useMutation(
    (data) => addDeviceToGroup(data.deviceId, data.groupId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('devices');
        setOpenGroupDialog(false);
      },
      onError: (error) => {
        setError(error.response?.data?.detail || 'Đã xảy ra lỗi khi thêm thiết bị vào nhóm');
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
      hostname: '',
      os_type: 'Linux',
      ip_address: '',
      status: 'active',
      device_group_id: null,
      ssh_port: ''
    });
    setOpenDialog(true);
    setError('');
  };

  const handleOpenEditDialog = (device) => {
    setDialogMode('edit');
    setSelectedDevice(device);
    setFormData({
      hostname: device.hostname || '',
      os_type: device.os_type || 'Linux',
      ip_address: device.ip_address || '',
      status: device.status || 'active',
      device_group_id: device.device_group_id || null,
      ssh_port: device.ssh_port || ''
    });
    setOpenDialog(true);
    setError('');
  };

  const handleOpenGroupDialog = (device) => {
    setSelectedDevice(device);
    setSelectedGroupId(device.device_group_id || '');
    setOpenGroupDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleCloseGroupDialog = () => {
    setOpenGroupDialog(false);
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
    if (dialogMode === 'add') {
      // Chuyển device_group_id từ chuỗi sang số hoặc null
      const submitData = {
        ...formData,
        device_group_id: formData.device_group_id === '' ? null : Number(formData.device_group_id)
      };
      createMutation.mutate(submitData);
    } else {
      // Chuyển device_group_id từ chuỗi sang số hoặc null
      const submitData = {
        id: selectedDevice.id,
        ...formData,
        device_group_id: formData.device_group_id === '' ? null : Number(formData.device_group_id)
      };
      updateMutation.mutate(submitData);
    }
  };

  const handleAddToGroup = () => {
    if (selectedDevice && selectedGroupId) {
      addToGroupMutation.mutate({
        deviceId: selectedDevice.id,
        groupId: Number(selectedGroupId)
      });
    }
  };

  const handleDeleteDevice = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {
      deleteMutation.mutate(id);
    }
  };

  // Tìm tên nhóm thiết bị dựa theo ID
  const getGroupName = (groupId) => {
    if (!groupId) return '';
    const group = deviceGroups.find(g => g.id === groupId);
    return group ? group.name : `Nhóm ${groupId}`;
  };

  // Format thời gian tạo
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Quản lý thiết bị
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenAddDialog}
              sx={{ mr: 1 }}
            >
              Thêm thiết bị
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
            <Alert severity="error">Đã xảy ra lỗi khi tải dữ liệu thiết bị</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tên máy chủ</TableCell>
                      <TableCell>Hệ điều hành</TableCell>
                      <TableCell>Địa chỉ IP</TableCell>
                      <TableCell>SSH Port</TableCell>
                      <TableCell>Nhóm thiết bị</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devices
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((device) => (
                        <TableRow key={device.id}>
                          <TableCell>{device.id}</TableCell>
                          <TableCell>{device.hostname}</TableCell>
                          <TableCell>{device.os_type}</TableCell>
                          <TableCell>{device.ip_address}</TableCell>
                          <TableCell>{device.ssh_port || '1700'}</TableCell>
                          <TableCell>
                            {device.device_group_id ? (
                              <Chip
                                size="small"
                                label={getGroupName(device.device_group_id)}
                                color="primary"
                                variant="outlined"
                              />
                            ) : (
                              <Chip size="small" label="Chưa phân nhóm" variant="outlined" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={device.status === 'active' ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                              label={device.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                              color={device.status === 'active' ? 'success' : 'error'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{formatDate(device.created_at)}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              color="secondary"
                              onClick={() => handleOpenGroupDialog(device)}
                              title="Thêm vào nhóm"
                              size="small"
                            >
                              <Group />
                            </IconButton>
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenEditDialog(device)}
                              title="Chỉnh sửa"
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteDevice(device.id)}
                              title="Xóa"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    {devices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          Không có thiết bị nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={devices.length}
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

      {/* Dialog thêm/sửa thiết bị - Cải thiện giao diện */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          pb: 2,
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {dialogMode === 'add' ? (
              <Add sx={{ mr: 1, color: 'primary.main' }} />
            ) : (
              <Edit sx={{ mr: 1, color: 'primary.main' }} />
            )}
            <Typography variant="h6">
              {dialogMode === 'add' ? 'Thêm thiết bị mới' : 'Chỉnh sửa thiết bị'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
              Thông tin cơ bản
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="hostname"
                  label="Tên máy chủ"
                  fullWidth
                  required
                  variant="outlined"
                  value={formData.hostname}
                  onChange={handleInputChange}
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Hệ điều hành</InputLabel>
                  <Select
                    name="os_type"
                    value={formData.os_type}
                    label="Hệ điều hành"
                    onChange={handleInputChange}
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="Linux">Linux</MenuItem>
                    <MenuItem value="Windows">Windows</MenuItem>
                    <MenuItem value="macOS">macOS</MenuItem>
                    <MenuItem value="Other">Khác</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Trạng thái"
                    onChange={handleInputChange}
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="active">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircle fontSize="small" color="success" sx={{ mr: 1 }} />
                        Hoạt động
                      </Box>
                    </MenuItem>
                    <MenuItem value="inactive">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Cancel fontSize="small" color="error" sx={{ mr: 1 }} />
                        Không hoạt động
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
              Thông tin kết nối
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="ip_address"
                  label="Địa chỉ IP"
                  fullWidth
                  variant="outlined"
                  value={formData.ip_address}
                  onChange={handleInputChange}
                  placeholder="192.168.0.1"
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="ssh_port"
                  label="SSH Port"
                  fullWidth
                  variant="outlined"
                  value={formData.ssh_port}
                  onChange={handleInputChange}
                  placeholder="22"
                  helperText="Port SSH để kết nối với thiết bị (mặc định: 22)"
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          p: 2
        }}>
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            variant="outlined"
            startIcon={<Cancel />}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            color="primary"
            variant="contained"
            startIcon={dialogMode === 'add' ? <Add /> : <Edit />}
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            {createMutation.isLoading || updateMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              dialogMode === 'add' ? 'Thêm thiết bị' : 'Cập nhật thiết bị'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog thêm thiết bị vào nhóm */}
      <Dialog open={openGroupDialog} onClose={handleCloseGroupDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Thêm thiết bị vào nhóm
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Thiết bị:</strong> {selectedDevice?.hostname}
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Chọn nhóm</InputLabel>
              <Select
                value={selectedGroupId}
                label="Chọn nhóm"
                onChange={(e) => setSelectedGroupId(e.target.value)}
              >
                <MenuItem value="">Không thuộc nhóm</MenuItem>
                {deviceGroups.map(group => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGroupDialog} color="inherit">Hủy</Button>
          <Button
            onClick={handleAddToGroup}
            color="primary"
            variant="contained"
            disabled={addToGroupMutation.isLoading}
          >
            {addToGroupMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              'Thêm vào nhóm'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DevicesPage;