import axiosInstance from './axiosConfig';

// API quản lý Profile
export const getProfiles = async () => {
  try {
    const response = await axiosInstance.get('/profiles');
    return response.data;
  } catch (error) {
    console.error('Error fetching profiles:', error);
    throw error;
  }
};

export const getProfileById = async (profileId) => {
  try {
    const response = await axiosInstance.get(`/profiles/${profileId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile ${profileId}:`, error);
    throw error;
  }
};

export const createProfile = async (profileData) => {
  try {
    const response = await axiosInstance.post('/profiles', profileData);
    return response.data;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

export const updateProfile = async (profileId, profileData) => {
  try {
    const response = await axiosInstance.put(`/profiles/${profileId}`, profileData);
    return response.data;
  } catch (error) {
    console.error(`Error updating profile ${profileId}:`, error);
    throw error;
  }
};

export const deleteProfile = async (profileId) => {
  try {
    const response = await axiosInstance.delete(`/profiles/${profileId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting profile ${profileId}:`, error);
    throw error;
  }
};

// API quản lý Profile Commands - Cập nhật theo profile_commands.py
export const getProfileCommands = async (profileId) => {
  try {
    // Giữ nguyên endpoint này vì có thể được định nghĩa ở router profiles
    const response = await axiosInstance.get(`/profiles/${profileId}/commands`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching commands for profile ${profileId}:`, error);
    throw error;
  }
};

export const addProfileCommand = async (commandData) => {
  try {
    // Cập nhật theo router prefix trong profile_commands.py
    const response = await axiosInstance.post('/profile-command', commandData);
    return response.data;
  } catch (error) {
    console.error('Error adding command to profile:', error);
    throw error;
  }
};

export const deleteProfileCommand = async (commandId) => {
  try {
    // Cập nhật theo router prefix trong profile_commands.py
    const response = await axiosInstance.delete(`/profile-command/${commandId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting command ${commandId}:`, error);
    throw error;
  }
};

// API quản lý Profile Operators - Cập nhật theo profile_operators.py
export const getProfileOperators = async () => {
  try {
    // Cập nhật theo router prefix trong profile_operators.py
    const response = await axiosInstance.get('/profile_operators');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile operators:', error);
    throw error;
  }
};

// Cập nhật hàm getProfileOperatorByOperatorId
export const getProfileOperatorByOperatorId = async (operatorId) => {
  try {
    // Sửa URL thành /profile_operators/{operatorId}
    const response = await axiosInstance.get(`/profile_operators/${operatorId}`);
    console.log('API response for getProfileOperatorByOperatorId:', response.data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Trả về một đối tượng trống nếu không tìm thấy
      return { 
        operator_id: operatorId,
        profile_id: []
      };
    }
    throw error;
  }
};

export const getProfileOperatorByProfileId = async (profileId) => {
  try {
    // Giả định từ cấu trúc API nhưng không có trong file profile_operators.py
    // Có thể cần kiểm tra endpoint chính xác
    const response = await axiosInstance.get(`/profile_operators/profile/${profileId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching operators for profile ${profileId}:`, error);
    throw error;
  }
};

// Cập nhật hàm createProfileOperator
export const createProfileOperator = async (data) => {
  try {
    const profileOperatorData = {
      operator_id: data.operator_id,
      profile_id: data.profile_ids // Lưu ý rằng backend mong đợi 'profile_id' không phải 'profile_ids'
    };

    console.log('Sending profile operator data:', profileOperatorData);
    const response = await axiosInstance.post('/profile_operators', profileOperatorData);
    return response.data;
  } catch (error) {
    console.error('Error creating profile operator:', error);
    throw error;
  }
};

export const deleteProfileOperator = async (assignmentId) => {
  try {
    // Cập nhật để phù hợp với prefix router trong profile_operators.py
    const response = await axiosInstance.delete(`/profile_operators/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting profile operator assignment ${assignmentId}:`, error);
    throw error;
  }
};