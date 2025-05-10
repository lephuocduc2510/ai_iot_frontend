import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box, Button, TextField, Typography, Paper, 
  CircularProgress, Alert, InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import jwt_decode from 'jwt-decode';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

const LoginForm = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const loginMutation = useMutation(login, {
    onSuccess: (data) => {
      const token = data.access_token;
      const decoded = jwt_decode(token);
      
      const userInfo = {
        id: decoded.id,
        username: decoded.sub,
        role: decoded.role
      };
      
      authLogin(token, userInfo);
      navigate('/dashboard');
    }
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: 400
        }}
      >
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          AI IoT System
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          Login
        </Typography>

        {loginMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {loginMutation.error.response?.data?.detail || 'Login failed'}
          </Alert>
        )}

        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={(values) => {
            loginMutation.mutate(values);
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <Field
                as={TextField}
                name="username"
                label="Username"
                fullWidth
                margin="normal"
                error={touched.username && Boolean(errors.username)}
                helperText={touched.username && errors.username}
              />
              
              <Field
                as={TextField}
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loginMutation.isLoading}
                  sx={{ py: 1.5 }}
                >
                  {loginMutation.isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Login'
                  )}
                </Button>
              </Box>
              
              <Box sx={{ mt: 2, textAlign: 'right' }}>
                <Typography variant="body2">
                  <Link to="/reset-password-request" style={{ color: 'inherit' }}>
                    Forgot password?
                  </Link>
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default LoginForm;