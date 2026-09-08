import React from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  useTheme,
  Box,
  Typography
} from '@mui/material';
import { useDatabase, DATABASE_OPTIONS } from '../context/DatabaseContext';
import StorageIcon from '@mui/icons-material/Storage';

function DatabaseSelector() {
  const { selectedDatabase, setSelectedDatabase } = useDatabase();
  const theme = useTheme();

  const handleChange = (event) => {
    setSelectedDatabase(event.target.value);
  };

  const getDatabaseLabel = (value) => {
    switch (value) {
      case DATABASE_OPTIONS.SEED:
        return 'Seed';
      case DATABASE_OPTIONS.PROD:
        return 'Production';
      case DATABASE_OPTIONS.TESTING:
        return 'Testing';
      default:
        return value;
    }
  };

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 150,
        '& .MuiOutlinedInput-root': {
          bgcolor: 'rgba(255,255,255,0.95)',
          borderRadius: 1.5,
          '& fieldset': {
            borderColor: 'rgba(255,255,255,0.4)',
            borderWidth: 2,
          },
          '&:hover fieldset': {
            borderColor: '#00FF99',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#00FF99',
          },
        },
        '& .MuiSelect-select': {
          color: '#004D66',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        },
        '& .MuiSelect-icon': {
          color: '#004D66',
        },
      }}
    >
      <Select
        value={selectedDatabase}
        onChange={handleChange}
        displayEmpty
        renderValue={(value) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageIcon sx={{ fontSize: 18, color: '#00897b' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#004D66' }}>
              {getDatabaseLabel(value)}
            </Typography>
          </Box>
        )}
      >
        <MenuItem value={DATABASE_OPTIONS.SEED}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StorageIcon sx={{ fontSize: 18, color: '#10b981' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Seed</Typography>
              <Typography variant="caption" color="text.secondary">Sample data</Typography>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem value={DATABASE_OPTIONS.PROD}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StorageIcon sx={{ fontSize: 18, color: '#dc2626' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Production</Typography>
              <Typography variant="caption" color="text.secondary">Live data</Typography>
            </Box>
          </Box>
        </MenuItem>
        <MenuItem value={DATABASE_OPTIONS.TESTING}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StorageIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Testing</Typography>
              <Typography variant="caption" color="text.secondary">Test environment</Typography>
            </Box>
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  );
}

export default DatabaseSelector;
