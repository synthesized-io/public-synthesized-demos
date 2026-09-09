import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  useTheme,
  CircularProgress,
  Divider,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack,
  IconButton,
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
  PersonAdd as PersonAddIcon,
  AddCircle as AddCircleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Phone as PhoneIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Shield as ShieldIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useDatabase } from '../context/DatabaseContext';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

function StatCard({ title, value, loading, icon: Icon, color }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: `1px solid ${theme.palette.grey[200]}`,
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
        transition: 'all 0.3s ease',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
              {title}
            </Typography>
            {loading ? (
              <CircularProgress size={32} />
            ) : (
              <Typography variant="h3" sx={{ color: theme.palette.text.primary, fontWeight: 700, mb: 0.5 }}>
                {value.toLocaleString()}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: color || theme.palette.primary.main,
              width: 56,
              height: 56,
              boxShadow: `0 4px 14px 0 ${color || theme.palette.primary.main}40`,
            }}
          >
            {Icon && <Icon sx={{ fontSize: 28 }} />}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({ title, description, icon: Icon, onClick, color }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        cursor: 'pointer',
        border: `2px solid ${theme.palette.grey[200]}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: color || theme.palette.primary.main,
          boxShadow: theme.shadows[4],
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            bgcolor: `${color || theme.palette.primary.main}15`,
            color: color || theme.palette.primary.main,
            width: 64,
            height: 64,
            margin: '0 auto 16px',
          }}
        >
          {Icon && <Icon sx={{ fontSize: 32 }} />}
        </Avatar>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

function Home({ isVisible, refreshTrigger }) {
  const { selectedDatabase } = useDatabase();
  const theme = useTheme();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [policyStatusCounts, setPolicyStatusCounts] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const STATUS_COLORS = {
    InForce: '#10b981', // Green for in force
    Bound: '#3b82f6', // Blue for bound
    Expired: '#f59e0b', // Amber for expired
    Cancelled: '#dc2626', // Red for cancelled
    Draft: '#8b5cf6', // Purple for draft
    Withdrawn: '#6b7280', // Gray for withdrawn
  };
  const STATUS_LABELS = ['InForce', 'Bound', 'Expired', 'Cancelled', 'Draft', 'Withdrawn'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/statistics?database=${selectedDatabase}`);
      setStatistics(response.data);
    } catch (err) {
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchPolicyStatusCounts = async () => {
    setStatusLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/statistics/policy-status-counts?database=${selectedDatabase}`);
      setPolicyStatusCounts(response.data);
    } catch (err) {
      setPolicyStatusCounts(null);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchStatistics();
      fetchPolicyStatusCounts();
    }
  }, [selectedDatabase, isVisible, refreshTrigger]);

  // Prepare data for recharts
  const pieData = STATUS_LABELS.map(status => ({
    name: status,
    value: policyStatusCounts && policyStatusCounts[status] ? policyStatusCounts[status] : 0
  }));

  return (
    <Box sx={{ pb: 4 }}>
      {/* Enhanced Header Banner */}
      <Paper
        elevation={3}
        sx={{
          p: 0,
          mb: 3,
          background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #B8860B 100%)',
          color: 'white',
          borderRadius: 2,
          overflow: 'hidden',
          border: '2px solid #996515',
          position: 'relative',
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '40%',
          height: '100%',
          background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'none\'/%3E%3Cpath d=\'M0 0L100 100M100 0L0 100\' stroke=\'rgba(255,255,255,0.05)\' stroke-width=\'2\'/%3E%3C/svg%3E")',
          opacity: 0.3,
        }} />
        <Grid container spacing={0} alignItems="center" sx={{ position: 'relative' }}>
          <Grid item xs={12} md={8} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShieldIcon sx={{ fontSize: 48, mr: 2, color: '#FFD700' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFD700', letterSpacing: '1px' }}>
                  INSURANCE WORKBENCH
                </Typography>
                <Typography variant="body1" sx={{ color: '#FFE4B5', fontWeight: 600 }}>
                  Enterprise Policy & Claims Management System
                </Typography>
              </Box>
            </Box>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 2, py: 1.5, borderRadius: 1, mt: 2 }}>
              <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                Database: <Chip label={selectedDatabase} size="small" sx={{ bgcolor: '#FFD700', color: '#8B4513', fontWeight: 700, ml: 1 }} />
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', p: 3 }}>
            <ShieldIcon sx={{ fontSize: 140, color: 'rgba(255,215,0,0.2)' }} />
          </Grid>
        </Grid>
      </Paper>

      {/* Key Metrics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Key Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Policyholders"
              value={statistics?.totalPolicyholders || 0}
              loading={loading}
              icon={PeopleIcon}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Policies"
              value={statistics?.totalPolicies || 0}
              loading={loading}
              icon={DescriptionIcon}
              color={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Claims"
              value={statistics?.totalClaims || 0}
              loading={loading}
              icon={AssignmentIcon}
              color={theme.palette.warning.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Agents"
              value={statistics?.totalAgents || 0}
              loading={loading}
              icon={AccountBalanceIcon}
              color="#10b981"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Stats Section - Pie Chart and System Information */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Policy Status Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShieldIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Policy Status Distribution
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              {statusLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {pieData.map((entry) => (
                      <Chip
                        key={entry.name}
                        label={`${entry.name}: ${entry.value}`}
                        size="small"
                        sx={{
                          bgcolor: `${STATUS_COLORS[entry.name]}20`,
                          color: STATUS_COLORS[entry.name],
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentTurnedInIcon sx={{ mr: 1, color: theme.palette.secondary.main }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  System Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="System Status"
                    secondary="All systems operational"
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PhoneIcon sx={{ color: '#8B4513' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Support Available"
                    secondary="24/7 customer support"
                    primaryTypographyProps={{ fontWeight: 600 }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="New Claim"
              description="File a new insurance claim"
              icon={AddCircleIcon}
              color={theme.palette.warning.main}
              onClick={() => navigate('/claims')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="New Policy"
              description="Create a new insurance policy"
              icon={DescriptionIcon}
              color={theme.palette.secondary.main}
              onClick={() => navigate('/policies')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <QuickActionCard
              title="New Customer"
              description="Register a new policyholder"
              icon={PersonAddIcon}
              color={theme.palette.primary.main}
              onClick={() => navigate('/policyholders')}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Home;
