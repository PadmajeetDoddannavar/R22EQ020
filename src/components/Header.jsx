import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

export default function Header() {
  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="h5" component="div">
        Affordmed — URL Shortener (Frontend)
      </Typography>
      <Box>
        <Link component={RouterLink} to="/" sx={{ mr: 2 }}>Shorten</Link>
        <Link component={RouterLink} to="/stats">Statistics</Link>
      </Box>
    </Box>
  );
}
