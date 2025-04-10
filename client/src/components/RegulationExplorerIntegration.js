// RegulationExplorerIntegration.js
import React, { useState } from 'react';
import {
  Box, Paper, Typography, Grid, Button, Card, CardContent, 
  Divider, Dialog, DialogContent, DialogTitle, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RegulationExplorer from './RegulationExplorer';

/**
 * This component demonstrates how to integrate the RegulationExplorer
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
          Advanced Regulation Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Dive deeper into federal regulations with our advanced exploration tools.
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Deep Dive Analysis
                </Typography>
                <Typography variant="body2" paragraph>
                  Explore the full structure of the CFR, perform complex searches, track historical
                  changes, and analyze regulatory corrections.
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
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Features
                </Typography>
                <Typography variant="body2">
                  • Title structure browser with full hierarchy navigation
                </Typography>
                <Typography variant="body2">
                  • Full-text search with advanced filtering
                </Typography>
                <Typography variant="body2">
                  • Version history tracking and comparison
                </Typography>
                <Typography variant="body2">
                  • Corrections and amendments tracker
                </Typography>
                <Typography variant="body2">
                  • Agency-specific regulation analysis
                </Typography>
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
            <Typography variant="h6">Advanced Regulation Explorer</Typography>
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