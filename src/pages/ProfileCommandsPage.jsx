import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Autocomplete,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { addProfileCommand, getProfiles, getProfileCommands, deleteProfileCommand } from '../api/profileApi';
import { useAuth } from '../hooks/useAuth';

const ProfileCommandsPage = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newCommand, setNewCommand] = useState('');
  const [commands, setCommands] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [commandToDelete, setCommandToDelete] = useState(null);

  // Fetch profiles for dropdown
  const {
    data: profiles = [],
    isLoading: profilesLoading
  } = useQuery('profiles', getProfiles);

  // Fetch commands for selected profile
  const {
    data: profileCommands = [],
    isLoading: commandsLoading,
    refetch: refetchCommands
  } = useQuery(
    ['profileCommands', selectedProfile?.id],
    () => getProfileCommands(selectedProfile.id),
    {
      enabled: !!selectedProfile?.id,
      onSuccess: (data) => {
        if (data && Array.isArray(data)) {
          setCommands(data);
        }
      }
    }
  );

  const createCommandMutation = useMutation(addProfileCommand, {
    onSuccess: () => {
      queryClient.invalidateQueries(['profileCommands', selectedProfile?.id]);
      setSuccess('Thêm lệnh vào hồ sơ thành công!');
      setNewCommand('');
      refetchCommands();
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      console.error('Error adding command to profile:', error);
      let errorMessage = 'Đã xảy ra lỗi khi thêm lệnh vào hồ sơ';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      }
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  });

  const deleteCommandMutation = useMutation(deleteProfileCommand, {
    onSuccess: () => {
      queryClient.invalidateQueries(['profileCommands', selectedProfile?.id]);
      refetchCommands();
      setDeleteConfirmDialog(false);
      setSuccess('Xóa lệnh thành công!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (error) => {
      console.error('Error deleting command:', error);
      let errorMessage = 'Đã xảy ra lỗi khi xóa lệnh';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      }
      alert(`Lỗi: ${errorMessage}`);
      setDeleteConfirmDialog(false);
    }
  });

  const handleProfileChange = (event, newValue) => {
    setSelectedProfile(newValue);
    setNewCommand('');
  };

  const handleAddCommand = () => {
    if (!selectedProfile) {
      setError('Vui lòng chọn hồ sơ trước khi thêm lệnh');
      return;
    }

    if (!newCommand.trim()) {
      setError('Vui lòng nhập lệnh');
      return;
    }

    const commandData = {
      profile_id: selectedProfile.id,
      command: newCommand.trim()
    };

    console.log('Adding command:', commandData);
    createCommandMutation.mutate(commandData);
  };

  const handleDeleteCommand = (command) => {
    setCommandToDelete(command);
    setDeleteConfirmDialog(true);
  };

  const confirmDeleteCommand = () => {
    if (commandToDelete?.id) {
      deleteCommandMutation.mutate(commandToDelete.id);
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Quản lý lệnh hồ sơ
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chọn hồ sơ
            </Typography>
            
            <Autocomplete
              options={profiles}
              getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
              onChange={handleProfileChange}
              value={selectedProfile}
              loading={profilesLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn hồ sơ"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {profilesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {selectedProfile && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Thông tin hồ sơ:
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>ID:</strong> {selectedProfile.id}
                </Typography>
                <Typography>
                  <strong>Tên:</strong> {selectedProfile.name}
                </Typography>
                <Typography>
                  <strong>Trạng thái:</strong> {selectedProfile.is_active ? 'Hoạt động' : 'Vô hiệu'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

              <Typography variant="h6" sx={{ mb: 2 }}>
                Thêm lệnh mới
              </Typography>
              
              {isAdmin && selectedProfile && (
                <Box sx={{ display: 'flex' }}>
                  <TextField
                    label="Nhập lệnh"
                    variant="outlined"
                    fullWidth
                    value={newCommand}
                    onChange={(e) => setNewCommand(e.target.value)}
                    disabled={!selectedProfile}
                    sx={{ mr: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleAddCommand}
                    disabled={!selectedProfile || !newCommand.trim() || createCommandMutation.isLoading}
                  >
                    {createCommandMutation.isLoading ? <CircularProgress size={24} /> : 'Thêm'}
                  </Button>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Danh sách lệnh
              </Typography>
              
              {selectedProfile && (
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => refetchCommands()}
                  disabled={commandsLoading}
                  size="small"
                >
                  Làm mới
                </Button>
              )}
            </Box>

            {!selectedProfile ? (
              <Alert severity="info">Vui lòng chọn hồ sơ để xem danh sách lệnh</Alert>
            ) : commandsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : commands.length > 0 ? (
              <List>
                {commands.map((cmd) => (
                  <ListItem
                    key={cmd.id}
                    secondaryAction={
                      isAdmin && (
                        <IconButton 
                          edge="end" 
                          color="error"
                          onClick={() => handleDeleteCommand(cmd)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                    divider
                  >
                    <ListItemText
                      primary={cmd.command}
                      secondary={`ID: ${cmd.id} • Ngày tạo: ${new Date(cmd.created_at).toLocaleString('vi-VN')}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Alert severity="info">Không có lệnh nào trong hồ sơ này</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog xác nhận xóa lệnh */}
      <Dialog open={deleteConfirmDialog} onClose={() => setDeleteConfirmDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa lệnh "{commandToDelete?.command}" không?
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
            onClick={confirmDeleteCommand} 
            color="error" 
            variant="contained"
            disabled={deleteCommandMutation.isLoading}
          >
            {deleteCommandMutation.isLoading ? <CircularProgress size={24} /> : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileCommandsPage;