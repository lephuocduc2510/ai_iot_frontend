import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';  // Changed from @tanstack/react-query
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, Alert, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, 
  IconButton, Collapse, Tooltip, Card, CardHeader, CardContent, Divider,
  Avatar, Grid, Badge, Stack, LinearProgress, useTheme
} from '@mui/material';
import {
  Refresh, Cancel, Info, KeyboardArrowUp, KeyboardArrowDown,
  DesktopMac, PersonOutline, AccessTime, Code, Check, Warning
} from '@mui/icons-material';
import axiosInstance from '../api/axiosConfig';

// API functions
const getActiveSessions = async () => {
  const response = await axiosInstance.get('/sessions/active');
  return response.data;
};

const terminateSession = async (sessionId) => {
  const response = await axiosInstance.post(`/sessions/${sessionId}/terminate`);
  return response.data;
};

const ActiveSessionsPage = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [timeLeft, setTimeLeft] = useState(refreshInterval);

  // Auto-refresh counter
  useEffect(() => {
    if (timeLeft <= 0) {
      refetch();
      setTimeLeft(refreshInterval);
      return;
    }
    
    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Fetch active sessions
  const { data: sessions = [], isLoading, error, refetch } = useQuery(
    'activeSessions',  // Changed from array to string key
    getActiveSessions,
    { refetchInterval: refreshInterval * 1000 }
  );

  // Terminate session mutation
  const terminateMutation = useMutation(
    terminateSession,
    {
      onSuccess: () => {
        refetch();
        setOpenDialog(false);
        alert("Session terminated successfully");
      },
      onError: (error) => {
        console.error("Error terminating session:", error);
        alert(`Error: ${error.response?.data?.detail || 'Failed to terminate session'}`);
      }
    }
  );

  const handleTerminateConfirm = () => {
    if (selectedSession) {
      terminateMutation.mutate(selectedSession.id);
    }
  };

  const handleTerminateClick = (session) => {
    setSelectedSession(session);
    setOpenDialog(true);
  };

  const handleManualRefresh = () => {
    refetch();
    setTimeLeft(refreshInterval);
  };

  const formatDuration = (startTimeStr) => {
    const startTime = new Date(startTimeStr);
    const now = new Date();
    const diffMs = now - startTime;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Generate avatar color based on string
  const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Get session activity level (for coloring)
  const getActivityLevel = (lastActivityStr) => {
    const lastActivity = new Date(lastActivityStr);
    const now = new Date();
    const diffMs = now - lastActivity;
    const diffMinutes = diffMs / (1000 * 60);
    
    if (diffMinutes < 5) return 'active'; // Very recent activity
    if (diffMinutes < 15) return 'semi-active'; // Some recent activity
    return 'inactive'; // No recent activity
  };

  // Generate summary stats
  const activeCount = sessions.filter(s => s.status === 'Active').length;
  const uniqueOperators = new Set(sessions.map(s => s.operator_id)).size;
  const uniqueDevices = new Set(sessions.map(s => s.device_id)).size;

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Active Sessions
            </Typography>
            <Typography variant="body1">
              Monitor and manage ongoing device connections
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="inherit"
            size="large"
            startIcon={<Refresh />}
            onClick={handleManualRefresh}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)', 
              color: theme.palette.primary.dark,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,1)',
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.success.main, mr: 2 }}>
                  <Check />
                </Avatar>
                <Typography variant="h6" component="div">Active Sessions</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'medium', color: theme.palette.success.main }}>
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                  <PersonOutline />
                </Avatar>
                <Typography variant="h6" component="div">Active Operators</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'medium', color: theme.palette.info.main }}>
                {uniqueOperators}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2 }}>
                  <DesktopMac />
                </Avatar>
                <Typography variant="h6" component="div">Connected Devices</Typography>
              </Box>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'medium', color: theme.palette.warning.main }}>
                {uniqueDevices}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Auto-refresh indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" color="text.secondary">
          <AccessTime fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
          Auto-refreshing in {timeLeft} seconds
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(1 - timeLeft/refreshInterval) * 100} 
          sx={{ width: '100%', ml: 2, borderRadius: 1 }}
        />
      </Box>

      {/* Sessions Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }} elevation={3}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 3 }}>
            Failed to load active sessions: {error.message}
          </Alert>
        ) : sessions.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Info sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary">No active sessions found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              There are currently no operators connected to any devices
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }}>
                <TableRow>
                  <TableCell sx={{ width: '40px' }}></TableCell>
                  <TableCell>Operator</TableCell>
                  <TableCell>Device</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((session) => {
                  const activityLevel = getActivityLevel(session.last_activity);
                  
                  return (
                    <React.Fragment key={session.id}>
                      <TableRow 
                        hover 
                        sx={{ 
                          '&:hover': { bgcolor: theme.palette.action.hover },
                          bgcolor: expandedRow === session.id ? 
                            (theme.palette.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)') : 
                            'transparent'
                        }}
                      >
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => setExpandedRow(expandedRow === session.id ? null : session.id)}
                          >
                            {expandedRow === session.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: stringToColor(session.operator_name),
                                width: 32,
                                height: 32,
                                mr: 1.5,
                                fontSize: '0.875rem'
                              }}
                            >
                              {session.operator_name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {session.operator_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DesktopMac sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                            {session.device_name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={session.status} 
                            color="success" 
                            size="small" 
                            sx={{
                              fontWeight: 'medium',
                              bgcolor: theme.palette.success.main + '20',
                              color: theme.palette.success.dark,
                              border: 'none'
                            }} 
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime 
                              sx={{ 
                                fontSize: '0.875rem', 
                                mr: 0.5, 
                                color: theme.palette.text.secondary
                              }} 
                            />
                            {formatDuration(session.start_time)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={new Date(session.last_activity).toLocaleString()}>
                            <Badge 
                              variant="dot" 
                              color={
                                activityLevel === 'active' ? 'success' :
                                activityLevel === 'semi-active' ? 'warning' : 'error'
                              }
                              sx={{ '& .MuiBadge-badge': { top: 9, right: -3 } }}
                            >
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {formatDuration(session.last_activity)}
                              </Typography>
                            </Badge>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Terminate Session">
                            <IconButton 
                              color="error" 
                              onClick={() => handleTerminateClick(session)}
                              size="small"
                              sx={{ 
                                '&:hover': { 
                                  bgcolor: theme.palette.error.main + '20',
                                }
                              }}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                          <Collapse in={expandedRow === session.id} timeout="auto" unmountOnExit>
                            <Box sx={{ 
                              p: 3, 
                              pt: 2,
                              borderRadius: 1,
                              bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                              mx: 2,
                              my: 1
                            }}>
                              <Typography 
                                variant="subtitle1" 
                                gutterBottom 
                                component="div" 
                                sx={{ 
                                  fontWeight: 'bold', 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  color: theme.palette.primary.main
                                }}
                              >
                                <Info fontSize="small" sx={{ mr: 1 }} /> Session Details
                              </Typography>
                              <Divider sx={{ mb: 2 }} />
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Stack spacing={2}>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">Device OS</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {session.detail.device_os || 'Not specified'}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">Device IP</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {session.detail.device_ip || 'Not specified'}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">SSH Port</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {session.detail.ssh_port || '22 (default)'}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">Active Since</Typography>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {new Date(session.detail.active_since).toLocaleString()}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                      <Code fontSize="small" sx={{ mr: 0.5 }} /> Last Command
                                    </Typography>
                                    <Paper
                                      variant="outlined"
                                      sx={{ 
                                        p: 1.5, 
                                        mt: 1,
                                        borderRadius: 1,
                                        fontFamily: 'monospace',
                                        bgcolor: theme.palette.mode === 'dark' 
                                          ? 'rgba(0,0,0,0.2)' 
                                          : 'rgba(0,0,0,0.04)',
                                      }}
                                    >
                                      {session.last_command || "No commands executed yet"}
                                    </Paper>
                                  </Box>
                                </Grid>
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Warning color="error" sx={{ mr: 1 }} />
            Terminate Session
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to terminate the session for 
            operator <strong>{selectedSession?.operator_name}</strong> on device <strong>{selectedSession?.device_name}</strong>?
            <br /><br />
            This action will disconnect the operator from the device and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => setOpenDialog(false)} 
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTerminateConfirm} 
            color="error" 
            variant="contained"
            startIcon={terminateMutation.isLoading ? null : <Cancel />}
            disabled={terminateMutation.isLoading}
          >
            {terminateMutation.isLoading ? <CircularProgress size={24} /> : "Terminate Session"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActiveSessionsPage;