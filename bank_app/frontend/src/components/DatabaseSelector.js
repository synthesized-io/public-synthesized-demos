import React from 'react';
import { 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  useTheme
} from '@mui/material';
import { useDatabase, DATABASE_OPTIONS } from '../context/DatabaseContext';

function DatabaseSelector() {
  const { selectedDatabase, setSelectedDatabase } = useDatabase();
  const theme = useTheme();

  const handleChange = (event) => {
    setSelectedDatabase(event.target.value);
  };

  return (
    <FormControl 
      size="small" 
      sx={{ 
        minWidth: 150,
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
        '& .MuiSelect-select': {
          color: theme.palette.text.primary,
        },
      }}
    >
      <InputLabel id="database-select-label">Database</InputLabel>
      <Select
        labelId="database-select-label"
        id="database-select"
        value={selectedDatabase}
        label="Database"
        onChange={handleChange}
      >
        <MenuItem value={DATABASE_OPTIONS.SEED}>Bank Seed</MenuItem>
        <MenuItem value={DATABASE_OPTIONS.PROD}>Bank Prod</MenuItem>
        <MenuItem value={DATABASE_OPTIONS.TESTING}>Bank Testing</MenuItem>
      </Select>
    </FormControl>
  );
}

export default DatabaseSelector; 