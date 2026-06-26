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
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DescriptionIcon from '@mui/icons-material/Description';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import { useDatabase } from '../context/DatabaseContext';
import { useLocation, useNavigate } from 'react-router-dom';

// Policy Card Component
function PolicyCard({ policy, onEdit, onDelete, onViewClaims, onViewPolicyholder }) {
  const theme = useTheme();

  const getStatusColor = (status) => {
    switch (status) {
      case 'InForce':
        return theme.palette.success.main;
      case 'Bound':
        return theme.palette.info.main;
      case 'Expired':
        return theme.palette.warning.main;
      case 'Cancelled':
        return theme.palette.error.main;
      case 'Draft':
        return theme.palette.grey[600];
      case 'Withdrawn':
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[500];
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{
                bgcolor: `${getStatusColor(policy.status)}20`,
                color: getStatusColor(policy.status),
                mr: 1.5,
                width: 48,
                height: 48,
              }}
            >
              <DescriptionIcon />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Policy ID
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                #{policy.policyId}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={policy.status}
            size="small"
            sx={{
              bgcolor: `${getStatusColor(policy.status)}20`,
              color: getStatusColor(policy.status),
              fontWeight: 600,
              borderRadius: '6px',
            }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DescriptionIcon sx={{ fontSize: 18, color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Type:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {policy.policyType}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ fontSize: 18, color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Policyholder:
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={() => onViewPolicyholder(policy.policyholderId)}
              sx={{ fontWeight: 600, textDecoration: 'none' }}
            >
              {policy.policyholderFirstName && policy.policyholderLastName
                ? `${policy.policyholderFirstName} ${policy.policyholderLastName} (#${policy.policyholderId})`
                : `#${policy.policyholderId}`}
            </Link>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon sx={{ fontSize: 18, color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Premium:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
              {formatCurrency(policy.premiumAmount)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AttachMoneyIcon sx={{ fontSize: 18, color: theme.palette.text.secondary, mr: 1 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Coverage:
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatCurrency(policy.coverageAmount)}
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Box>
          <Button
            size="small"
            onClick={() => onViewClaims(policy.policyId)}
            sx={{ textTransform: 'none', minWidth: 'auto' }}
          >
            {policy.claimCount || 0} {policy.claimCount === 1 ? 'claim' : 'claims'}
          </Button>
        </Box>
        <Box>
          <Tooltip title="Edit Policy">
            <IconButton size="small" onClick={() => onEdit(policy)} color="primary">
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Policy">
            <IconButton size="small" onClick={() => onDelete(policy.policyId)} color="error">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
}

function Policies({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [orderBy, setOrderBy] = useState('policy_id');
  const [order, setOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    policy_type: '',
    status: ''
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    policyholderId: '',
    policyType: '',
    status: 'InForce',
    premium: '',
    coverageAmount: '',
    startDate: '',
    endDate: ''
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const initialLoadRef = React.useRef(true);
  const fetchTimeoutRef = React.useRef(null);
  const isNavigatingRef = React.useRef(false);
  const hasInitialStateRef = React.useRef(false);
  const currentFiltersRef = React.useRef(null);
  const navigationStateRef = React.useRef(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, policyId: null });

  const policyTypes = ['Auto', 'Home', 'Life', 'Health', 'Business'];
  const statuses = ['InForce', 'Bound', 'Expired', 'Cancelled', 'Draft', 'Withdrawn'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

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

  // Handle policyId or policyholderId from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const policyId = params.get('policyId');
    const policyholderId = params.get('policyholderId');

    if (policyId) {
      navigationStateRef.current = { searchQuery: policyId };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setSearchQuery(policyId);
      // Clear the query parameter to prevent re-applying on re-renders
      window.history.replaceState({}, document.title, '/policies');
    }

    if (policyholderId) {
      navigationStateRef.current = { searchQuery: policyholderId };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setSearchQuery(policyholderId);
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

  const fetchPolicies = async () => {
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

      if (filtersToUse.filters.policy_type) params.append('policyType', filtersToUse.filters.policy_type);
      if (filtersToUse.filters.status) params.append('status', filtersToUse.filters.status);
      if (filtersToUse.searchQuery) {
        // If the search query is a number, treat it as an ID
        if (!isNaN(filtersToUse.searchQuery)) {
          params.append('policyId', filtersToUse.searchQuery);
        } else {
          params.append('searchQuery', filtersToUse.searchQuery);
        }
      }
      params.append('sortBy', filtersToUse.orderBy);
      params.append('sortOrder', filtersToUse.order);
      params.append('page', filtersToUse.page);
      params.append('size', filtersToUse.rowsPerPage);

      const response = await fetch(`${backendUrl}/api/policies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data = await response.json();
      setRows(data.policies);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError('Failed to fetch policies');
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
      fetchPolicies();
      initialLoadRef.current = false;
      return;
    }

    // Otherwise, debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      fetchPolicies();
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

  const handleNewPolicy = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewPolicy({
      policyholderId: '',
      policyType: '',
      status: 'InForce',
      premium: '',
      coverageAmount: '',
      startDate: '',
      endDate: ''
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewPolicy({
      ...newPolicy,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!newPolicy.policyholderId || !newPolicy.policyType || !newPolicy.premium || !newPolicy.coverageAmount) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const policyData = {
        ...newPolicy,
        policyholderId: parseInt(newPolicy.policyholderId, 10),
        premium: parseFloat(newPolicy.premium),
        coverageAmount: parseFloat(newPolicy.coverageAmount)
      };

      const response = await fetch(`${backendUrl}/api/policies?database=${selectedDatabase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(policyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create policy');
      }

      // Refresh the policies list
      const params = new URLSearchParams();
      params.append('database', selectedDatabase);
      params.append('page', page);
      params.append('size', rowsPerPage);
      params.append('sortBy', orderBy);
      params.append('sortOrder', order);
      const refreshResponse = await fetch(`${backendUrl}/api/policies?${params.toString()}`);
      if (!refreshResponse.ok) throw new Error('Failed to refresh policies');
      const data = await refreshResponse.json();
      setRows(data.policies);
      setTotalCount(data.totalCount);
      setError(null);
      handleCloseDialog();
    } catch (err) {
      console.error('Policy creation error:', err);
      setError(err.message || 'Failed to create policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (policy) => {
    setEditingPolicy(policy);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingPolicy(null);
  };

  const handleStatusUpdate = async () => {
    if (!editingPolicy) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`${backendUrl}/api/policies/${editingPolicy.policyId}?database=${selectedDatabase}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editingPolicy.status
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update policy status');
      }

      // Refresh the policies list
      const params = new URLSearchParams();
      params.append('database', selectedDatabase);
      if (filters.policy_type) params.append('policyType', filters.policy_type);
      if (filters.status) params.append('status', filters.status);
      if (searchQuery) params.append('searchQuery', searchQuery);
      params.append('sortBy', orderBy);
      params.append('sortOrder', order);
      params.append('page', page);
      params.append('size', rowsPerPage);
      const refreshResponse = await fetch(`${backendUrl}/api/policies?${params.toString()}`);
      if (!refreshResponse.ok) throw new Error('Failed to refresh policies');
      const data = await refreshResponse.json();
      setRows(data.policies);
      setTotalCount(data.totalCount);
      setError(null);
      handleCloseEditDialog();
    } catch (err) {
      console.error('Policy update error:', err);
      setError(err.message || 'Failed to update policy status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (event) => {
    setEditingPolicy(prev => ({
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
      if (filters.policy_type) params.append('policyType', filters.policy_type);
      if (filters.status) params.append('status', filters.status);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${backendUrl}/api/policies?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch policies');
      const data = await response.json();
      setRows(data.policies);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Error fetching policies:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePolicyClick = (policyId) => {
    navigate('/claims', {
      state: {
        filters: {
          policy_ids: policyId.toString()
        }
      }
    });
  };

  const handlePolicyholderClick = (policyholderId) => {
    navigate(`/policyholders?policyholderId=${policyholderId}`);
  };

  const handleDeleteClick = (policyId) => {
    setConfirmDelete({ open: true, policyId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, policyId: null });
  };

  const handleDeleteConfirm = async () => {
    const { policyId } = confirmDelete;
    setDeletingId(policyId);
    setDeleteError(null);
    try {
      const response = await fetch(`${backendUrl}/api/policies/${policyId}?database=${selectedDatabase}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete policy');
      }
      // Refresh the policies list
      fetchPolicies();
      setConfirmDelete({ open: false, policyId: null });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete policy');
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
              Policy Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and track all insurance policies
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newView) => newView && setViewMode(newView)}
              size="small"
            >
              <ToggleButton value="card">
                <ViewModuleIcon sx={{ mr: 0.5 }} fontSize="small" />
                Cards
              </ToggleButton>
              <ToggleButton value="table">
                <ViewListIcon sx={{ mr: 0.5 }} fontSize="small" />
                Table
              </ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewPolicy}
            >
              New Policy
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search Policy ID"
            variant="outlined"
            size="medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter policy ID"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />

          <TextField
            select
            label="Policy Type"
            value={filters.policy_type}
            onChange={(e) => handleFilterChange('policy_type', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          >
            <MenuItem value="">All Types</MenuItem>
            {policyTypes.map((type) => (
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
            <MenuItem value="">All Statuses</MenuItem>
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

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={48} />
          </Box>
        )}

        {!loading && rows.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <DescriptionIcon sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No policies found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or create a new policy
            </Typography>
          </Box>
        )}

        {!loading && rows.length > 0 && viewMode === 'card' && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {rows.map((policy) => (
              <Grid item xs={12} sm={6} md={4} key={policy.policyId}>
                <PolicyCard
                  policy={policy}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onViewClaims={handlePolicyClick}
                  onViewPolicyholder={handlePolicyholderClick}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && rows.length > 0 && viewMode === 'table' && (
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
                    active={orderBy === 'policy_id'}
                    direction={orderBy === 'policy_id' ? order : 'asc'}
                    onClick={() => handleSort('policy_id')}
                  >
                    Policy ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'policyholder_id'}
                    direction={orderBy === 'policyholder_id' ? order : 'asc'}
                    onClick={() => handleSort('policyholder_id')}
                  >
                    Policyholder ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'policy_type'}
                    direction={orderBy === 'policy_type' ? order : 'asc'}
                    onClick={() => handleSort('policy_type')}
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
                    active={orderBy === 'premium'}
                    direction={orderBy === 'premium' ? order : 'asc'}
                    onClick={() => handleSort('premium')}
                  >
                    Premium
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Coverage Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const getStatusColor = (status) => {
                  switch (status) {
                    case 'InForce':
                      return theme.palette.success.main;
                    case 'Bound':
                      return theme.palette.info.main;
                    case 'Expired':
                      return theme.palette.warning.main;
                    case 'Cancelled':
                      return theme.palette.error.main;
                    case 'Draft':
                      return theme.palette.grey[600];
                    case 'Withdrawn':
                      return theme.palette.grey[500];
                    default:
                      return theme.palette.grey[500];
                  }
                };

                return (
                  <TableRow key={row.policyId} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        #{row.policyId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => handlePolicyholderClick(row.policyholderId)}
                        sx={{
                          fontWeight: 500,
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        #{row.policyholderId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.policyType}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: '6px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        sx={{
                          bgcolor: `${getStatusColor(row.status)}20`,
                          color: getStatusColor(row.status),
                          fontWeight: 600,
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        {formatCurrency(row.premium)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {formatCurrency(row.coverageAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Claims">
                          <IconButton
                            size="small"
                            onClick={() => handlePolicyClick(row.policyId)}
                            color="primary"
                          >
                            <AssignmentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Policy">
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(row)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Policy">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(row.policyId)}
                            disabled={deletingId === row.policyId}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        )}

        {!loading && rows.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[12, 24, 48]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{ borderTop: `1px solid ${theme.palette.grey[200]}`, mt: 2 }}
          />
        )}

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>New Policy</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Policyholder ID"
                  type="number"
                  value={newPolicy.policyholderId}
                  onChange={handleInputChange('policyholderId')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Policy Type</InputLabel>
                  <Select
                    value={newPolicy.policyType}
                    onChange={handleInputChange('policyType')}
                    label="Policy Type"
                  >
                    {policyTypes.map((type) => (
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
                    value={newPolicy.status}
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
                  label="Premium"
                  type="number"
                  value={newPolicy.premium}
                  onChange={handleInputChange('premium')}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Coverage Amount"
                  type="number"
                  value={newPolicy.coverageAmount}
                  onChange={handleInputChange('coverageAmount')}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={newPolicy.startDate}
                  onChange={handleInputChange('startDate')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={newPolicy.endDate}
                  onChange={handleInputChange('endDate')}
                  InputLabelProps={{
                    shrink: true,
                  }}
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
              disabled={!newPolicy.policyholderId || !newPolicy.policyType || !newPolicy.premium || !newPolicy.coverageAmount || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Policy'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={editDialogOpen}
          onClose={handleCloseEditDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Edit Policy Status</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Policy ID: {editingPolicy?.policyId}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editingPolicy?.status || ''}
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
              <Typography>Are you sure you want to delete this policy? This will also delete all related claims.</Typography>
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

export default Policies;
