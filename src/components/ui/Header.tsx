import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  AppBar, 
  Toolbar, 
  Container, 
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import StorageIcon from '@mui/icons-material/Storage';
import InfoIcon from '@mui/icons-material/Info';

import StorageSettings from './StorageSettings';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleHomeClick = () => {
    navigate('/');
  };
  
  const handleStorageSettingsClick = () => {
    handleMenuClose();
    setStorageDialogOpen(true);
  };
  
  const handleAboutClick = () => {
    handleMenuClose();
    // Implement About dialog or navigate to About page
    console.log('About clicked');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleHomeClick}
            sx={{ mr: 2 }}
          >
            <HomeIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Canadian Retirement Planner
          </Typography>
          
          <Tooltip title="Settings">
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleStorageSettingsClick}>
              <StorageIcon sx={{ mr: 1 }} />
              Storage Settings
            </MenuItem>
            <MenuItem onClick={handleAboutClick}>
              <InfoIcon sx={{ mr: 1 }} />
              About
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Storage Settings Dialog */}
      <StorageSettings
        open={storageDialogOpen}
        onClose={() => setStorageDialogOpen(false)}
      />
    </>
  );
};

export default Header;