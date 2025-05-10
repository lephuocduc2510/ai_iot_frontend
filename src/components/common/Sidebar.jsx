// import React from 'react';
// import { 
//   Drawer, List, Divider, IconButton, Box, 
//   ListItem, ListItemButton, ListItemIcon, ListItemText,
//   Typography, Collapse
// } from '@mui/material';
// import {
//   ChevronLeft as ChevronLeftIcon,
//   Dashboard as DashboardIcon,
//   DevicesOther as DevicesIcon,
//   Group as GroupIcon,
//   Code as CodeIcon,
//   Person as PersonIcon,
//   Settings as SettingsIcon,
//   Assignment as AssignmentIcon,
//   PersonAdd as PersonAddIcon,
//   ExpandLess,
//   ExpandMore
// } from '@mui/icons-material';
// import { Link, useLocation } from 'react-router-dom';
// import { useAuth } from '../../hooks/useAuth';
// import { useState } from 'react';

// const Sidebar = ({ open, handleDrawerClose, drawerWidth }) => {
//   const location = useLocation();
//   const { user } = useAuth();
//   const [profilesOpen, setProfilesOpen] = useState(false);

//   // Xác định nếu đang ở trang liên quan đến profiles để mở submenu
//   React.useEffect(() => {
//     if (location.pathname.includes('profile')) {
//       setProfilesOpen(true);
//     }
//   }, [location.pathname]);

//   const handleProfilesClick = () => {
//     setProfilesOpen(!profilesOpen);
//   };

//   // Danh sách menu chính
//   const mainMenuItems = [
//     { 
//       text: 'Tổng quan', 
//       icon: <DashboardIcon />, 
//       path: '/dashboard',
//       requiredRole: ['Admin', 'Supervisor', 'TeamLead', 'Operator']
//     },
//     { 
//       text: 'Thiết bị', 
//       icon: <DevicesIcon />, 
//       path: '/devices',
//       requiredRole: ['Admin', 'Supervisor', 'TeamLead', 'Operator']
//     },
//     { 
//       text: 'Nhóm thiết bị', 
//       icon: <GroupIcon />, 
//       path: '/device-groups',
//       requiredRole: ['Admin', 'Supervisor', 'TeamLead']
//     },
//     { 
//       text: 'Lệnh điều khiển', 
//       icon: <CodeIcon />, 
//       path: '/commands',
//       requiredRole: ['Admin', 'Supervisor', 'TeamLead', 'Operator']
//     },
//   ];

//   // Danh sách submenu hồ sơ
//   const profileMenuItems = [
//     { 
//       text: 'Quản lý hồ sơ', 
//       icon: <AssignmentIcon />, 
//       path: '/profiles',
//       requiredRole: ['Admin', 'Supervisor']
//     },
//     { 
//       text: 'Lệnh hồ sơ', 
//       icon: <CodeIcon />, 
//       path: '/profile-commands',
//       requiredRole: ['Admin', 'Supervisor']
//     },
//     { 
//       text: 'Gán hồ sơ', 
//       icon: <PersonAddIcon />, 
//       path: '/profile-operators',
//       requiredRole: ['Admin', 'Supervisor']
//     }
//   ];

//   // Danh sách menu bổ sung
//   const additionalMenuItems = [
//     { 
//       text: 'Quản lý người dùng', 
//       icon: <PersonIcon />, 
//       path: '/users',
//       requiredRole: ['Admin']
//     },
//     { 
//       text: 'Cài đặt', 
//       icon: <SettingsIcon />, 
//       path: '/settings',
//       requiredRole: ['Admin', 'Supervisor'] 
//     }
//   ];

//   // Lọc menu items dựa trên quyền
//   const filteredMainMenu = mainMenuItems.filter(item => {
//     if (!user?.role) return false;
//     return item.requiredRole.includes(user.role);
//   });

//   const filteredProfileMenu = profileMenuItems.filter(item => {
//     if (!user?.role) return false;
//     return item.requiredRole.includes(user.role);
//   });

//   const filteredAdditionalMenu = additionalMenuItems.filter(item => {
//     if (!user?.role) return false;
//     return item.requiredRole.includes(user.role);
//   });

//   // Kiểm tra xem có nên hiển thị menu hồ sơ không
//   const showProfileMenu = filteredProfileMenu.length > 0;

