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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicationIcon from '@mui/icons-material/Medication';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDatabase } from '../context/DatabaseContext';
import { useLocation, useNavigate } from 'react-router-dom';

function Patients({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('patient_id');
  const [order, setOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [patientIdSearch, setPatientIdSearch] = useState('');
  const [filters, setFilters] = useState({
    blood_type: ''
  });
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPatient, setNewPatient] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    bloodType: '',
    phone: '',
    email: '',
    address: '',
    insurancePolicyId: ''
  });
  const initialLoadRef = React.useRef(true);
  const fetchTimeoutRef = React.useRef(null);
  const isNavigatingRef = React.useRef(false);
  const hasInitialStateRef = React.useRef(false);
  const currentFiltersRef = React.useRef(null);
  const navigationStateRef = React.useRef(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, patientId: null });

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Handle patientId from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientId = params.get('patientId');
    if (patientId) {
      navigationStateRef.current = { patientId };
      isNavigatingRef.current = true;
      hasInitialStateRef.current = true;
      setPatientIdSearch(patientId);
      // Clear the query parameter to prevent re-applying on re-renders
      window.history.replaceState({}, document.title, '/patients');
    }
  }, [location.search]);

  // Store current filters for refresh
  useEffect(() => {
    currentFiltersRef.current = {
      searchQuery,
      patientIdSearch,
      filters,
      page,
      rowsPerPage,
      orderBy,
      order
    };
  }, [searchQuery, patientIdSearch, filters, page, rowsPerPage, orderBy, order]);

  const fetchPatients = async () => {
    // Skip fetch if we're in the middle of a navigation and haven't processed initial state
    if (isNavigatingRef.current && !hasInitialStateRef.current) {
      return;
    }

    // If we have navigation state, use it for the first fetch
    const filtersToUse = navigationStateRef.current ? {
      patientIdSearch: navigationStateRef.current.patientId,
      searchQuery: currentFiltersRef.current?.searchQuery || searchQuery,
      filters: currentFiltersRef.current?.filters || filters,
      page: currentFiltersRef.current?.page || page,
      rowsPerPage: currentFiltersRef.current?.rowsPerPage || rowsPerPage,
      orderBy: currentFiltersRef.current?.orderBy || orderBy,
      order: currentFiltersRef.current?.order || order
    } : currentFiltersRef.current || {
      searchQuery,
      patientIdSearch,
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
      if (filtersToUse.filters.blood_type) params.append('bloodType', filtersToUse.filters.blood_type);
      if (filtersToUse.searchQuery) params.append('searchQuery', filtersToUse.searchQuery);
      if (filtersToUse.patientIdSearch) params.append('patientId', filtersToUse.patientIdSearch);
      params.append('sortBy', filtersToUse.orderBy);
      params.append('sortOrder', filtersToUse.order);
      params.append('page', filtersToUse.page);
      params.append('size', filtersToUse.rowsPerPage);

      const response = await fetch(`${backendUrl}/api/patients?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setRows(data.patients);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError('Failed to fetch patients');
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
      fetchPatients();
      initialLoadRef.current = false;
      return;
    }

    // Otherwise, debounce the fetch
    fetchTimeoutRef.current = setTimeout(() => {
      fetchPatients();
    }, 100);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [selectedDatabase, page, rowsPerPage, orderBy, order, filters, searchQuery, patientIdSearch, refreshTrigger]);

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
    fetchPatients();
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0);
  };

  const handleNewPatient = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewPatient({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      bloodType: '',
      phone: '',
      email: '',
      address: '',
      insurancePolicyId: ''
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewPatient({
      ...newPatient,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!newPatient.firstName || !newPatient.lastName || !newPatient.dateOfBirth) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const patientData = {
        ...newPatient,
        insurancePolicyId: newPatient.insurancePolicyId ? parseInt(newPatient.insurancePolicyId, 10) : null
      };

      const response = await fetch(`${backendUrl}/api/patients?database=${selectedDatabase}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create patient');
      }

      fetchPatients();
      setError(null);
      handleCloseDialog();
    } catch (err) {
      console.error('Patient creation error:', err);
      setError(err.message || 'Failed to create patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewAppointments = (patient) => {
    navigate(`/appointments`, {
      state: {
        filters: {
          patient_id: patient.patientId
        }
      }
    });
  };

  const handleViewPrescriptions = (patient) => {
    navigate(`/prescriptions`, {
      state: {
        filters: {
          patient_id: patient.patientId
        }
      }
    });
  };

  const handleDeleteClick = (patientId) => {
    setConfirmDelete({ open: true, patientId });
  };

  const handleDeleteCancel = () => {
    setConfirmDelete({ open: false, patientId: null });
  };

  const handleDeleteConfirm = async () => {
    const { patientId } = confirmDelete;
    setDeletingId(patientId);
    setDeleteError(null);
    try {
      const response = await fetch(`${backendUrl}/api/patients/${patientId}?database=${selectedDatabase}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete patient');
      }
      // Refresh the patients list
      fetchPatients();
      setConfirmDelete({ open: false, patientId: null });
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete patient');
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
            Patient Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewPatient}
            sx={{
              backgroundColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            New Patient
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
            label="Patient ID"
            variant="outlined"
            size="medium"
            value={patientIdSearch}
            onChange={(e) => setPatientIdSearch(e.target.value)}
            placeholder="Search by ID (exact)"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <TextField
            select
            label="Blood Type"
            value={filters.blood_type}
            onChange={(e) => handleFilterChange('blood_type', e.target.value)}
            sx={{ minWidth: 180 }}
            size="medium"
          >
            <MenuItem value="">All</MenuItem>
            {bloodTypes.map((type) => (
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
                <TableCell>Patient ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Blood Type</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Insurance Policy ID</TableCell>
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
                  <TableCell colSpan={9} align="center">
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.patientId}>
                    <TableCell>{row.patientId}</TableCell>
                    <TableCell>{`${row.firstName} ${row.lastName}`}</TableCell>
                    <TableCell>
                      {new Date(row.dateOfBirth).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{row.bloodType}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>
                      {row.insurancePolicyId || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewAppointments(row)}
                        title="View Appointments"
                      >
                        <CalendarTodayIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleViewPrescriptions(row)}
                        title="View Prescriptions"
                      >
                        <MedicationIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(row.patientId)}
                        title="Delete Patient"
                        disabled={deletingId === row.patientId}
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

      {/* New Patient Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>New Patient</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={newPatient.firstName}
                onChange={handleInputChange('firstName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={newPatient.lastName}
                onChange={handleInputChange('lastName')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={newPatient.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Blood Type</InputLabel>
                <Select
                  value={newPatient.bloodType}
                  onChange={handleInputChange('bloodType')}
                  label="Blood Type"
                >
                  {bloodTypes.map((type) => (
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
                label="Phone"
                value={newPatient.phone}
                onChange={handleInputChange('phone')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newPatient.email}
                onChange={handleInputChange('email')}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Policy ID"
                type="number"
                value={newPatient.insurancePolicyId}
                onChange={handleInputChange('insurancePolicyId')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={newPatient.address}
                onChange={handleInputChange('address')}
              />
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
            <Typography>Are you sure you want to delete this patient? This will also delete all related appointments and prescriptions.</Typography>
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

export default Patients;
