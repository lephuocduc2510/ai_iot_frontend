// filepath: d:\Đồ án ra trường\ai_iot_frontend\src\components\common\PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const PrivateRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Debug log
  console.log("PrivateRoute - isAuthenticated:", isAuthenticated);
  console.log("PrivateRoute - isLoading:", isLoading);
  
  // Hiển thị loading khi đang kiểm tra xác thực
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Kiểm tra cả qua localStorage để debug
  const token = localStorage.getItem('access_token');
  console.log("PrivateRoute - token exists:", !!token);
  
  // Cho phép truy cập nếu đã xác thực hoặc có token
  if (isAuthenticated || !!token) {
    return <Outlet />;
  }
  
  // Chuyển hướng về trang login nếu chưa xác thực
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;