import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, IconButton, Checkbox, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getAllCommands, deleteCommand, deleteMultipleCommands } from '../../api/commandApi';
import { useNotification } from '../../hooks/useNotification';

const CommandsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();
  const [selected, setSelected] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const { data: commands = [], isLoading } = useQuery('commands', getAllCommands);

  const deleteMutation = useMutation(
    (id) => deleteCommand(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('commands');
        showNotification('Command deleted successfully', 'success');
      },
      onError: (error) => {
        showNotification(
          error.response?.data?.detail || 'Failed to delete command',
          'error'
        );
      }
    }
  );

  const deleteMultipleMutation = useMutation(
    (ids) => deleteMultipleCommands(ids),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('commands');
        showNotification('Commands deleted successfully', 'success');
        setSelected([]);
      },
      onError: (error) => {
        showNotification(
          error.response?.data?.detail || 'Failed to delete commands',
          'error'
        );
      }
    }
  );

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = commands.map((command) => command.id);
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

  const handleOpenDeleteDialog = (id) => {
    setDeleteId(id);
    setOpenDialog(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    } else if (selected.length > 0) {
      deleteMultipleMutation.mutate(selected);
    }
    setOpenDialog(false);
    setDeleteId(null);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Commands
        </Typography>
        <Box>
          {selected.length > 0 && (
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={() => setOpenDialog(true)}
              sx={{ mr: 2 }}
            >
              Delete Selected
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/commands/new')}
          >
            New Command
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
                    indeterminate={selected.length > 0 && selected.length < commands.length}
                    checked={commands.length > 0 && selected.length === commands.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Command</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {commands.map((command) => {
                const isItemSelected = isSelected(command.id);
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, command.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    selected={isItemSelected}
                    key={command.id}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox checked={isItemSelected} />
                    </TableCell>
                    <TableCell>{command.id}</TableCell>
                    <TableCell>{command.command}</TableCell>
                    <TableCell>
                      {new Date(command.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/commands/edit/${command.id}`);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDeleteDialog(command.id);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteId
              ? "Are you sure you want to delete this command?"
              : `Are you sure you want to delete ${selected.length} selected commands?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            {deleteMutation.isLoading || deleteMultipleMutation.isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommandsList;