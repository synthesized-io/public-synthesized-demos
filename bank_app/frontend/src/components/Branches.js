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

function Branches({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState('branch_id');
  const [order, setOrder] = useState('asc');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, branchId: null });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', region: '', managerName: '' });
  const [addError, setAddError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const regionOptions = ['North', 'South', 'East', 'West', 'Central'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8085';

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/branches?database=${selectedDatabase}`);
      setBranches(response.data);
    } catch (err) {
      setError('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [selectedDatabase, refreshTrigger]);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleEditClick = (branch) => {
    setSelectedBranch(branch);
    setNewManagerName(branch.manager_name);
    setEditDialogOpen(true);
  };

  const handleSaveManager = async () => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/branches/${selectedBranch.branch_id}/manager`,
        null,
        { params: { managerName: newManagerName, database: selectedDatabase } }
      );
      
      setBranches(branches.map(branch => 
        branch.branch_id === selectedBranch.branch_id ? response.data : branch
      ));
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating manager:', error);
    }
  };

  const handleDeleteClick = (branchId) => {
    setConfirmDelete({ open: true, branchId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, branchId: null });
  };

  const handleDeleteConfirm = async () => {
    const { branchId } = confirmDelete;
    setDeletingId(branchId);
    setDeleteError(null);
    try {
      await axios.delete(`${backendUrl}/api/branches/${branchId}`, { params: { database: selectedDatabase } });
      fetchBranches();
      setConfirmDelete({ open: false, branchId: null });
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete branch');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddBranch = () => {
    setAddDialogOpen(true);
    setNewBranch({ name: '', region: '', managerName: '' });
    setAddError(null);
  };

  const handleAddDialogClose = () => {
    setAddDialogOpen(false);
    setAddError(null);
  };

  const handleAddInputChange = (field) => (event) => {
    setNewBranch({ ...newBranch, [field]: event.target.value });
  };

  const handleAddSubmit = async () => {
    if (!newBranch.name || !newBranch.region || !newBranch.managerName) {
      setAddError('All fields are required');
      return;
    }
    setIsAdding(true);
    setAddError(null);
    try {
      await axios.post(`${backendUrl}/api/branches?database=${selectedDatabase}`, newBranch);
      setAddDialogOpen(false);
      fetchBranches();
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add branch');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredAndSortedBranches = React.useMemo(() => {
    return branches
      .filter((branch) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          branch.branch_id.toString().includes(searchLower) ||
          branch.name.toLowerCase().includes(searchLower) ||
          branch.region.toLowerCase().includes(searchLower) ||
          branch.manager_name.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const isAsc = order === 'asc';
        if (orderBy === 'branch_id') {
          return isAsc ? a.branch_id - b.branch_id : b.branch_id - a.branch_id;
        }
        return isAsc
          ? a[orderBy].localeCompare(b[orderBy])
          : b[orderBy].localeCompare(a[orderBy]);
      });
  }, [branches, orderBy, order, searchTerm]);

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
            Branch Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddBranch}
            sx={{ backgroundColor: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.dark } }}
          >
            Add Branch
          </Button>
        </Box>

        <TextField
          fullWidth
          label="Search branches"
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
                      active={orderBy === 'branch_id'}
                      direction={orderBy === 'branch_id' ? order : 'asc'}
                      onClick={() => handleRequestSort('branch_id')}
                      sx={{ color: 'black', fontWeight: 'bold' }}
                    >
                      Branch ID
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                      sx={{ color: 'black', fontWeight: 'bold' }}
                    >
                      Branch Name
                    </TableSortLabel>
                  </TableCell>
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
                      active={orderBy === 'manager_name'}
                      direction={orderBy === 'manager_name' ? order : 'asc'}
                      onClick={() => handleRequestSort('manager_name')}
                      sx={{ color: 'black', fontWeight: 'bold' }}
                    >
                      Manager
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAndSortedBranches.map((branch) => (
                  <TableRow key={branch.branch_id}>
                    <TableCell sx={{ color: 'black' }}>{branch.branch_id}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{branch.name}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{branch.region}</TableCell>
                    <TableCell sx={{ color: 'black' }}>{branch.manager_name}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(branch)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(branch.branch_id)}
                        disabled={deletingId === branch.branch_id}
                        title="Delete Branch"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Branch Manager</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Manager Name"
            fullWidth
            value={newManagerName}
            onChange={(e) => setNewManagerName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveManager} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {confirmDelete.open && (
        <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this branch?</Typography>
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
        <DialogTitle>Add New Branch</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Branch Name"
            fullWidth
            value={newBranch.name}
            onChange={handleAddInputChange('name')}
            required
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel>Region</InputLabel>
            <Select
              value={newBranch.region}
              onChange={handleAddInputChange('region')}
              label="Region"
            >
              {regionOptions.map((region) => (
                <MenuItem key={region} value={region}>{region}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Manager Name"
            fullWidth
            value={newBranch.managerName}
            onChange={handleAddInputChange('managerName')}
            required
            sx={{ mb: 2 }}
          />
          {addError && <Typography color="error">{addError}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddDialogClose} disabled={isAdding}>Cancel</Button>
          <Button onClick={handleAddSubmit} color="primary" variant="contained" disabled={isAdding}>
            {isAdding ? 'Adding...' : 'Add Branch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Branches; 