import React, { useState, useEffect } from 'react';
import { Container, Paper, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import { resetPassword } from '../api/authApi';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
// Thêm icon
import { Password as PasswordIcon, Lock as LockIcon, LockReset as LockResetIcon } from '@mui/icons-material';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu mới là bắt buộc'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc')
});

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setTokenError('Token không hợp lệ hoặc đã hết hạn');
    }
  }, [searchParams]);

  const resetPasswordMutation = useMutation(
    (data) => resetPassword(data.token, data.newPassword),
    {
      onSuccess: () => {
        setTimeout(() => {
          navigate('/login', { state: { resetSuccess: true } });
        }, 2000);
      }
    }
  );

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Paper 
          elevation={6} 
          sx={{ 
            padding: 4, 
            borderRadius: 2,
            backgroundColor: 'background.paper'
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            {/* Thêm icon */}
            <LockResetIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography 
              variant="h5" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Đặt lại mật khẩu
            </Typography>
          </Box>

          {tokenError ? (
            <Box>
              <Alert severity="error" sx={{ mb: 3 }}>
                {tokenError}
              </Alert>
              <Button 
                component={Link} 
                to="/reset-password-request"
                variant="contained" 
                color="primary" 
                fullWidth
                startIcon={<PasswordIcon />}
              >
                Yêu cầu đặt lại mật khẩu mới
              </Button>
            </Box>
          ) : resetPasswordMutation.isSuccess ? (
            <Alert 
              severity="success"
              icon={<LockIcon />}
              sx={{ 
                mb: 3,
                '& .MuiAlert-icon': { 
                  fontSize: 28
                } 
              }}
            >
              Mật khẩu đã được đặt lại thành công! Đang chuyển hướng đến trang đăng nhập...
            </Alert>
          ) : (
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={ResetPasswordSchema}
              onSubmit={(values) => {
                resetPasswordMutation.mutate({
                  token,
                  newPassword: values.password
                });
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  {resetPasswordMutation.isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {resetPasswordMutation.error.response?.data?.detail || 'Đã xảy ra lỗi khi đặt lại mật khẩu'}
                    </Alert>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Nhập mật khẩu mới của bạn bên dưới:
                  </Typography>

                  <Field name="password">
                    {({ field }) => (
                      <TextField
                        {...field}
                        type="password"
                        label="Mật khẩu mới"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        InputProps={{
                          startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    )}
                  </Field>

                  <Field name="confirmPassword">
                    {({ field }) => (
                      <TextField
                        {...field}
                        type="password"
                        label="Xác nhận mật khẩu mới"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        InputProps={{
                          startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    )}
                  </Field>

                  <Box sx={{ mt: 4 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      disabled={resetPasswordMutation.isLoading}
                      startIcon={resetPasswordMutation.isLoading ? 
                        <CircularProgress size={20} color="inherit" /> : 
                        <LockResetIcon />
                      }
                      sx={{ py: 1.5 }}
                    >
                      {resetPasswordMutation.isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              <Link to="/login" style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center' }}>
                ← Quay lại trang đăng nhập
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResetPasswordPage;