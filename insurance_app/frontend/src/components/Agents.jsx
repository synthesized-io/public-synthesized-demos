import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  TextField,
  TableSortLabel,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import { useDatabase } from '../context/DatabaseContext';

function Agents({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('agent_id');
  const [order, setOrder] = useState('asc');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, agentId: null });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ firstName: '', lastName: '', email: '', phone: '', region: '' });
  const [addError, setAddError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const regionOptions = ['North', 'South', 'East', 'West', 'Central'];
  const statusOptions = ['Active', 'Inactive', 'Suspended'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  const fetchAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/agents?database=${selectedDatabase}`);
      setAgents(response.data);
    } catch (err) {
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [selectedDatabase, refreshTrigger]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleEditClick = (agent) => {
    setSelectedAgent(agent);
    setNewStatus(agent.status);
    setEditDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/agents/${selectedAgent.agent_id}/status`,
        null,
        { params: { status: newStatus, database: selectedDatabase } }
      );

      setAgents(agents.map(agent =>
        agent.agent_id === selectedAgent.agent_id ? response.data : agent
      ));

      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteClick = (agentId) => {
    setConfirmDelete({ open: true, agentId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, agentId: null });
  };

  const handleDeleteConfirm = async () => {
    const { agentId } = confirmDelete;
    setDeletingId(agentId);
    setDeleteError(null);
    try {
      await axios.delete(`${backendUrl}/api/agents/${agentId}`, { params: { database: selectedDatabase } });
      fetchAgents();
      setConfirmDelete({ open: false, agentId: null });
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete agent');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddAgent = () => {
    setAddDialogOpen(true);
    setNewAgent({ firstName: '', lastName: '', email: '', phone: '', region: '' });
    setAddError(null);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setAddError(null);
  };

  const handleAddInputChange = (field) => (event) => {
    setNewAgent({ ...newAgent, [field]: event.target.value });
  };

  const handleAddSubmit = async () => {
    if (!newAgent.firstName || !newAgent.lastName || !newAgent.email || !newAgent.region) {
      setAddError('All fields are required');
      return;
    }
    setIsAdding(true);
    setAddError(null);
    try {
      await axios.post(`${backendUrl}/api/agents?database=${selectedDatabase}`, newAgent);
      setAddDialogOpen(false);
      fetchAgents();
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add agent');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredAndSortedAgents = React.useMemo(() => {
    return agents
      .filter((agent) => {
        const searchLower = searchTerm.toLowerCase();
        const agentId = agent.agentId ?? agent.agent_id;
        const firstName = agent.firstName ?? agent.first_name;
        const lastName = agent.lastName ?? agent.last_name;
        return (
          agentId.toString().includes(searchLower) ||
          firstName.toLowerCase().includes(searchLower) ||
          lastName.toLowerCase().includes(searchLower) ||
          agent.email.toLowerCase().includes(searchLower) ||
          agent.region.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const isAsc = order === 'asc';
        if (orderBy === 'agent_id') {
          const aId = a.agentId ?? a.agent_id;
          const bId = b.agentId ?? b.agent_id;
          return isAsc ? aId - bId : bId - aId;
        }
        const aVal = a[orderBy] ?? a[orderBy.replace(/([A-Z])/g, '_$1').toLowerCase()];
        const bVal = b[orderBy] ?? b[orderBy.replace(/([A-Z])/g, '_$1').toLowerCase()];
        return isAsc
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
  }, [agents, orderBy, order, searchTerm]);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: '#ffffff',
          border: `1px solid ${theme.palette.grey[200]}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: 'black' }}>
            Agent Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddAgent}
            sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}
          >
            Add Agent
          </Button>
        </Box>

        <TextField
          fullWidth
          label="Search agents"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'agent_id'}
                      direction={orderBy === 'agent_id' ? order : 'asc'}
                      onClick={() => handleRequestSort('agent_id')}
                      sx={{ color: 'black', fontWeight: 'bold' }}
                    >
                      Agent ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'first_name'}
                      direction={orderBy === 'first_name' ? order : 'asc'}
                      onClick={() => handleRequestSort('first_name')}
                      sx={{ color: 'black', fontWeight: 'bold' }}
                    >
                      First Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'last_name'}
                      direction={orderBy === 'last_name' ? order : 'asc'}
                      onClick={() => handleRequestSort('last_name')}
                      sx={{ color: 'black', fontWeight: 'bold' }}
                    >
                      Last Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'email'}
                      direction={orderBy === 'email' ? order : 'asc'}
                      onClick={() => handleRequestSort('email')}
                      sx={{ color: 'black', fontWeight: 'bold' }}
                    >
                      Email
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'region'}
                      direction={orderBy === 'region' ? order : 'asc'}
                      onClick={() => handleRequestSort('region')}
                      sx={{ color: 'black', fontWeight: 'bold' }}
                    >
                      Region
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleRequestSort('status')}
                      sx={{ color: 'black', fontWeight: 'bold' }}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedAgents.map((agent) => {
                  const agentId = agent.agentId ?? agent.agent_id;
                  const firstName = agent.firstName ?? agent.first_name;
                  const lastName = agent.lastName ?? agent.last_name;
                  return (
                    <TableRow key={agentId}>
                      <TableCell sx={{ color: 'black' }}>{agentId}</TableCell>
                      <TableCell sx={{ color: 'black' }}>{firstName}</TableCell>
                      <TableCell sx={{ color: 'black' }}>{lastName}</TableCell>
                      <TableCell sx={{ color: 'black' }}>{agent.email}</TableCell>
                      <TableCell sx={{ color: 'black' }}>{agent.phone}</TableCell>
                      <TableCell sx={{ color: 'black' }}>{agent.region}</TableCell>
                      <TableCell sx={{ color: 'black' }}>{agent.status || 'Active'}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditClick(agent)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(agentId)}
                          disabled={deletingId === agentId}
                          title="Delete Agent"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Agent Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveStatus} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {confirmDelete.open && (
        <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this agent?</Typography>
            {deleteError && <Typography color="error">{deleteError}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} disabled={deletingId !== null}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deletingId !== null}>
              {deletingId !== null ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <Dialog open={addDialogOpen} onClose={handleAddDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Agent</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            fullWidth
            value={newAgent.firstName}
            onChange={handleAddInputChange('firstName')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={newAgent.lastName}
            onChange={handleAddInputChange('lastName')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={newAgent.email}
            onChange={handleAddInputChange('email')}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={newAgent.phone}
            onChange={handleAddInputChange('phone')}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Region</InputLabel>
            <Select
              value={newAgent.region}
              onChange={handleAddInputChange('region')}
              label="Region"
            >
              {regionOptions.map((region) => (
                <MenuItem key={region} value={region}>{region}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {addError && <Typography color="error">{addError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose} disabled={isAdding}>Cancel</Button>
          <Button onClick={handleAddSubmit} color="primary" variant="contained" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Agent'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Agents;
