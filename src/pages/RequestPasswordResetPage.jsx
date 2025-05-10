import React from 'react';
import { Container, Paper, Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import { requestPasswordReset } from '../api/authApi';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
// Thêm icon
import { Password as PasswordIcon, Email as EmailIcon } from '@mui/icons-material';

const RequestPasswordResetSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc')
});

const RequestPasswordResetPage = () => {
  const navigate = useNavigate();

  const resetRequestMutation = useMutation(
    (email) => requestPasswordReset(email),
    {
      onSuccess: () => {
        // Không chuyển hướng ngay, hiển thị thông báo thành công
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
            <PasswordIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography 
              variant="h5" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              Yêu cầu đặt lại mật khẩu
            </Typography>
          </Box>

          {resetRequestMutation.isSuccess ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.
              </Alert>
              <Button 
                component={Link} 
                to="/login"
                variant="contained" 
                color="primary" 
                fullWidth
                sx={{ mt: 2 }}
              >
                Quay lại trang đăng nhập
              </Button>
            </Box>
          ) : (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={RequestPasswordResetSchema}
              onSubmit={(values) => {
                resetRequestMutation.mutate(values.email);
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  {resetRequestMutation.isError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {resetRequestMutation.error.response?.data?.detail || 'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.'}
                    </Alert>
                  )}

                  <Typography variant="body2" color="text.secondary" paragraph>
                    Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
                  </Typography>

                  <Field name="email">
                    {({ field }) => (
                      <TextField
                        {...field}
                        type="email"
                        label="Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                        // Thêm icon email
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
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
                      disabled={resetRequestMutation.isLoading}
                      sx={{ py: 1.5 }}
                      startIcon={resetRequestMutation.isLoading ? <CircularProgress size={20} color="inherit" /> : <PasswordIcon />}
                    >
                      {resetRequestMutation.isLoading ? 'Đang gửi...' : 'Yêu cầu đặt lại mật khẩu'}
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

export default RequestPasswordResetPage;