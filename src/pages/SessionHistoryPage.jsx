import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, Alert, 
  IconButton, TextField, InputAdornment, Card, CardContent,
  Grid, Tooltip, useTheme, MenuItem, FormControl, InputLabel, Select,
  Pagination
} from '@mui/material';
import {
  Refresh, Search, FilterList, History as HistoryIcon,
  DevicesOther as DeviceIcon, AccessTime, Person as PersonIcon,
  Code as CodeIcon, Terminal
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import axiosInstance from '../api/axiosConfig';

// API functions
const getSessionHistory = async (deviceId = null, limit = 50, offset = 0) => {
  let url;
  
  if (deviceId) {
    url = `/sessions/history/device/${deviceId}?limit=${limit}&offset=${offset}`;
  } else {
    url = `/sessions/history?limit=${limit}&offset=${offset}`;
  }
  
  const response = await axiosInstance.get(url);
  return response.data;
};

const getDevices = async () => {
  const response = await axiosInstance.get('/devices');
  return response.data;
};

const SessionHistoryPage = () => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Calculate offset based on current page
  const offset = (page - 1) * rowsPerPage;

  // Fetch session history
  const { 
    data: historyData = [], 
    isLoading: historyLoading, 
    error: historyError,
    refetch: refetchHistory
  } = useQuery(
    ['sessionHistory', deviceId, rowsPerPage, offset],
    () => getSessionHistory(deviceId, rowsPerPage, offset),
    {
      keepPreviousData: true
    }
  );

  // Fetch devices for filter dropdown
  const { 
    data: devices = [],
    isLoading: devicesLoading
  } = useQuery('devices', getDevices);

  // Filter history based on search term
  const filteredHistory = historyData.filter(record => 
    searchTerm === '' ||
    record.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.operator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.device_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);  // Reset to first page
  };

  // Handle device filter change
  const handleDeviceChange = (event) => {
    setDeviceId(event.target.value);
    setPage(1);  // Reset to first page
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };

  // Total pages calculation (estimate since API doesn't provide total count)
  const totalPages = Math.ceil(100 / rowsPerPage); // Using a placeholder of 100 total records

  return (
    <Box sx={{ p: 3 }}>
      {/* Page Header */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          background: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Session History
            </Typography>
            <Typography variant="body1">
              View command execution history across devices
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="inherit"
            size="large"
            startIcon={<Refresh />}
            onClick={() => refetchHistory()}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.9)', 
              color: theme.palette.secondary.dark,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,1)',
              }
            }}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Search and Filters */}
      <Card sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by command, operator, or device name"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
                <Button 
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterList />}
                >
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel id="rows-per-page-label">Per Page</InputLabel>
                  <Select
                    labelId="rows-per-page-label"
                    value={rowsPerPage}
                    onChange={handleRowsPerPageChange}
                    label="Per Page"
                  >
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            
            {showFilters && (
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="device-filter-label">Device</InputLabel>
                  <Select
                    labelId="device-filter-label"
                    value={deviceId}
                    onChange={handleDeviceChange}
                    label="Device"
                  >
                    <MenuItem value="">All Devices</MenuItem>
                    {!devicesLoading && devices.map(device => (
                      <MenuItem key={device.id} value={device.id}>
                        {device.hostname || device.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* History Data Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }} elevation={3}>
        {historyLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : historyError ? (
          <Alert severity="error" sx={{ m: 3 }}>
            Failed to load session history: {historyError.message}
          </Alert>
        ) : filteredHistory.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <HistoryIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" color="text.secondary">No session history found</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try changing your filters or search criteria
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)' }}>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTime sx={{ fontSize: '1rem', mr: 1 }} />
                        Time
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DeviceIcon sx={{ fontSize: '1rem', mr: 1 }} />
                        Device
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ fontSize: '1rem', mr: 1 }} />
                        Operator
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Terminal sx={{ fontSize: '1rem', mr: 1 }} />
                        Command
                      </Box>
                    </TableCell>
                    <TableCell>Session ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHistory.map((record) => (
                    <TableRow 
                      key={record.id}
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: theme.palette.action.hover }
                      }}
                    >
                      <TableCell>
                        <Tooltip title={formatDate(record.timestamp)}>
                          <Typography variant="body2">
                            {formatDate(record.timestamp)}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            label={record.device_name}
                            size="small"
                            sx={{ 
                              bgcolor: theme.palette.info.main + '20',
                              color: theme.palette.info.dark,
                              fontWeight: 'medium',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip
                            label={record.operator_name}
                            size="small"
                            sx={{ 
                              bgcolor: theme.palette.primary.main + '20',
                              color: theme.palette.primary.dark,
                              fontWeight: 'medium',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            p: 0.75,
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)',
                            borderRadius: 1,
                            display: 'inline-block',
                            maxWidth: '400px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {record.command}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {record.session_id}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange}
                color="primary"
                size="medium"
                showFirstButton
                showLastButton
                sx={{ mt: 2 }}
              />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SessionHistoryPage;