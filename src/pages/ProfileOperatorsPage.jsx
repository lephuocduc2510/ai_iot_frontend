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
import axiosInstance from '../api/axiosConfig';
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

  // Lấy danh sách người dùng có role là Operator
  // Lấy danh sách người dùng có role là Operator
  const {
    data: operators = [],
    isLoading: operatorsLoading,
    error: operatorsError
  } = useQuery('operators', async () => {
    try {
      // Sử dụng endpoint "/users" từ users.py
      const response = await axiosInstance.get('/users');
      console.log('Fetched operators:', response.data);
      // Lọc chỉ lấy người dùng có role là "Operator"
      return response.data.filter(user => user.role === 'Operator');
    } catch (error) {
      console.error('Error fetching operators:', error);
      throw error;
    }
  });

  // Lấy danh sách tất cả profiles
  const {
    data: profiles = [],
    isLoading: profilesLoading,
    error: profilesError,
    refetch: refetchProfiles  // Thêm refetch cho profiles
  } = useQuery('profiles', async () => {
    try {
      // Sử dụng endpoint "/profiles" từ profiles.py
      console.log('Fetching profiles...');
      const response = await axiosInstance.get('/profiles');
      console.log('Profiles response:', response.data);
      return response.data.filter(profile => profile.is_active !== false);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
  });
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
        console.log('Profile operator data received:', data);
        if (data && Array.isArray(data.profile_id)) {
          // Lấy thông tin chi tiết của các profile từ danh sách profiles đã tải
          const profileDetails = profiles.filter(profile =>
            data.profile_id.includes(profile.id)
          );

          console.log('Mapped profile details:', profileDetails);
          setOperatorProfiles(profileDetails);
        } else {
          setOperatorProfiles([]);
        }
      },
      onError: (error) => {
        console.error('Error fetching operator profiles:', error);
        if (error.response && error.response.status === 404) {
          // Nếu 404, nghĩa là người vận hành chưa có hồ sơ nào
          setOperatorProfiles([]);
        } else {
          setError('Lỗi khi tải danh sách hồ sơ của người vận hành này');
          setTimeout(() => setError(''), 5000);
          setOperatorProfiles([]);
        }
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
      setError(errorMessage);
      setDeleteConfirmDialog(false);
      setTimeout(() => setError(''), 5000);
    }
  });

  // Cập nhật hàm handleOperatorChange để tải mới danh sách hồ sơ
  const handleOperatorChange = (event, newValue) => {
    setSelectedOperator(newValue);
    setSelectedProfiles([]);

    if (newValue?.id) {
      // Tải các hồ sơ đã gán
      fetchOperatorProfiles();

      // Đồng thời tải mới danh sách tất cả hồ sơ
      console.log('Operator selected, refreshing profiles list');
      refetchProfiles(); // Gọi lại API để cập nhật danh sách hồ sơ
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

  // Kiểm tra quyền quản lý - Admin, Supervisor hoặc TeamLead
  const canManageAssignments = currentUser &&
    ['Admin', 'Supervisor', 'TeamLead'].includes(currentUser.role);

  useEffect(() => {
    // Hiển thị lỗi nếu không load được operators hoặc profiles
    if (operatorsError) {
      setError('Không thể tải danh sách người vận hành. Vui lòng thử lại.');
    } else if (profilesError) {
      setError('Không thể tải danh sách hồ sơ. Vui lòng thử lại.');
    }
  }, [operatorsError, profilesError]);

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
        Gán hồ sơ cho người vận hành
      </Typography>

      {!canManageAssignments && (
        <Alert
          severity="warning"
          sx={{
            mb: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          Bạn không có quyền quản lý việc gán hồ sơ. Chỉ Admin, Supervisor và TeamLead mới có quyền này.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium', color: 'primary.main' }}>
              Chọn người vận hành
            </Typography>

            <Autocomplete
              options={operators}
              getOptionLabel={(option) => `${option.username} (${option.email || 'Không có email'})`}
              onChange={handleOperatorChange}
              value={selectedOperator}
              loading={operatorsLoading}
              disabled={!canManageAssignments}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn người vận hành"
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                  InputProps={{
                    ...params.InputProps,
                    sx: { borderRadius: 1 },
                    endAdornment: (
                      <>
                        {operatorsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />

            {canManageAssignments && selectedOperator && (
              <Box sx={{ mt: 4 }}>
                <Divider sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium', color: 'primary.main' }}>
                  Gán hồ sơ mới
                </Typography>

                <Autocomplete
                  multiple
                  options={profiles}
                  getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
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
                        sx: { borderRadius: 1 },
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
                    sx={{
                      borderRadius: 1,
                      py: 1,
                      px: 3,
                      boxShadow: '0px 3px 10px rgba(25, 118, 210, 0.2)'
                    }}
                  >
                    {createProfileOperatorMutation.isLoading ? <CircularProgress size={24} /> : 'Gán hồ sơ'}
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
                Hồ sơ đã gán
              </Typography>

              {selectedOperator && (
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => fetchOperatorProfiles()}
                  disabled={operatorProfilesLoading}
                  size="small"
                  sx={{ borderRadius: 1 }}
                >
                  Làm mới
                </Button>
              )}
            </Box>

            {!selectedOperator ? (
              <Alert
                severity="info"
                sx={{
                  borderRadius: 1,
                  '& .MuiAlert-message': { p: 1 }
                }}
              >
                Vui lòng chọn người vận hành để xem danh sách hồ sơ đã gán
              </Alert>
            ) : operatorProfilesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : operatorProfiles.length > 0 ? (
              <TableContainer sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                <Table>
                  <TableHead sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                  }}>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Tên hồ sơ</TableCell>
                      <TableCell>Mô tả</TableCell>
                      {canManageAssignments && <TableCell align="right">Thao tác</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {operatorProfiles.map((profile) => (
                      <TableRow
                        key={profile.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                          }
                        }}
                      >
                        <TableCell>{profile.id}</TableCell>
                        <TableCell>{profile.name}</TableCell>
                        <TableCell>{profile.description?.substring(0, 50) || '-'}</TableCell>
                        {canManageAssignments && (
                          <TableCell align="right">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteAssignment({
                                profile_id: profile.id,
                                assignment_id: profile.assignment_id
                              })}
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
                Người vận hành này chưa được gán cho hồ sơ nào
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog xác nhận hủy gán hồ sơ */}
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
          Xác nhận hủy gán
        </DialogTitle>
        <DialogContent sx={{ minWidth: '400px' }}>
          <Typography>
            Bạn có chắc chắn muốn hủy gán hồ sơ này khỏi người vận hành không?
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
            onClick={confirmDeleteAssignment}
            color="error"
            variant="contained"
            disabled={deleteProfileOperatorMutation.isLoading}
            sx={{
              borderRadius: 1,
              boxShadow: '0 4px 10px rgba(211, 47, 47, 0.3)'
            }}
          >
            {deleteProfileOperatorMutation.isLoading ? <CircularProgress size={24} /> : 'Xác nhận hủy gán'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileOperatorsPage;