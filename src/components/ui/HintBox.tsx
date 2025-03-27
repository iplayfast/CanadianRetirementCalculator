// src/components/ui/HintBox.tsx
import React, { ReactNode } from 'react';
import { Paper, Typography, Box, SxProps, Theme } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface HintBoxProps {
  text: string | ReactNode;
  title?: string;
  variant?: 'bordered' | 'filled' | 'outlined';
  icon?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/**
 * A reusable component for displaying hints, tips, or informational messages
 */
const HintBox: React.FC<HintBoxProps> = ({
  text,
  title,
  variant = 'filled',
  icon = <InfoIcon color="primary" />,
  sx = {}
}) => {
  // Determine styling based on variant
  let boxStyles = {};
  
  switch (variant) {
    case 'bordered':
      boxStyles = {
        border: '1px solid',
        borderColor: 'primary.main',
        bgcolor: 'background.paper',
      };
      break;
    case 'outlined':
      boxStyles = {
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      };
      break;
    case 'filled':
    default:
      boxStyles = {
        bgcolor: 'action.hover',
      };
      break;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 1,
        ...boxStyles,
        ...sx
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        {icon && (
          <Box sx={{ mr: 1.5, mt: 0.25 }}>
            {icon}
          </Box>
        )}
        
        <Box sx={{ flex: 1 }}>
          {title && (
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {title}
            </Typography>
          )}
          {typeof text === 'string' ? (
            <Typography variant="body2" component="div">
              {text}
            </Typography>
          ) : (
            text
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default HintBox;