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
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
} from '@mui/material';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MedicationIcon from '@mui/icons-material/Medication';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MessageIcon from '@mui/icons-material/Message';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function WelcomeCard({ statistics }) {
  const theme = useTheme();
  const currentHour = new Date().getHours();
  let greeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 18) greeting = 'Good Afternoon';
  else if (currentHour >= 18) greeting = 'Good Evening';

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Paper sx={{
      background: 'linear-gradient(135deg, #006699 0%, #0088CC 50%, #00AA99 100%)',
      color: 'white',
      mb: 3,
      overflow: 'hidden',
      position: 'relative',
      border: '3px solid #00AA99',
      borderRadius: 2,
    }} elevation={4}>
      <Box sx={{
        position: 'absolute',
        top: -50,
        right: -50,
        width: 300,
        height: 300,
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
      }} />
      <CardContent sx={{ p: 4, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 300 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalHospitalIcon sx={{ fontSize: 40, mr: 2, color: '#00FFCC' }} />
              <Box>
                <Typography variant="h4" sx={{ color: '#00FFCC', fontWeight: 800, letterSpacing: '1px' }}>
                  EMR DASHBOARD
                </Typography>
                <Typography variant="body2" sx={{ color: '#CCEEEE', fontWeight: 600 }}>
                  {currentDate}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
            <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
              <Box sx={{
                bgcolor: 'rgba(0,255,204,0.15)',
                px: 3,
                py: 2,
                borderRadius: 1,
                border: '2px solid rgba(0,255,204,0.3)',
              }}>
                <Typography variant="h3" sx={{ color: '#00FFCC', fontWeight: 800 }}>
                  {statistics?.totalPatients || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600, mt: 0.5 }}>
                  ACTIVE PATIENTS
                </Typography>
              </Box>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                px: 3,
                py: 2,
                borderRadius: 1,
                border: '2px solid rgba(255,255,255,0.3)',
              }}>
                <Typography variant="h3" sx={{ color: '#FFFFFF', fontWeight: 800 }}>
                  {statistics?.totalAppointments || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#CCEEEE', fontWeight: 600, mt: 0.5 }}>
                  APPOINTMENTS
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '4px solid rgba(0,255,204,0.3)',
            }}>
              <LocalHospitalIcon sx={{ fontSize: 60, color: '#00FFCC' }} />
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Paper>
  );
}

