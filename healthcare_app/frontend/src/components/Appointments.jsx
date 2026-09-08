import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Divider,
  IconButton,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useDatabase } from '../context/DatabaseContext';
import { useLocation, useNavigate } from 'react-router-dom';

function getStatusColor(status, theme) {
  const statusMap = {
    'Scheduled': theme.palette.primary.main,
    'Confirmed': theme.palette.secondary.main,
    'Completed': theme.palette.success.main,
    'Cancelled': theme.palette.error.main,
    'NoShow': theme.palette.warning.main,
  };
  return statusMap[status] || theme.palette.grey[500];
}

function getStatusIcon(status) {
  const iconMap = {
    'Scheduled': <CalendarTodayIcon fontSize="small" />,
    'Confirmed': <EventAvailableIcon fontSize="small" />,
    'Completed': <CheckCircleIcon fontSize="small" />,
    'Cancelled': <CancelIcon fontSize="small" />,
    'NoShow': <AccessTimeIcon fontSize="small" />,
  };
  return iconMap[status] || <CalendarTodayIcon fontSize="small" />;
}

function AppointmentCard({ appointment, onEdit, onDelete, onViewDetails, theme }) {
  const appointmentDate = new Date(appointment.appointmentDate);
  appointmentDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isUpcoming = appointmentDate >= today;
  const statusColor = getStatusColor(appointment.status, theme);

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      '&:hover': {
        boxShadow: 3,
      }
    }}>
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        bgcolor: statusColor,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
      }} />

      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Chip
            icon={getStatusIcon(appointment.status)}
            label={appointment.status}
            size="small"
            sx={{
              bgcolor: `${statusColor}15`,
              color: statusColor,
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: statusColor
              }
            }}
          />
          <Typography variant="caption" color="text.secondary">
            ID: {appointment.appointmentId}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{
            bgcolor: `${theme.palette.primary.main}15`,
            color: theme.palette.primary.main,
            width: 56,
            height: 56
          }}>
            <CalendarTodayIcon />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {appointmentDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon fontSize="small" />
              {appointmentDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Patient:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {appointment.patientFirstName && appointment.patientLastName
                ? `${appointment.patientFirstName} ${appointment.patientLastName} (#${appointment.patientId})`
                : `#${appointment.patientId}`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalHospitalIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Provider ID:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {appointment.providerId}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
        <Button
          size="small"
          startIcon={<InfoOutlinedIcon />}
          onClick={() => onViewDetails(appointment)}
        >
          Details
        </Button>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(appointment)}
        >
          Edit
        </Button>
        <IconButton
          size="small"
          color="error"
          onClick={() => onDelete(appointment.appointmentId)}
          sx={{ ml: 'auto' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
}

function Appointments({ refreshTrigger }) {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessedFilters = useRef(false);
  const processedStateRef = useRef(null);

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [patientIdFilter, setPatientIdFilter] = useState('');
  const [providerIdFilter, setProviderIdFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const [appointments, setAppointments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [detailDialog, setDetailDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, appointmentId: null });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    providerId: '',
    appointmentDate: '',
    appointmentTime: '',
    status: 'Scheduled'
  });

  const statuses = ['Scheduled', 'Completed', 'Cancelled', 'NoShow'];
  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  useEffect(() => {
    if (location.state?.filters) {
      // Check if this is a new state object (different from what we've processed)
      const stateKey = JSON.stringify(location.state.filters);
      if (stateKey !== processedStateRef.current) {
        if (location.state.filters.patient_id) {
          setPatientIdFilter(String(location.state.filters.patient_id));
        }
        if (location.state.filters.provider_id) {
          setProviderIdFilter(String(location.state.filters.provider_id));
        }
        processedStateRef.current = stateKey;
        hasProcessedFilters.current = true;
        // Clear the state to prevent re-applying on re-renders
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('database', selectedDatabase);
      if (statusFilter) params.append('status', statusFilter);
      if (patientIdFilter) params.append('patientId', patientIdFilter);
      if (providerIdFilter) params.append('providerId', providerIdFilter);
      if (searchQuery) params.append('searchQuery', searchQuery);

      // Filter by date range based on tab
      // Get current date in UTC at midnight
      const now = new Date();
      const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0));
      const todayStr = today.toISOString();

      if (tabValue === 0) {
        // Upcoming appointments - appointment_date >= today
        params.append('fromDate', todayStr);
        params.append('sortOrder', 'asc');
      } else {
        // Past appointments - appointment_date < today
        params.append('toDate', todayStr);
        params.append('sortOrder', 'desc');
      }

      params.append('sortBy', 'appointment_date');
      params.append('page', page);
      params.append('size', rowsPerPage);

      const response = await fetch(`${backendUrl}/api/appointments?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data.appointments);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(0); // Reset to first page when filters change
  }, [selectedDatabase, statusFilter, patientIdFilter, providerIdFilter, searchQuery, tabValue]);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDatabase, statusFilter, patientIdFilter, providerIdFilter, searchQuery, refreshTrigger, page, rowsPerPage, tabValue]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleNewAppointment = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewAppointment({
      patientId: '',
      providerId: '',
      appointmentDate: '',
      appointmentTime: '',
      status: 'Scheduled'
    });
  };

  const handleInputChange = (field) => (event) => {
    setNewAppointment({
      ...newAppointment,
      [field]: event.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!newAppointment.patientId || !newAppointment.providerId || !newAppointment.appointmentDate) {
        setError('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const appointmentData = {
        ...newAppointment,
        patientId: parseInt(newAppointment.patientId, 10),
        providerId: parseInt(newAppointment.providerId, 10)
      };

      const response = await fetch(`${backendUrl}/api/appointments?database=${selectedDatabase}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create appointment');
      }

      fetchAppointments();
      handleCloseDialog();
    } catch (err) {
      setError(err.message || 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailDialog(true);
  };

  const handleEditClick = (appointment) => {
    setEditingAppointment(appointment);
    setEditDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!editingAppointment) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`${backendUrl}/api/appointments/${editingAppointment.appointmentId}?database=${selectedDatabase}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editingAppointment.status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update appointment status');
      }

      fetchAppointments();
      setEditDialogOpen(false);
      setEditingAppointment(null);
    } catch (err) {
      setError(err.message || 'Failed to update appointment status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (appointmentId) => {
    setConfirmDelete({ open: true, appointmentId });
  };

  const handleDeleteConfirm = async () => {
    const { appointmentId } = confirmDelete;
    setDeletingId(appointmentId);
    try {
      const response = await fetch(`${backendUrl}/api/appointments/${appointmentId}?database=${selectedDatabase}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete appointment');
      }
      fetchAppointments();
      setConfirmDelete({ open: false, appointmentId: null });
    } catch (err) {
      setError(err.message || 'Failed to delete appointment');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Appointments
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your appointments and schedule new visits
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewAppointment}
            size="large"
          >
            Schedule Appointment
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <TextField
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 300 }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
            size="small"
          >
            <MenuItem value="">All Statuses</MenuItem>
            {statuses.map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Patient ID"
            value={patientIdFilter}
            onChange={(e) => setPatientIdFilter(e.target.value)}
            sx={{ minWidth: 130 }}
            size="small"
          />

          <TextField
            label="Provider ID"
            value={providerIdFilter}
            onChange={(e) => setProviderIdFilter(e.target.value)}
            sx={{ minWidth: 130 }}
            size="small"
          />
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab
            label={`Upcoming${totalCount > 0 && tabValue === 0 ? ` (${totalCount})` : ''}`}
            icon={<EventAvailableIcon />}
            iconPosition="start"
          />
          <Tab
            label={`Past${totalCount > 0 && tabValue === 1 ? ` (${totalCount})` : ''}`}
            icon={<CheckCircleIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {error && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'error.lighter', border: 1, borderColor: 'error.main' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : appointments.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center' }}>
          <CalendarTodayIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No {tabValue === 0 ? 'upcoming' : 'past'} appointments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 ? 'Schedule your first appointment to get started' : 'Your appointment history will appear here'}
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {appointments.map((appointment) => (
              <Grid item xs={12} sm={6} md={4} key={appointment.appointmentId}>
                <AppointmentCard
                  appointment={appointment}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onViewDetails={handleViewDetails}
                  theme={theme}
                />
              </Grid>
            ))}
          </Grid>

          {totalCount > rowsPerPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Paper elevation={0} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, totalCount)} of {totalCount}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => handleChangePage(e, page - 1)}
                      disabled={page === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => handleChangePage(e, page + 1)}
                      disabled={(page + 1) * rowsPerPage >= totalCount}
                    >
                      Next
                    </Button>
                  </Box>
                  <TextField
                    select
                    size="small"
                    value={rowsPerPage}
                    onChange={handleChangeRowsPerPage}
                    label="Per page"
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value={12}>12</MenuItem>
                    <MenuItem value={24}>24</MenuItem>
                    <MenuItem value={48}>48</MenuItem>
                    <MenuItem value={96}>96</MenuItem>
                  </TextField>
                </Box>
              </Paper>
            </Box>
          )}
        </>
      )}

      {/* Create Appointment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient ID"
                type="number"
                value={newAppointment.patientId}
                onChange={handleInputChange('patientId')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Provider ID"
                type="number"
                value={newAppointment.providerId}
                onChange={handleInputChange('providerId')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment Date"
                type="date"
                value={newAppointment.appointmentDate}
                onChange={handleInputChange('appointmentDate')}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment Time"
                type="time"
                value={newAppointment.appointmentTime}
                onChange={handleInputChange('appointmentTime')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newAppointment.status}
                  onChange={handleInputChange('status')}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Appointment ID</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedAppointment.appointmentId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedAppointment.status}
                    size="small"
                    sx={{
                      bgcolor: `${getStatusColor(selectedAppointment.status, theme)}15`,
                      color: getStatusColor(selectedAppointment.status, theme),
                      fontWeight: 600,
                      mt: 0.5
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Patient ID</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedAppointment.patientId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Provider ID</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedAppointment.providerId}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(selectedAppointment.appointmentDate).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Appointment Status</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Appointment ID: {editingAppointment?.appointmentId}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editingAppointment?.status || ''}
                  onChange={(e) => setEditingAppointment({ ...editingAppointment, status: e.target.value })}
                  label="Status"
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, appointmentId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this appointment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, appointmentId: null })} disabled={deletingId !== null}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deletingId !== null}>
            {deletingId !== null ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Appointments;
