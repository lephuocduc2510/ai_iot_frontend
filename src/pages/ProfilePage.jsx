import React, { useState } from 'react';
import { 
  Container, Box, Typography, Paper, Tabs, Tab, 
  TextField, Button, Alert, CircularProgress,
  Avatar, Divider, Grid
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Password as PasswordIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import { useMutation } from 'react-query';
import { updatePassword } from '../api/authApi';
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const passwordUpdateMutation = useMutation(
    (data) => updatePassword(data.oldPassword, data.newPassword),
    {
      onSuccess: () => {
        // Xử lý khi cập nhật thành công
      }
    }
  );

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
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Hồ sơ người dùng
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <VerifiedUserIcon sx={{ mr: 1 }} />
              <Typography variant="subtitle1">
                {user?.role || 'User'}
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
                value={user?.username || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={user?.email || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vai trò"
                value={user?.role || ''}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Trạng thái"
                value={user?.is_active ? 'Hoạt động' : 'Bị khóa'}
                InputProps={{ readOnly: true }}
                variant="outlined"
              />
            </Grid>
          </Grid>
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