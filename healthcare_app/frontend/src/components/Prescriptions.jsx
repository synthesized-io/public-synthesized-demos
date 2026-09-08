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
import DeleteIcon from '@mui/icons-material/Delete';
import { useDatabase } from '../context/DatabaseContext';
import { useLocation, useNavigate } from 'react-router-dom';

function Prescriptions({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('prescription_id');
  const [order, setOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    patient_id: '',
    provider_id: ''
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    providerId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    instructions: ''
  });
  const initialLoadRef = React.useRef(true);
  const fetchTimeoutRef = React.useRef(null);
  const isNavigatingRef = React.useRef(false);
  const hasInitialStateRef = React.useRef(false);
  const currentFiltersRef = React.useRef(null);
  const navigationStateRef = React.useRef(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, prescriptionId: null });

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Handle incoming filters from navigation
  useEffect(() => {
    if (location.state?.filters) {
      navigationStateRef.current = location.state;
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setFilters(prev => ({
        ...prev,
        ...location.state.filters
      }));
      // Clear the state to prevent re-applying on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  const fetchPrescriptions = async () => {
    // Skip fetch if we're in the middle of a navigation and haven't processed initial state
    if (isNavigatingRef.current && !hasInitialStateRef.current) {
      return;
    }

    // If we have navigation state, use it for the first fetch
    const filtersToUse = navigationStateRef.current ? {
      searchQuery: currentFiltersRef.current?.searchQuery || searchQuery,
      filters: {
        ...currentFiltersRef.current?.filters || filters,
        ...navigationStateRef.current.filters
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
      if (filtersToUse.filters.patient_id) params.append('patientId', filtersToUse.filters.patient_id);
      if (filtersToUse.filters.provider_id) params.append('providerId', filtersToUse.filters.provider_id);
      if (filtersToUse.searchQuery) params.append('searchQuery', filtersToUse.searchQuery);
      params.append('sortBy', filtersToUse.orderBy);
      params.append('sortOrder', filtersToUse.order);
      params.append('page', filtersToUse.page);
      params.append('size', filtersToUse.rowsPerPage);

      const response = await fetch(`${backendUrl}/api/prescriptions?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch prescriptions');
      const data = await response.json();
      setRows(data.prescriptions);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError('Failed to fetch prescriptions');
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
      fetchPrescriptions();
      initialLoadRef.current = false;
      return;
    }

    // Otherwise, debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      fetchPrescriptions();
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

  const handleNewPrescription = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewPrescription({
      patientId: '',
      providerId: '',
      medicationName: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      instructions: ''
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewPrescription({
      ...newPrescription,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!newPrescription.patientId || !newPrescription.providerId || !newPrescription.medicationName) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const prescriptionData = {
        ...newPrescription,
        patientId: parseInt(newPrescription.patientId, 10),
        providerId: parseInt(newPrescription.providerId, 10)
      };

      const response = await fetch(`${backendUrl}/api/prescriptions?database=${selectedDatabase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create prescription');
      }

      fetchPrescriptions();
      setError(null);
      handleCloseDialog();
    } catch (err) {
      console.error('Prescription creation error:', err);
      setError(err.message || 'Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patients?patientId=${patientId}`);
  };

  const handleProviderClick = (providerId) => {
    navigate(`/providers?providerId=${providerId}`);
  };

  const handleDeleteClick = (prescriptionId) => {
    setConfirmDelete({ open: true, prescriptionId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, prescriptionId: null });
  };

  const handleDeleteConfirm = async () => {
    const { prescriptionId } = confirmDelete;
    setDeletingId(prescriptionId);
    setDeleteError(null);
    try {
      const response = await fetch(`${backendUrl}/api/prescriptions/${prescriptionId}?database=${selectedDatabase}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prescription');
      }
      // Refresh the prescriptions list
      fetchPrescriptions();
      setConfirmDelete({ open: false, prescriptionId: null });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete prescription');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
            Prescription Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewPrescription}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            New Prescription
          </Button>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Search"
            placeholder="Search by medication..."
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
            label="Patient ID"
            value={filters.patient_id}
            onChange={(e) => handleFilterChange('patient_id', e.target.value)}
            sx={{ minWidth: 150 }}
            size="medium"
          />

          <TextField
            label="Provider ID"
            value={filters.provider_id}
            onChange={(e) => handleFilterChange('provider_id', e.target.value)}
            sx={{ minWidth: 150 }}
            size="medium"
          />
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
                <TableCell>Patient ID</TableCell>
                <TableCell>Provider ID</TableCell>
                <TableCell>Medication</TableCell>
                <TableCell>Dosage</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No prescriptions found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.prescriptionId}>
                    <TableCell>{row.prescriptionId}</TableCell>
                    <TableCell>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => handlePatientClick(row.patientId)}
                        sx={{
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {row.patientId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => handleProviderClick(row.providerId)}
                        sx={{
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {row.providerId}
                      </Link>
                    </TableCell>
                    <TableCell>{row.medicationName}</TableCell>
                    <TableCell>{row.dosage}</TableCell>
                    <TableCell>{row.frequency}</TableCell>
                    <TableCell>{formatDate(row.startDate)}</TableCell>
                    <TableCell>{formatDate(row.endDate)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(row.prescriptionId)}
                        title="Delete Prescription"
                        disabled={deletingId === row.prescriptionId}
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

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>New Prescription</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Patient ID"
                  type="number"
                  value={newPrescription.patientId}
                  onChange={handleInputChange('patientId')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Provider ID"
                  type="number"
                  value={newPrescription.providerId}
                  onChange={handleInputChange('providerId')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Medication Name"
                  value={newPrescription.medicationName}
                  onChange={handleInputChange('medicationName')}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Dosage"
                  value={newPrescription.dosage}
                  onChange={handleInputChange('dosage')}
                  placeholder="e.g., 500mg"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Frequency"
                  value={newPrescription.frequency}
                  onChange={handleInputChange('frequency')}
                  placeholder="e.g., Twice daily"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={newPrescription.startDate}
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
                  value={newPrescription.endDate}
                  onChange={handleInputChange('endDate')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instructions"
                  multiline
                  rows={3}
                  value={newPrescription.instructions}
                  onChange={handleInputChange('instructions')}
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
              disabled={!newPrescription.patientId || !newPrescription.providerId || !newPrescription.medicationName || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Prescription'}
            </Button>
          </DialogActions>
        </Dialog>

        {confirmDelete.open && (
          <Dialog open={confirmDelete.open} onClose={handleDeleteCancel}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this prescription?</Typography>
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

export default Prescriptions;
