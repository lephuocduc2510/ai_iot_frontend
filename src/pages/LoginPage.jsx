import React, { useState } from 'react';
import { 
  Container, Paper, Box, Typography, TextField,
  Button, CircularProgress, Alert, Link as MuiLink
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from 'react-query';
import { login } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const loginMutation = useMutation(login, {
    onSuccess: (data) => {
      // Lưu token đúng tên để phù hợp với axiosConfig
      localStorage.setItem('access_token', data.access_token);
      
      // Giải mã JWT token để lấy thông tin user
      const user = parseJwt(data.access_token);
      // Lưu thêm thông tin user vào localStorage để đảm bảo
      localStorage.setItem('user_info', JSON.stringify(user));
      
      // Cập nhật user trong context
      setUser(user);
      
      // Cập nhật context
      console.log("Login successful, user:", user);
      
      // Chuyển hướng sau đăng nhập
      const from = location.state?.from?.pathname || '/dashboard';
      console.log("Redirecting to:", from);
      navigate(from, { replace: true });
    },
    onError: (error) => {
      console.error("Login error:", error);
      setError(error.response?.data?.detail || 'Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.');
    }
  });
  // Hàm giải mã JWT token để lấy payload
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(credentials);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const resetPasswordSuccess = location.state?.resetSuccess;

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
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              AI IoT System
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Đăng nhập để truy cập hệ thống
            </Typography>
          </Box>
          
          {resetPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập với mật khẩu mới.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Tên đăng nhập"
              name="username"
              autoComplete="username"
              autoFocus
              value={credentials.username}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleInputChange}
              sx={{ mb: 3 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loginMutation.isLoading}
              sx={{ py: 1.5 }}
            >
              {loginMutation.isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Đăng nhập'
              )}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <MuiLink 
                component={Link} 
                to="/reset-password-request" 
                variant="body2"
                color="primary"
                underline="hover"
              >
                Quên mật khẩu?
              </MuiLink>
            </Box>
          </form>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} AI IoT System. Bản quyền thuộc về công ty.
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;