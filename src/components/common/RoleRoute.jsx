import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Typography, Paper, Box } from '@mui/material';

/**
 * Component kiểm tra quyền truy cập dựa trên vai trò
 * @param {Array} allowedRoles - Mảng các vai trò được phép truy cập
 * @param {React.ReactNode} children - Component con để render nếu có quyền
 * @param {boolean} navigate - Nếu true, chuyển hướng đến trang chính nếu không có quyền
 */
const RoleRoute = ({ allowedRoles = [], children, navigate = false }) => {
  const { user } = useAuth();
  
  // Kiểm tra xem người dùng có quyền truy cập không
  const hasAccess = user && allowedRoles.includes(user.role);
  
  // Nếu không có quyền và chọn chuyển hướng
  if (!hasAccess && navigate) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Nếu không có quyền, hiển thị thông báo từ chối truy cập
  if (!hasAccess) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Truy cập bị từ chối
          </Typography>
          <Typography variant="body1">
            Bạn không có quyền truy cập vào trang này.
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Vui lòng liên hệ quản trị viên nếu bạn cần trợ giúp.
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  // Nếu có quyền, hiển thị component con
  return children;
};

export default RoleRoute;