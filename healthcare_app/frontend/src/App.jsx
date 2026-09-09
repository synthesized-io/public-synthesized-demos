import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, Container, Button, IconButton, Chip, Breadcrumbs, Link } from '@mui/material';
import { Refresh as RefreshIcon, Home as HomeIcon, Person as PersonIcon, Event as EventIcon, Medication as MedicationIcon, LocalHospital as LocalHospitalIcon, Settings as SettingsIcon, Notifications as NotificationsIcon, Help as HelpIcon } from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import DatabaseSelector from './components/DatabaseSelector';
import Home from './components/Home';
import Patients from './components/Patients';
import Appointments from './components/Appointments';
import Prescriptions from './components/Prescriptions';
import Providers from './components/Providers';
import Admin from './components/Admin';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00897b',
    },
    text: {
      primary: '#000000',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function TabPanel({ children, value, index }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AppContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedDatabase } = useDatabase(); // This is now safe because DatabaseProvider wraps Router

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const isHomeVisible = location.pathname === '/';
  const isPatientsVisible = location.pathname === '/patients';
  const isAppointmentsVisible = location.pathname === '/appointments';
  const isPrescriptionsVisible = location.pathname === '/prescriptions';
  const isProvidersVisible = location.pathname === '/providers';
  const isAdminVisible = location.pathname === '/admin';

  const ribbonButtons = [
    { label: 'Home', icon: <HomeIcon />, path: '/', color: '#0066CC' },
    { label: 'Patients', icon: <PersonIcon />, path: '/patients', color: '#00AA66' },
    { label: 'Schedule', icon: <EventIcon />, path: '/appointments', color: '#FF6600' },
    { label: 'Prescriptions', icon: <MedicationIcon />, path: '/prescriptions', color: '#CC3399' },
    { label: 'Providers', icon: <LocalHospitalIcon />, path: '/providers', color: '#0099CC' },
    { label: 'Admin', icon: <SettingsIcon />, path: '/admin', color: '#666666' },
  ];

  const getBreadcrumbs = () => {
    const pathMap = {
      '/': 'Home',
      '/patients': 'Patient Registry',
      '/appointments': 'Appointment Schedule',
      '/prescriptions': 'Prescription Management',
      '/providers': 'Provider Directory',
      '/admin': 'System Administration',
    };
    return pathMap[location.pathname] || 'Home';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
          {/* Top Header Bar */}
          <AppBar position="static" elevation={0} sx={{ bgcolor: '#004D66', borderBottom: '2px solid #00AA99' }}>
            <Toolbar sx={{ minHeight: '56px', px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <LocalHospitalIcon sx={{ fontSize: 32, color: '#00FF99' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#FFFFFF', fontWeight: 800, lineHeight: 1.2 }}>
                      HealthCare EMR
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mx: 2, height: 32, width: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
                <Chip
                  label={`DB: ${selectedDatabase || 'Default'}`}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    '& .MuiChip-label': { px: 2 }
                  }}
                />
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DatabaseSelector />
                <IconButton size="small" sx={{ color: '#FFFFFF' }}>
                  <HelpIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: '#FFFFFF' }}>
                  <NotificationsIcon />
                </IconButton>
                <IconButton onClick={handleRefresh} size="small" sx={{ color: '#FFFFFF' }}>
                  <RefreshIcon />
                </IconButton>
                <Chip
                  label="Dr. Smith"
                  avatar={<PersonIcon />}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', fontWeight: 600 }}
                />
              </Box>
            </Toolbar>
          </AppBar>

          {/* Ribbon Navigation */}
          <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Box sx={{ px: 2, py: 1, display: 'flex', gap: 0.5, overflowX: 'auto' }}>
              {ribbonButtons.map((btn) => {
                const isActive = location.pathname === btn.path;
                return (
                  <Button
                    key={btn.path}
                    onClick={() => navigate(btn.path)}
                    startIcon={btn.icon}
                    sx={{
                      minWidth: '110px',
                      py: 1.5,
                      px: 2,
                      borderRadius: 1,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      bgcolor: isActive ? `${btn.color}15` : 'transparent',
                      color: isActive ? btn.color : '#666666',
                      borderBottom: isActive ? `3px solid ${btn.color}` : '3px solid transparent',
                      '&:hover': {
                        bgcolor: `${btn.color}10`,
                        color: btn.color,
                      },
                    }}
                  >
                    {btn.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {/* Breadcrumb and Page Title */}
          <Box sx={{ bgcolor: '#F5F5F5', borderBottom: '1px solid #E0E0E0', px: 3, py: 1.5 }}>
            <Breadcrumbs>
              <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer', fontSize: '0.875rem' }}>
                Home
              </Link>
              <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                {getBreadcrumbs()}
              </Typography>
            </Breadcrumbs>
          </Box>

          {/* Main Content Area */}
          <Box sx={{ flex: 1, px: 3, py: 2, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<Home isVisible={isHomeVisible} refreshTrigger={isHomeVisible ? refreshTrigger : 0} />} />
              <Route path="/patients" element={<Patients refreshTrigger={isPatientsVisible ? refreshTrigger : 0} />} />
              <Route path="/appointments" element={<Appointments refreshTrigger={isAppointmentsVisible ? refreshTrigger : 0} />} />
              <Route path="/prescriptions" element={<Prescriptions refreshTrigger={isPrescriptionsVisible ? refreshTrigger : 0} />} />
              <Route path="/providers" element={<Providers refreshTrigger={isProvidersVisible ? refreshTrigger : 0} />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Box>

          {/* Footer Status Bar */}
          <Box sx={{ bgcolor: '#004D66', borderTop: '2px solid #00AA99', px: 3, py: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#CCEEEE', fontWeight: 600 }}>
                Connected to: {selectedDatabase || 'Default Database'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00FF99' }} />
                <Typography variant="caption" sx={{ color: '#CCEEEE', fontWeight: 600 }}>
                  System Online
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <DatabaseProvider>
      <Router>
        <AppContent />
      </Router>
    </DatabaseProvider>
  );
}

export default App;
