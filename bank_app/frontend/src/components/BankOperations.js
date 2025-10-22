import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import axios from 'axios';
import { useDatabase } from '../context/DatabaseContext';

function BankOperations() {
  const [balance, setBalance] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { selectedDatabase } = useDatabase();
  const theme = useTheme();
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8085';

  const fetchBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/balance?database=${selectedDatabase}`);
      setBalance(response.data.balance);
    } catch (err) {
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [selectedDatabase]);

  const handleDeposit = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${backendUrl}/api/deposit`, {
        amount: parseFloat(amount),
        database: selectedDatabase
      });
      setSuccess('Deposit successful');
      setAmount('');
      fetchBalance();
    } catch (err) {
      setError('Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(`${backendUrl}/api/withdraw`, {
        amount: parseFloat(amount),
        database: selectedDatabase
      });
      setSuccess('Withdrawal successful');
      setAmount('');
      fetchBalance();
    } catch (err) {
      setError('Failed to process withdrawal');
    } finally {
      setLoading(false);
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
        <Typography variant="h5" gutterBottom sx={{ color: 'black' }}>
          Current Balance
        </Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : (
          <Typography variant="h3" sx={{ color: 'black', mb: 3 }}>
            ${balance !== null ? balance.toFixed(2) : '0.00'}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                inputProps: { min: 0, step: 0.01 }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.text.primary,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeposit}
                disabled={loading}
                fullWidth
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                Deposit
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleWithdraw}
                disabled={loading}
                fullWidth
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                Withdraw
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}

export default BankOperations; 