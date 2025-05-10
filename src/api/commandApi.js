import axiosInstance from './axiosConfig';

export const createCommand = async (commandData) => {
  const response = await axiosInstance.post('/command', commandData);
  return response.data;
};

export const updateCommand = async (id, command) => {
  const response = await axiosInstance.put(`/command/${id}/update`, {
    command: command
  });
  return response.data;
};

export const getCommand = async (id) => {
  const response = await axiosInstance.get(`/command/${id}`);
  return response.data;
};

export const getAllCommands = async () => {
  const response = await axiosInstance.get('/command/get/all');
  return response.data;
};

export const deleteCommand = async (id) => {
  const response = await axiosInstance.delete(`/command/delete/${id}`);
  return response.data;
};

export const deleteMultipleCommands = async (ids) => {
  const response = await axiosInstance.delete('/command/delete', {
    data: { id: ids }
  });
  return response.data;
};