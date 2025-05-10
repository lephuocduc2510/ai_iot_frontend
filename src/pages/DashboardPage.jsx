import React, { useState } from 'react';
import {
  Box, Typography, Grid, Paper, Card, CardContent,
  CardHeader, Divider, Avatar, List, ListItem,
  ListItemText, ListItemIcon, Chip, CircularProgress,
  Button, IconButton, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow
} from '@mui/material';
import {
  DevicesOther, People, Memory, ArrowUpward,
  ArrowDownward, CheckCircle, Error, Refresh,
  Build, Group,
  ArrowRight,
  AccessTime,
  History,
  MoreVert,
  ShowChart
} from '@mui/icons-material';
import { useQuery } from 'react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Layout from '../components/common/Layout';
import { getAllDevices } from '../api/deviceApi';
import { getUsers } from '../api/authApi';
import { getAllCommands } from '../api/commandApi';

// Dữ liệu thống kê giả định
const generateRandomData = (count) => {
  const data = [];
  const now = new Date();

  for (let i = count; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      devices: Math.floor(Math.random() * 5) + 10 + i,
      users: Math.floor(Math.random() * 2) + 3 + Math.floor(i / 3),
      commands: Math.floor(Math.random() * 10) + 15 + i * 2,
    });
  }

  return data;
};

// Dữ liệu cảm biến giả định
const generateSensorData = (days) => {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      temperature: (Math.random() * 10 + 20).toFixed(1),
      humidity: (Math.random() * 30 + 40).toFixed(1),
      pressure: (Math.random() * 5 + 1010).toFixed(1),
    });
  }

  return data;
};

// Thống kê hoạt động gần đây
const recentActivities = [
  { id: 1, action: 'Thiết bị mới được thêm', device: 'Cảm biến nhiệt độ T100', time: '10 phút trước' },
  { id: 2, action: 'Lệnh điều khiển', device: 'Đèn phòng khách', command: 'BẬT', time: '25 phút trước' },
  { id: 3, action: 'Cảnh báo', device: 'Cảm biến khói', alert: 'Mức độ khói cao', time: '1 giờ trước' },
  { id: 4, action: 'Thiết bị offline', device: 'Camera ngoài trời', time: '2 giờ trước' },
  { id: 5, action: 'Lệnh điều khiển', device: 'Hệ thống tưới cây', command: 'BẬT', time: '3 giờ trước' }
];

// Dữ liệu thống kê
const statisticsData = generateRandomData(10);
const temperatureData = generateSensorData(7);

