import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Autocomplete,
  TextField,
  Divider,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Terminal as TerminalIcon,
  DevicesOther as DevicesIcon
} from '@mui/icons-material';
import axiosInstance from '../api/axiosConfig';
import { useAuth } from '../hooks/useAuth';

const ProfileCommandsPage = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [selectedDeviceGroup, setSelectedDeviceGroup] = useState(null);
  const [selectedCommands, setSelectedCommands] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [groupCommands, setGroupCommands] = useState([]);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [commandToDelete, setCommandToDelete] = useState(null);
  const [profileName, setProfileName] = useState('');

  // Lấy danh sách tất cả device groups
  const {
    data: deviceGroups = [],
    isLoading: deviceGroupsLoading,
    error: deviceGroupsError,
    refetch: refetchDeviceGroups
  } = useQuery('deviceGroups', async () => {
    try {
      console.log('Fetching device groups...');
      const response = await axiosInstance.get('/devices/groups/all');
      console.log('Device groups response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching device groups:', error);
      throw error;
    }
  });

  // Lấy danh sách tất cả commands
  const {
    data: commands = [],
    isLoading: commandsLoading,
    error: commandsError,
    refetch: refetchCommands
  } = useQuery('commands', async () => {
    try {
      console.log('Fetching commands...');
      const response = await axiosInstance.get('/command/get/all');
      console.log('Commands response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching commands:', error);
      throw error;
    }
  });

  // Gọi API để lấy commands của device group khi device group được chọn
  const {
    refetch: fetchGroupCommands,
    isLoading: groupCommandsLoading
  } = useQuery(
    ['groupCommands', selectedDeviceGroup?.id],
    async () => {
      const response = await axiosInstance.get(`/profile-command/${selectedDeviceGroup.id}`);
      return response.data;
    },
    {
      enabled: !!selectedDeviceGroup?.id,
      onSuccess: (data) => {
        console.log('Group commands data received:', data);
        if (data && Array.isArray(data.command_ids)) {
          // Lấy thông tin chi tiết của các command từ danh sách commands đã tải
          const commandDetails = commands.filter(cmd =>
            data.command_ids.includes(cmd.id)
          );

          console.log('Mapped command details:', commandDetails);
          setGroupCommands(commandDetails);
        } else {
          setGroupCommands([]);
        }
      },
      onError: (error) => {
        console.error('Error fetching group commands:', error);
        if (error.response && error.response.status === 404) {
          // Nếu 404, nghĩa là nhóm thiết bị chưa có lệnh nào
          setGroupCommands([]);
        } else {
          setError('Lỗi khi tải danh sách lệnh của nhóm thiết bị này');
          setTimeout(() => setError(''), 5000);
          setGroupCommands([]);
        }
      }
    }
  );

  // Mutation để tạo profile command
  const createProfileCommandMutation = useMutation(
    async (profileCommandData) => {
      const response = await axiosInstance.post('/profile-command', profileCommandData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['groupCommands', selectedDeviceGroup?.id]);
        setSuccess('Gán lệnh cho nhóm thiết bị thành công!');
        setSelectedCommands([]);
        setProfileName('');
        setTimeout(() => setSuccess(''), 3000);
        // Refresh the group commands
        if (selectedDeviceGroup?.id) {
          fetchGroupCommands();
        }
      },
      onError: (error) => {
        console.error('Error assigning commands to device group:', error);
        let errorMessage = 'Đã xảy ra lỗi khi gán lệnh cho nhóm thiết bị';
        if (error.response?.data?.detail) {
          errorMessage = typeof error.response.data.detail === 'string'
            ? error.response.data.detail
            : JSON.stringify(error.response.data.detail);
        }
        setError(errorMessage);
        setTimeout(() => setError(''), 5000);
      }
    }
  );

  // Mutation để xóa profile command
  const deleteProfileCommandMutation = useMutation(
    async (commandId) => {
      const response = await axiosInstance.delete(`/profile-command/${selectedDeviceGroup.id}/command/${commandId}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['groupCommands', selectedDeviceGroup?.id]);
        setDeleteConfirmDialog(false);
        setSuccess('Hủy gán lệnh thành công!');
        setTimeout(() => setSuccess(''), 3000);
        // Refresh the group commands
        if (selectedDeviceGroup?.id) {
          fetchGroupCommands();
        }
      },
      onError: (error) => {
        console.error('Error removing command assignment:', error);
        let errorMessage = 'Đã xảy ra lỗi khi hủy gán lệnh';
        if (error.response?.data?.detail) {
          errorMessage = typeof error.response.data.detail === 'string'
            ? error.response.data.detail
            : JSON.stringify(error.response.data.detail);
        }
        setError(errorMessage);
        setDeleteConfirmDialog(false);
        setTimeout(() => setError(''), 5000);
      }
    }
  );

  // Cập nhật hàm handleDeviceGroupChange
  const handleDeviceGroupChange = (event, newValue) => {
    setSelectedDeviceGroup(newValue);
    setSelectedCommands([]);

    if (newValue?.id) {
      // Tải các commands đã gán
      fetchGroupCommands();

      // Đồng thời tải mới danh sách tất cả commands
      console.log('Device group selected, refreshing commands list');
      refetchCommands();
    } else {
      setGroupCommands([]);
    }
  };

  const handleCommandChange = (event, newValue) => {
    setSelectedCommands(newValue);
  };

  const handleProfileNameChange = (event) => {
    setProfileName(event.target.value);
  };

  const handleSubmit = () => {
    if (!selectedDeviceGroup) {
      setError('Vui lòng chọn nhóm thiết bị');
      return;
    }

    if (selectedCommands.length === 0) {
      setError('Vui lòng chọn ít nhất một lệnh');
      return;
    }

    if (!profileName.trim()) {
      setError('Vui lòng nhập tên hồ sơ');
      return;
    }

    const profileCommandData = {
      profile_name: profileName,
      device_group_id: selectedDeviceGroup.id,
      command_ids: selectedCommands.map(cmd => cmd.id)
    };

    console.log('Sending profile command data:', profileCommandData);
    createProfileCommandMutation.mutate(profileCommandData);
  };

  const handleDeleteCommand = (command) => {
    setCommandToDelete(command);
    setDeleteConfirmDialog(true);
  };

  const confirmDeleteCommand = () => {
    if (commandToDelete?.id) {
      deleteProfileCommandMutation.mutate(commandToDelete.id);
    }
  };

  // Kiểm tra quyền quản lý - Admin, Supervisor hoặc TeamLead
  const canManageCommands = currentUser &&
    ['Admin', 'Supervisor', 'TeamLead'].includes(currentUser.role);

  useEffect(() => {
    // Hiển thị lỗi nếu không load được device groups hoặc commands
    if (deviceGroupsError) {
      setError('Không thể tải danh sách nhóm thiết bị. Vui lòng thử lại.');
    } else if (commandsError) {
      setError('Không thể tải danh sách lệnh. Vui lòng thử lại.');
    }
  }, [deviceGroupsError, commandsError]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          mb: 4,
          fontWeight: 'bold',
          borderLeft: '4px solid #1976d2',
          pl: 2
        }}
      >
        Gán lệnh cho nhóm thiết bị
      </Typography>

      {!canManageCommands && (
        <Alert
          severity="warning"
          sx={{
            mb: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          Bạn không có quyền quản lý việc gán lệnh. Chỉ Admin, Supervisor và TeamLead mới có quyền này.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium', color: 'primary.main' }}>
              <DevicesIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Chọn nhóm thiết bị
            </Typography>

            <Autocomplete
              options={deviceGroups}
              getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
              onChange={handleDeviceGroupChange}
              value={selectedDeviceGroup}
              loading={deviceGroupsLoading}
              disabled={!canManageCommands}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn nhóm thiết bị"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    ...params.InputProps,
                    sx: { borderRadius: 1 },
                    endAdornment: (
                      <>
                        {deviceGroupsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {canManageCommands && selectedDeviceGroup && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: 'primary.main' }}>
                  <TerminalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Gán lệnh mới
                </Typography>

                <TextField
                  label="Tên hồ sơ lệnh"
                  fullWidth
                  value={profileName}
                  onChange={handleProfileNameChange}
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />

                <Autocomplete
                  multiple
                  options={commands}
                  getOptionLabel={(option) => `${option.command} (ID: ${option.id})`}
                  value={selectedCommands}
                  onChange={handleCommandChange}
                  loading={commandsLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chọn lệnh"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        sx: { borderRadius: 1 },
                        endAdornment: (
                          <>
                            {commandsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.command}
                        {...getTagProps({ index })}
                        color="primary"
                      />
                    ))
                  }
                />

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleSubmit}
                    disabled={!selectedDeviceGroup || selectedCommands.length === 0 || !profileName.trim() || createProfileCommandMutation.isLoading}
                    sx={{
                      borderRadius: 1,
                      py: 1,
                      px: 3,
                      boxShadow: '0px 3px 10px rgba(25, 118, 210, 0.2)'
                    }}
                  >
                    {createProfileCommandMutation.isLoading ? <CircularProgress size={24} /> : 'Gán lệnh'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
                <TerminalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Lệnh đã gán
              </Typography>

              {selectedDeviceGroup && (
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchGroupCommands()}
                  disabled={groupCommandsLoading}
                  size="small"
                  sx={{ borderRadius: 1 }}
                >
                  Làm mới
                </Button>
              )}
            </Box>

            {!selectedDeviceGroup ? (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 1,
                  '& .MuiAlert-message': { p: 1 }
                }}
              >
                Vui lòng chọn nhóm thiết bị để xem danh sách lệnh đã gán
              </Alert>
            ) : groupCommandsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : groupCommands.length > 0 ? (
              <TableContainer sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Table>
                  <TableHead sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                  }}>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Lệnh</TableCell>
                      {canManageCommands && <TableCell align="right">Thao tác</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupCommands.map((command) => (
                      <TableRow
                        key={command.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                          }
                        }}
                      >
                        <TableCell>{command.id}</TableCell>
                        <TableCell>
                          <Chip 
                            icon={<TerminalIcon />}
                            label={command.command}
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        {canManageCommands && (
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteCommand(command)}
                              sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' } }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 1,
                  '& .MuiAlert-message': { p: 1 }
                }}
              >
                Nhóm thiết bị này chưa được gán lệnh nào
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog xác nhận hủy gán lệnh */}
      <Dialog
        open={deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
          Xác nhận hủy gán lệnh
        </DialogTitle>
        <DialogContent sx={{ minWidth: '400px' }}>
          <Typography>
            Bạn có chắc chắn muốn hủy gán lệnh này khỏi nhóm thiết bị không?
          </Typography>
          <Typography color="error" sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={() => setDeleteConfirmDialog(false)}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Hủy
          </Button>
          <Button
            onClick={confirmDeleteCommand}
            color="error"
            variant="contained"
            disabled={deleteProfileCommandMutation.isLoading}
            sx={{
              borderRadius: 1,
              boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)'
            }}
          >
            {deleteProfileCommandMutation.isLoading ? <CircularProgress size={24} /> : 'Xác nhận hủy gán'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileCommandsPage;