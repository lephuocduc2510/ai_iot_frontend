import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, Checkbox, IconButton, Chip, Dialog,
  DialogActions, DialogContent, DialogTitle, FormControl, InputLabel,
  MenuItem, Select, CircularProgress
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllDevices, getAllDeviceGroups, addMultipleDevicesToGroup } from '../../api/deviceApi';
import { useNotification } from '../../hooks/useNotification';

const DevicesList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  
  const { data: devices = [], isLoading } = useQuery('devices', getAllDevices);
  const { data: groups = [] } = useQuery('deviceGroups', getAllDeviceGroups);
  
  const addToGroupMutation = useMutation(
    ({deviceIds, groupId}) => addMultipleDevicesToGroup(deviceIds, groupId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('devices');
        showNotification('Devices added to group successfully', 'success');
        setOpenDialog(false);
        setSelected([]);
      },
      onError: (error) => {
        showNotification(
          error.response?.data?.detail || 'Failed to add devices to group', 
          'error'
        );
      }
    }
  );
  
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = devices.map((device) => device.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };
  
  const handleClick = (_, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    
    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter(item => item !== id);
    }
    
    setSelected(newSelected);
  };
  
  const isSelected = (id) => selected.indexOf(id) !== -1;
  
  const handleAddToGroup = () => {
    if (selected.length > 0 && selectedGroupId) {
      addToGroupMutation.mutate({
        deviceIds: selected,
        groupId: parseInt(selectedGroupId)
      });
    } else {
      showNotification('Please select devices and a group', 'warning');
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Devices
        </Typography>
        <Box>
          {selected.length > 0 && (
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{ mr: 2 }}
            >
              Add to Group
            </Button>
          )}
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<Add />}
            onClick={() => navigate('/devices/new')}
          >
            Add Device
          </Button>
        </Box>
      </Box>
      
      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < devices.length}
                    checked={devices.length > 0 && selected.length === devices.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Group</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {devices.map((device) => {
                const isItemSelected = isSelected(device.id);
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, device.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    key={device.id}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                    <TableCell>{device.id}</TableCell>
                    <TableCell>{device.name}</TableCell>
                    <TableCell>{device.description}</TableCell>
                    <TableCell>
                      {device.group_id ? (
                        <Chip 
                          label={groups.find(g => g.id === device.group_id)?.name || `Group ${device.group_id}`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        'None'
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(device.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/devices/edit/${device.id}`);
                        }}
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Devices to Group</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Group</InputLabel>
            <Select
              value={selectedGroupId}
              label="Select Group"
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="body2" color="textSecondary" mt={2}>
            {selected.length} device(s) selected
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleAddToGroup}
            variant="contained" 
            color="primary"
            disabled={addToGroupMutation.isLoading}
          >
            {addToGroupMutation.isLoading ? <CircularProgress size={24} /> : 'Add to Group'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DevicesList;