//   return (
//     <Drawer
//       sx={{
//         width: drawerWidth,
//         flexShrink: 0,
//         '& .MuiDrawer-paper': {
//           width: drawerWidth,
//           boxSizing: 'border-box',
//         },
//       }}
//       variant="persistent"
//       anchor="left"
//       open={open}
//     >
//       <Box sx={{ 
//         display: 'flex', 
//         alignItems: 'center', 
//         padding: '0 16px',
//         justifyContent: 'space-between',
//         minHeight: 64
//       }}>
//         <Typography variant="h6" noWrap component="div">
//           AI IoT System
//         </Typography>
//         <IconButton onClick={handleDrawerClose}>
//           <ChevronLeftIcon />
//         </IconButton>
//       </Box>
//       <Divider />
      
//       {/* Menu chính */}
//       <List>
//         {filteredMainMenu.map((item) => (
//           <ListItem 
//             key={item.text} 
//             disablePadding
//             sx={{
//               backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
//             }}
//           >
//             <ListItemButton
//               component={Link}
//               to={item.path}
//               sx={{
//                 borderRadius: 1,
//                 mx: 1,
//                 '&.Mui-selected': {
//                   backgroundColor: 'primary.light',
//                 }
//               }}
//               selected={location.pathname === item.path}
//             >
//               <ListItemIcon 
//                 sx={{ 
//                   color: location.pathname === item.path ? 'primary.main' : 'inherit',
//                   minWidth: 36
//                 }}
//               >
//                 {item.icon}
//               </ListItemIcon>
//               <ListItemText 
//                 primary={item.text} 
//                 sx={{ 
//                   color: location.pathname === item.path ? 'primary.main' : 'inherit'
//                 }}
//               />
//             </ListItemButton>
//           </ListItem>
//         ))}
//       </List>
      
//       {/* Phần menu hồ sơ */}
//       {showProfileMenu && (
//         <>
//           <Divider />
//           <List>
//             <ListItem disablePadding>
//               <ListItemButton onClick={handleProfilesClick}>
//                 <ListItemIcon>
//                   <AssignmentIcon />
//                 </ListItemIcon>
//                 <ListItemText primary="Hồ sơ & Lệnh" />
//                 {profilesOpen ? <ExpandLess /> : <ExpandMore />}
//               </ListItemButton>
//             </ListItem>
//             <Collapse in={profilesOpen} timeout="auto" unmountOnExit>
//               <List component="div" disablePadding>
//                 {filteredProfileMenu.map((item) => (
//                   <ListItem 
//                     key={item.text} 
//                     disablePadding
//                     sx={{
//                       backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
//                       pl: 4
//                     }}
//                   >
//                     <ListItemButton
//                       component={Link}
//                       to={item.path}
//                       sx={{
//                         borderRadius: 1,
//                         '&.Mui-selected': {
//                           backgroundColor: 'primary.light',
//                         }
//                       }}
//                       selected={location.pathname === item.path}
//                     >
//                       <ListItemIcon 
//                         sx={{ 
//                           color: location.pathname === item.path ? 'primary.main' : 'inherit',
//                           minWidth: 36
//                         }}
//                       >
//                         {item.icon}
//                       </ListItemIcon>
//                       <ListItemText 
//                         primary={item.text} 
//                         sx={{ 
//                           color: location.pathname === item.path ? 'primary.main' : 'inherit'
//                         }}
//                       />
//                     </ListItemButton>
//                   </ListItem>
//                 ))}
//               </List>
//             </Collapse>
//           </List>
//         </>
//       )}

//       {/* Menu bổ sung */}
//       <Divider />
//       <List>
//         {filteredAdditionalMenu.map((item) => (
//           <ListItem 
//             key={item.text} 
//             disablePadding
//             sx={{
//               backgroundColor: location.pathname === item.path ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
//             }}
//           >
//             <ListItemButton
//               component={Link}
//               to={item.path}
//               sx={{
//                 borderRadius: 1,
//                 mx: 1,
//                 '&.Mui-selected': {
//                   backgroundColor: 'primary.light',
//                 }
//               }}
//               selected={location.pathname === item.path}
//             >
//               <ListItemIcon 
//                 sx={{ 
//                   color: location.pathname === item.path ? 'primary.main' : 'inherit',
//                   minWidth: 36
//                 }}
//               >
//                 {item.icon}
//               </ListItemIcon>
//               <ListItemText 
//                 primary={item.text} 
//                 sx={{ 
//                   color: location.pathname === item.path ? 'primary.main' : 'inherit'
//                 }}
//               />
//             </ListItemButton>
//           </ListItem>
//         ))}
//       </List>
//     </Drawer>
//   );
// };

// export default Sidebar;