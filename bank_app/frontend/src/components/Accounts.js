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
  Link
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDatabase } from '../context/DatabaseContext';
import { useLocation, useNavigate } from 'react-router-dom';

function Accounts({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('account_id');
  const [order, setOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    account_type: '',
    status: ''
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAccount, setNewAccount] = useState({
    customerId: '',
    accountType: '',
    status: 'Active',
    balance: '',
    currency: 'USD'
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const initialLoadRef = React.useRef(true);
  const fetchTimeoutRef = React.useRef(null);
  const isNavigatingRef = React.useRef(false);
  const hasInitialStateRef = React.useRef(false);
  const currentFiltersRef = React.useRef(null);
  const navigationStateRef = React.useRef(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, accountId: null });

  const accountTypes = ['Checking', 'Savings', 'Credit', 'Loan', 'Investment'];
  const statuses = ['Active', 'Closed', 'Frozen', 'Dormant', 'Overdrawn'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8085';

  // Handle incoming search query from navigation
  useEffect(() => {
    if (location.state?.searchQuery) {
      navigationStateRef.current = location.state;
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setSearchQuery(location.state.searchQuery);
      // Clear the state to prevent re-applying on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle accountId or customerId from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accountId = params.get('accountId');
    const customerId = params.get('customerId');
    
    if (accountId) {
      navigationStateRef.current = { searchQuery: accountId };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setSearchQuery(accountId);
      // Clear the query parameter to prevent re-applying on re-renders
      window.history.replaceState({}, document.title, '/accounts');
    }
    
    if (customerId) {
      navigationStateRef.current = { searchQuery: customerId };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setSearchQuery(customerId);
      // Don't clear the query parameter as it's used for filtering
    }
  }, [location.search]);

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

  const fetchAccounts = async () => {
    // Skip fetch if we're in the middle of a navigation and haven't processed initial state
    if (isNavigatingRef.current && !hasInitialStateRef.current) {
      return;
    }

    // If we have navigation state, use it for the first fetch
    const filtersToUse = navigationStateRef.current ? {
      searchQuery: navigationStateRef.current.searchQuery,
      filters: currentFiltersRef.current?.filters || filters,
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
      
      if (filtersToUse.filters.account_type) params.append('accountType', filtersToUse.filters.account_type);
      if (filtersToUse.filters.status) params.append('status', filtersToUse.filters.status);
      if (filtersToUse.searchQuery) {
        // If the search query is a number, treat it as an ID
        if (!isNaN(filtersToUse.searchQuery)) {
          params.append('accountId', filtersToUse.searchQuery);
        } else {
          params.append('searchQuery', filtersToUse.searchQuery);
        }
      }
      params.append('sortBy', filtersToUse.orderBy);
      params.append('sortOrder', filtersToUse.order);
      params.append('page', filtersToUse.page);
      params.append('size', filtersToUse.rowsPerPage);

      const response = await fetch(`${backendUrl}/api/accounts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setRows(data.accounts);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError('Failed to fetch accounts');
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
      fetchAccounts();
      initialLoadRef.current = false;
      return;
    }

    // Otherwise, debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      fetchAccounts();
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleNewAccount = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewAccount({
      customerId: '',
      accountType: '',
      status: 'Active',
      balance: '',
      currency: 'USD'
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewAccount({
      ...newAccount,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!newAccount.customerId || !newAccount.accountType || !newAccount.balance) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const accountData = {
        ...newAccount,
        customerId: parseInt(newAccount.customerId, 10),
        balance: parseFloat(newAccount.balance)
      };

      const response = await fetch(`${backendUrl}/api/accounts?database=${selectedDatabase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      // Refresh the accounts list
      const params = new URLSearchParams();
      params.append('database', selectedDatabase);
      params.append('page', page);
      params.append('size', rowsPerPage);
      params.append('sortBy', orderBy);
      params.append('sortOrder', order);
      const refreshResponse = await fetch(`${backendUrl}/api/accounts?${params.toString()}`);
      if (!refreshResponse.ok) throw new Error('Failed to refresh accounts');
      const data = await refreshResponse.json();
      setRows(data.accounts);
      setTotalCount(data.totalCount);
      setError(null);
      handleCloseDialog();
    } catch (err) {
      console.error('Account creation error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (account) => {
    setEditingAccount(account);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingAccount(null);
  };

  const handleStatusUpdate = async () => {
    if (!editingAccount) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`${backendUrl}/api/accounts/${editingAccount.accountId}?database=${selectedDatabase}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editingAccount.status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update account status');
      }

      // Refresh the accounts list
      const params = new URLSearchParams();
      params.append('database', selectedDatabase);
      if (filters.account_type) params.append('accountType', filters.account_type);
      if (filters.status) params.append('status', filters.status);
      if (searchQuery) params.append('searchQuery', searchQuery);
      params.append('sortBy', orderBy);
      params.append('sortOrder', order);
      params.append('page', page);
      params.append('size', rowsPerPage);
      const refreshResponse = await fetch(`${backendUrl}/api/accounts?${params.toString()}`);
      if (!refreshResponse.ok) throw new Error('Failed to refresh accounts');
      const data = await refreshResponse.json();
      setRows(data.accounts);
      setTotalCount(data.totalCount);
      setError(null);
      handleCloseEditDialog();
    } catch (err) {
      console.error('Account update error:', err);
      setError(err.message || 'Failed to update account status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (event) => {
    setEditingAccount(prev => ({
      ...prev,
      status: event.target.value
    }));
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
      if (filters.account_type) params.append('accountType', filters.account_type);
      if (filters.status) params.append('status', filters.status);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${backendUrl}/api/accounts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setRows(data.accounts);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountClick = (accountId) => {
    navigate('/transactions', { 
      state: { 
        filters: {
          account_ids: accountId.toString()
        }
      }
    });
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/customers?customerId=${customerId}`);
  };

  const handleDeleteClick = (accountId) => {
    setConfirmDelete({ open: true, accountId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, accountId: null });
  };

  const handleDeleteConfirm = async () => {
    const { accountId } = confirmDelete;
    setDeletingId(accountId);
    setDeleteError(null);
    try {
      const response = await fetch(`${backendUrl}/api/accounts/${accountId}?database=${selectedDatabase}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }
      // Refresh the accounts list
      fetchAccounts();
      setConfirmDelete({ open: false, accountId: null });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete account');
    } finally {
      setDeletingId(null);
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ color: 'black' }}>
            Account Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewAccount}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            New Account
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Account ID"
            variant="outlined"
            size="medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID (exact)"

            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />

          <TextField
            select
            label="Account Type"
            value={filters.account_type}
            onChange={(e) => handleFilterChange('account_type', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          >
            <MenuItem value="">All</MenuItem>
            {accountTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          >
            <MenuItem value="">All</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
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
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'account_id'}
                    direction={orderBy === 'account_id' ? order : 'asc'}
                    onClick={() => handleSort('account_id')}
                  >
                    Account ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'customer_id'}
                    direction={orderBy === 'customer_id' ? order : 'asc'}
                    onClick={() => handleSort('customer_id')}
                  >
                    Customer ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'account_type'}
                    direction={orderBy === 'account_type' ? order : 'asc'}
                    onClick={() => handleSort('account_type')}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'status'}
                    direction={orderBy === 'status' ? order : 'asc'}
                    onClick={() => handleSort('status')}
                  >
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'balance'}
                    direction={orderBy === 'balance' ? order : 'asc'}
                    onClick={() => handleSort('balance')}
                  >
                    Balance
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No accounts found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.accountId}>
                    <TableCell>{row.accountId}</TableCell>
                    <TableCell>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => handleCustomerClick(row.customerId)}
                        sx={{ 
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {row.customerId}
                      </Link>
                    </TableCell>
                    <TableCell>{row.accountType}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell align="right">{formatCurrency(row.balance)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleAccountClick(row.accountId)}
                          title="View Transactions"
                        >
                          <ReceiptIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(row)}
                          title="Edit Account"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteClick(row.accountId)}
                          title="Delete Account"
                          disabled={deletingId === row.accountId}
                        >
                          <DeleteIcon />
                        </IconButton>
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

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>New Account</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer ID"
                  type="number"
                  value={newAccount.customerId}
                  onChange={handleInputChange('customerId')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    value={newAccount.accountType}
                    onChange={handleInputChange('accountType')}
                    label="Account Type"
                  >
                    {accountTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newAccount.status}
                    onChange={handleInputChange('status')}
                    label="Status"
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Initial Balance"
                  type="number"
                  value={newAccount.balance}
                  onChange={handleInputChange('balance')}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={newAccount.currency}
                    onChange={handleInputChange('currency')}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary"
              disabled={!newAccount.customerId || !newAccount.accountType || !newAccount.balance || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Account Status</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Account ID: {editingAccount?.accountId}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editingAccount?.status || ''}
                    onChange={handleStatusChange}
                    label="Status"
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogActions>
        </Dialog>

        {confirmDelete.open && (
          <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this account? This will also delete all related transactions.</Typography>
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

export default Accounts; 