const DashboardPage = () => {
  // Mock data if API calls aren't working yet
  const mockDevices = [
    { id: 1, name: 'Nhiệt kế phòng khách', type: 'Temperature', location: 'Phòng khách', status: 'active' },
    { id: 2, name: 'Đèn phòng ngủ', type: 'Light', location: 'Phòng ngủ', status: 'active' },
    { id: 3, name: 'Camera ngoài trời', type: 'Camera', location: 'Sân trước', status: 'inactive' },
    { id: 4, name: 'Cảm biến khói', type: 'Smoke', location: 'Nhà bếp', status: 'active' },
    { id: 5, name: 'Điều hòa', type: 'AC', location: 'Phòng khách', status: 'active' }
  ];

  const mockUsers = [
    { id: 1, username: 'admin', email: 'admin@example.com', fullName: 'Admin User', role: 'admin', isActive: true },
    { id: 2, username: 'manager', email: 'manager@example.com', fullName: 'Manager User', role: 'manager', isActive: true },
    { id: 3, username: 'user1', email: 'user1@example.com', fullName: 'Normal User', role: 'user', isActive: true }
  ];

  const mockCommands = [
    { id: 1, name: 'Turn On Light', description: 'Bật đèn phòng khách', command_type: 'single', status: 'success' },
    { id: 2, name: 'Turn Off AC', description: 'Tắt điều hòa', command_type: 'single', status: 'failed' },
    { id: 3, name: 'Set Temperature', description: 'Đặt nhiệt độ điều hòa', command_type: 'single', status: 'success' }
  ];

  // For testing, we'll mock query results
  const { data: devices = mockDevices, isLoading: isLoadingDevices } = { data: mockDevices, isLoading: false };
  const { data: users = mockUsers, isLoading: isLoadingUsers } = { data: mockUsers, isLoading: false };
  const { data: commands = mockCommands, isLoading: isLoadingCommands } = { data: mockCommands, isLoading: false };
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getDeviceStatusCount = () => {
    if (!devices.length) return { active: 0, inactive: 0 };

    return devices.reduce(
      (counts, device) => {
        if (device.status === 'active') {
          counts.active += 1;
        } else {
          counts.inactive += 1;
        }
        return counts;
      },
      { active: 0, inactive: 0 }
    );
  };

  const getCommandStatusCount = () => {
    if (!commands.length) return { success: 0, failed: 0, pending: 0 };

    return commands.reduce(
      (counts, command) => {
        if (command.status === 'success') {
          counts.success += 1;
        } else if (command.status === 'failed') {
          counts.failed += 1;
        } else {
          counts.pending += 1;
        }
        return counts;
      },
      { success: 0, failed: 0, pending: 0 }
    );
  };

  const deviceStatus = getDeviceStatusCount();
  const commandStatus = getCommandStatusCount();

  const isDataLoading = isLoadingDevices || isLoadingUsers || isLoadingCommands || refreshing;

  return (

    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bảng điều khiển
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Làm mới
        </Button>
      </Box>

      {isDataLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Thẻ thống kê */}
          <Grid container spacing={3} sx={{ mb: 4 }} justifyItems={'center'}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <DevicesOther />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Thiết bị
                    </Typography>
                    <Typography variant="h5" component="div">
                      {devices.length}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" display="flex" alignItems="center">
                    <ArrowUpward fontSize="small" color="success" sx={{ mr: 0.5 }} />
                    {deviceStatus.active} hoạt động
                  </Typography>
                  <Typography variant="body2" display="flex" alignItems="center">
                    <ArrowDownward fontSize="small" color="error" sx={{ mr: 0.5 }} />
                    {deviceStatus.inactive} không hoạt động
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <People />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Người dùng
                    </Typography>
                    <Typography variant="h5" component="div">
                      {users.length}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {users.filter(u => u.isActive).length} hoạt động
                  </Typography>
                  <Typography variant="body2">
                    {users.filter(u => u.role === 'admin').length} quản trị viên
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                    <Memory />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Lệnh
                    </Typography>
                    <Typography variant="h5" component="div">
                      {commands.length}
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" display="flex" alignItems="center">
                    <CheckCircle fontSize="small" color="success" sx={{ mr: 0.5 }} />
                    {commandStatus.success} thành công
                  </Typography>
                  <Typography variant="body2" display="flex" alignItems="center">
                    <Error fontSize="small" color="error" sx={{ mr: 0.5 }} />
                    {commandStatus.failed} lỗi
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                    <Group />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nhóm thiết bị
                    </Typography>
                    <Typography variant="h5" component="div">
                      5
                    </Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    3 nhóm hoạt động
                  </Typography>
                  <Typography variant="body2">
                    12 thiết bị trong nhóm
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Biểu đồ và hoạt động gần đây */}
          <Grid container spacing={2}  justifyContent={'center'}>
            {/* Biểu đồ */}

            <Grid item xs={24} md={8}>
              <Paper elevation={2} sx={{
                p: 0,
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                width: '100%'
              }}>
                <Box sx={{
                  p: 3,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6" fontWeight="medium">
                    Dữ liệu cảm biến trong 7 ngày qua
                  </Typography>
                  <Box>
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <Refresh fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ height: 380, flexGrow: 1, p: 2 }}>
                  {typeof LineChart !== 'undefined' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={temperatureData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 12 }}
                          stroke="rgba(0,0,0,0.5)"
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 12 }}
                          stroke="rgba(0,0,0,0.5)"
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 12 }}
                          stroke="rgba(0,0,0,0.5)"
                        />
                        <Tooltip
                          contentStyle={{
                            borderRadius: 8,
                            boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
                            fontSize: 12
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                          iconType="circle"
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="temperature"
                          name="Nhiệt độ (°C)"
                          stroke="#8884d8"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="humidity"
                          name="Độ ẩm (%)"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="pressure"
                          name="Áp suất (hPa)"
                          stroke="#ff7300"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      flexDirection: 'column'
                    }}>
                      <ShowChart sx={{ fontSize: 40, opacity: 0.3, mb: 2 }} />
                      <Typography>Biểu đồ không khả dụng</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Cần cài đặt thư viện recharts
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Hoạt động gần đây */}

            <Grid item xs={12} md={8}>
              <Paper elevation={2} sx={{
                borderRadius: 2,
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{
                  p: 3,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                    <History sx={{ mr: 1 }} /> Hoạt động gần đây
                  </Typography>
                  <Chip
                    label={`${recentActivities.length} hoạt động`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      fontWeight: 'medium'
                    }}
                  />
                </Box>

                <List sx={{
                  p: 0,
                  overflowY: 'auto',
                  flexGrow: 1,
                  maxHeight: 334, // Để khớp với chiều cao của biểu đồ bên cạnh
                  '&::-webkit-scrollbar': {
                    width: '6px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,.2)',
                    borderRadius: '3px'
                  }
                }}>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={activity.id}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          py: 1.5,
                          px: 2,
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: (theme) => theme.palette.mode === 'dark'
                              ? 'rgba(255, 255, 255, 0.05)'
                              : 'rgba(0, 0, 0, 0.02)'
                          }
                        }}
                      >
                        <ListItemIcon sx={{
                          minWidth: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Avatar sx={{
                            width: 36,
                            height: 36,
                            bgcolor: activity.action.includes('Lệnh')
                              ? 'primary.light'
                              : activity.action.includes('Cảnh báo')
                                ? 'error.light'
                                : activity.action.includes('offline')
                                  ? 'warning.light'
                                  : 'info.light'
                          }}>
                            {activity.action.includes('Lệnh') ? (
                              <Build fontSize="small" />
                            ) : activity.action.includes('Cảnh báo') ? (
                              <Error fontSize="small" />
                            ) : activity.action.includes('offline') ? (
                              <ArrowDownward fontSize="small" />
                            ) : (
                              <DevicesOther fontSize="small" />
                            )}
                          </Avatar>
                        </ListItemIcon>

                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {activity.device}
                                {activity.command && (
                                  <Chip
                                    label={activity.command}
                                    size="small"
                                    color="primary"
                                    sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                                  />
                                )}
                                {activity.alert && (
                                  <Chip
                                    label={activity.alert}
                                    size="small"
                                    color="error"
                                    sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                                  />
                                )}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5, lineHeight: 1.2 }}
                              >
                                {activity.action}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              component="div"
                              color="text.secondary"
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mt: 0.5
                              }}
                            >
                              <AccessTime fontSize="inherit" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                              {activity.time}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < recentActivities.length - 1 && (
                        <Divider variant="inset" component="li" sx={{ ml: 7 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>

                <Box sx={{
                  p: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                  textAlign: 'center',
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)'
                }}>
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    startIcon={<List />}
                  >
                    Xem tất cả hoạt động
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>

          {/* Thiết bị gần đây */}

          <Grid container spacing={3} sx={{ mt: 2}} xs={{ width: '100% ' }} justifyContent={'center'}>
            <Grid item xs={12}>
              <Paper
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden' // Đảm bảo các góc bo tròn của bảng
                }}
              >
                <Box sx={{
                  p: 3,
                  pb: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                }}>
                  <Typography variant="h6" fontWeight="medium">
                    Thiết bị gần đây
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    sx={{ textTransform: 'none' }}
                  >
                    Xem tất cả
                  </Button>
                </Box>

                <TableContainer sx={{ maxHeight: 400 }}>
                  <Table stickyHeader sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                          }}
                        >
                          ID
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 180,
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                          }}
                        >
                          Tên thiết bị
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 120,
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                          }}
                        >
                          Loại
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 150,
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                          }}
                        >
                          Vị trí
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 'bold',
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                          }}
                        >
                          Trạng thái
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {devices.slice(0, 5).map((device) => (
                        <TableRow
                          key={device.id}
                          hover
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell sx={{ fontSize: '0.875rem' }}>{device.id}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  mr: 1.5,
                                  bgcolor: (theme) => device.status === 'active'
                                    ? theme.palette.success.light
                                    : theme.palette.grey[300]
                                }}
                              >
                                {device.type === 'Temperature' && <DevicesOther fontSize="small" />}
                                {device.type === 'Light' && <DevicesOther fontSize="small" />}
                                {device.type === 'Camera' && <DevicesOther fontSize="small" />}
                                {device.type === 'Smoke' && <DevicesOther fontSize="small" />}
                                {device.type === 'AC' && <DevicesOther fontSize="small" />}
                              </Avatar>
                              <Typography variant="body2" fontWeight="medium">
                                {device.name}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{device.type}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem' }}>{device.location}</TableCell>
                          <TableCell>
                            <Chip
                              label={device.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                              color={device.status === 'active' ? 'success' : 'default'}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderRadius: 1,
                                fontWeight: 500,
                                minWidth: 100
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {devices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 }}>
                              <DevicesOther sx={{ fontSize: 40, mb: 2, opacity: 0.3 }} />
                              <Typography variant="body1">Không có thiết bị nào</Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Thêm thiết bị để hiển thị tại đây
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {devices.length > 0 && (
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    p: 2,
                    borderTop: '1px solid rgba(0, 0, 0, 0.08)'
                  }}>
                    <Button size="small" endIcon={<ArrowRight />} sx={{ textTransform: 'none' }}>
                      Xem tất cả thiết bị
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>

  );
};

export default DashboardPage;