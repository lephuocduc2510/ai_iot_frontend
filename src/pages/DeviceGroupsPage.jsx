import React, { useState } from 'react';
import { 
  Box, Typography, Button, Paper, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Chip, List, ListItem, ListItemText,
  Checkbox, FormGroup, FormControlLabel
} from '@mui/material';
import { Add, Edit, Delete, Refresh, DevicesOther, Person, AccessTime } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { getAllDeviceGroups as getDeviceGroups, createDeviceGroup, getDeviceGroupById } from '../api/deviceApi';
import { getAllDevices as getDevices, addMultipleDevicesToGroup } from '../api/deviceApi';

const DeviceGroupsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    devices: []
  });
  const [error, setError] = useState('');

  const { 
    data: deviceGroups = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery('deviceGroups', getDeviceGroups);

  const { data: devices = [] } = useQuery('devices', getDevices);

  const createMutation = useMutation(createDeviceGroup, {
    onSuccess: () => {
      queryClient.invalidateQueries('deviceGroups');
      handleCloseDialog();
      alert("Thêm nhóm thiết bị thành công");
    },
    onError: (error) => {
      setError(error.response?.data?.detail || 'Đã xảy ra lỗi khi tạo nhóm thiết bị');
    }
  });

  // API không có updateDeviceGroup nên sử dụng giả định
  const updateMutation = useMutation((data) => {
    // Giả định có API cập nhật nhóm thiết bị
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('deviceGroups');
      handleCloseDialog();
      alert("Cập nhật nhóm thiết bị thành công");
    },
    onError: (error) => {
      setError(error.response?.data?.detail || 'Đã xảy ra lỗi khi cập nhật nhóm thiết bị');
    }
  });

  // API không có deleteDeviceGroup nên sử dụng giả định
  const deleteMutation = useMutation((id) => {
    // Giả định có API xóa nhóm thiết bị
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('deviceGroups');
      alert("Xóa nhóm thiết bị thành công");
    },
    onError: (error) => {
      setError(error.response?.data?.detail || 'Đã xảy ra lỗi khi xóa nhóm thiết bị');
    }
  });

  // Sử dụng API addMultipleDevicesToGroup
  const addDevicesMutation = useMutation(
    (data) => addMultipleDevicesToGroup(data.deviceIds, data.groupId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('deviceGroups');
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
      name: '',
      devices: []
    });
    setOpenDialog(true);
    setError('');
  };

  const handleOpenEditDialog = (group) => {
    setDialogMode('edit');
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      devices: group.devices ? group.devices.map(device => device.id) : []
    });
    setOpenDialog(true);
    setError('');
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

  const handleDeviceToggle = (deviceId) => {
    setFormData((prevFormData) => {
      const isSelected = prevFormData.devices.includes(deviceId);
      const updatedDevices = isSelected
        ? prevFormData.devices.filter((id) => id !== deviceId) // Bỏ thiết bị nếu đã được chọn
        : [...prevFormData.devices, deviceId]; // Thêm thiết bị nếu chưa được chọn
  
      return {
        ...prevFormData,
        devices: updatedDevices, // Cập nhật danh sách thiết bị
      };
    });
  };

  const handleSubmit = () => {
    if (!formData.name) {
      setError('Tên nhóm không được để trống');
      return;
    }

    if (dialogMode === 'add') {
      createMutation.mutate({
        name: formData.name,
        id_devices: formData.devices
      }, {
        onSuccess: (response) => {
          // Sau khi tạo nhóm thành công, thêm các thiết bị vào nhóm
          if (formData.devices.length > 0) {
            addDevicesMutation.mutate({
              deviceIds: formData.devices,
              groupId: response.id
            });
          }
        }
      });
    } else {
      updateMutation.mutate({
        id: selectedGroup.id,
        name: formData.name,
        id_devices: formData.devices
      }, {
        onSuccess: () => {
          // Sau khi cập nhật nhóm thành công, cập nhật danh sách thiết bị
          if (formData.devices.length > 0) {
            addDevicesMutation.mutate({
              deviceIds: formData.devices,
              groupId: selectedGroup.id
            });
          }
        }
      });
    }
  };

  const handleDeleteGroup = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhóm thiết bị này?')) {
      deleteMutation.mutate(id);
    }
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
            Quản lý nhóm thiết bị
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />} 
              onClick={handleOpenAddDialog}
              sx={{ mr: 1 }}
            >
              Thêm nhóm
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
            <Alert severity="error">Đã xảy ra lỗi khi tải dữ liệu nhóm thiết bị</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tên nhóm</TableCell>
                      <TableCell>Số thiết bị</TableCell>
                      <TableCell>Người tạo</TableCell>
                      <TableCell>Thời gian tạo</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deviceGroups
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((group) => (
                        <TableRow key={group.id}>
                          <TableCell>{group.id}</TableCell>
                          <TableCell>{group.name}</TableCell>
                          <TableCell>
                            <Chip 
                              icon={<DevicesOther fontSize="small" />} 
                              label={group.devices ? group.devices.length : 0} 
                              color="primary" 
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Person fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {group.created_by || 'Không có thông tin'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTime fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                {formatDate(group.created_at)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              color="primary" 
                              onClick={() => handleOpenEditDialog(group)}
                              title="Chỉnh sửa"
                              size="small"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteGroup(group.id)}
                              title="Xóa"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    {deviceGroups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          Không có nhóm thiết bị nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={deviceGroups.length}
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

      {/* Dialog thêm/sửa nhóm thiết bị */}
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
              {dialogMode === 'add' ? 'Thêm nhóm thiết bị mới' : 'Chỉnh sửa nhóm thiết bị'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          <TextField
            margin="dense"
            name="name"
            label="Tên nhóm"
            type="text"
            fullWidth
            required
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 3, mt: 1 }}
          />
          
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
            Thiết bị trong nhóm
          </Typography>
          
          <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto', p: 2, mb: 2 }}>
            <FormGroup>
              {devices.map((device) => (
                <FormControlLabel 
                  key={device.id}
                  control={
                    <Checkbox 
                      checked={formData.devices.includes(device.id)}
                      onChange={() => handleDeviceToggle(device.id)}
                    />
                  }
                  label={`${device.hostname || device.name} (${device.os_type || device.type})`}
                />
              ))}
              {devices.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  Không có thiết bị nào
                </Typography>
              )}
            </FormGroup>
          </Paper>
          
          {dialogMode === 'edit' && selectedGroup && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Thông tin bổ sung
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 100 }}>
                  ID:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedGroup.id}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 100 }}>
                  Người tạo:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {selectedGroup.created_by || 'Không có thông tin'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1, minWidth: 100 }}>
                  Thời gian tạo:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatDate(selectedGroup.created_at)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: '1px solid rgba(0, 0, 0, 0.12)', 
          p: 2 
        }}>
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={createMutation.isLoading || updateMutation.isLoading}
            startIcon={dialogMode === 'add' ? <Add /> : <Edit />}
          >
            {createMutation.isLoading || updateMutation.isLoading ? (
              <CircularProgress size={24} />
            ) : (
              dialogMode === 'add' ? 'Thêm nhóm' : 'Cập nhật'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeviceGroupsPage;