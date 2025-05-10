// import React, { useState } from 'react';
// import { 
//   AppBar, Toolbar, Typography, Box, IconButton, Menu, 
//   MenuItem, Avatar, Divider, ListItemIcon, Tooltip,
//   Button, Badge
// } from '@mui/material';
// import { 
//   Menu as MenuIcon, Logout, AccountCircle, 
//   Settings, NotificationsNone, Brightness4, Brightness7,
//   Dashboard as DashboardIcon,
//   DevicesOther as DevicesIcon,
//   Group as GroupIcon, 
//   Code as CodeIcon,
//   Person as PersonIcon,
//   Assignment as AssignmentIcon,
//   PersonAdd as PersonAddIcon,
//   Password as PasswordIcon // Thêm icon Password
// } from '@mui/icons-material';
// import { useNavigate, Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';

// const Navbar = ({ toggleSidebar, drawerWidth, theme, toggleThemeMode }) => {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
//   const [navMenuAnchor, setNavMenuAnchor] = useState(null);

//   const handleMenu = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleNavMenu = (event) => {
//     setNavMenuAnchor(event.currentTarget);
//   };

//   const handleNotificationsMenu = (event) => {
//     setNotificationsAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleNavMenuClose = () => {
//     setNavMenuAnchor(null);
//   };

//   const handleNotificationsClose = () => {
//     setNotificationsAnchorEl(null);
//   };

//   const handleLogout = () => {
//     handleClose();
//     logout();
//     navigate('/login');
//   };

//   const handleProfile = () => {
//     handleClose();
//     navigate('/profile');
//   };

//   // Thêm hàm xử lý đặt lại mật khẩu
//   const handleResetPassword = () => {
//     handleClose();
//     navigate('/reset-password-request');
//   };

//   const handleNavigate = (path) => {
//     handleNavMenuClose();
//     navigate(path);
//   };

//   // Danh sách menu điều hướng
//   const navItems = [
//     { text: 'Tổng quan', path: '/dashboard', icon: <DashboardIcon /> },
//     { text: 'Thiết bị', path: '/devices', icon: <DevicesIcon /> },
//     { text: 'Nhóm thiết bị', path: '/device-groups', icon: <GroupIcon /> },
//     { text: 'Lệnh điều khiển', path: '/commands', icon: <CodeIcon /> }
//   ];

//   // Danh sách menu quản trị
//   const adminNavItems = [
//     { text: 'Quản lý người dùng', path: '/users', icon: <PersonIcon />, roles: ['Admin'] },
//     { text: 'Quản lý hồ sơ', path: '/profiles', icon: <AssignmentIcon />, roles: ['Admin', 'Supervisor'] },
//     { text: 'Lệnh hồ sơ', path: '/profile-commands', icon: <CodeIcon />, roles: ['Admin', 'Supervisor'] },
//     { text: 'Gán hồ sơ', path: '/profile-operators', icon: <PersonAddIcon />, roles: ['Admin', 'Supervisor'] }
//   ];

//   // Lọc menu quản trị theo vai trò
//   const filteredAdminNavItems = adminNavItems.filter(item => {
//     if (!user?.role) return false;
//     return item.roles.includes(user.role);
//   });

//   // Fake notification count - để hiển thị badge trên icon thông báo
//   const notificationCount = 0;

//   return (
//     <AppBar 
//       position="fixed" 
//       sx={{ 
//         width: { sm: `calc(100% - ${drawerWidth}px)` }, 
//         ml: { sm: `${drawerWidth}px` },
//         boxShadow: 1
//       }}
//     >
//       <Toolbar>
//         <IconButton
//           color="inherit"
//           aria-label="open drawer"
//           edge="start"
//           onClick={toggleSidebar}
//           sx={{ mr: 2, display: { sm: 'none' } }}
//         >
//           <MenuIcon />
//         </IconButton>
        
//         <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }}>
//           AI IoT System
//         </Typography>

//         {/* Menu điều hướng cho màn hình nhỏ */}
//         <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
//           <IconButton
//             size="large"
//             aria-label="navigation menu"
//             aria-controls="menu-navigation"
//             aria-haspopup="true"
//             onClick={handleNavMenu}
//             color="inherit"
//           >
//             <MenuIcon />
//           </IconButton>
//           <Menu
//             id="menu-navigation"
//             anchorEl={navMenuAnchor}
//             anchorOrigin={{
//               vertical: 'bottom',
//               horizontal: 'left',
//             }}
//             keepMounted
//             transformOrigin={{
//               vertical: 'top',
//               horizontal: 'left',
//             }}
//             open={Boolean(navMenuAnchor)}
//             onClose={handleNavMenuClose}
//             sx={{
//               display: { xs: 'block', md: 'none' },
//             }}
//           >
//             {navItems.map((item) => (
//               <MenuItem 
//                 key={item.text} 
//                 onClick={() => handleNavigate(item.path)}
//                 selected={location.pathname === item.path}
//               >
//                 <ListItemIcon>{item.icon}</ListItemIcon>
//                 <Typography textAlign="center">{item.text}</Typography>
//               </MenuItem>
//             ))}
//             <Divider />
//             {filteredAdminNavItems.map((item) => (
//               <MenuItem 
//                 key={item.text} 
//                 onClick={() => handleNavigate(item.path)}
//                 selected={location.pathname === item.path}
//               >
//                 <ListItemIcon>{item.icon}</ListItemIcon>
//                 <Typography textAlign="center">{item.text}</Typography>
//               </MenuItem>
//             ))}
//           </Menu>
//         </Box>

