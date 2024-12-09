import { Switch, FormControlLabel } from '@mui/material';
import { useState } from 'react';

const StatusToggle = ({ isActive, itemId, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleChange = async () => {
    setLoading(true);
    try {
      await onToggle();
    } catch (error) {
      console.error('Error toggling status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isActive}
          onChange={handleChange}
          disabled={loading}
          color="secondary"
        />
      }
      label={loading ? 'Updating...' : isActive ? 'Active' : 'Inactive'}
    />
  );
};

export default StatusToggle;
