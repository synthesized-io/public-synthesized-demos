import React, { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, IconButton, Avatar, Badge, Divider } from '@mui/material';
import { Refresh as RefreshIcon, Notifications as NotificationsIcon, AccountCircle as AccountCircleIcon, Shield as ShieldIcon, Dashboard as DashboardIcon, People as PeopleIcon, Description as DescriptionIcon, Assignment as AssignmentIcon, Badge as BadgeIcon, Settings as SettingsIcon, Menu as MenuIcon } from '@mui/icons-material';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DatabaseProvider } from './context/DatabaseContext';
import DatabaseSelector from './components/DatabaseSelector';
import Home from './components/Home';
import Policyholders from './components/Policyholders';
import Policies from './components/Policies';
import Claims from './components/Claims';
import Agents from './components/Agents';
import Admin from './components/Admin';
import theme from './theme';

const DRAWER_WIDTH = 260;

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const isHomeVisible = location.pathname === '/';
  const isPolicyholdersVisible = location.pathname === '/policyholders';
  const isPoliciesVisible = location.pathname === '/policies';
  const isClaimsVisible = location.pathname === '/claims';
  const isAgentsVisible = location.pathname === '/agents';
  const isAdminVisible = location.pathname === '/admin';

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', color: '#0066CC' },
    { text: 'Policyholders', icon: <PeopleIcon />, path: '/policyholders', color: '#00AA66' },
    { text: 'Policies', icon: <DescriptionIcon />, path: '/policies', color: '#FF9900' },
    { text: 'Claims', icon: <AssignmentIcon />, path: '/claims', color: '#DD3333' },
    { text: 'Agents', icon: <BadgeIcon />, path: '/agents', color: '#9933CC' },
    { text: 'Admin', icon: <SettingsIcon />, path: '/admin', color: '#666666' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FFF8E7' }}>
      <Box sx={{ p: 3, bgcolor: '#8B4513', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: '#FFD700', width: 48, height: 48, mr: 2 }}>
            <ShieldIcon sx={{ color: '#8B4513', fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: '#FFD700' }}>
              SecureLife
            </Typography>
            <Typography variant="caption" sx={{ color: '#FFE4B5' }}>
              Insurance Portal
            </Typography>
          </Box>
        </Box>
        <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 1.5, borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: '#FFE4B5', fontWeight: 600, display: 'block', mb: 0.5 }}>
            Active Database
          </Typography>
          <DatabaseSelector />
        </Box>
      </Box>

      <List sx={{ flex: 1, py: 2 }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                bgcolor: isSelected ? `${item.color}15` : 'transparent',
                borderLeft: isSelected ? `4px solid ${item.color}` : '4px solid transparent',
                '&:hover': {
                  bgcolor: `${item.color}10`,
                },
              }}
            >
              <ListItemIcon sx={{ color: isSelected ? item.color : '#666666', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? item.color : '#333333',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 1 }}>
          System Status
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#00CC66' }} />
          <Typography variant="caption" sx={{ color: '#333333', fontWeight: 600 }}>
            All Systems Operational
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <DatabaseProvider>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* Sidebar Navigation */}
          <Drawer
            variant="permanent"
            sx={{
              width: DRAWER_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                border: 'none',
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
              },
            }}
          >
            {drawer}
          </Drawer>

          {/* Main Content */}
          <Box component="main" sx={{ flexGrow: 1, bgcolor: '#FFF8DC', display: 'flex', flexDirection: 'column' }}>
            {/* Top Bar */}
            <AppBar
              position="static"
              elevation={0}
              sx={{
                bgcolor: '#FFFFFF',
                borderBottom: '1px solid #E0E0E0',
              }}
            >
              <Toolbar sx={{ minHeight: '64px', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' }, color: '#333333' }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ color: '#333333', fontWeight: 600 }}>
                    {location.pathname === '/' && 'Dashboard Overview'}
                    {location.pathname === '/policyholders' && 'Policyholder Management'}
                    {location.pathname === '/policies' && 'Policy Administration'}
                    {location.pathname === '/claims' && 'Claims Processing'}
                    {location.pathname === '/agents' && 'Agent Directory'}
                    {location.pathname === '/admin' && 'System Administration'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton onClick={handleRefresh} sx={{ color: '#666666' }}>
                    <RefreshIcon />
                  </IconButton>
                  <IconButton sx={{ color: '#666666' }}>
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                  <IconButton sx={{ color: '#666666' }}>
                    <AccountCircleIcon />
                  </IconButton>
                </Box>
              </Toolbar>
            </AppBar>

            {/* Page Content */}
            <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
              <Routes>
                <Route path="/" element={<Home isVisible={isHomeVisible} refreshTrigger={isHomeVisible ? refreshTrigger : 0} />} />
                <Route path="/policyholders" element={<Policyholders refreshTrigger={isPolicyholdersVisible ? refreshTrigger : 0} />} />
                <Route path="/policies" element={<Policies refreshTrigger={isPoliciesVisible ? refreshTrigger : 0} />} />
                <Route path="/claims" element={<Claims refreshTrigger={isClaimsVisible ? refreshTrigger : 0} />} />
                <Route path="/agents" element={<Agents refreshTrigger={isAgentsVisible ? refreshTrigger : 0} />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </Box>
          </Box>
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
