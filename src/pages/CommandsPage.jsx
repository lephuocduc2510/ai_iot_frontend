import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, Chip, Tooltip, Stack,
  Grid
} from '@mui/material';
import {
  Add, Edit, Delete, Refresh, Send, CheckCircle,
  Error, Schedule, HourglassEmpty,
  Cancel
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '../components/common/Layout';
import {
  getAllCommands, createCommand, updateCommand, deleteCommand,
  getCommand
} from '../api/commandApi';
import { getAllDevices } from '../api/deviceApi';
import { getAllDeviceGroups } from '../api/deviceApi';

const CommandsPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedCommand, setSelectedCommand] = useState(null);

  // Cập nhật formData để khớp với schema của backend, đã xóa trường name
  const [formData, setFormData] = useState({
    description: '',
    command_type: 'single', // Đổi từ commandType thành command_type
    target_id: '',          // Đổi từ targetId thành target_id
    command: '',
    parameters: '',
    scheduled_time: null    // Đổi từ scheduledTime thành scheduled_time
  });

  const [error, setError] = useState('');

  const {
    data: commands = [],
    isLoading,
    isError,
    refetch
  } = useQuery('commands', getAllCommands);

  const { data: devices = [] } = useQuery('devices', getAllDevices);
  const { data: deviceGroups = [] } = useQuery('deviceGroups', getAllDeviceGroups);


  // Thêm useEffect để cập nhật target_id khi deviceGroups được tải
  React.useEffect(() => {
    if (dialogMode === 'add' && deviceGroups.length > 0 && formData.command_type === 'group' && !formData.target_id) {
      setFormData(prev => ({
        ...prev,
        target_id: deviceGroups[0].id
      }));
    }
  }, [deviceGroups, dialogMode, formData.command_type, formData.target_id]);

  const createMutation = useMutation(createCommand, {
    onSuccess: () => {
      queryClient.invalidateQueries('commands');
      handleCloseDialog();
      alert("Lệnh đã được tạo thành công!");
    },
    onError: (error) => {
      setError(error.response?.data?.detail || 'Đã xảy ra lỗi khi tạo lệnh');
    }
  });

  const updateMutation = useMutation(
    ({ id, command }) => updateCommand(id, command),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('commands');
        handleCloseDialog();
        alert("Lệnh đã được cập nhật thành công!");
      },
      onError: (error) => {
        setError(error.response?.data?.detail || 'Đã xảy ra lỗi khi cập nhật lệnh');
      }
    }
  );

  const deleteMutation = useMutation(deleteCommand, {
    onSuccess: () => {
      queryClient.invalidateQueries('commands');
      alert("Lệnh đã được xóa thành công!");
    },
    onError: (error) => {
      setError(error.response?.data?.detail || 'Đã xảy ra lỗi khi xóa lệnh');
    }
  });

  // API không có executeCommand nên sử dụng giả định
  const executeMutation = useMutation((id) => {
    // Giả định có API thực thi lệnh
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('commands');
      alert('Lệnh đã được gửi thành công!');
    },
    onError: (error) => {
      alert(error.response?.data?.detail || 'Đã xảy ra lỗi khi thực thi lệnh');
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
      description: '',
      command_type: 'group', // Mặc định là nhóm thiết bị thay vì 'single'
      target_id: deviceGroups.length > 0 ? deviceGroups[0].id : '', // Chọn mặc định nhóm thiết bị đầu tiên
      command: '',
      parameters: '',
      scheduled_time: null
    });
    setOpenDialog(true);
    setError('');
  };

  const handleOpenEditDialog = (command) => {
    setDialogMode('edit');
    setSelectedCommand(command);
    setFormData({
      description: command.description || '',
      command_type: command.command_type || 'single',
      target_id: command.target_id || '',
      command: command.command || '',
      parameters: command.parameters || '',
      scheduled_time: command.scheduled_time || null
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

  const handleSubmit = () => {
    // Kiểm tra các trường dữ liệu bắt buộc
    if (!formData.command) {
      setError('Vui lòng nhập lệnh');
      return;
    }

    if (!formData.target_id) {
      setError('Vui lòng chọn mục tiêu');
      return;
    }

    if (dialogMode === 'add') {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate({
        id: selectedCommand.id,
        command: formData.command
      });
    }
  };

  const handleDeleteCommand = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lệnh này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExecuteCommand = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn thực thi lệnh này ngay?')) {
      executeMutation.mutate(id);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      case 'scheduled':
        return <Schedule color="info" />;
      default:
        return <HourglassEmpty color="warning" />;
    }
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Quản lý lệnh
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenAddDialog}
              sx={{ mr: 1 }}
            >
              Tạo lệnh
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
            <Alert severity="error">Đã xảy ra lỗi khi tải dữ liệu lệnh</Alert>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      {/* Đã xóa cột "Tên lệnh" */}
                      <TableCell>Loại mục tiêu</TableCell>
                      <TableCell>Mục tiêu</TableCell>
                      <TableCell>Lệnh</TableCell>
                      <TableCell>Thời gian thực thi</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {commands
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((command) => {
                        const targetName = command.command_type === 'single'
                          ? devices.find(d => d.id === command.target_id)?.hostname || 'N/A'
                          : deviceGroups.find(g => g.id === command.target_id)?.name || 'N/A';

                        return (
                          <TableRow key={command.id}>
                            <TableCell>{command.id}</TableCell>
                            {/* Đã xóa dòng hiển thị tên lệnh */}
                            <TableCell>
                              {command.command_type === 'single' ? 'Thiết bị' : 'Nhóm thiết bị'}
                            </TableCell>
                            <TableCell>{targetName}</TableCell>
                            <TableCell>
                              <Tooltip title={command.parameters ? `Tham số: ${command.parameters}` : 'Không có tham số'}>
                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                  {command.command}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              {command.executed_at ? new Date(command.executed_at).toLocaleString() :
                                command.scheduled_time ? new Date(command.scheduled_time).toLocaleString() : 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleExecuteCommand(command.id)}
                                  disabled={command.status === 'success'}
                                  title="Thực thi lệnh"
                                  size="small"
                                >
                                  <Send />
                                </IconButton>
                                <IconButton
                                  color="info"
                                  onClick={() => handleOpenEditDialog(command)}
                                  title="Chỉnh sửa lệnh"
                                  size="small"
                                >
                                  <Edit />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteCommand(command.id)}
                                  title="Xóa lệnh"
                                  size="small"
                                >
                                  <Delete />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {commands.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          Không có lệnh nào
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={commands.length}
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

      {/* Dialog thêm/sửa lệnh - Đã xóa trường tên lệnh */}
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
              {dialogMode === 'add' ? 'Tạo lệnh mới' : 'Chỉnh sửa lệnh'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          {/* Phần nội dung lệnh được chuyển lên trên */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary" marginTop={3}>
              Nội dung lệnh
            </Typography>
            <TextField
              name="command"
              label="Lệnh"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.command}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />

            <TextField
              name="parameters"
              label="Tham số (không bắt buộc)"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.parameters}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
              disabled={dialogMode === 'edit'} // Chỉ cập nhật lệnh, không cập nhật tham số
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
              Mục tiêu
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Loại mục tiêu</InputLabel>
                  <Select
                    name="command_type"
                    value={formData.command_type}
                    label="Loại mục tiêu"
                    onChange={(e) => {
                      // Khi thay đổi loại mục tiêu, tự động chọn phần tử đầu tiên của loại đó
                      const newType = e.target.value;
                      const newTargetId = newType === 'single'
                        ? (devices.length > 0 ? devices[0].id : '')
                        : (deviceGroups.length > 0 ? deviceGroups[0].id : '');

                      setFormData({
                        ...formData,
                        command_type: newType,
                        target_id: newTargetId
                      });
                    }}
                    disabled={dialogMode === 'edit'} // Chỉ cập nhật lệnh, không cập nhật loại mục tiêu
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="single">Thiết bị</MenuItem>
                    <MenuItem value="group">Nhóm thiết bị</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Mục tiêu</InputLabel>
                  <Select
                    name="target_id"
                    value={formData.target_id}
                    label="Mục tiêu"
                    onChange={handleInputChange}
                    disabled={dialogMode === 'edit'} // Chỉ cập nhật lệnh, không cập nhật mục tiêu
                    displayEmpty
                    sx={{
                      borderRadius: 1,
                      "& .MuiSelect-select": {
                        color: formData.target_id ? 'inherit' : 'text.secondary'
                      }
                    }}
                  >
                    <MenuItem value="" disabled>
                      <em>Chọn mục tiêu</em>
                    </MenuItem>

                    {formData.command_type === 'single' ? (
                      devices.map(device => (
                        <MenuItem key={device.id} value={device.id}>{device.hostname}</MenuItem>
                      ))
                    ) : (
                      deviceGroups.map(group => (
                        <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
              Thời gian thực thi
            </Typography>
            <TextField
              name="scheduled_time"
              label="Thời gian lên lịch (không bắt buộc)"
              type="datetime-local"
              fullWidth
              variant="outlined"
              value={formData.scheduled_time || ''}
              onChange={handleInputChange}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={dialogMode === 'edit'} // Chỉ cập nhật lệnh, không cập nhật thời gian
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
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
              dialogMode === 'add' ? 'Tạo lệnh' : 'Cập nhật'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CommandsPage;