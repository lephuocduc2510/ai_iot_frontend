import React, { useState, useEffect } from 'react';
import {
  Box, CssBaseline, Toolbar, useTheme, Drawer, List, Divider,
  ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton,
  AppBar, Typography, Avatar, Menu, MenuItem, Tooltip, useMediaQuery,
  Collapse, Button, Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  DevicesOther as DevicesIcon,
  Group as GroupIcon,
  Code as CodeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout,
  AccountCircle,
  NotificationsNone,
  ChevronLeft as ChevronLeftIcon,
  Password as PasswordIcon,
  Assignment as AssignmentIcon,
  ExpandLess,
  ExpandMore,
  PersonAdd as PersonAddIcon,
  Brightness4,
  Brightness7
} from '@mui/icons-material';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const drawerWidth = 240;

const Layout = () => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [profilesOpen, setProfilesOpen] = useState(false);

  // Debug: Hiển thị thông tin về user và permissions
  useEffect(() => {
    console.log("User information:", user);
    console.log("Has permission function:", typeof hasPermission === 'function');
    // Debug: hiển thị menu items trước và sau khi lọc
  }, [user, hasPermission]);

  // Mở menu profiles nếu đang ở một trong các trang profile
  useEffect(() => {
    if (location.pathname.includes('profile')) {
      setProfilesOpen(true);
    }
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenu = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleNavigate = (path) => {
    handleClose();
    navigate(path);
  };

  const handleResetPassword = () => {
    handleClose();
    navigate('/reset-password-request');
  };

  const handleToggleProfiles = () => {
    setProfilesOpen(!profilesOpen);
  };

  // Danh sách các mục menu chính
  const mainMenuItems = [
    {
      text: 'Tổng quan',
      icon: <DashboardIcon />,
      path: '/dashboard',
      requiredRole: ['Admin', 'Supervisor', 'TeamLead', 'Operator'],
      requiredPermission: null
    },
    {
      text: 'Thiết bị',
      icon: <DevicesIcon />,
      path: '/devices',
      requiredRole: ['Admin', 'Supervisor', 'TeamLead', 'Operator'],
      requiredPermission: 'view_devices'
    },
    {
      text: 'Nhóm thiết bị',
      icon: <GroupIcon />,
      path: '/device-groups',
      requiredRole: ['Admin', 'Supervisor', 'TeamLead'],
      requiredPermission: 'view_device_groups'
    },
    {
      text: 'Lệnh điều khiển',
      icon: <CodeIcon />,
      path: '/commands',
      requiredRole: ['Admin', 'Supervisor', 'TeamLead', 'Operator'],
      requiredPermission: 'view_commands'
    }
  ];

  // Submenu cho hồ sơ
  const profileMenuItems = [
    {
      text: 'Quản lý hồ sơ',
      icon: <AssignmentIcon />,
      path: '/profiles',
      requiredRole: ['Admin', 'Supervisor', 'TeamLead'],
      requiredPermission: 'view_profiles'
    },
    {
      text: 'Lệnh hồ sơ',
      icon: <CodeIcon />,
      path: '/profile-commands',
      requiredRole: ['Admin', 'Supervisor', 'TeamLead'],
      requiredPermission: 'manage_profile_commands'
    },
    {
      text: 'Gán hồ sơ',
      icon: <PersonAddIcon />,
      path: '/profile-operators',
      requiredRole: ['Admin', 'Supervisor', 'TeamLead'],
      requiredPermission: 'assign_profiles'
    }
  ];

  // Các menu bổ sung
  const additionalMenuItems = [
    {
      text: 'Quản lý người dùng',
      icon: <PersonIcon />,
      path: '/users',
      requiredRole: ['Admin'],
      requiredPermission: 'manage_users'
    },
    {
      text: 'Cài đặt',
      icon: <SettingsIcon />,
      path: '/settings',
      requiredRole: ['Admin', 'Supervisor', 'TeamLead', 'Operator'],
      requiredPermission: null
    }
  ];

  // Sửa: Đơn giản hóa kiểm tra quyền
  const hasAccess = (item) => {
    // Nếu không có thông tin user, không hiển thị menu
    if (!user) return false;

    // Kiểm tra theo role, không kiểm tra permission (permission sẽ được kiểm tra ở RoleRoute)
    const roleAccess = !item.requiredRole ||
      item.requiredRole.includes(user.role);

    return roleAccess;
  };

  // Lọc menu items dựa trên quyền (theo role)
  const filteredMainMenu = mainMenuItems.filter(hasAccess);
  const filteredProfileMenu = profileMenuItems.filter(hasAccess);
  const filteredAdditionalMenu = additionalMenuItems.filter(hasAccess);

  // Nếu không hiển thị đủ menu, tạm thời bỏ qua lọc:
  // const filteredMainMenu = mainMenuItems;
  // const filteredProfileMenu = profileMenuItems;
  // const filteredAdditionalMenu = additionalMenuItems;

  // Kiểm tra xem có hiển thị menu hồ sơ không
  const showProfileMenu = filteredProfileMenu.length > 0;

  // Fake notification count
  const notificationCount = 0;

  // Nội dung drawer (sidebar)
  const drawer = (
    <>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          AI IoT System
        </Typography>
        {isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />

      {/* Menu chính */}
      <List>
        {filteredMainMenu.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
          >
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                borderRadius: 1,
                mx: 1,
                backgroundColor: location.pathname === item.path ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit',
                  minWidth: 36
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'inherit'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Menu hồ sơ có thể mở rộng */}
      {showProfileMenu && (
        <>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleToggleProfiles}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                }}
              >
                <ListItemIcon>
                  <AssignmentIcon />
                </ListItemIcon>
                <ListItemText primary="Hồ sơ & Lệnh" />
                {profilesOpen ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={profilesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {filteredProfileMenu.map((item) => (
                  <ListItem
                    key={item.text}
                    disablePadding
                  >
                    <ListItemButton
                      component={Link}
                      to={item.path}
                      selected={location.pathname === item.path}
                      onClick={isMobile ? handleDrawerToggle : undefined}
                      sx={{
                        pl: 4,
                        borderRadius: 1,
                        mx: 1,
                        backgroundColor: location.pathname === item.path ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        '&.Mui-selected': {
                          backgroundColor: 'primary.light',
                        }
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: location.pathname === item.path ? 'primary.main' : 'inherit',
                          minWidth: 36
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{
                          color: location.pathname === item.path ? 'primary.main' : 'inherit'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </List>
        </>
      )}

      {/* Menu bổ sung */}
      {filteredAdditionalMenu.length > 0 && (
        <>
          <Divider />
          <List>
            {filteredAdditionalMenu.map((item) => (
              <ListItem
                key={item.text}
                disablePadding
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={location.pathname === item.path}
                  onClick={isMobile ? handleDrawerToggle : undefined}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    backgroundColor: location.pathname === item.path ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'inherit',
                      minWidth: 36
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      color: location.pathname === item.path ? 'primary.main' : 'inherit'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}

      {/* User Profile and Logout */}
      <Divider sx={{ mt: 'auto' }} />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleProfile} sx={{ borderRadius: 1, mx: 1 }}>
            <ListItemIcon>
              <AccountCircle />
            </ListItemIcon>
            <ListItemText
              primary={user?.username || 'Người dùng'}
              secondary={user?.role || 'Không xác định'}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleResetPassword} sx={{ borderRadius: 1, mx: 1 }}>
            <ListItemIcon>
              <PasswordIcon />
            </ListItemIcon>
            <ListItemText primary="Đổi mật khẩu" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 1, mx: 1 }}>
            <ListItemIcon>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Đăng xuất" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* Navbar (AppBar) */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="toggle drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Hiển thị tiêu đề trang hiện tại */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {/* Icon trang hiện tại */}
            <Box sx={{ mr: 1, display: 'flex' }}>
              {filteredMainMenu.find(item => item.path === location.pathname)?.icon ||
                filteredProfileMenu.find(item => item.path === location.pathname)?.icon ||
                filteredAdditionalMenu.find(item => item.path === location.pathname)?.icon ||
                <DashboardIcon />}
            </Box>

            {/* Tên trang hiện tại */}
            <Typography variant="h6" noWrap component="div">
              {filteredMainMenu.find(item => item.path === location.pathname)?.text ||
                filteredProfileMenu.find(item => item.path === location.pathname)?.text ||
                filteredAdditionalMenu.find(item => item.path === location.pathname)?.text ||
                'Tổng quan'}
            </Typography>
          </Box>

          {/* Các chức năng phụ */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Theme Toggle */}
            <Tooltip title={theme.palette.mode === 'dark' ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}>
              <IconButton
                color="inherit"
                sx={{ mr: 2 }}
              >
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Thông báo">
              <IconButton
                color="inherit"
                onClick={handleNotificationsMenu}
                sx={{ mr: 2 }}
              >
                <Badge badgeContent={notificationCount} color="error">
                  <NotificationsNone />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              id="notifications-menu"
              anchorEl={notificationsAnchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
            >
              <MenuItem onClick={handleNotificationsClose}>Không có thông báo mới</MenuItem>
            </Menu>

            {/* User Menu */}
            <Box>
              <Tooltip title={`${user?.username || 'Người dùng'} - ${user?.role || 'Không xác định'}`}>
                <IconButton
                  onClick={handleMenu}
                  size="small"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  color="inherit"
                >
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  Hồ sơ
                </MenuItem>

                <MenuItem onClick={handleResetPassword}>
                  <ListItemIcon>
                    <PasswordIcon fontSize="small" />
                  </ListItemIcon>
                  Đổi mật khẩu
                </MenuItem>

                <MenuItem onClick={() => handleNavigate('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Cài đặt
                </MenuItem>

                <Divider />

                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Thanh điều hướng bên trái (Sidebar) */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {/* Drawer di động */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Drawer desktop - Sửa lỗi */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              position: 'fixed', // Đảm bảo vị trí cố định
            },
            width: drawerWidth // Đặt chiều rộng cố định
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Nội dung chính - Điều chỉnh margin để phù hợp với Drawer cố định */}

      {/* Nội dung chính - Tính toán chính xác vị trí căn giữa */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },  // Trừ đi chiều rộng sidebar
          ml: { sm: `${drawerWidth}px` },                  // Margin left đúng bằng chiều rộng sidebar
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',                            // Căn giữa theo chiều ngang
          maxWidth: '100%',
        }}
      >
        <Toolbar /> {/* Spacer cho navbar */}
        <Box sx={{
          width: '100%',                                  // Chiếm toàn bộ không gian có sẵn
          maxWidth: {
            xs: '100%',                                   // Điện thoại: toàn màn hình
            sm: '95%',                                    // Tablet: 95% chiều rộng
            md: '85%',                                    // Desktop nhỏ: 85% 
            lg: '75%',                                    // Desktop: 75%
            xl: '1200px'                                  // Desktop lớn: cố định 1200px
          },
          mx: 'auto',                                     // Margin tự động hai bên để căn giữa
          position: 'relative',                           // Đảm bảo vị trí chính xác
          left: { sm: `calc(-${drawerWidth}px / 2)` },    // Điều chỉnh vị trí để căn giữa thực sự
          // Dịch về bên trái 1/2 chiều rộng sidebar
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;