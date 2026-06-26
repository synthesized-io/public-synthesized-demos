import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Link,
  Avatar,
  Chip,
  Tooltip,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import GroupsIcon from '@mui/icons-material/Groups';
import { useDatabase } from '../context/DatabaseContext';
import { useLocation, useNavigate } from 'react-router-dom';

function Policyholders({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('policyholder_id');
  const [order, setOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [policyholderIdSearch, setPolicyholderIdSearch] = useState('');
  const [filters, setFilters] = useState({
    policyholder_type: ''
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPolicyholder, setNewPolicyholder] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    policyholderType: 'Individual'
  });
  const initialLoadRef = React.useRef(true);
  const fetchTimeoutRef = React.useRef(null);
  const isNavigatingRef = React.useRef(false);
  const hasInitialStateRef = React.useRef(false);
  const currentFiltersRef = React.useRef(null);
  const navigationStateRef = React.useRef(null);
  const [editingPolicyholder, setEditingPolicyholder] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, policyholderId: null });

  const policyholderTypes = ['Individual', 'Family', 'Corporate', 'Group'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Handle policyholderId from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const policyholderId = params.get('policyholderId');
    if (policyholderId) {
      navigationStateRef.current = { policyholderId };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setPolicyholderIdSearch(policyholderId);
      // Clear the query parameter to prevent re-applying on re-renders
      window.history.replaceState({}, document.title, '/policyholders');
    }
  }, [location.search]);

  // Store current filters for refresh
  useEffect(() => {
    currentFiltersRef.current = {
      searchQuery,
      policyholderIdSearch,
      filters,
      page,
      rowsPerPage,
      orderBy,
      order
    };
  }, [searchQuery, policyholderIdSearch, filters, page, rowsPerPage, orderBy, order]);

  const fetchPolicyholders = async () => {
    // Skip fetch if we're in the middle of a navigation and haven't processed initial state
    if (isNavigatingRef.current && !hasInitialStateRef.current) {
      return;
    }

    // If we have navigation state, use it for the first fetch
    const filtersToUse = navigationStateRef.current ? {
      policyholderIdSearch: navigationStateRef.current.policyholderId,
      searchQuery: currentFiltersRef.current?.searchQuery || searchQuery,
      filters: currentFiltersRef.current?.filters || filters,
      page: currentFiltersRef.current?.page || page,
      rowsPerPage: currentFiltersRef.current?.rowsPerPage || rowsPerPage,
      orderBy: currentFiltersRef.current?.orderBy || orderBy,
      order: currentFiltersRef.current?.order || order
    } : currentFiltersRef.current || {
      searchQuery,
      policyholderIdSearch,
      filters,
      page,
      rowsPerPage,
      orderBy,
      order
    };

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('database', selectedDatabase);
      if (filtersToUse.filters.policyholder_type) params.append('policyholderType', filtersToUse.filters.policyholder_type);
      if (filtersToUse.searchQuery) params.append('searchQuery', filtersToUse.searchQuery);
      if (filtersToUse.policyholderIdSearch) params.append('policyholderId', filtersToUse.policyholderIdSearch);
      params.append('sortBy', filtersToUse.orderBy);
      params.append('sortOrder', filtersToUse.order);
      params.append('page', filtersToUse.page);
      params.append('size', filtersToUse.rowsPerPage);

      const response = await fetch(`${backendUrl}/api/policyholders?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch policyholders');
      const data = await response.json();
      setRows(data.policyholders);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError('Failed to fetch policyholders');
    } finally {
      setLoading(false);
      isNavigatingRef.current = false;
      navigationStateRef.current = null;
    }
  };

  useEffect(() => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // If it's the initial load, fetch immediately
    if (initialLoadRef.current) {
      fetchPolicyholders();
      initialLoadRef.current = false;
      return;
    }

    // Otherwise, debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      fetchPolicyholders();
    }, 100);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [selectedDatabase, page, rowsPerPage, orderBy, order, filters, searchQuery, policyholderIdSearch, refreshTrigger]);

  // Reset refs when component unmounts
  useEffect(() => {
    return () => {
      initialLoadRef.current = true;
      isNavigatingRef.current = false;
      hasInitialStateRef.current = false;
      currentFiltersRef.current = null;
      navigationStateRef.current = null;
    };
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearch = () => {
    setPage(0);
    fetchPolicyholders();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const handleNewPolicyholder = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewPolicyholder({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      policyholderType: 'Individual'
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewPolicyholder({
      ...newPolicyholder,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!newPolicyholder.firstName || !newPolicyholder.lastName || !newPolicyholder.email) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const policyholderData = {
        firstName: newPolicyholder.firstName,
        lastName: newPolicyholder.lastName,
        email: newPolicyholder.email,
        phone: newPolicyholder.phone,
        address: newPolicyholder.address,
        dateOfBirth: newPolicyholder.dateOfBirth,
        policyholderType: newPolicyholder.policyholderType
      };

      const response = await fetch(`${backendUrl}/api/policyholders?database=${selectedDatabase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyholderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create policyholder');
      }

      fetchPolicyholders();
      setError(null);
      handleCloseDialog();
    } catch (err) {
      console.error('Policyholder creation error:', err);
      setError(err.message || 'Failed to create policyholder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (policyholder) => {
    setEditingPolicyholder(policyholder);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingPolicyholder(null);
  };

  const handlePolicyholderClick = (policyholderId) => {
    navigate(`/policies`, { state: { policyholderId } });
  };

  const handleViewPolicies = (policyholder) => {
    navigate(`/policies?policyholderId=${policyholder.policyholderId}`, {
      state: {
        policyholderId: policyholder.policyholderId,
        policyholderName: `${policyholder.firstName} ${policyholder.lastName}`
      }
    });
  };

  const handleViewClaims = (policyholder) => {
    navigate(`/claims`, {
      state: {
        filters: {
          policy_ids: policyholder.policyIds?.join(',') || ''
        },
        policyholderId: policyholder.policyholderId,
        policyholderName: `${policyholder.firstName} ${policyholder.lastName}`
      }
    });
  };

  const handleDeleteClick = (policyholderId) => {
    setConfirmDelete({ open: true, policyholderId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, policyholderId: null });
  };

  const handleDeleteConfirm = async () => {
    const { policyholderId } = confirmDelete;
    setDeletingId(policyholderId);
    setDeleteError(null);
    try {
      const response = await fetch(`${backendUrl}/api/policyholders/${policyholderId}?database=${selectedDatabase}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete policyholder');
      }
      // Refresh the policyholders list
      fetchPolicyholders();
      setConfirmDelete({ open: false, policyholderId: null });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete policyholder');
    } finally {
      setDeletingId(null);
    }
  };

  const getPolicyholderTypeIcon = (type) => {
    switch (type) {
      case 'Individual':
        return <PersonIcon />;
      case 'Family':
        return <FamilyRestroomIcon />;
      case 'Corporate':
        return <BusinessIcon />;
      case 'Group':
        return <GroupsIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              Policyholder Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage customer information and policies
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewPolicyholder}
          >
            New Policyholder
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search"
            variant="outlined"
            size="medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton onClick={handleSearch} edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <TextField
            label="Policyholder ID"
            variant="outlined"
            size="medium"
            value={policyholderIdSearch}
            onChange={(e) => setPolicyholderIdSearch(e.target.value)}
            placeholder="Search by ID (exact)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <TextField
            select
            label="Policyholder Type"
            value={filters.policyholder_type}
            onChange={(e) => handleFilterChange('policyholder_type', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          >
            <MenuItem value="">All</MenuItem>
            {policyholderTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Policyholder ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Policies</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={48} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <PersonIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No policyholders found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.policyholderId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{row.policyholderId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 40,
                            height: 40,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(row.firstName, row.lastName)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {`${row.firstName} ${row.lastName}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getPolicyholderTypeIcon(row.policyholderType)}
                        label={row.policyholderType}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '6px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap">
                        {Array.isArray(row.policyIds) && row.policyIds.length > 0 ? (
                          row.policyIds.slice(0, 3).map((policyId) => (
                            <Chip
                              key={policyId}
                              label={`#${policyId}`}
                              size="small"
                              onClick={() => navigate(`/policies?policyId=${policyId}`)}
                              sx={{
                                cursor: 'pointer',
                                bgcolor: `${theme.palette.secondary.main}15`,
                                color: theme.palette.secondary.main,
                                fontWeight: 600,
                                '&:hover': {
                                  bgcolor: `${theme.palette.secondary.main}30`,
                                }
                              }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            None
                          </Typography>
                        )}
                        {Array.isArray(row.policyIds) && row.policyIds.length > 3 && (
                          <Chip
                            label={`+${row.policyIds.length - 3}`}
                            size="small"
                            sx={{
                              bgcolor: theme.palette.grey[200],
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Claims">
                          <IconButton
                            size="small"
                            onClick={() => handleViewClaims(row)}
                            color="primary"
                          >
                            <AssignmentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Policyholder">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(row.policyholderId)}
                            disabled={deletingId === row.policyholderId}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* New Policyholder Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Policyholder</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newPolicyholder.firstName}
                onChange={handleInputChange('firstName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newPolicyholder.lastName}
                onChange={handleInputChange('lastName')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newPolicyholder.email}
                onChange={handleInputChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={newPolicyholder.phone}
                onChange={handleInputChange('phone')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={newPolicyholder.address}
                onChange={handleInputChange('address')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={newPolicyholder.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Policyholder Type</InputLabel>
                <Select
                  value={newPolicyholder.policyholderType}
                  onChange={handleInputChange('policyholderType')}
                  label="Policyholder Type"
                >
                  {policyholderTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {confirmDelete.open && (
        <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this policyholder? This will also delete all related policies and claims.</Typography>
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
    </Box>
  );
}

export default Policyholders;
