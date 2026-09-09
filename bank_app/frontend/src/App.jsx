import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar, Typography, Container, Tabs, Tab, IconButton } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DatabaseProvider } from './context/DatabaseContext';
import DatabaseSelector from './components/DatabaseSelector';
import Home from './components/Home';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import Branches from './components/Branches';
import Customers from './components/Customers';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
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
  const [selectedTab, setSelectedTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync selected tab with current route
  useEffect(() => {
    switch(location.pathname) {
      case '/':
        setSelectedTab(0);
        break;
      case '/customers':
        setSelectedTab(1);
        break;
      case '/accounts':
        setSelectedTab(2);
        break;
      case '/transactions':
        setSelectedTab(3);
        break;
      case '/branches':
        setSelectedTab(4);
        break;
      default:
        break;
    }
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    switch(newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/customers');
        break;
      case 2:
        navigate('/accounts');
        break;
      case 3:
        navigate('/transactions');
        break;
      case 4:
        navigate('/branches');
        break;
      default:
        break;
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const isHomeVisible = location.pathname === '/';
  const isCustomersVisible = location.pathname === '/customers';
  const isAccountsVisible = location.pathname === '/accounts';
  const isTransactionsVisible = location.pathname === '/transactions';
  const isBranchesVisible = location.pathname === '/branches';

  return (
    <ThemeProvider theme={theme}>
      <DatabaseProvider>
        <CssBaseline />
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" sx={{ backgroundColor: '#ffffff', boxShadow: 1 }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'black' }}>
                Blank Back Office
              </Typography>
              <IconButton 
                onClick={handleRefresh}
                sx={{ 
                  color: 'black',
                  mr: 2,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
              <DatabaseSelector />
            </Toolbar>
            <Tabs 
              value={selectedTab} 
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  color: 'black',
                  '&.Mui-selected': {
                    color: theme.palette.primary.main,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
            >
              <Tab label="Home" />
              <Tab label="Customers" />
              <Tab label="Accounts" />
              <Tab label="Transactions" />
              <Tab label="Branches" />
            </Tabs>
          </AppBar>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<Home isVisible={isHomeVisible} refreshTrigger={isHomeVisible ? refreshTrigger : 0} />} />
              <Route path="/customers" element={<Customers refreshTrigger={isCustomersVisible ? refreshTrigger : 0} />} />
              <Route path="/accounts" element={<Accounts refreshTrigger={isAccountsVisible ? refreshTrigger : 0} />} />
              <Route path="/transactions" element={<Transactions refreshTrigger={isTransactionsVisible ? refreshTrigger : 0} />} />
              <Route path="/branches" element={<Branches refreshTrigger={isBranchesVisible ? refreshTrigger : 0} />} />
            </Routes>
          </Container>
        </Box>
      </DatabaseProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 