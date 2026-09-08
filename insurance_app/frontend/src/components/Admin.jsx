import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
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
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BadgeIcon from '@mui/icons-material/Badge';
import { useDatabase } from '../context/DatabaseContext';

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function Admin() {
  const theme = useTheme();
  const { selectedDatabase } = useDatabase();
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  // Form states
  const [policyholderForm, setPolicyholderForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    policyholderType: 'Individual',
  });

  const [policyForm, setPolicyForm] = useState({
    policyholderId: '',
    policyNumber: '',
    policyType: 'Auto',
    status: 'Active',
    coverageAmount: '',
    premiumAmount: '',
    paymentFrequency: 'Monthly',
    coverageLevel: 'Standard',
    startDate: '',
    endDate: '',
  });

  const [claimForm, setClaimForm] = useState({
    policyId: '',
    claimNumber: '',
    claimType: 'Accident',
    claimStatus: 'Filed',
    incidentDate: '',
    claimAmount: '',
    settlementAmount: '',
    description: '',
  });

  const [agentForm, setAgentForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    region: 'North',
    licenseNumber: '',
  });

  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    // Reset forms
    setPolicyholderForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      policyholderType: 'Individual',
    });
    setPolicyForm({
      policyholderId: '',
      policyNumber: '',
      policyType: 'Auto',
      status: 'Active',
      coverageAmount: '',
      premiumAmount: '',
      paymentFrequency: 'Monthly',
      coverageLevel: 'Standard',
      startDate: '',
      endDate: '',
    });
    setClaimForm({
      policyId: '',
      claimNumber: '',
      claimType: 'Accident',
      claimStatus: 'Filed',
      incidentDate: '',
      claimAmount: '',
      settlementAmount: '',
      description: '',
    });
    setAgentForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      region: 'North',
      licenseNumber: '',
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let endpoint = '';
      let data = {};

      switch (dialogType) {
        case 'policyholder':
          endpoint = `${backendUrl}/api/policyholders?database=${selectedDatabase}`;
          data = policyholderForm;
          break;
        case 'policy':
          endpoint = `${backendUrl}/api/policies?database=${selectedDatabase}`;
          data = {
            ...policyForm,
            policyholderId: parseInt(policyForm.policyholderId, 10),
            coverageAmount: parseFloat(policyForm.coverageAmount),
            premiumAmount: parseFloat(policyForm.premiumAmount),
          };
          break;
        case 'claim':
          endpoint = `${backendUrl}/api/claims?database=${selectedDatabase}`;
          data = {
            ...claimForm,
            policyId: parseInt(claimForm.policyId, 10),
            claimAmount: parseFloat(claimForm.claimAmount),
            settlementAmount: claimForm.settlementAmount ? parseFloat(claimForm.settlementAmount) : null,
          };
          break;
        case 'agent':
          endpoint = `${backendUrl}/api/agents?database=${selectedDatabase}`;
          data = agentForm;
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
      case 'policyholder':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={policyholderForm.firstName}
                onChange={(e) => setPolicyholderForm({ ...policyholderForm, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={policyholderForm.lastName}
                onChange={(e) => setPolicyholderForm({ ...policyholderForm, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={policyholderForm.email}
                onChange={(e) => setPolicyholderForm({ ...policyholderForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={policyholderForm.phone}
                onChange={(e) => setPolicyholderForm({ ...policyholderForm, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={policyholderForm.dateOfBirth}
                onChange={(e) => setPolicyholderForm({ ...policyholderForm, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Policyholder Type</InputLabel>
                <Select
                  value={policyholderForm.policyholderType}
                  onChange={(e) => setPolicyholderForm({ ...policyholderForm, policyholderType: e.target.value })}
                  label="Policyholder Type"
                >
                  <MenuItem value="Individual">Individual</MenuItem>
                  <MenuItem value="Family">Family</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Group">Group</MenuItem>
                  <MenuItem value="Senior">Senior</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 'policy':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Policyholder ID"
                type="number"
                value={policyForm.policyholderId}
                onChange={(e) => setPolicyForm({ ...policyForm, policyholderId: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Policy Number"
                value={policyForm.policyNumber}
                onChange={(e) => setPolicyForm({ ...policyForm, policyNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Policy Type</InputLabel>
                <Select
                  value={policyForm.policyType}
                  onChange={(e) => setPolicyForm({ ...policyForm, policyType: e.target.value })}
                  label="Policy Type"
                >
                  <MenuItem value="Auto">Auto</MenuItem>
                  <MenuItem value="Home">Home</MenuItem>
                  <MenuItem value="Life">Life</MenuItem>
                  <MenuItem value="Health">Health</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={policyForm.status}
                  onChange={(e) => setPolicyForm({ ...policyForm, status: e.target.value })}
                  label="Status"
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Coverage Amount"
                type="number"
                value={policyForm.coverageAmount}
                onChange={(e) => setPolicyForm({ ...policyForm, coverageAmount: e.target.value })}
                required
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Premium Amount"
                type="number"
                value={policyForm.premiumAmount}
                onChange={(e) => setPolicyForm({ ...policyForm, premiumAmount: e.target.value })}
                required
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Payment Frequency</InputLabel>
                <Select
                  value={policyForm.paymentFrequency}
                  onChange={(e) => setPolicyForm({ ...policyForm, paymentFrequency: e.target.value })}
                  label="Payment Frequency"
                >
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="SemiAnnually">Semi-Annually</MenuItem>
                  <MenuItem value="Annually">Annually</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Coverage Level</InputLabel>
                <Select
                  value={policyForm.coverageLevel}
                  onChange={(e) => setPolicyForm({ ...policyForm, coverageLevel: e.target.value })}
                  label="Coverage Level"
                >
                  <MenuItem value="Basic">Basic</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                  <MenuItem value="Comprehensive">Comprehensive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={policyForm.startDate}
                onChange={(e) => setPolicyForm({ ...policyForm, startDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={policyForm.endDate}
                onChange={(e) => setPolicyForm({ ...policyForm, endDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        );
      case 'claim':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Policy ID"
                type="number"
                value={claimForm.policyId}
                onChange={(e) => setClaimForm({ ...claimForm, policyId: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Claim Number"
                value={claimForm.claimNumber}
                onChange={(e) => setClaimForm({ ...claimForm, claimNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Claim Type</InputLabel>
                <Select
                  value={claimForm.claimType}
                  onChange={(e) => setClaimForm({ ...claimForm, claimType: e.target.value })}
                  label="Claim Type"
                >
                  <MenuItem value="Accident">Accident</MenuItem>
                  <MenuItem value="Theft">Theft</MenuItem>
                  <MenuItem value="Damage">Damage</MenuItem>
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Liability">Liability</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Claim Status</InputLabel>
                <Select
                  value={claimForm.claimStatus}
                  onChange={(e) => setClaimForm({ ...claimForm, claimStatus: e.target.value })}
                  label="Claim Status"
                >
                  <MenuItem value="Filed">Filed</MenuItem>
                  <MenuItem value="UnderReview">Under Review</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Denied">Denied</MenuItem>
                  <MenuItem value="Settled">Settled</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Incident Date"
                type="date"
                value={claimForm.incidentDate}
                onChange={(e) => setClaimForm({ ...claimForm, incidentDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Claim Amount"
                type="number"
                value={claimForm.claimAmount}
                onChange={(e) => setClaimForm({ ...claimForm, claimAmount: e.target.value })}
                required
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Settlement Amount"
                type="number"
                value={claimForm.settlementAmount}
                onChange={(e) => setClaimForm({ ...claimForm, settlementAmount: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={claimForm.description}
                onChange={(e) => setClaimForm({ ...claimForm, description: e.target.value })}
              />
            </Grid>
          </Grid>
        );
      case 'agent':
        return (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={agentForm.firstName}
                onChange={(e) => setAgentForm({ ...agentForm, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={agentForm.lastName}
                onChange={(e) => setAgentForm({ ...agentForm, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={agentForm.email}
                onChange={(e) => setAgentForm({ ...agentForm, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={agentForm.phone}
                onChange={(e) => setAgentForm({ ...agentForm, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Region</InputLabel>
                <Select
                  value={agentForm.region}
                  onChange={(e) => setAgentForm({ ...agentForm, region: e.target.value })}
                  label="Region"
                >
                  <MenuItem value="North">North</MenuItem>
                  <MenuItem value="South">South</MenuItem>
                  <MenuItem value="East">East</MenuItem>
                  <MenuItem value="West">West</MenuItem>
                  <MenuItem value="Central">Central</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="License Number"
                value={agentForm.licenseNumber}
                onChange={(e) => setAgentForm({ ...agentForm, licenseNumber: e.target.value })}
                required
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
              onClick={() => handleOpenDialog('policyholder')}
            >
              <PersonAddIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                New Policyholder
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a policyholder entry
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
              onClick={() => handleOpenDialog('policy')}
            >
              <DescriptionIcon sx={{ fontSize: 48, color: theme.palette.secondary.main, mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                New Policy
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a policy entry
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
              onClick={() => handleOpenDialog('claim')}
            >
              <AssignmentIcon sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                New Claim
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add a claim entry
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
              onClick={() => handleOpenDialog('agent')}
            >
              <BadgeIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                New Agent
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add an agent entry
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
