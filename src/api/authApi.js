import axiosInstance from './axiosConfig';

export const login = async (credentials) => {
  const response = await axiosInstance.post('/login', credentials);
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await axiosInstance.post('/request-reset-password', { email });
  return response.data;
};

// Chỉnh sửa để khớp với API backend
export const resetPassword = async (token, newPassword) => {
  const response = await axiosInstance.post(`/reset-password?token=${token}`, {
    new_password: newPassword
  });
  return response.data;
};

export const updatePassword = async (oldPassword, newPassword) => {
  const response = await axiosInstance.put('/update-password', {
    old_password: oldPassword,
    new_password: newPassword
  });
  return response.data;
};

// Chỉnh sửa để khớp với API backend
export const getUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data;
};

export const getUser = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
};

export const createUser = async (userData) => {
  try {
    console.log('Creating user with data:', userData);
    // Đảm bảo dữ liệu khớp với schema expected
    const data = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role,
      is_active: userData.isActive !== undefined ? userData.isActive : true
    };
    
    // Loại bỏ undefined/null values
    Object.keys(data).forEach(key => {
      if (data[key] === undefined || data[key] === null || data[key] === '') {
        delete data[key];
      }
    });
    
    const response = await axiosInstance.post('/users', data);
    return response.data;
  } catch (error) {
    console.error('Error in createUser:', error.response || error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  const response = await axiosInstance.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axiosInstance.delete(`/users/${userId}`);
  return response.data;
};