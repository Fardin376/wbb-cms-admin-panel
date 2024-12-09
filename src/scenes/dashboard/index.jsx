import {
  Box,
  Button,
  Card,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Header, StatBox, ProgressCircle } from '../../components';
import { tokens } from '../../theme';
import {
  DownloadOutlined,
  Email,
  PersonAdd,
  PointOfSale,
  Traffic,
} from '@mui/icons-material';

function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); // Get theme colors
  const isXlDevices = useMediaQuery('(min-width: 1260px)');
  const isMdDevices = useMediaQuery('(min-width: 724px)');
  const isXsDevices = useMediaQuery('(max-width: 436px)');

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 20,
        mx: 20,
        mt: 20,
      }}
    >
      <Box display="flex" justifyContent="space-between">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
        {/* Remove download button for now */}
      </Box>
    </Card>
  );
}

export default Dashboard;
