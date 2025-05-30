import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Tabs, Tab, 
  TextField, Button, Alert, CircularProgress,
  Avatar, Divider, Grid
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Password as PasswordIcon,
  VerifiedUser as VerifiedUserIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useMutation, useQuery } from 'react-query';
import { updatePassword, getUser } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { Link } from 'react-router-dom';

const PasswordSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .required('Mật khẩu hiện tại là bắt buộc'),
  newPassword: Yup.string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .required('Mật khẩu mới là bắt buộc'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc')
});

// TabPanel component để hiển thị nội dung theo tab
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  
  // Lấy thông tin chi tiết người dùng từ API
  const { data: userDetails, isLoading, error } = useQuery(
    ['user', user?.id],
    () => getUser(user?.id),
    {
      enabled: !!user?.id, // Chỉ gọi API khi có user.id
      refetchOnWindowFocus: false
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const passwordUpdateMutation = useMutation(
    (data) => updatePassword(data.oldPassword, data.newPassword)
  );

  // Tạo avatar từ tên người dùng
  const getAvatarText = () => {
    if (userDetails?.full_name) {
      return userDetails.full_name.charAt(0).toUpperCase();
    } 
    if (userDetails?.username) {
      return userDetails.username.charAt(0).toUpperCase();
    } 
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              bgcolor: 'white', 
              color: 'primary.main',
              mr: 3,
              fontSize: '2.5rem'
            }}
          >
            {getAvatarText()}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Hồ sơ người dùng
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <VerifiedUserIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                {userDetails?.role || user?.role || 'User'}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="profile tabs"
            variant="fullWidth"
          >
            <Tab 
              icon={<PersonIcon />} 
              label="Thông tin cá nhân" 
              iconPosition="start"
            />
            <Tab 
              icon={<PasswordIcon />} 
              label="Đổi mật khẩu" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              Không thể tải thông tin người dùng: {error.message}
            </Alert>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Thông tin tài khoản
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tên đăng nhập"
                  value={userDetails?.username || user?.username || ''}
                  InputProps={{ 
                    readOnly: true,
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    )
                  }}
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={userDetails?.email || user?.email || ''}
                  InputProps={{ 
                    readOnly: true,
                    startAdornment: (
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    )
                  }}
                  variant="outlined"
                />
              </Grid>

              {(userDetails?.full_name || user?.full_name) && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    value={userDetails?.full_name || user?.full_name || ''}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                  />
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vai trò"
                  value={userDetails?.role || user?.role || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Trạng thái"
                  value={
                    userDetails?.is_active !== undefined 
                      ? (userDetails.is_active ? 'Hoạt động' : 'Bị khóa')
                      : (user?.is_active ? 'Hoạt động' : 'Bị khóa')
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>

            
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Formik
            initialValues={{
              oldPassword: '',
              newPassword: '',
              confirmPassword: ''
            }}
            validationSchema={PasswordSchema}
            onSubmit={(values, { resetForm }) => {
              passwordUpdateMutation.mutate({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
              }, {
                onSuccess: () => resetForm()
              });
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Thay đổi mật khẩu
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    
                    {passwordUpdateMutation.isSuccess && (
                      <Alert severity="success" sx={{ mb: 3 }}>
                        Mật khẩu đã được cập nhật thành công!
                      </Alert>
                    )}
                    
                    {passwordUpdateMutation.isError && (
                      <Alert severity="error" sx={{ mb: 3 }}>
                        {passwordUpdateMutation.error.response?.data?.detail || 'Đã xảy ra lỗi khi cập nhật mật khẩu'}
                      </Alert>
                    )}
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Field name="oldPassword">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Mật khẩu hiện tại"
                          type="password"
                          fullWidth
                          variant="outlined"
                          error={touched.oldPassword && Boolean(errors.oldPassword)}
                          helperText={touched.oldPassword && errors.oldPassword}
                          sx={{ mb: 2 }}
                        />
                      )}
                    </Field>
                    
                    <Field name="newPassword">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Mật khẩu mới"
                          type="password"
                          fullWidth
                          variant="outlined"
                          error={touched.newPassword && Boolean(errors.newPassword)}
                          helperText={touched.newPassword && errors.newPassword}
                          sx={{ mb: 2 }}
                        />
                      )}
                    </Field>
                    
                    <Field name="confirmPassword">
                      {({ field }) => (
                        <TextField
                          {...field}
                          label="Xác nhận mật khẩu mới"
                          type="password"
                          fullWidth
                          variant="outlined"
                          error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                          helperText={touched.confirmPassword && errors.confirmPassword}
                          sx={{ mb: 2 }}
                        />
                      )}
                    </Field>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={passwordUpdateMutation.isLoading}
                        startIcon={passwordUpdateMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <PasswordIcon />}
                      >
                        Cập nhật mật khẩu
                      </Button>
                      
                      <Button 
                        component={Link} 
                        to="/reset-password-request"
                        variant="text" 
                        color="primary"
                      >
                        Quên mật khẩu?
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default ProfilePage;