//         {/* Menu điều hướng cho màn hình lớn (desktop) */}
//         <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 2 }}>
//           {navItems.map((item) => (
//             <Button
//               key={item.text}
//               component={Link}
//               to={item.path}
//               sx={{ 
//                 color: 'white', 
//                 display: 'flex', 
//                 mx: 0.5,
//                 bgcolor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
//                 '&:hover': {
//                   bgcolor: 'rgba(255, 255, 255, 0.2)'
//                 }
//               }}
//               startIcon={item.icon}
//             >
//               {item.text}
//             </Button>
//           ))}
          
//           {filteredAdminNavItems.length > 0 && (
//             <IconButton
//               color="inherit"
//               onClick={handleNavMenu}
//               sx={{ ml: 2 }}
//             >
//               <Settings />
//             </IconButton>
//           )}
          
//           <Menu
//             id="admin-menu"
//             anchorEl={navMenuAnchor}
//             anchorOrigin={{
//               vertical: 'bottom',
//               horizontal: 'left',
//             }}
//             keepMounted
//             transformOrigin={{
//               vertical: 'top',
//               horizontal: 'left',
//             }}
//             open={Boolean(navMenuAnchor)}
//             onClose={handleNavMenuClose}
//           >
//             {filteredAdminNavItems.map((item) => (
//               <MenuItem 
//                 key={item.text} 
//                 onClick={() => handleNavigate(item.path)}
//                 selected={location.pathname === item.path}
//               >
//                 <ListItemIcon>{item.icon}</ListItemIcon>
//                 <Typography textAlign="center">{item.text}</Typography>
//               </MenuItem>
//             ))}
//           </Menu>
//         </Box>

//         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//           {/* Theme Toggle */}
//           <Tooltip title={theme.palette.mode === 'dark' ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}>
//             <IconButton 
//               color="inherit" 
//               onClick={toggleThemeMode} 
//               sx={{ mr: 2 }}
//             >
//               {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
//             </IconButton>
//           </Tooltip>

//           {/* Notifications */}
//           <Tooltip title="Thông báo">
//             <IconButton 
//               color="inherit" 
//               onClick={handleNotificationsMenu} 
//               sx={{ mr: 2 }}
//             >
//               <Badge badgeContent={notificationCount} color="error">
//                 <NotificationsNone />
//               </Badge>
//             </IconButton>
//           </Tooltip>
//           <Menu
//             id="notifications-menu"
//             anchorEl={notificationsAnchorEl}
//             anchorOrigin={{
//               vertical: 'bottom',
//               horizontal: 'right',
//             }}
//             keepMounted
//             transformOrigin={{
//               vertical: 'top',
//               horizontal: 'right',
//             }}
//             open={Boolean(notificationsAnchorEl)}
//             onClose={handleNotificationsClose}
//           >
//             <MenuItem onClick={handleNotificationsClose}>Không có thông báo mới</MenuItem>
//           </Menu>
          
//           {/* User Menu */}
//           <Box>
//             <Tooltip title={`${user?.username || 'Người dùng'} - ${user?.role || 'Không xác định'}`}>
//               <IconButton 
//                 onClick={handleMenu} 
//                 size="small" 
//                 sx={{ ml: 1 }} 
//                 aria-controls="menu-appbar"
//                 aria-haspopup="true"
//               >
//                 <Avatar sx={{ width: 32, height: 32 }}>
//                   {user?.username?.charAt(0)?.toUpperCase() || 'U'}
//                 </Avatar>
//               </IconButton>
//             </Tooltip>
//             <Menu
//               id="menu-appbar"
//               anchorEl={anchorEl}
//               anchorOrigin={{
//                 vertical: 'bottom',
//                 horizontal: 'right',
//               }}
//               keepMounted
//               transformOrigin={{
//                 vertical: 'top',
//                 horizontal: 'right',
//               }}
//               open={Boolean(anchorEl)}
//               onClose={handleClose}
//             >
//               <MenuItem onClick={handleProfile}>
//                 <ListItemIcon>
//                   <AccountCircle fontSize="small" />
//                 </ListItemIcon>
//                 Hồ sơ
//               </MenuItem>
              
//               {/* Thêm menu item đổi mật khẩu */}
//               <MenuItem onClick={handleResetPassword}>
//                 <ListItemIcon>
//                   <PasswordIcon fontSize="small" />
//                 </ListItemIcon>
//                 Đổi mật khẩu
//               </MenuItem>
              
//               <MenuItem onClick={() => handleNavigate('/settings')}>
//                 <ListItemIcon>
//                   <Settings fontSize="small" />
//                 </ListItemIcon>
//                 Cài đặt
//               </MenuItem>
              
//               <Divider />
              
//               <MenuItem onClick={handleLogout}>
//                 <ListItemIcon>
//                   <Logout fontSize="small" />
//                 </ListItemIcon>
//                 Đăng xuất
//               </MenuItem>
//             </Menu>
//           </Box>
//         </Box>
//       </Toolbar>
//     </AppBar>
//   );
// };

// export default Navbar;