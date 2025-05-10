import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DevicesPage from './pages/DevicesPage';
import DeviceGroupsPage from './pages/DeviceGroupsPage';
import CommandsPage from './pages/CommandsPage';
import UsersPage from './pages/UsersPage';
import ProfilesPage from './pages/ProfilesPage';
import ProfileCommandsPage from './pages/ProfileCommandsPage';
import ProfileOperatorsPage from './pages/ProfileOperatorsPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RequestPasswordResetPage from './pages/RequestPasswordResetPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
// Context and hooks
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/common/Layout';
import RoleRoute from './components/common/RoleRoute';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Các route công khai */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password-request" element={<RequestPasswordResetPage />} />
              <Route path="/page/reset-password" element={<ResetPasswordPage />} />
              
              {/* Các route có layout và yêu cầu xác thực */}
              <Route element={<PrivateRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  
                  {/* Routes với kiểm tra quyền */}
                  <Route path="/devices" element={
                    <RoleRoute 
                      allowedRoles={['Admin', 'Supervisor', 'TeamLead', 'Operator']} 
                      requiredPermissions={['view_devices']}
                    >
                      <DevicesPage />
                    </RoleRoute>
                  } />
                  
                  <Route path="/device-groups" element={
                    <RoleRoute 
                      allowedRoles={['Admin', 'Supervisor', 'TeamLead']} 
                      requiredPermissions={['view_device_groups']}
                    >
                      <DeviceGroupsPage />
                    </RoleRoute>
                  } />
                  
                  <Route path="/commands" element={
                    <RoleRoute 
                      allowedRoles={['Admin', 'Supervisor', 'TeamLead', 'Operator']} 
                      requiredPermissions={['view_commands']}
                    >
                      <CommandsPage />
                    </RoleRoute>
                  } />
                  
                  <Route path="/users" element={
                    <RoleRoute 
                      allowedRoles={['Admin']} 
                      requiredPermissions={['manage_users']}
                    >
                      <UsersPage />
                    </RoleRoute>
                  } />
                  
                  <Route path="/profiles" element={
                    <RoleRoute 
                      allowedRoles={['Admin', 'Supervisor', 'TeamLead']} 
                      requiredPermissions={['view_profiles']}
                    >
                      <ProfilesPage />
                    </RoleRoute>
                  } />
                  
                  <Route path="/profile-commands" element={
                    <RoleRoute 
                      allowedRoles={['Admin', 'Supervisor', 'TeamLead']} 
                      requiredPermissions={['manage_profile_commands']}
                    >
                      <ProfileCommandsPage />
                    </RoleRoute>
                  } />
                  
                  <Route path="/profile-operators" element={
                    <RoleRoute 
                      allowedRoles={['Admin', 'Supervisor', 'TeamLead']} 
                      requiredPermissions={['assign_profiles']}
                    >
                      <ProfileOperatorsPage />
                    </RoleRoute>
                  } />
                </Route>
              </Route>
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;