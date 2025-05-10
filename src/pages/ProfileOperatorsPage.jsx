import React, { useState } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { 
  getProfiles, 
  createProfileOperator, 
  getProfileOperatorByOperatorId, 
  deleteProfileOperator 
} from '../api/profileApi';
import { getUsers } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

const ProfileOperatorsPage = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [operatorProfiles, setOperatorProfiles] = useState([]);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);

  // Fetch profiles and users
  const { data: profiles = [], isLoading: profilesLoading } = useQuery('profiles', getProfiles);
  const { 
    data: users = [], 
    isLoading: usersLoading 
  } = useQuery('users', () => getUsers().then(data => 
    data.filter(user => user.role === 'Operator' && user.is_active)
  ));

  // Fetch operator profiles when operator is selected
  const { 
    refetch: fetchOperatorProfiles,
    isLoading: operatorProfilesLoading
  } = useQuery(
    ['operatorProfiles', selectedOperator?.id],
    () => getProfileOperatorByOperatorId(selectedOperator?.id),
    {
      enabled: !!selectedOperator?.id,
      onSuccess: (data) => {
        if (data && data.profiles) {
          setOperatorProfiles(Array.isArray(data.profiles) ? data.profiles : []);
        } else {
          setOperatorProfiles([]);
        }
      },
      onError: (error) => {
        console.error('Error fetching operator profiles:', error);
        setOperatorProfiles([]);
      }
    }
  );

  // Create profile operator mutation
  const createProfileOperatorMutation = useMutation(createProfileOperator, {
    onSuccess: () => {
      queryClient.invalidateQueries(['operatorProfiles', selectedOperator?.id]);
      setSuccess('Gán hồ sơ cho người vận hành thành công!');
      setSelectedProfiles([]);
      setTimeout(() => setSuccess(''), 3000);
      // Refresh the operator profiles
      if (selectedOperator?.id) {
        fetchOperatorProfiles();
      }
    },
    onError: (error) => {
      console.error('Error assigning profiles to operator:', error);
      let errorMessage = 'Đã xảy ra lỗi khi gán hồ sơ cho người vận hành';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      }
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    }
  });

  // Delete profile operator mutation
  const deleteProfileOperatorMutation = useMutation(deleteProfileOperator, {
    onSuccess: () => {
      queryClient.invalidateQueries(['operatorProfiles', selectedOperator?.id]);
      setDeleteConfirmDialog(false);
      setSuccess('Hủy gán hồ sơ thành công!');
      setTimeout(() => setSuccess(''), 3000);
      // Refresh the operator profiles
      if (selectedOperator?.id) {
        fetchOperatorProfiles();
      }
    },
    onError: (error) => {
      console.error('Error removing profile assignment:', error);
      let errorMessage = 'Đã xảy ra lỗi khi hủy gán hồ sơ';
      if (error.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail);
      }
      alert(`Lỗi: ${errorMessage}`);
      setDeleteConfirmDialog(false);
    }
  });

  const handleOperatorChange = (event, newValue) => {
    setSelectedOperator(newValue);
    setSelectedProfiles([]);
    if (newValue?.id) {
      fetchOperatorProfiles();
    } else {
      setOperatorProfiles([]);
    }
  };

  const handleProfileChange = (event, newValue) => {
    setSelectedProfiles(newValue);
  };

  const handleSubmit = () => {
    if (!selectedOperator) {
      setError('Vui lòng chọn người vận hành');
      return;
    }

    if (selectedProfiles.length === 0) {
      setError('Vui lòng chọn ít nhất một hồ sơ');
      return;
    }

    const profileOperatorData = {
      operator_id: selectedOperator.id,
      profile_ids: selectedProfiles.map(profile => profile.id)
    };

    console.log('Sending profile operator data:', profileOperatorData);
    createProfileOperatorMutation.mutate(profileOperatorData);
  };

  const handleDeleteAssignment = (assignment) => {
    setAssignmentToDelete(assignment);
    setDeleteConfirmDialog(true);
  };

  const confirmDeleteAssignment = () => {
    if (assignmentToDelete?.assignment_id) {
      deleteProfileOperatorMutation.mutate(assignmentToDelete.assignment_id);
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Gán hồ sơ cho người vận hành
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Typography variant="h6" sx={{ mb: 2 }}>
              Chọn người vận hành
            </Typography>

            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.username} (${option.email})`}
              onChange={handleOperatorChange}
              value={selectedOperator}
              loading={usersLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn người vận hành"
                  fullWidth
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {usersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {isAdmin && selectedOperator && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Gán hồ sơ mới
                </Typography>

                <Autocomplete
                  multiple
                  options={profiles.filter(p => p.is_active)}
                  getOptionLabel={(option) => option.name}
                  value={selectedProfiles}
                  onChange={handleProfileChange}
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
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.name}
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
                    startIcon={<PersonAddIcon />}
                    onClick={handleSubmit}
                    disabled={!selectedOperator || selectedProfiles.length === 0 || createProfileOperatorMutation.isLoading}
                  >
                    {createProfileOperatorMutation.isLoading ? <CircularProgress size={24} /> : 'Gán hồ sơ'}
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Hồ sơ đã gán
              </Typography>
              
              {selectedOperator && (
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchOperatorProfiles()}
                  disabled={operatorProfilesLoading}
                  size="small"
                >
                  Làm mới
                </Button>
              )}
            </Box>

            {!selectedOperator ? (
              <Alert severity="info">Vui lòng chọn người vận hành để xem danh sách hồ sơ đã gán</Alert>
            ) : operatorProfilesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : operatorProfiles.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tên hồ sơ</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      {isAdmin && <TableCell align="right">Thao tác</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {operatorProfiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell>{profile.id}</TableCell>
                        <TableCell>{profile.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={profile.is_active ? 'Hoạt động' : 'Vô hiệu'}
                            color={profile.is_active ? 'success' : 'default'}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        {isAdmin && (
                          <TableCell align="right">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteAssignment({
                                profile_id: profile.id,
                                assignment_id: profile.assignment_id
                              })}
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
              <Alert severity="info">Người vận hành này chưa được gán hồ sơ nào</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog xác nhận hủy gán hồ sơ */}
      <Dialog open={deleteConfirmDialog} onClose={() => setDeleteConfirmDialog(false)}>
        <DialogTitle>Xác nhận hủy gán</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn hủy gán hồ sơ này khỏi người vận hành không?
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
            onClick={confirmDeleteAssignment} 
            color="error" 
            variant="contained"
            disabled={deleteProfileOperatorMutation.isLoading}
          >
            {deleteProfileOperatorMutation.isLoading ? <CircularProgress size={24} /> : 'Xác nhận hủy gán'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileOperatorsPage;