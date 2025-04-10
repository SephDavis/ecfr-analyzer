// RegulationExplorerIntegration.js
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Card, CardContent, 
  Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import RegulationExplorer from './RegulationExplorer';

/**
 * This component integrates the improved RegulationExplorer
 * into the Dashboard or AgencyAnalysis components
 */
const RegulationExplorerIntegration = ({ agenciesData, historicalData }) => {
  const [explorerOpen, setExplorerOpen] = useState(false);
  
  const handleOpenExplorer = () => {
    setExplorerOpen(true);
  };
  
  const handleCloseExplorer = () => {
    setExplorerOpen(false);
  };
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Federal Regulation Explorer
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Search, analyze, and explore federal regulations with advanced tools.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <SearchIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Powerful Search & Analysis
                  </Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Quickly find regulations, analyze changes over time, track corrections, and explore the structure of the Code of Federal Regulations (CFR).
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<ZoomInIcon />}
                  onClick={handleOpenExplorer}
                  fullWidth
                >
                  Open Regulation Explorer
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MenuBookIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Key Features
                  </Typography>
                </Box>
                <ul style={{ paddingLeft: '1.5rem', marginTop: 0 }}>
                  <li>
                    <Typography variant="body2">
                      Agency-specific regulation analysis
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Title structure browser with full hierarchy navigation
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Full-text search with advanced filtering
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Version history tracking and comparison
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Corrections and amendments tracker
                    </Typography>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Full-screen Explorer Dialog */}
      <Dialog
        open={explorerOpen}
        onClose={handleCloseExplorer}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { 
            height: '90vh',
            backgroundColor: 'background.default'
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AnalyticsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Federal Regulation Explorer</Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleCloseExplorer}
            edge="end"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <RegulationExplorer agenciesData={agenciesData} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default RegulationExplorerIntegration;