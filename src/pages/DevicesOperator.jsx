import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Button, Paper, Tooltip,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination,
  CircularProgress, Alert, Chip,
  Divider, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, InputAdornment,
  IconButton
} from '@mui/material';
import {
  Refresh, CheckCircle, Cancel,
  DevicesOther, Link as LinkIcon,
  Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
  Terminal as TerminalIcon, Close as CloseIcon,
  Fullscreen as FullscreenIcon, FullscreenExit as FullscreenExitIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from 'react-query';
import axiosInstance from '../api/axiosConfig';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { SearchAddon } from 'xterm-addon-search';
import 'xterm/css/xterm.css';
import io from 'socket.io-client';

// Hàm để kết nối SSH với thiết bị
const connectToDevice = async (connectionData) => {
  const response = await axiosInstance.post('/operator/connect-device', connectionData);
  // Thêm trường status mặc định vào response
  return { ...response.data, status: "Đang hoạt động" };
};

// Hàm để lấy thiết bị của operator
const getOperatorDevices = async () => {
  const response = await axiosInstance.get('/operator/devices');
  console.log('Fetched devices:', response.data);
  return response.data;
};

const DevicesOperator = () => {
  // State
  const [testCommand, setTestCommand] = useState('ls -la');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const token = localStorage.getItem('access_token') || '';

  // State cho connect dialog
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [connectingDevice, setConnectingDevice] = useState(null);
  const [sshUsername, setSshUsername] = useState('');
  const [sshPassword, setSshPassword] = useState('');
  const [connectError, setConnectError] = useState('');
  const [connectSuccess, setConnectSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State cho terminal
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const terminalRef = useRef(null);
  const terminalInstance = useRef(null);
  const socketRef = useRef(null);
  const fitAddonRef = useRef(null);
  const searchAddonRef = useRef(null);
  const sessionIdRef = useRef(null);

  // Command buffer để lưu lệnh đang nhập
  const [interactiveMode, setInteractiveMode] = useState(false);

  useEffect(() => {
    console.log('Interactive mode changed:', interactiveMode);
  }, [interactiveMode]);
  // Cleanup cho terminal và socket khi component unmount
  useEffect(() => {
    return () => {
      if (terminalInstance.current) terminalInstance.current.dispose();
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Thiết lập kích thước terminal khi cửa sổ thay đổi
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonRef.current && terminalOpen) fitAddonRef.current.fit();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [terminalOpen]);

  // Thêm hàm test API riêng biệt, không liên quan đến luồng chính
  const testAPI = () => {
    if (!terminalInstance.current || !connectingDevice) return;

    const terminal = terminalInstance.current;
    terminal.write('\r\n\x1B[1;33m===== TEST API =====\x1B[0m\r\n');
    terminal.write(`\x1B[1;33mĐang thử API với lệnh: ${testCommand}\x1B[0m\r\n`);

    // Gọi API thực hiện lệnh
    fetch('http://127.0.0.1:8000/api/v1/operator/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        device_id: connectingDevice.id,
        command: testCommand
      })
    })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => {
            terminal.write('\r\n\x1B[1;32mAPI trả về thành công:\x1B[0m\r\n');
            terminal.write(`\x1B[37m${JSON.stringify(data, null, 2)}\x1B[0m\r\n`);
            terminal.write('\r\n');
          });
        } else {
          return res.json().catch(() => ({ message: 'Lỗi không xác định' }))
            .then(err => {
              terminal.write(`\r\n\x1B[1;31mAPI trả về lỗi (${res.status}):\x1B[0m\r\n`);
              terminal.write(`\x1B[1;31m${err.message || err.detail || JSON.stringify(err)}\x1B[0m\r\n`);
              terminal.write('\r\n');
            });
        }
      })
      .catch(err => {
        terminal.write(`\r\n\x1B[1;31mLỗi kết nối API: ${err.message}\x1B[0m\r\n`);
        terminal.write('\r\n');
      });
  };

  // Mutation cho kết nối SSH
  const connectMutation = useMutation(connectToDevice, {
    onSuccess: (data) => {
      setConnectSuccess('Kết nối thành công! Đang mở terminal...');
      console.log('Kết nối thành công:', data);
      if (data.session_id) {
        sessionIdRef.current = data.session_id;
        setTimeout(() => {
          setConnectDialogOpen(false);
          openTerminal();
        }, 1000);
      } else {
        setConnectError('Không nhận được session ID từ server');
      }
    },
    onError: (error) => {
      setConnectError(error.response?.data?.detail || 'Lỗi kết nối đến thiết bị');
    }
  });

  // Lấy danh sách thiết bị của operator hiện tại
  const {
    data: devices = [],
    isLoading,
    isError,
    refetch: refetchDevices
  } = useQuery('operatorDevices', getOperatorDevices);

  // Handler cho phân trang
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handlers cho connect dialog
  const handleOpenConnectDialog = (device) => {
    setConnectingDevice(device);
    setConnectDialogOpen(true);
    setConnectError('');
    setConnectSuccess('');
  };
  const handleCloseConnectDialog = () => {
    setConnectDialogOpen(false);
    resetConnectForm();
  };
  const resetConnectForm = () => {
    setSshUsername('');
    setSshPassword('');
    setConnectingDevice(null);
    setConnectError('');
    setConnectSuccess('');
  };
  const handleConnectSubmit = () => {
    if (!connectingDevice) return;
    if (!sshUsername.trim()) {
      setConnectError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!sshPassword) {
      setConnectError('Vui lòng nhập mật khẩu');
      return;
    }
    setConnectError('');
    connectMutation.mutate({
      ip_device: connectingDevice.id,
      username: sshUsername,
      password: sshPassword
    });
  };
  const handleTogglePasswordVisibility = () => setShowPassword(!showPassword);

  // Hàm mở và khởi tạo terminal
  const openTerminal = () => {
    setTerminalOpen(true);
    setTimeout(() => {
      initTerminal();
    }, 100);
  };
  // Hàm khởi tạo terminal
  const initTerminal = () => {
    if (!terminalRef.current) return;
    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, "Liberation Mono", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#f0f0f0',
        cursor: '#aeafad',
        selectionBackground: '#5DA5D533'
      },
      convertEol: true,
      scrollback: 1000,
      cols: 80,  // Đặt kích thước cố định
      rows: 24   // cho terminal để nano hiển thị đúng
    });
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();
    const searchAddon = new SearchAddon();
    fitAddonRef.current = fitAddon;
    searchAddonRef.current = searchAddon;
    terminal.loadAddon(fitAddon);
    terminal.loadAddon(webLinksAddon);
    terminal.loadAddon(searchAddon);
    terminal.open(terminalRef.current);
    setTimeout(() => terminal.focus(), 100);
    if (connectingDevice) {
      terminal.write(
        `\x1b[1;36mThông tin thiết bị:\x1b[0m\r\n` +
        `Hostname: ${connectingDevice.hostname}\r\n` +
        `IP: ${connectingDevice.ip_address}\r\n` +
        `SSH Port: ${connectingDevice.ssh_port || '2001'}\r\n` +
        `Trạng thái: ${connectingDevice.status === 'Đang hoạt động' ? 'Đang hoạt động' : 'Đang hoạt động'}\r\n` +
        `Ngày tạo: ${formatDate(connectingDevice.created_at)}\r\n\r\n`
      );
      // Gọi API thực hiện lệnh ls
      // fetch('http://127.0.0.1:8000/api/v1/operator/execute', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     // Nếu có token, thêm Authorization ở đây
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({
      //     device_id: connectingDevice.id,
      //     command: 'ls'
      //   })
      // })
      //   .then(res => res.json())
      //   .then(data => {
      //     if (data.success) {
      //       terminal.write(`\x1b[1;32m${data.output}\x1b[0m\r\n`);
      //     } else {
      //       terminal.write(`\x1b[1;31m${data.message || 'Lỗi khi thực thi lệnh.'}\x1b[0m\r\n`);
      //     }
      //   })
      //   .catch(err => {
      //     terminal.write(`\x1b[1;31mLỗi kết nối API: ${err.message}\x1b[0m\r\n`);
      //   });
    }
    fitAddon.fit();
    terminal.focus();
    terminalInstance.current = terminal;
    connectToSocketServer(terminal);
  };
  // Hàm kết nối với socket.io server
  const connectToSocketServer = (terminal) => {
    // Tạo kết nối socket
    const socket = io('http://localhost:8001', {
      path: '/socket.io',
      query: {
        sessionId: sessionIdRef.current
      },
      reconnection: true,      // Tự động kết nối lại
      reconnectionAttempts: 5, // Số lần thử kết nối lại
      reconnectionDelay: 1000  // Khoảng thời gian giữa các lần thử 
    });
    socketRef.current = socket;

    // Xử lý khi kết nối thành công
    socket.on('connect', () => {
      console.log('Socket connected to server');
      terminal.write('\r\n\x1B[1;32mĐã kết nối tới server.\x1B[0m\r\n');

      // Gửi thông tin SSH
      socket.emit('start_ssh', {
        host: connectingDevice.ip_address,
        port: parseInt(connectingDevice.ssh_port || 2001),
        username: sshUsername,
        password: sshPassword
      });

      // Gửi kích thước terminal
      socket.emit('resize', {
        cols: terminal.cols,
        rows: terminal.rows
      });
    });

    // XỬ LÝ DỮ LIỆU TỪ SERVER
    socket.on('data', (data) => {
      terminal.write(data);
    });

    // Xử lý lỗi kết nối
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      terminal.write(`\r\n\x1B[1;31mLỗi kết nối: ${error}\x1B[0m\r\n`);
    });

    // Xử lý disconnect và errors
    socket.on('disconnect', () => {
      console.log('Socket disconnected from server');
      terminal.write('\r\n\x1B[1;31mĐã mất kết nối với server.\x1B[0m\r\n');
      setInteractiveMode(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      terminal.write(`\r\n\x1B[1;31mLỗi: ${error}\x1B[0m\r\n`);
    });

    // XỬ LÝ DỮ LIỆU TỪ CLIENT (người dùng nhập vào terminal) - ĐƠN GIẢN HÓA
    terminal.onData((data) => {
      // ĐƠN GIẢN HÓA: Gửi mọi thứ người dùng nhập trực tiếp đến SSH
      if (socketRef.current) {
        socketRef.current.emit('data', data);
      }
    });

    // XỬ LÝ RESIZE TERMINAL
    terminal.onResize((size) => {
      if (socketRef.current) {
        socketRef.current.emit('resize', { cols: size.cols, rows: size.rows });
      }
    });
  };

  // Sửa phương thức checkCommandAndExecute

  const checkCommandAndExecute = (command, terminal) => {
    // Không làm gì nếu lệnh rỗng
    if (!command.trim()) {
      console.log('Empty command, not executing');
      socketRef.current.emit('data', '\r');
      return;
    }

    // Xác định nếu là lệnh tương tác
    const isInteractiveCmd = command.startsWith('nano') ||
      command.startsWith('vim') ||
      command.startsWith('top') ||
      command.startsWith('less') ||
      command.startsWith('more') ||
      command.startsWith('vi');

    console.log(`Processing command: ${command} (interactive: ${isInteractiveCmd})`);

    // Kiểm tra qua API
    fetch('http://127.0.0.1:8000/api/v1/operator/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        device_id: connectingDevice.id,
        command: command
      })
    })
      .then(async res => {
        if (res.status === 200) {
          console.log(`API check successful for ${isInteractiveCmd ? 'interactive' : 'regular'} command`);

          // Nếu là lệnh tương tác, bật chế độ tương tác
          if (isInteractiveCmd) {
            console.log('Enabling interactive mode');
            setInteractiveMode(true);

            // Gửi lệnh qua sự kiện đặc biệt cho lệnh tương tác
            socketRef.current.emit('interactive_command', command);
          } else {
            // Gửi lệnh thông thường
            socketRef.current.emit('data', command + '\r\n');
          }

        } else {
          const data = await res.json();
          terminal.write(`\x1b[1;31m${data.message || 'Lệnh không hợp lệ hoặc bị từ chối.'}\x1b[0m\r\n`);
        }
      })
      .catch(err => {
        terminal.write(`\x1b[1;31mLỗi kết nối API: ${err.message}\x1b[0m\r\n`);
      });
  };
  // Đóng terminal
  const closeTerminal = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (terminalInstance.current) {
      terminalInstance.current.dispose();
      terminalInstance.current = null;
    }
    setTerminalOpen(false);
    sessionIdRef.current = null;
    setInteractiveMode(false); // Reset chế độ tương tác
  };
  // Toggle chế độ fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      if (fitAddonRef.current) fitAddonRef.current.fit();
    }, 100);
  };

  // Format thời gian tạo
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 4,
            fontWeight: 'bold',
            borderLeft: '4px solid #1976d2',
            pl: 2
          }}
        >
          Danh sách thiết bị của bạn
        </Typography>
        <Box sx={{ width: '100%', mb: 4 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Typography
              variant="h6"
              component="h2"
              sx={{
                fontWeight: 'medium',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <DevicesOther sx={{ mr: 1, color: 'primary.main' }} />
              Danh sách thiết bị
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Refresh />}
              onClick={() => refetchDevices()}
              disabled={isLoading}
            >
              Làm mới
            </Button>
          </Box>
          <Paper
            sx={{
              width: '100%',
              mb: 2,
              borderRadius: 1,
              overflow: 'hidden'
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : isError ? (
              <Alert
                severity="error"
                variant="filled"
                sx={{ borderRadius: 0 }}
              >
                Đã xảy ra lỗi khi tải dữ liệu thiết bị. Vui lòng thử lại sau.
              </Alert>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                    }}>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Tên máy chủ</TableCell>
                        <TableCell>Hệ điều hành</TableCell>
                        <TableCell>Địa chỉ IP</TableCell>
                        <TableCell>SSH Port</TableCell>
                        <TableCell>Nhóm thiết bị</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Ngày tạo</TableCell>
                        <TableCell align="center">Tác vụ</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {devices
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((device) => (
                          <TableRow key={device.id} hover>
                            <TableCell>{device.id}</TableCell>
                            <TableCell>{device.hostname}</TableCell>
                            <TableCell>{device.os_type}</TableCell>
                            <TableCell>{device.ip_address}</TableCell>
                            <TableCell>{device.ssh_port || '2001'}</TableCell>
                            <TableCell>
                              {device.device_group_id ? (
                                <Chip
                                  size="small"
                                  label={device.device_group_name || `Nhóm ${device.device_group_id}`}
                                  color="primary"
                                  variant="outlined"
                                />
                              ) : (
                                <Chip size="small" label="Chưa phân nhóm" variant="outlined" />
                              )}
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={<CheckCircle fontSize="small" />}
                                label="Đang hoạt động"
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>{formatDate(device.created_at)}</TableCell>
                            <TableCell align="center">
                              <Tooltip title="Kết nối SSH">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleOpenConnectDialog(device)}
                                  size="small"
                                >
                                  <LinkIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      {devices.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                            Không có thiết bị nào được gán cho bạn
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={devices.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Số hàng mỗi trang:"
                />
              </>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Dialog kết nối SSH */}
      <Dialog
        open={connectDialogOpen}
        onClose={handleCloseConnectDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            width: '450px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
          Kết nối SSH đến thiết bị
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {connectingDevice && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Thông tin thiết bị:
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1, pl: 1 }}>
                  <Typography variant="body2">
                    <strong>ID:</strong> {connectingDevice.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tên máy chủ:</strong> {connectingDevice.hostname}
                  </Typography>
                  <Typography variant="body2">
                    <strong>IP:</strong> {connectingDevice.ip_address}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hệ điều hành:</strong> {connectingDevice.os_type}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {connectError && (
                <Alert severity="error" sx={{ mb: 2, fontSize: '0.875rem' }}>
                  {connectError}
                </Alert>
              )}

              {connectSuccess && (
                <Alert severity="success" sx={{ mb: 2, fontSize: '0.875rem' }}>
                  {connectSuccess}
                </Alert>
              )}

              <TextField
                label="Tên đăng nhập SSH"
                value={sshUsername}
                onChange={(e) => setSshUsername(e.target.value)}
                fullWidth
                autoFocus
                margin="normal"
                size="small"
                disabled={connectMutation.isLoading || !!connectSuccess}
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />

              <TextField
                label="Mật khẩu SSH"
                value={sshPassword}
                onChange={(e) => setSshPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                size="small"
                disabled={connectMutation.isLoading || !!connectSuccess}
                InputProps={{
                  sx: { borderRadius: 1 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            onClick={handleCloseConnectDialog}
            color="inherit"
            variant="outlined"
            disabled={connectMutation.isLoading}
            sx={{ borderRadius: 1 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConnectSubmit}
            color="primary"
            variant="contained"
            disabled={connectMutation.isLoading || !!connectSuccess}
            sx={{
              borderRadius: 1,
              boxShadow: '0px 3px 8px rgba(25, 118, 210, 0.2)'
            }}
          >
            {connectMutation.isLoading ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              'Kết nối'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Terminal Dialog */}
      <Dialog
        open={terminalOpen}
        onClose={closeTerminal}
        maxWidth="md"
        fullWidth
        fullScreen={isFullscreen}
        PaperProps={{
          sx: {
            borderRadius: isFullscreen ? 0 : 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            height: isFullscreen ? '100vh' : '80vh',
            margin: isFullscreen ? 0 : 2,
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1,
          pl: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TerminalIcon sx={{ color: 'primary.main', mr: 1 }} />
            <Typography variant="subtitle1" fontWeight="bold">
              Terminal SSH: {connectingDevice?.hostname || 'Thiết bị'}
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={toggleFullscreen} size="small" sx={{ mr: 1 }}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
            <IconButton onClick={closeTerminal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Terminal */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: '#1e1e1e',
            p: 1,
            overflow: 'hidden'
          }}
        >
          <Box
            ref={terminalRef}
            sx={{
              width: '100%',
              height: '100%',
              minHeight: '300px',
              '& .xterm': { height: '100%' },
              '& .terminal': { height: '100%' }
            }}
          />
        </Box>

        {/* Footer - Test API */}
        <Box sx={{
          p: 1,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          bgcolor: '#1e1e1e',
          display: 'flex',
          alignItems: 'center'
        }}>
          <TextField
            size="small"
            placeholder="Lệnh để test API"
            value={testCommand}
            onChange={(e) => setTestCommand(e.target.value)}
            sx={{
              mr: 1,
              flexGrow: 1,
              '& .MuiInputBase-root': {
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.05)',
                borderRadius: 1
              }
            }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={testAPI}
            sx={{ borderRadius: 1, textTransform: 'none' }}
          >
            Test API
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default DevicesOperator;