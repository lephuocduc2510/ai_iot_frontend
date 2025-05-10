import React, { createContext, useEffect, useState } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Trong component AuthProvider
useEffect(() => {
  // Kiểm tra cả token và thông tin user đã lưu
  const token = localStorage.getItem('access_token');
  const storedUser = localStorage.getItem('user_info');
  
  console.log("Stored token:", token);
  console.log("Stored user:", storedUser);
  
  if (token && storedUser) {
    try {
      // Parse thông tin đã lưu
      const userData = JSON.parse(storedUser);
      console.log("Loaded user data:", userData);
      
      // Đảm bảo role mặc định nếu không có
      if (!userData.role) {
        userData.role = 'user';  // Set role mặc định
      }
      
      setUser(userData);
      setIsAuthenticated(true);
    } catch (e) {
      console.error("Error parsing user data:", e);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
    }
  }
  
  setIsLoading(false);
}, []);

  // Cập nhật hàm setUser để đồng thời cập nhật isAuthenticated
  const updateUser = (userData) => {
    console.log("AuthContext: Updating user", userData);
    setUser(userData);
    setIsAuthenticated(!!userData);
  };

  const logout = () => {
    console.log("AuthContext: Logging out");
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Hàm kiểm tra quyền người dùng
  const hasPermission = (requiredRoles) => {
    if (!user || !user.role) return false;
    return requiredRoles.includes(user.role);
  };

  const value = {
    user,
    setUser: updateUser,
    isAuthenticated,
    isLoading,
    logout,
    hasPermission
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};