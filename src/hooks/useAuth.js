// filepath: d:\Đồ án ra trường\ai_iot_frontend\src\hooks\useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';  // Đảm bảo đường dẫn chính xác

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth phải được sử dụng trong AuthProvider");
  }
  
  return context;
};