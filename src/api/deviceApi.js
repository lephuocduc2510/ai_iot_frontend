import axiosInstance from './axiosConfig';

// Device Groups
export const createDeviceGroup = async (groupData) => {
  const response = await axiosInstance.post('/devices/groups', groupData);
  return response.data;
};

// Đổi tên hàm để khớp với endpoint của backend
export const getDeviceGroupById = async (groupId) => {
  const response = await axiosInstance.get(`/devices/groups_by_id/${groupId}`);
  return response.data;
};

// Đổi tên hàm để khớp với endpoint của backend
export const getAllDeviceGroups = async () => {
  const response = await axiosInstance.get('/devices/groups/all');
  return response.data;
};

// Devices
export const createDevice = async (deviceData) => {
  const response = await axiosInstance.post('/devices', deviceData);
  return response.data;
};

export const getDeviceById = async (deviceId) => {
  const response = await axiosInstance.get(`/devices/${deviceId}`);
  return response.data;
};

// Đổi tên hàm để khớp với endpoint của backend
export const getAllDevices = async () => {
  const response = await axiosInstance.get('/devices');
  return response.data;
};

export const getDevicesByGroupId = async (groupId) => {
  const response = await axiosInstance.get(`/devices/device_groups/${groupId}`);
  return response.data;
};

// Tạo thiết bị mới - thêm timeout và xử lý lỗi
// export const createDevice = async (deviceData) => {
//   try {
//     const response = await axios.post('/api/v1/devices', deviceData, {
//       timeout: 10000 // timeout sau 10s nếu không có phản hồi
//     });
//     return response.data;
//   } catch (error) {
//     console.error("API Error:", error);
//     throw error; // Re-throw để useMutation có thể bắt
//   }
// };

// Thêm thiết bị vào nhóm
export const addDeviceToGroup = async (deviceId, groupId) => {
  try {
    const response = await axiosInstance.post('/api/v1/devices/add-to-group', {
      device_id: deviceId,
      group_id: groupId
    }, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const addMultipleDevicesToGroup = async (deviceIds, groupId) => {
  const response = await axiosInstance.put('/devices/add-multiple', {
    device_ids: deviceIds,
    group_id: groupId
  });
  return response.data;
};