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
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import SyncIcon from '@mui/icons-material/Sync';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Claims({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('filed_date');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    claim_type: '',
    status: '',
    policy_ids: ''
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClaim, setNewClaim] = useState({
    policyId: '',
    claimAmount: '',
    claimType: 'Accident',
    description: '',
    claimDate: ''
  });
  const initialLoadRef = React.useRef(true);
  const fetchTimeoutRef = React.useRef(null);
  const isNavigatingRef = React.useRef(false);
  const hasInitialStateRef = React.useRef(false);
  const currentFiltersRef = React.useRef(null);
  const navigationStateRef = React.useRef(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, claimId: null });

  const claimTypes = ['Accident', 'Theft', 'Damage', 'Medical', 'Liability'];
  const statuses = ['Draft', 'Open', 'Closed'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Handle both URL parameters and navigation state
  useEffect(() => {
    // Handle URL parameter
    const params = new URLSearchParams(location.search);
    const policyId = params.get('policyId');
    if (policyId) {
      navigationStateRef.current = { policyId };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setSearchQuery(policyId);
      // Clear the query parameter to prevent re-applying on re-renders
      window.history.replaceState({}, document.title, '/claims');
    }

    // Handle navigation state
    if (location.state?.filters?.policy_ids) {
      navigationStateRef.current = { policyIds: location.state.filters.policy_ids };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setFilters(prev => ({
        ...prev,
        policy_ids: location.state.filters.policy_ids
      }));
      // Clear the navigation state to prevent re-applying on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.search, location.state]);

  // Store current filters for refresh
  useEffect(() => {
    currentFiltersRef.current = {
      searchQuery,
      filters,
      page,
      rowsPerPage,
      orderBy,
      order
    };
  }, [searchQuery, filters, page, rowsPerPage, orderBy, order]);

  const fetchClaims = async () => {
    // Skip fetch if we're in the middle of a navigation and haven't processed initial state
    if (isNavigatingRef.current && !hasInitialStateRef.current) {
      return;
    }

    // If we have navigation state, use it for the first fetch
    const filtersToUse = navigationStateRef.current ? {
      searchQuery: navigationStateRef.current.policyId,
      filters: {
        ...currentFiltersRef.current?.filters || filters,
        policy_ids: navigationStateRef.current.policyIds || navigationStateRef.current.policyId
      },
      page: currentFiltersRef.current?.page || page,
      rowsPerPage: currentFiltersRef.current?.rowsPerPage || rowsPerPage,
      orderBy: currentFiltersRef.current?.orderBy || orderBy,
      order: currentFiltersRef.current?.order || order
    } : currentFiltersRef.current || {
      searchQuery,
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
      if (filtersToUse.filters.claim_type) params.append('claimType', filtersToUse.filters.claim_type);
      if (filtersToUse.filters.status) params.append('status', filtersToUse.filters.status);
      if (filtersToUse.filters.policy_ids) params.append('policyIds', filtersToUse.filters.policy_ids);
      if (filtersToUse.searchQuery) params.append('policyId', filtersToUse.searchQuery);
      params.append('sortBy', filtersToUse.orderBy);
      params.append('sortOrder', filtersToUse.order);
      params.append('page', filtersToUse.page);
      params.append('size', filtersToUse.rowsPerPage);

      const response = await fetch(`${backendUrl}/api/claims?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      const data = await response.json();
      setRows(data.claims);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError('Failed to fetch claims');
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
      fetchClaims();
      initialLoadRef.current = false;
      return;
    }

    // Otherwise, debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      fetchClaims();
    }, 100);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [selectedDatabase, page, rowsPerPage, orderBy, order, filters, searchQuery, refreshTrigger]);

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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  // Filter and search rows (client-side for sort/pagination)
  const filteredRows = rows;

  const handleNewClaim = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewClaim({
      policyId: '',
      claimAmount: '',
      claimType: 'Accident',
      description: '',
      claimDate: ''
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewClaim({
      ...newClaim,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!newClaim.policyId || !newClaim.claimType || !newClaim.claimAmount) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const claimData = {
        ...newClaim,
        policyId: parseInt(newClaim.policyId, 10),
        claimAmount: parseFloat(newClaim.claimAmount),
        claimDate: newClaim.claimDate
      };

      const response = await fetch(`${backendUrl}/api/claims?database=${selectedDatabase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(claimData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create claim');
      }

      // Refresh the claims list
      const params = new URLSearchParams();
      params.append('database', selectedDatabase);
      params.append('page', page);
      params.append('size', rowsPerPage);
      params.append('sortBy', orderBy);
      params.append('sortOrder', order);
      const refreshResponse = await fetch(`${backendUrl}/api/claims?${params.toString()}`);
      if (!refreshResponse.ok) throw new Error('Failed to refresh claims');
      const data = await refreshResponse.json();
      setRows(data.claims);
      setTotalCount(data.totalCount);
      setError(null); // Clear any previous errors
      handleCloseDialog();
    } catch (err) {
      console.error('Claim creation error:', err);
      setError(err.message || 'Failed to create claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePolicyClick = (policyId) => {
    navigate('/policies', { state: { searchQuery: policyId } });
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('database', selectedDatabase);
      params.append('page', page);
      params.append('size', rowsPerPage);
      params.append('sortBy', orderBy);
      params.append('sortOrder', order);
      if (filters.claim_type) params.append('claimType', filters.claim_type);
      if (filters.claim_id) params.append('claimId', filters.claim_id);
      if (filters.policy_ids && filters.policy_ids.trim()) {
        // Split by comma and trim each ID
        const policyIds = filters.policy_ids.split(',')
          .map(id => id.trim())
          .filter(id => id) // Remove empty strings
          .join(',');
        if (policyIds) {
          params.append('policyIds', policyIds);
        }
      }
      if (searchQuery) params.append('searchQuery', searchQuery);

      const response = await fetch(`${backendUrl}/api/claims?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      const data = await response.json();
      setRows(data.claims);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Error fetching claims:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (claimId) => {
    setConfirmDelete({ open: true, claimId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, claimId: null });
  };

  const handleDeleteConfirm = async () => {
    const { claimId } = confirmDelete;
    setDeletingId(claimId);
    setDeleteError(null);
    try {
      const response = await fetch(`${backendUrl}/api/claims/${claimId}?database=${selectedDatabase}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete claim');
      }
      // Refresh the claims list
      fetchClaims();
      setConfirmDelete({ open: false, claimId: null });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete claim');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return theme.palette.info.main;
      case 'Closed':
        return theme.palette.success.main;
      case 'Draft':
        return theme.palette.grey[600];
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <SyncIcon fontSize="small" />;
      case 'Closed':
        return <CheckCircleIcon fontSize="small" />;
      case 'Draft':
        return <HourglassEmptyIcon fontSize="small" />;
      default:
        return null;
    }
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
              Claims Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track and manage insurance claims
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewClaim}
          >
            File New Claim
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ minWidth: 250 }}
            size="medium"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Claim ID"
            placeholder="Claim ID"
            value={filters.claim_id}
            onChange={(e) => handleFilterChange('claim_id', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          />

          <TextField
            label="Policy IDs"
            placeholder="e.g., 1,2,3"
            value={filters.policy_ids}
            onChange={(e) => handleFilterChange('policy_ids', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          />

          <FormControl sx={{ minWidth: 180 }} size="medium">
            <InputLabel>Claim Type</InputLabel>
            <Select
              value={filters.claim_type}
              onChange={(e) => handleFilterChange('claim_type', e.target.value)}
              label="Claim Type"
            >
              <MenuItem value="">All</MenuItem>
              {claimTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 180 }} size="medium">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
        )}
        {loading ? (
          <Typography sx={{ mb: 2 }}>Loading...</Typography>
        ) : null}

        <TableContainer sx={{
          filter: loading ? 'blur(2px)' : 'none',
          transition: 'filter 0.2s ease-in-out',
          pointerEvents: loading ? 'none' : 'auto'
        }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Policy ID</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'filed_date'}
                    direction={orderBy === 'filed_date' ? order : 'asc'}
                    onClick={() => handleSort('filed_date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'claim_type'}
                    direction={orderBy === 'claim_type' ? order : 'asc'}
                    onClick={() => handleSort('claim_type')}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'claim_amount'}
                    direction={orderBy === 'claim_amount' ? order : 'asc'}
                    onClick={() => handleSort('claim_amount')}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Description</TableCell>
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
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <AssignmentIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No claims found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row, idx) => (
                  <TableRow key={row.claimId || row.claim_id || idx} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{row.claimId ?? row.claim_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handlePolicyClick(row.policyId ?? row.policy_id)}
                        sx={{
                          textTransform: 'none',
                          color: theme.palette.secondary.main,
                          fontWeight: 500,
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        #{row.policyId ?? row.policy_id}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(row.filedDate ?? row.filed_date ?? row.claimDate ?? row.claim_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.claimType ?? row.claim_type}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '6px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {formatAmount(row.claimAmount ?? row.claim_amount, 'USD')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(row.claimStatus ?? row.claim_status)}
                        label={row.claimStatus ?? row.claim_status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(row.claimStatus ?? row.claim_status)}20`,
                          color: getStatusColor(row.claimStatus ?? row.claim_status),
                          fontWeight: 600,
                          borderRadius: '6px',
                          '& .MuiChip-icon': {
                            color: getStatusColor(row.claimStatus ?? row.claim_status),
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Delete Claim">
                        <IconButton
                          aria-label="delete"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(row.claimId ?? row.claim_id)}
                          disabled={deletingId === (row.claimId ?? row.claim_id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>New Claim</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policy ID"
                  type="number"
                  value={newClaim.policyId}
                  onChange={handleInputChange('policyId')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Claim Type</InputLabel>
                  <Select
                    value={newClaim.claimType}
                    onChange={handleInputChange('claimType')}
                    label="Claim Type"
                  >
                    {claimTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Claim Amount"
                  type="number"
                  value={newClaim.claimAmount}
                  onChange={handleInputChange('claimAmount')}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Claim Date"
                  type="date"
                  value={newClaim.claimDate}
                  onChange={handleInputChange('claimDate')}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={newClaim.description}
                  onChange={handleInputChange('description')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={!newClaim.policyId || !newClaim.claimType || !newClaim.claimAmount || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Claim'}
            </Button>
          </DialogActions>
        </Dialog>

        {confirmDelete.open && (
          <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this claim?</Typography>
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
      </Paper>
    </Box>
  );
}

export default Claims;
