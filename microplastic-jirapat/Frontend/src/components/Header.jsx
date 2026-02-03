// Header.jsx
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';

export default function Header() {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1.5 }}>
          <ScienceIcon />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Microplastic Detection Dashboard
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Real-time ML Analysis
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
