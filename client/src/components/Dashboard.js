// components/Dashboard.js
import React, { useState, useMemo } from 'react';
import { 
  Grid, Paper, Typography, Box, 
  Card, CardContent, Divider, 
  useTheme, alpha, LinearProgress,
  Button, Fab, Zoom, IconButton,
  Tooltip, Menu, MenuItem
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, 
  Area, AreaChart, Treemap
} from 'recharts';

// Import icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import DescriptionIcon from '@mui/icons-material/Description';
import BusinessIcon from '@mui/icons-material/Business';
import GavelIcon from '@mui/icons-material/Gavel';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import GetAppIcon from '@mui/icons-material/GetApp';
import ShareIcon from '@mui/icons-material/Share';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// Import RegulationExplorerIntegration
import RegulationExplorerIntegration from './RegulationExplorerIntegration';

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          p: 1.5,
          borderRadius: 1
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={`tooltip-${index}`}
            variant="body2"
            sx={{ color: entry.color, fontWeight: 600 }}
          >
            {`${entry.name}: ${entry.value.toLocaleString()}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const Dashboard = ({ agenciesData, historicalData }) => {
  const theme = useTheme();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [expandedView, setExpandedView] = useState(false);
  const { chart: COLORS } = theme.palette;
  
  // Calculate total word count
  const totalWordCount = agenciesData.reduce((sum, agency) => sum + agency.wordCount, 0);
  
  // Calculate total regulations
  const totalRegulations = agenciesData.reduce((sum, agency) => sum + agency.regulationCount, 0);
  
  // Get top agencies by word count
  const topAgencies = [...agenciesData]
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 7)
    .map(agency => ({
      name: agency.name.length > 20 ? agency.name.substring(0, 20) + '...' : agency.name,
      wordCount: agency.wordCount,
      percentage: (agency.wordCount / totalWordCount * 100).toFixed(1)
    }));
  
  // Format historical data for the line chart
  const historicalChartData = historicalData
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(record => ({
      date: new Date(record.date).toLocaleDateString(),
      wordCount: record.totalWordCount
    }));
  
  // Get recent changes
  const recentChanges = historicalData.length > 0 
    ? historicalData[0].changes
      .sort((a, b) => Math.abs(b.wordDifference) - Math.abs(a.wordDifference))
      .slice(0, 6)
      .map(change => {
        let entityName = change.entity;
        
        // Try to find an agency name if the entity type is 'agency'
        if (change.entityType === 'agency') {
          const agency = agenciesData.find(a => a.agencyId === change.entity);
          if (agency) {
            entityName = agency.name;
          }
        }
        
        return {
          name: entityName.length > 25 ? entityName.substring(0, 25) + '...' : entityName,
          change: change.wordDifference,
          isIncrease: change.wordDifference > 0
        };
      })
    : [];

  // Create data for agency types pie chart
  const agencyTypeData = [
    { name: 'Executive', value: agenciesData.filter(a => a.name.includes('Department')).length },
    { name: 'Independent', value: agenciesData.filter(a => !a.name.includes('Department')).length },
  ];
  
  // Format data for the agency complexity chart
  const agencyComplexity = [...agenciesData]
    .sort((a, b) => {
      const aAvg = a.regulationCount ? a.wordCount / a.regulationCount : 0;
      const bAvg = b.regulationCount ? b.wordCount / b.regulationCount : 0;
      return bAvg - aAvg;
    })
    .slice(0, 5)
    .map(agency => ({
      name: agency.name.length > 20 ? agency.name.substring(0, 20) + '...' : agency.name,
      avgWordCount: agency.regulationCount ? Math.round(agency.wordCount / agency.regulationCount) : 0
    }));
    
  // Create data for treemap visualization of agency word count
  const treemapData = useMemo(() => {
    const formattedData = topAgencies.map(agency => ({
      name: agency.name,
      size: agency.wordCount,
    }));
    
    return [{ name: 'agencies', children: formattedData }];
  }, [topAgencies]);

  // Calculate word count growth rate
  let growthRate = 0;
  if (historicalChartData.length >= 2) {
    const firstCount = historicalChartData[0].wordCount;
    const lastCount = historicalChartData[historicalChartData.length - 1].wordCount;
    growthRate = ((lastCount - firstCount) / firstCount) * 100;
  }
  
  // Handle menu operations
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleExpandView = () => {
    setExpandedView(!expandedView);
    handleMenuClose();
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 0.5 }}>
            Federal Regulations Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analysis of the Code of Federal Regulations
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Dashboard Options">
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>
              <GetAppIcon fontSize="small" sx={{ mr: 1 }} />
              Export Data
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
              <ShareIcon fontSize="small" sx={{ mr: 1 }} />
              Share Dashboard
            </MenuItem>
            <MenuItem onClick={handleExpandView}>
              <ZoomInIcon fontSize="small" sx={{ mr: 1 }} />
              {expandedView ? 'Compact View' : 'Expanded View'}
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Advanced Regulation Explorer Integration */}
      <RegulationExplorerIntegration 
        agenciesData={agenciesData} 
        historicalData={historicalData} 
      />
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={expandedView ? 3 : 4}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}
            >
              <DescriptionIcon sx={{ fontSize: 120 }} />
            </Box>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" color="primary.main" fontWeight="bold">
                  TOTAL WORD COUNT
                </Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {totalWordCount.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {growthRate > 0 ? (
                  <TrendingUpIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={growthRate > 0 ? "error" : "success"}
                >
                  {Math.abs(growthRate).toFixed(1)}% {growthRate > 0 ? "increase" : "decrease"} since first record
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={expandedView ? 3 : 4}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}
            >
              <GavelIcon sx={{ fontSize: 120 }} />
            </Box>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" color="secondary.main" fontWeight="bold">
                  TOTAL REGULATIONS
                </Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {totalRegulations.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Average {Math.round(totalWordCount / totalRegulations).toLocaleString()} words per regulation
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={expandedView ? 3 : 4}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(COLORS[2], 0.05)} 0%, ${alpha(COLORS[2], 0.1)} 100%)`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: -20, 
                right: -20, 
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}
            >
              <BusinessIcon sx={{ fontSize: 120 }} />
            </Box>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" sx={{ color: COLORS[2] }} fontWeight="bold">
                  REGULATORY AGENCIES
                </Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {agenciesData.length}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Overseeing {(totalWordCount / 1000000).toFixed(2)} million words of regulations
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {expandedView && (
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              background: `linear-gradient(135deg, ${alpha(COLORS[3], 0.05)} 0%, ${alpha(COLORS[3], 0.1)} 100%)`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: -20, 
                  opacity: 0.1,
                  transform: 'rotate(15deg)'
                }}
              >
                <AnalyticsIcon sx={{ fontSize: 120 }} />
              </Box>
              <CardContent>
                <Box sx={{ mb: 1 }}>
                  <Typography variant="overline" sx={{ color: COLORS[3] }} fontWeight="bold">
                    COMPLEXITY SCORE
                  </Typography>
                </Box>
                <Typography variant="h3" component="div" fontWeight="bold">
                  {(Math.log(totalWordCount) / Math.log(10)).toFixed(1)}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Logarithmic complexity index based on total word count
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
      
      {/* Main Charts */}
      <Grid container spacing={3}>
        {/* Treemap visualization (visible in expanded view) */}
        {expandedView && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Regulatory Footprint - Agency Proportional Representation
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Relative size represents word count proportion in the federal regulatory corpus
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <Treemap
                  data={treemapData[0].children}
                  dataKey="size"
                  nameKey="name"
                  aspectRatio={4/3}
                >
                  {
                    treemapData[0].children.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))
                  }
                </Treemap>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
        
        {/* Bar Chart - Top Agencies */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Top Regulatory Agencies by Word Count
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Agencies with the largest regulatory footprint in the Federal Register
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={topAgencies}
                margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
                barSize={40}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={1} />
                    <stop offset="100%" stopColor={theme.palette.primary.dark} stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                  interval={0}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                />
                <YAxis 
                  width={80}
                  tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="wordCount" 
                  name="Word Count" 
                  fill="url(#barGradient)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Agency Complexity Chart */}
        <Grid item xs={12} sm={6} lg={4}>
          <Paper sx={{ p: 3, height: 450 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Agency Complexity
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Top 5 agencies by average words per regulation
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                layout="vertical"
                data={agencyComplexity}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                <XAxis 
                  type="number" 
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <defs>
                  <linearGradient id="complexityGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={theme.palette.secondary.dark} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Bar 
                  dataKey="avgWordCount" 
                  name="Avg Words per Regulation" 
                  fill="url(#complexityGradient)" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Line Chart - Historical Trends */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: expandedView ? 500 : 450 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Regulation Growth Over Time
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Historical tracking of total word count in the Federal Register
            </Typography>
            <ResponsiveContainer width="100%" height={expandedView ? 400 : 350}>
              <AreaChart
                data={historicalChartData}
                margin={{ top: 10, right: 30, left: 10, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: theme.palette.text.secondary }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  width={80}
                  tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="wordCount" 
                  name="Total Word Count"
                  stroke={theme.palette.primary.main}
                  fillOpacity={1}
                  fill="url(#colorGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Recent Changes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Recent Regulatory Changes
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Most significant word count changes in the latest update
            </Typography>
            
            {recentChanges.length > 0 ? (
              <Grid container spacing={2}>
                {recentChanges.map((change, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        backgroundColor: 'background.card',
                        border: '1px solid',
                        borderColor: change.isIncrease 
                          ? alpha(theme.palette.error.main, 0.3)
                          : alpha(theme.palette.success.main, 0.3),
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                          {change.name}
                        </Typography>
                        <Typography 
                          variant="h5" 
                          color={change.isIncrease ? 'error' : 'success'}
                          fontWeight="bold"
                        >
                          {change.isIncrease ? '+' : ''}{change.change.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          words {change.isIncrease ? 'added' : 'removed'}
                        </Typography>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, Math.abs(change.change) / 1000)}
                          sx={{ 
                            mt: 2,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(
                              change.isIncrease ? theme.palette.error.main : theme.palette.success.main, 
                              0.1
                            ),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: change.isIncrease ? theme.palette.error.main : theme.palette.success.main
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No recent changes recorded.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Floating action button for expanded view */}
      <Zoom in={true}>
        <Fab 
          color="primary" 
          aria-label="expand" 
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={handleExpandView}
        >
          {expandedView ? <CompareArrowsIcon /> : <ZoomInIcon />}
        </Fab>
      </Zoom>
    </Box>
  );
};

export default Dashboard;