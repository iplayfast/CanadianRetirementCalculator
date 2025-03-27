import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ py: 3, bgcolor: 'primary.light', mt: 'auto' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          Canadian Retirement Planner © {new Date().getFullYear()}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
