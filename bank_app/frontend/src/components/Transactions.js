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
  Select
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate, useLocation } from 'react-router-dom';

function Transactions({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('transaction_date');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    transaction_type: '',
    status: '',
    account_ids: ''
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    accountId: '',
    amount: '',
    transactionType: 'Deposit',
    description: ''
  });
  const initialLoadRef = React.useRef(true);
  const fetchTimeoutRef = React.useRef(null);
  const isNavigatingRef = React.useRef(false);
  const hasInitialStateRef = React.useRef(false);
  const currentFiltersRef = React.useRef(null);
  const navigationStateRef = React.useRef(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, transactionId: null });

  const transactionTypes = ['Deposit', 'Withdrawal', 'Transfer', 'Payment', 'Fee'];
  const statuses = ['Pending', 'Completed', 'Failed', 'Reversed'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8085';

  // Handle both URL parameters and navigation state
  useEffect(() => {
    // Handle URL parameter
    const params = new URLSearchParams(location.search);
    const accountId = params.get('accountId');
    if (accountId) {
      navigationStateRef.current = { accountId };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setSearchQuery(accountId);
      // Clear the query parameter to prevent re-applying on re-renders
      window.history.replaceState({}, document.title, '/transactions');
    }

    // Handle navigation state
    if (location.state?.filters?.account_ids) {
      navigationStateRef.current = { accountIds: location.state.filters.account_ids };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setFilters(prev => ({
        ...prev,
        account_ids: location.state.filters.account_ids
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

  const fetchTransactions = async () => {
    // Skip fetch if we're in the middle of a navigation and haven't processed initial state
    if (isNavigatingRef.current && !hasInitialStateRef.current) {
      return;
    }

    // If we have navigation state, use it for the first fetch
    const filtersToUse = navigationStateRef.current ? {
      searchQuery: navigationStateRef.current.accountId,
      filters: {
        ...currentFiltersRef.current?.filters || filters,
        account_ids: navigationStateRef.current.accountIds || navigationStateRef.current.accountId
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
      if (filtersToUse.filters.transaction_type) params.append('transactionType', filtersToUse.filters.transaction_type);
      if (filtersToUse.filters.status) params.append('status', filtersToUse.filters.status);
      if (filtersToUse.filters.account_ids) params.append('accountIds', filtersToUse.filters.account_ids);
      if (filtersToUse.searchQuery) params.append('accountId', filtersToUse.searchQuery);
      params.append('sortBy', filtersToUse.orderBy);
      params.append('sortOrder', filtersToUse.order);
      params.append('page', filtersToUse.page);
      params.append('size', filtersToUse.rowsPerPage);

      const response = await fetch(`${backendUrl}/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setRows(data.transactions);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError('Failed to fetch transactions');
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
      fetchTransactions();
      initialLoadRef.current = false;
      return;
    }

    // Otherwise, debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      fetchTransactions();
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
      currency: currency
    }).format(amount);
  };

  // Filter and search rows (client-side for sort/pagination)
  const filteredRows = rows;

  const handleNewTransaction = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTransaction({
      accountId: '',
      amount: '',
      transactionType: 'Deposit',
      description: ''
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewTransaction({
      ...newTransaction,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!newTransaction.accountId || !newTransaction.transactionType || !newTransaction.amount) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const transactionData = {
        ...newTransaction,
        accountId: parseInt(newTransaction.accountId, 10),
        amount: parseFloat(newTransaction.amount),
        transactionDate: newTransaction.transactionDate + ':00'
      };

      const response = await fetch(`${backendUrl}/api/transactions?database=${selectedDatabase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create transaction');
      }

      // Refresh the transactions list
      const params = new URLSearchParams();
      params.append('database', selectedDatabase);
      params.append('page', page);
      params.append('size', rowsPerPage);
      params.append('sortBy', orderBy);
      params.append('sortOrder', order);
      const refreshResponse = await fetch(`${backendUrl}/api/transactions?${params.toString()}`);
      if (!refreshResponse.ok) throw new Error('Failed to refresh transactions');
      const data = await refreshResponse.json();
      setRows(data.transactions);
      setTotalCount(data.totalCount);
      setError(null); // Clear any previous errors
      handleCloseDialog();
    } catch (err) {
      console.error('Transaction creation error:', err);
      setError(err.message || 'Failed to create transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountClick = (accountId) => {
    navigate('/accounts', { state: { searchQuery: accountId } });
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
      if (filters.transaction_type) params.append('transactionType', filters.transaction_type);
      if (filters.transaction_id) params.append('transactionId', filters.transaction_id);
      if (filters.account_ids && filters.account_ids.trim()) {
        // Split by comma and trim each ID
        const accountIds = filters.account_ids.split(',')
          .map(id => id.trim())
          .filter(id => id) // Remove empty strings
          .join(',');
        if (accountIds) {
          params.append('accountIds', accountIds);
        }
      }
      if (searchQuery) params.append('searchQuery', searchQuery);

      const response = await fetch(`${backendUrl}/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setRows(data.transactions);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (transactionId) => {
    setConfirmDelete({ open: true, transactionId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, transactionId: null });
  };

  const handleDeleteConfirm = async () => {
    const { transactionId } = confirmDelete;
    setDeletingId(transactionId);
    setDeleteError(null);
    try {
      const response = await fetch(`${backendUrl}/api/transactions/${transactionId}?database=${selectedDatabase}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete transaction');
      }
      // Refresh the transactions list
      fetchTransactions();
      setConfirmDelete({ open: false, transactionId: null });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete transaction');
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
            Transaction History
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewTransaction}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            New Transaction
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search"
            placeholder="Search transactions..."
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
            label="Transaction ID"
            placeholder="Transaction ID"
            value={filters.transaction_id}
            onChange={(e) => handleFilterChange('transaction_id', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          />

          <TextField
            label="Account IDs"
            placeholder="e.g., 1,2,3"
            value={filters.account_ids}
            onChange={(e) => handleFilterChange('account_ids', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          />

          <FormControl sx={{ minWidth: 180 }} size="medium">
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={filters.transaction_type}
              onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
              label="Transaction Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Deposit">Deposit</MenuItem>
              <MenuItem value="Withdrawal">Withdrawal</MenuItem>
              <MenuItem value="Transfer">Transfer</MenuItem>
              <MenuItem value="Payment">Payment</MenuItem>
              <MenuItem value="Fee">Fee</MenuItem>
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
                <TableCell>Account ID</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'transaction_date'}
                    direction={orderBy === 'transaction_date' ? order : 'asc'}
                    onClick={() => handleSort('transaction_date')}
                  >
                    Date
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'transaction_type'}
                    direction={orderBy === 'transaction_type' ? order : 'asc'}
                    onClick={() => handleSort('transaction_type')}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'amount'}
                    direction={orderBy === 'amount' ? order : 'asc'}
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                  </TableSortLabel>
                </TableCell>
                <TableCell>Channel</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row, idx) => (
                <TableRow key={row.transactionId || row.transaction_id || idx}>
                  <TableCell>{row.transactionId ?? row.transaction_id}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleAccountClick(row.accountId ?? row.account_id)}
                      sx={{ 
                        textTransform: 'none',
                        color: theme.palette.primary.main,
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {row.accountId ?? row.account_id}
                    </Button>
                  </TableCell>
                  <TableCell>{formatDate(row.transactionDate ?? row.transaction_date)}</TableCell>
                  <TableCell>{row.transactionType ?? row.transaction_type}</TableCell>
                  <TableCell>{formatAmount(row.amount, row.currency)}</TableCell>
                  <TableCell>{row.channel}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="delete"
                      color="error"
                      onClick={() => handleDeleteClick(row.transactionId ?? row.transaction_id)}
                      disabled={deletingId === (row.transactionId ?? row.transaction_id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
          <DialogTitle>New Transaction</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account ID"
                  type="number"
                  value={newTransaction.accountId}
                  onChange={handleInputChange('accountId')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Transaction Type</InputLabel>
                  <Select
                    value={newTransaction.transactionType}
                    onChange={handleInputChange('transactionType')}
                    label="Transaction Type"
                  >
                    <MenuItem value="Deposit">Deposit</MenuItem>
                    <MenuItem value="Withdrawal">Withdrawal</MenuItem>
                    <MenuItem value="Transfer">Transfer</MenuItem>
                    <MenuItem value="Payment">Payment</MenuItem>
                    <MenuItem value="Fee">Fee</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={newTransaction.amount}
                  onChange={handleInputChange('amount')}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Transaction Date"
                  type="datetime-local"
                  value={newTransaction.transactionDate}
                  onChange={handleInputChange('transactionDate')}
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={newTransaction.currency}
                    onChange={handleInputChange('currency')}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Channel</InputLabel>
                  <Select
                    value={newTransaction.channel}
                    onChange={handleInputChange('channel')}
                    label="Channel"
                  >
                    <MenuItem value="ATM">ATM</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                    <MenuItem value="Mobile">Mobile</MenuItem>
                    <MenuItem value="Branch">Branch</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Auth Method</InputLabel>
                  <Select
                    value={newTransaction.authMethod}
                    onChange={handleInputChange('authMethod')}
                    label="Auth Method"
                  >
                    <MenuItem value="PIN">PIN</MenuItem>
                    <MenuItem value="Password">Password</MenuItem>
                    <MenuItem value="Biometric">Biometric</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                    <MenuItem value="Token">Token</MenuItem>
                    <MenuItem value="None">None</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={newTransaction.location}
                  onChange={handleInputChange('location')}
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
              disabled={!newTransaction.accountId || !newTransaction.transactionType || !newTransaction.amount || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Transaction'}
            </Button>
          </DialogActions>
        </Dialog>

        {confirmDelete.open && (
          <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this transaction?</Typography>
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

export default Transactions; 