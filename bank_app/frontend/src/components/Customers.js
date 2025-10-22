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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDatabase } from '../context/DatabaseContext';
import { useLocation, useNavigate } from 'react-router-dom';

function Customers({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('customer_id');
  const [order, setOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerIdSearch, setCustomerIdSearch] = useState('');
  const [filters, setFilters] = useState({
    customer_type: ''
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    customerType: 'Individual'
  });
  const initialLoadRef = React.useRef(true);
  const fetchTimeoutRef = React.useRef(null);
  const isNavigatingRef = React.useRef(false);
  const hasInitialStateRef = React.useRef(false);
  const currentFiltersRef = React.useRef(null);
  const navigationStateRef = React.useRef(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, customerId: null });

  const customerTypes = ['Individual', 'Business', 'VIP', 'Government', 'Nonprofit'];
  const statuses = ['Active', 'Inactive', 'Suspended'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8085';

  // Handle customerId from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const customerId = params.get('customerId');
    if (customerId) {
      navigationStateRef.current = { customerId };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setCustomerIdSearch(customerId);
      // Clear the query parameter to prevent re-applying on re-renders
      window.history.replaceState({}, document.title, '/customers');
    }
  }, [location.search]);

  // Store current filters for refresh
  useEffect(() => {
    currentFiltersRef.current = {
      searchQuery,
      customerIdSearch,
      filters,
      page,
      rowsPerPage,
      orderBy,
      order
    };
  }, [searchQuery, customerIdSearch, filters, page, rowsPerPage, orderBy, order]);

  const fetchCustomers = async () => {
    // Skip fetch if we're in the middle of a navigation and haven't processed initial state
    if (isNavigatingRef.current && !hasInitialStateRef.current) {
      return;
    }

    // If we have navigation state, use it for the first fetch
    const filtersToUse = navigationStateRef.current ? {
      customerIdSearch: navigationStateRef.current.customerId,
      searchQuery: currentFiltersRef.current?.searchQuery || searchQuery,
      filters: currentFiltersRef.current?.filters || filters,
      page: currentFiltersRef.current?.page || page,
      rowsPerPage: currentFiltersRef.current?.rowsPerPage || rowsPerPage,
      orderBy: currentFiltersRef.current?.orderBy || orderBy,
      order: currentFiltersRef.current?.order || order
    } : currentFiltersRef.current || {
      searchQuery,
      customerIdSearch,
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
      if (filtersToUse.filters.customer_type) params.append('customerType', filtersToUse.filters.customer_type);
      if (filtersToUse.searchQuery) params.append('searchQuery', filtersToUse.searchQuery);
      if (filtersToUse.customerIdSearch) params.append('customerId', filtersToUse.customerIdSearch);
      params.append('sortBy', filtersToUse.orderBy);
      params.append('sortOrder', filtersToUse.order);
      params.append('page', filtersToUse.page);
      params.append('size', filtersToUse.rowsPerPage);

      const response = await fetch(`${backendUrl}/api/customers?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setRows(data.customers);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError('Failed to fetch customers');
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
      fetchCustomers();
      initialLoadRef.current = false;
      return;
    }

    // Otherwise, debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      fetchCustomers();
    }, 100);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [selectedDatabase, page, rowsPerPage, orderBy, order, filters, searchQuery, customerIdSearch, refreshTrigger]);

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
    fetchCustomers();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const handleNewCustomer = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCustomer({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      customerType: 'Individual'
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewCustomer({
      ...newCustomer,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const customerData = {
        firstName: newCustomer.firstName,
        lastName: newCustomer.lastName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        customerType: newCustomer.customerType
      };

      const response = await fetch(`${backendUrl}/api/customers?database=${selectedDatabase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create customer');
      }

      fetchCustomers();
      setError(null);
      handleCloseDialog();
    } catch (err) {
      console.error('Customer creation error:', err);
      setError(err.message || 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleCustomerClick = (customerId) => {
    navigate(`/accounts`, { state: { customerId } });
  };

  const handleViewAccounts = (customer) => {
    navigate(`/accounts?customerId=${customer.customerId}`, { 
      state: { 
        customerId: customer.customerId,
        customerName: `${customer.firstName} ${customer.lastName}`
      }
    });
  };

  const handleViewTransactions = (customer) => {
    navigate(`/transactions`, {
      state: {
        filters: {
          account_ids: customer.accountIds?.join(',') || ''
        },
        customerId: customer.customerId,
        customerName: `${customer.firstName} ${customer.lastName}`
      }
    });
  };

  const handleDeleteClick = (customerId) => {
    setConfirmDelete({ open: true, customerId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, customerId: null });
  };

  const handleDeleteConfirm = async () => {
    const { customerId } = confirmDelete;
    setDeletingId(customerId);
    setDeleteError(null);
    try {
      const response = await fetch(`${backendUrl}/api/customers/${customerId}?database=${selectedDatabase}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }
      // Refresh the customers list
      fetchCustomers();
      setConfirmDelete({ open: false, customerId: null });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete customer');
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
            Customer Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewCustomer}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            New Customer
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
            label="Customer ID"
            variant="outlined"
            size="medium"
            value={customerIdSearch}
            onChange={(e) => setCustomerIdSearch(e.target.value)}
            placeholder="Search by ID (exact)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <TextField
            select
            label="Customer Type"
            value={filters.customer_type}
            onChange={(e) => handleFilterChange('customer_type', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          >
            <MenuItem value="">All</MenuItem>
            {customerTypes.map((type) => (
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
                <TableCell>Customer ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Accounts</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.customerId}>
                    <TableCell>{row.customerId}</TableCell>
                    <TableCell>{`${row.firstName} ${row.lastName}`}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.customerType}</TableCell>
                    <TableCell>
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(row.accountIds) && row.accountIds.length > 0 ? (
                        row.accountIds.map((accountId, idx) => (
                          <Link
                            key={accountId}
                            component="button"
                            variant="body2"
                            onClick={() => navigate(`/accounts?accountId=${accountId}`)}
                            sx={{
                              mr: 1,
                              textDecoration: 'none',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {accountId}
                          </Link>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary">None</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewTransactions(row)}
                        title="View Transactions"
                      >
                        <ReceiptIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(row.customerId)}
                        title="Delete Customer"
                        disabled={deletingId === row.customerId}
                      >
                        <DeleteIcon />
                      </IconButton>
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

      {/* New Customer Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>New Customer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newCustomer.firstName}
                onChange={handleInputChange('firstName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newCustomer.lastName}
                onChange={handleInputChange('lastName')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newCustomer.email}
                onChange={handleInputChange('email')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={newCustomer.phone}
                onChange={handleInputChange('phone')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Customer Type</InputLabel>
                <Select
                  value={newCustomer.customerType}
                  onChange={handleInputChange('customerType')}
                  label="Customer Type"
                >
                  {customerTypes.map((type) => (
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
            <Typography>Are you sure you want to delete this customer? This will also delete all related accounts, transactions, and transaction metadata.</Typography>
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

export default Customers; 