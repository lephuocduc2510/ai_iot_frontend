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

// API quản lý Profile Commands
export const getProfileCommands = async (profileId) => {
  try {
    const response = await axiosInstance.get(`/profile-commands/profile/${profileId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching commands for profile ${profileId}:`, error);
    throw error;
  }
};

export const addProfileCommand = async (commandData) => {
  try {
    const response = await axiosInstance.post('/profile-commands', commandData);
    return response.data;
  } catch (error) {
    console.error('Error adding command to profile:', error);
    throw error;
  }
};

export const deleteProfileCommand = async (commandId) => {
  try {
    const response = await axiosInstance.delete(`/profile-commands/${commandId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting command ${commandId}:`, error);
    throw error;
  }
};

// API quản lý Profile Operators
export const getProfileOperators = async () => {
  try {
    const response = await axiosInstance.get('/profile-operators');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile operators:', error);
    throw error;
  }
};

export const getProfileOperatorByOperatorId = async (operatorId) => {
  try {
    const response = await axiosInstance.get(`/profile-operators/operator/${operatorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profiles for operator ${operatorId}:`, error);
    throw error;
  }
};

export const getProfileOperatorByProfileId = async (profileId) => {
  try {
    const response = await axiosInstance.get(`/profile-operators/profile/${profileId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching operators for profile ${profileId}:`, error);
    throw error;
  }
};

export const createProfileOperator = async (profileOperatorData) => {
  try {
    const response = await axiosInstance.post('/profile-operators', profileOperatorData);
    return response.data;
  } catch (error) {
    console.error('Error creating profile operator assignment:', error);
    throw error;
  }
};

export const deleteProfileOperator = async (assignmentId) => {
  try {
    const response = await axiosInstance.delete(`/profile-operators/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting profile operator assignment ${assignmentId}:`, error);
    throw error;
  }
};