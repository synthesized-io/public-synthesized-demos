import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  InputAdornment,
  useTheme,
  Chip,
  Divider,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicationIcon from '@mui/icons-material/Medication';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useDatabase } from '../context/DatabaseContext';

function Admin() {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Form states
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    bloodType: 'O+',
    patientType: 'Adult',
    medicalRecordNumber: '',
    insurancePolicyId: '',
  });

  const [appointmentForm, setAppointmentForm] = useState({
    patientId: '',
    appointmentNumber: '',
    appointmentType: 'Consultation',
    appointmentStatus: 'Scheduled',
    appointmentDate: '',
    durationMinutes: '30',
    providerName: '',
    department: 'GeneralPractice',
    notes: '',
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    appointmentId: '',
    prescriptionNumber: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    startDate: '',
    endDate: '',
    refillsRemaining: '0',
    pharmacyName: '',
    prescriptionStatus: 'Active',
    instructions: '',
  });

  const [providerForm, setProviderForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: 'GeneralPractitioner',
    department: 'GeneralPractice',
    licenseNumber: '',
    yearsOfExperience: '',
  });

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    // Reset forms
    setPatientForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      bloodType: 'O+',
      patientType: 'Adult',
      medicalRecordNumber: '',
      insurancePolicyId: '',
    });
    setAppointmentForm({
      patientId: '',
      appointmentNumber: '',
      appointmentType: 'Consultation',
      appointmentStatus: 'Scheduled',
      appointmentDate: '',
      durationMinutes: '30',
      providerName: '',
      department: 'GeneralPractice',
      notes: '',
    });
    setPrescriptionForm({
      appointmentId: '',
      prescriptionNumber: '',
      medicationName: '',
      dosage: '',
      frequency: '',
      startDate: '',
      endDate: '',
      refillsRemaining: '0',
      pharmacyName: '',
      prescriptionStatus: 'Active',
      instructions: '',
    });
    setProviderForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialization: 'GeneralPractitioner',
      department: 'GeneralPractice',
      licenseNumber: '',
      yearsOfExperience: '',
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let endpoint = '';
      let data = {};

      switch (dialogType) {
        case 'patient':
          endpoint = `${backendUrl}/api/patients?database=${selectedDatabase}`;
          data = {
            ...patientForm,
            insurancePolicyId: patientForm.insurancePolicyId ? parseInt(patientForm.insurancePolicyId, 10) : null,
          };
          break;
        case 'appointment':
          endpoint = `${backendUrl}/api/appointments?database=${selectedDatabase}`;
          data = {
            ...appointmentForm,
            patientId: parseInt(appointmentForm.patientId, 10),
            durationMinutes: parseInt(appointmentForm.durationMinutes, 10),
          };
          break;
        case 'prescription':
          endpoint = `${backendUrl}/api/prescriptions?database=${selectedDatabase}`;
          data = {
            ...prescriptionForm,
            appointmentId: parseInt(prescriptionForm.appointmentId, 10),
            refillsRemaining: parseInt(prescriptionForm.refillsRemaining, 10),
          };
          break;
        case 'provider':
          endpoint = `${backendUrl}/api/providers?database=${selectedDatabase}`;
          data = {
            ...providerForm,
            yearsOfExperience: providerForm.yearsOfExperience ? parseInt(providerForm.yearsOfExperience, 10) : null,
          };
          break;
        default:
          throw new Error('Unknown form type');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create entry');
      }

      setSnackbar({
        open: true,
        message: `${dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} created successfully!`,
        severity: 'success',
      });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to create entry',
        severity: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDialogContent = () => {
    switch (dialogType) {
      case 'patient':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={patientForm.firstName}
                onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={patientForm.lastName}
                onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={patientForm.email}
                onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={patientForm.phone}
                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={patientForm.dateOfBirth}
                onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Blood Type</InputLabel>
                <Select
                  value={patientForm.bloodType}
                  onChange={(e) => setPatientForm({ ...patientForm, bloodType: e.target.value })}
                  label="Blood Type"
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Patient Type</InputLabel>
                <Select
                  value={patientForm.patientType}
                  onChange={(e) => setPatientForm({ ...patientForm, patientType: e.target.value })}
                  label="Patient Type"
                >
                  <MenuItem value="Adult">Adult</MenuItem>
                  <MenuItem value="Pediatric">Pediatric</MenuItem>
                  <MenuItem value="Geriatric">Geriatric</MenuItem>
                  <MenuItem value="Prenatal">Prenatal</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medical Record Number"
                value={patientForm.medicalRecordNumber}
                onChange={(e) => setPatientForm({ ...patientForm, medicalRecordNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Insurance Policy ID"
                type="number"
                value={patientForm.insurancePolicyId}
                onChange={(e) => setPatientForm({ ...patientForm, insurancePolicyId: e.target.value })}
              />
            </Grid>
          </Grid>
        );
      case 'appointment':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient ID"
                type="number"
                value={appointmentForm.patientId}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, patientId: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment Number"
                value={appointmentForm.appointmentNumber}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Appointment Type</InputLabel>
                <Select
                  value={appointmentForm.appointmentType}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentType: e.target.value })}
                  label="Appointment Type"
                >
                  <MenuItem value="Consultation">Consultation</MenuItem>
                  <MenuItem value="FollowUp">Follow-Up</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Surgery">Surgery</MenuItem>
                  <MenuItem value="Checkup">Checkup</MenuItem>
                  <MenuItem value="Vaccination">Vaccination</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={appointmentForm.appointmentStatus}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentStatus: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                  <MenuItem value="Confirmed">Confirmed</MenuItem>
                  <MenuItem value="InProgress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="NoShow">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment Date & Time"
                type="datetime-local"
                value={appointmentForm.appointmentDate}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, appointmentDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={appointmentForm.durationMinutes}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, durationMinutes: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Provider Name"
                value={appointmentForm.providerName}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, providerName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={appointmentForm.department}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, department: e.target.value })}
                  label="Department"
                >
                  <MenuItem value="Cardiology">Cardiology</MenuItem>
                  <MenuItem value="Neurology">Neurology</MenuItem>
                  <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                  <MenuItem value="Orthopedics">Orthopedics</MenuItem>
                  <MenuItem value="Dermatology">Dermatology</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="GeneralPractice">General Practice</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        );
      case 'prescription':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Appointment ID"
                type="number"
                value={prescriptionForm.appointmentId}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, appointmentId: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prescription Number"
                value={prescriptionForm.prescriptionNumber}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, prescriptionNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Medication Name"
                value={prescriptionForm.medicationName}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicationName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dosage"
                value={prescriptionForm.dosage}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Frequency"
                value={prescriptionForm.frequency}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, frequency: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={prescriptionForm.startDate}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={prescriptionForm.endDate}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Refills Remaining"
                type="number"
                value={prescriptionForm.refillsRemaining}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, refillsRemaining: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pharmacy Name"
                value={prescriptionForm.pharmacyName}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, pharmacyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={prescriptionForm.prescriptionStatus}
                  onChange={(e) => setPrescriptionForm({ ...prescriptionForm, prescriptionStatus: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Instructions"
                multiline
                rows={3}
                value={prescriptionForm.instructions}
                onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
              />
            </Grid>
          </Grid>
        );
      case 'provider':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={providerForm.firstName}
                onChange={(e) => setProviderForm({ ...providerForm, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={providerForm.lastName}
                onChange={(e) => setProviderForm({ ...providerForm, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={providerForm.email}
                onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={providerForm.phone}
                onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Specialization</InputLabel>
                <Select
                  value={providerForm.specialization}
                  onChange={(e) => setProviderForm({ ...providerForm, specialization: e.target.value })}
                  label="Specialization"
                >
                  <MenuItem value="GeneralPractitioner">General Practitioner</MenuItem>
                  <MenuItem value="Cardiologist">Cardiologist</MenuItem>
                  <MenuItem value="Neurologist">Neurologist</MenuItem>
                  <MenuItem value="Pediatrician">Pediatrician</MenuItem>
                  <MenuItem value="Orthopedist">Orthopedist</MenuItem>
                  <MenuItem value="Dermatologist">Dermatologist</MenuItem>
                  <MenuItem value="EmergencyMedicine">Emergency Medicine</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={providerForm.department}
                  onChange={(e) => setProviderForm({ ...providerForm, department: e.target.value })}
                  label="Department"
                >
                  <MenuItem value="Cardiology">Cardiology</MenuItem>
                  <MenuItem value="Neurology">Neurology</MenuItem>
                  <MenuItem value="Pediatrics">Pediatrics</MenuItem>
                  <MenuItem value="Orthopedics">Orthopedics</MenuItem>
                  <MenuItem value="Dermatology">Dermatology</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="GeneralPractice">General Practice</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Number"
                value={providerForm.licenseNumber}
                onChange={(e) => setProviderForm({ ...providerForm, licenseNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Years of Experience"
                type="number"
                value={providerForm.yearsOfExperience}
                onChange={(e) => setProviderForm({ ...providerForm, yearsOfExperience: e.target.value })}
              />
            </Grid>
          </Grid>
        );
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
          border: `1px solid ${theme.palette.grey[200]}`,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            Database Administration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manually add seed data to the database
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Use this admin panel to manually insert seed data into the <Chip label={selectedDatabase} size="small" color="primary" sx={{ mx: 0.5 }} /> database. All entries will be added to the current database selection.
        </Alert>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `2px dashed ${theme.palette.grey[300]}`,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: `${theme.palette.primary.main}05`,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => handleOpenDialog('patient')}
            >
              <PersonAddIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                New Patient
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a patient entry
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `2px dashed ${theme.palette.grey[300]}`,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.secondary.main,
                  backgroundColor: `${theme.palette.secondary.main}05`,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => handleOpenDialog('appointment')}
            >
              <CalendarTodayIcon sx={{ fontSize: 48, color: theme.palette.secondary.main, mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                New Appointment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add an appointment entry
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `2px dashed ${theme.palette.grey[300]}`,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.warning.main,
                  backgroundColor: `${theme.palette.warning.main}05`,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => handleOpenDialog('prescription')}
            >
              <MedicationIcon sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                New Prescription
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a prescription entry
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `2px dashed ${theme.palette.grey[300]}`,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.success.main,
                  backgroundColor: `${theme.palette.success.main}05`,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => handleOpenDialog('provider')}
            >
              <LocalHospitalIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                New Provider
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a provider entry
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog for adding entries */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Add New {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)}
        </DialogTitle>
        <DialogContent>{renderDialogContent()}</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Admin;
