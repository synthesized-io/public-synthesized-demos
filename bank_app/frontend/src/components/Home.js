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
  CircularProgress
} from '@mui/material';
import { useDatabase } from '../context/DatabaseContext';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function StatCard({ title, value, loading }) {
  const theme = useTheme();
  
  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: `1px solid ${theme.palette.grey[200]}`,
        '&:hover': {
          boxShadow: 1,
        }
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: 'black' }}>
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
            {value.toLocaleString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function Home({ isVisible, refreshTrigger }) {
  const { selectedDatabase } = useDatabase();
  const theme = useTheme();
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accountStatusCounts, setAccountStatusCounts] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const STATUS_COLORS = {
    Frozen: '#8884d8',
    Active: '#82ca9d',
    Overdrawn: '#ffc658',
    Dormant: '#ff8042',
    Closed: '#a4a4a4',
  };
  const STATUS_LABELS = ['Frozen', 'Active', 'Overdrawn', 'Dormant', 'Closed'];

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8085';

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

  const fetchAccountStatusCounts = async () => {
    setStatusLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/statistics/account-status-counts?database=${selectedDatabase}`);
      setAccountStatusCounts(response.data);
    } catch (err) {
      setAccountStatusCounts(null);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      fetchStatistics();
      fetchAccountStatusCounts();
    }
  }, [selectedDatabase, isVisible, refreshTrigger]);

  // Prepare data for recharts
  const pieData = STATUS_LABELS.map(status => ({
    name: status,
    value: accountStatusCounts && accountStatusCounts[status] ? accountStatusCounts[status] : 0
  }));

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom sx={{ color: 'black' }}>
            System Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Transactions" 
                value={statistics?.totalTransactions || 0}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Customers" 
                value={statistics?.totalCustomers || 0}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Accounts" 
                value={statistics?.totalAccounts || 0}
                loading={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Branches" 
                value={statistics?.totalBranches || 0}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Pie Chart for Account Statuses */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ height: '100%', border: `1px solid ${theme.palette.grey[200]}` }}>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: 'black' }}>
                Account Status Distribution
              </Typography>
              {statusLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height={200}>
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
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#ccc'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{ 
              height: '100%',
              border: `1px solid ${theme.palette.grey[200]}`,
              '&:hover': {
                boxShadow: 1,
              }
            }}
          >
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ color: 'black' }}>
                API Documentation
              </Typography>
              <Typography variant="body1" sx={{ color: 'black' }}>
                Access the complete API documentation through Swagger UI. View all available endpoints, test them out, and understand the request/response formats.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleViewDocs}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                View Documentation
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home; 