function QuickActionsCard() {
  const theme = useTheme();
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Schedule Appointment',
      description: 'Book a new visit',
      icon: <CalendarTodayIcon />,
      color: theme.palette.primary.main,
      onClick: () => navigate('/appointments')
    },
    {
      title: 'Request Prescription',
      description: 'Refill medication',
      icon: <MedicationIcon />,
      color: theme.palette.secondary.main,
      onClick: () => navigate('/prescriptions')
    },
    {
      title: 'Message Provider',
      description: 'Contact your care team',
      icon: <MessageIcon />,
      color: theme.palette.info.main,
      onClick: () => navigate('/providers')
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentIcon color="primary" />
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {actions.map((action, index) => (
            <Grid item xs={12} key={index}>
              <Button
                fullWidth
                variant="outlined"
                onClick={action.onClick}
                sx={{
                  p: 2,
                  justifyContent: 'flex-start',
                  borderColor: theme.palette.grey[200],
                  '&:hover': {
                    borderColor: action.color,
                    backgroundColor: `${action.color}10`,
                  }
                }}
                startIcon={
                  <Avatar sx={{
                    bgcolor: `${action.color}20`,
                    color: action.color,
                    width: 40,
                    height: 40
                  }}>
                    {action.icon}
                  </Avatar>
                }
              >
                <Box sx={{ textAlign: 'left', ml: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}

function HealthMetricsCard({ statistics }) {
  const theme = useTheme();

  const metrics = [
    {
      title: 'Active Prescriptions',
      value: statistics?.totalPrescriptions || 0,
      icon: <MedicationIcon />,
      color: theme.palette.secondary.main
    },
    {
      title: 'Healthcare Providers',
      value: statistics?.totalProviders || 0,
      icon: <PersonIcon />,
      color: theme.palette.info.main
    },
    {
      title: 'Upcoming Visits',
      value: statistics?.upcomingAppointments || 0,
      icon: <EventAvailableIcon />,
      color: theme.palette.success.main
    },
  ];

  return (
    <Grid container spacing={2}>
      {metrics.map((metric, index) => (
        <Grid item xs={12} sm={4} key={index}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {metric.title}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: metric.color, my: 1 }}>
                    {metric.value}
                  </Typography>
                </Box>
                <Avatar sx={{
                  bgcolor: `${metric.color}15`,
                  color: metric.color,
                  width: 48,
                  height: 48
                }}>
                  {metric.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

function AppointmentStatusChart({ appointmentStatusCounts, statusLoading }) {
  const theme = useTheme();

  const STATUS_COLORS = {
    Scheduled: theme.palette.primary.main,
    Completed: theme.palette.success.main,
    Cancelled: theme.palette.error.main,
    NoShow: theme.palette.warning.main,
  };

  const STATUS_LABELS = ['Scheduled', 'Completed', 'Cancelled', 'NoShow'];

  const pieData = STATUS_LABELS.map(status => ({
    name: status === 'NoShow' ? 'No Show' : status,
    value: appointmentStatusCounts && appointmentStatusCounts[status] ? appointmentStatusCounts[status] : 0
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayIcon color="primary" />
          Appointment Status Distribution
        </Typography>
        {statusLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[STATUS_LABELS[index]] || theme.palette.grey[400]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function RecentActivityCard() {
  const theme = useTheme();

  const activities = [
    {
      type: 'appointment',
      title: 'Annual Physical Exam',
      description: 'Scheduled for Dec 15, 2023',
      time: '2 hours ago',
      icon: <CalendarTodayIcon />,
      color: theme.palette.primary.main
    },
    {
      type: 'prescription',
      title: 'Prescription Refilled',
      description: 'Lisinopril 10mg',
      time: '1 day ago',
      icon: <MedicationIcon />,
      color: theme.palette.secondary.main
    },
    {
      type: 'message',
      title: 'Message from Dr. Smith',
      description: 'Lab results are ready',
      time: '2 days ago',
      icon: <MessageIcon />,
      color: theme.palette.info.main
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon color="primary" />
          Recent Activity
        </Typography>
        <List sx={{ pt: 2 }}>
          {activities.map((activity, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: `${activity.color}15`, color: activity.color }}>
                    {activity.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body1" fontWeight={600}>
                      {activity.title}
                    </Typography>
                  }
                  secondary={
                    <React.Fragment>
                      <Typography variant="body2" color="text.secondary" component="span">
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {activity.time}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < activities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
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
  const [appointmentStatusCounts, setAppointmentStatusCounts] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  const handleViewDocs = () => {
    window.open(`${backendUrl}/swagger-ui/index.html`, '_blank');
  };

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

  const fetchAppointmentStatusCounts = async () => {
    setStatusLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/statistics/appointment-status-counts?database=${selectedDatabase}`);
      setAppointmentStatusCounts(response.data);
    } catch (err) {
      setAppointmentStatusCounts(null);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchStatistics();
      fetchAppointmentStatusCounts();
    }
  }, [selectedDatabase, isVisible, refreshTrigger]);

  if (loading && !statistics) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <WelcomeCard statistics={statistics} />

      <HealthMetricsCard statistics={statistics} />

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} md={4}>
          <QuickActionsCard />
        </Grid>

        <Grid item xs={12} md={8}>
          <AppointmentStatusChart
            appointmentStatusCounts={appointmentStatusCounts}
            statusLoading={statusLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 0 }}>
        <Grid item xs={12} md={6}>
          <RecentActivityCard />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" />
                API Documentation
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                Access the complete API documentation through Swagger UI. View all available endpoints,
                test them out, and understand the request/response formats.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleViewDocs}
                fullWidth
                sx={{ mt: 1 }}
              >
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
