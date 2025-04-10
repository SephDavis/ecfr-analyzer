// Enhanced AgencyAnalysis.js with extensive drill-down capabilities
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Grid, Paper, Typography, Box, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, TableSortLabel, 
  Card, CardContent, Chip, alpha, useTheme,
  Button, IconButton, Tooltip, Divider, Zoom, Fab,
  Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
  List, ListItem, ListItemText, ListItemIcon, Menu, MenuItem, LinearProgress
} from '@mui/material';

// Import recharts components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, 
  Area, AreaChart, Treemap
} from 'recharts';

// Import icons
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GavelIcon from '@mui/icons-material/Gavel';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import GetAppIcon from '@mui/icons-material/GetApp';
import ShareIcon from '@mui/icons-material/Share';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CloseIcon from '@mui/icons-material/Close';
import TimelineIcon from '@mui/icons-material/Timeline';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import PieChartIcon from '@mui/icons-material/PieChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// Import custom components (placeholder, you would implement this separately)
import FuturisticChart from './FuturisticChart';
// Custom tooltip for charts with enhanced detail
const CustomTooltip = ({ active, payload, label, onItemClick }) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          backgroundColor: 'background.paper',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          p: 1.5,
          borderRadius: 1,
          minWidth: 180,
          maxWidth: 300
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="bold">
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Box 
            key={`tooltip-${index}`}
            sx={{ 
              py: 0.5,
              '&:hover': { 
                backgroundColor: alpha(entry.color || theme.palette.primary.main, 0.1),
                cursor: 'pointer',
                borderRadius: 1
              },
              pl: 1
            }}
            onClick={() => onItemClick && onItemClick(entry, label)}
          >
            <Typography
              variant="body2"
              sx={{ 
                color: entry.color || theme.palette.primary.main,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{entry.name}: </span>
              <span>{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}</span>
            </Typography>
          </Box>
        ))}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center', fontStyle: 'italic' }}>
          Click for details
        </Typography>
      </Paper>
    );
  }
  return null;
};

// Enhanced detail dialog component for agency drill-down
const AgencyDetailDialog = ({ open, onClose, agency, onRegulationSelect }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Simulate loading data on dialog open
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Calculate agency stats
  const avgWordsPerReg = agency ? Math.round(agency.wordCount / (agency.regulationCount || 1)) : 0;
  const percentageOfTotal = agency ? ((agency.wordCount / (agency.totalWordCount || 1)) * 100).toFixed(1) : 0;
  
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              {agency?.name || 'Agency Details'}
            </Typography>
            <Typography variant="body2" paragraph>
              This agency is responsible for {agency?.regulationCount?.toLocaleString() || 0} regulations 
              containing approximately {agency?.wordCount?.toLocaleString() || 0} words.
            </Typography>
            
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <BusinessIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Agency Type" 
                  secondary={agency?.name?.includes('Department') ? 'Executive Department' : 'Independent Agency'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DescriptionIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Average Words per Regulation" 
                  secondary={avgWordsPerReg.toLocaleString()} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TimelineIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Last Updated" 
                  secondary={agency?.lastUpdated ? new Date(agency.lastUpdated).toLocaleDateString() : 'Unknown'} 
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Regulatory Impact
            </Typography>
            
            <Box sx={{ height: 250, mb: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: agency?.name, value: agency?.wordCount, color: theme.palette.primary.main },
                      { name: 'All Other Agencies', value: (agency?.totalWordCount || 0) - (agency?.wordCount || 0), color: theme.palette.grey[300] }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: agency?.name, value: agency?.wordCount, color: theme.palette.primary.main },
                      { name: 'All Other Agencies', value: (agency?.totalWordCount || 0) - (agency?.wordCount || 0), color: theme.palette.grey[300] }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                This agency represents{' '}
                <Typography component="span" fontWeight="bold" color="primary.main">
                  {percentageOfTotal}%
                </Typography>{' '}
                of all federal regulations by word count.
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Top Regulations
            </Typography>
            
            <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto' }}>
              <List dense>
                {Array.from({ length: 5 }).map((_, i) => (
                  <ListItem 
                    key={i} 
                    divider
                    button
                    onClick={() => onRegulationSelect({
                      id: `reg-${agency?.agencyId}-${i}`,
                      title: `${agency?.name} Regulation ${i + 1}`,
                      words: Math.round(avgWordsPerReg * (0.5 + Math.random())),
                      lastUpdate: new Date(Date.now() - Math.random() * 10000000000).toISOString()
                    })}
                  >
                    <ListItemIcon>
                      <GavelIcon fontSize="small" color="secondary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Regulation ${i + 1} - ${agency?.name} Standard ${100 + i}`}
                      secondary={`Part ${400 + i * 10} • Approximately ${(Math.round(avgWordsPerReg * (0.5 + Math.random()))).toLocaleString()} words`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12}>
            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<AnalyticsIcon />}
              onClick={() => {
                // Here we would navigate to a dedicated agency view
                onClose();
              }}
            >
              Explore All {agency?.name} Regulations
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.08)}, transparent 70%)`
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BusinessIcon sx={{ mr: 1 }} />
          {agency?.name || 'Agency Details'}
        </Box>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {renderContent()}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          sx={{ mr: 'auto' }}
        >
          Close
        </Button>
        <Button 
          variant="contained" 
          endIcon={<AnalyticsIcon />}
          onClick={onClose}
        >
          Advanced Analysis
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Regulation detail dialog component
const RegulationDetailDialog = ({ open, onClose, regulation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Simulate loading data on dialog open
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {regulation?.title || 'Regulation Details'}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="medium" gutterBottom>
            Word Count: {regulation?.words?.toLocaleString() || 0}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={Math.min(100, (regulation?.words / 10000) * 100)} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 5
              }
            }}
          />
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Regulatory Category
                </Typography>
                <Typography variant="body1">
                  {regulation?.category || 'Administrative Requirement'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Last Amendment
                </Typography>
                <Typography variant="body1">
                  {regulation?.lastUpdate ? new Date(regulation.lastUpdate).toLocaleDateString() : 'January 15, 2023'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom color="text.secondary">
                  Summary
                </Typography>
                <Typography variant="body2">
                  This regulation establishes standards for {regulation?.title?.split(' ').slice(0, 3).join(' ')} and requires compliance 
                  with various administrative, technical, and reporting requirements. It contains
                  approximately {regulation?.words?.toLocaleString() || 0} words across multiple sections.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="outlined" 
            startIcon={<TableChartIcon />} 
            fullWidth
            onClick={onClose}
          >
            View Full Regulation Text
          </Button>
        </Box>
      </Box>
    );
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: `radial-gradient(circle at top right, ${alpha(theme.palette.secondary.main, 0.08)}, transparent 70%)`
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon sx={{ mr: 1 }} />
          Regulation Details
        </Box>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {renderContent()}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          sx={{ mr: 'auto' }}
        >
          Close
        </Button>
        <Button 
          variant="contained" 
          endIcon={<AnalyticsIcon />}
          onClick={onClose}
        >
          Analyze Impact
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Enhanced trend analysis dialog
const TrendAnalysisDialog = ({ open, onClose, data, title }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Simulate loading data on dialog open
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [open]);
  
  // Generate historical trend data if not provided
  const trendData = useMemo(() => {
    if (data && data.length > 0) return data;
    
    // Generate mock trend data based on the current date
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }).map((_, i) => ({
      year: (currentYear - 5 + i).toString(),
      avgWords: Math.round(7000 + i * 500 + Math.random() * 800),
      totalRegulations: Math.round(100 + i * 8 + Math.random() * 20)
    }));
  }, [data]);
  
  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {title || 'Historical Trend Analysis'}
        </Typography>
        
        <Typography variant="body2" paragraph>
          The chart shows the evolution of regulatory complexity over time, measured by average words per regulation.
        </Typography>
        
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={trendData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(value) => `${(value).toLocaleString()}`} />
            <RechartsTooltip 
              formatter={(value) => value.toLocaleString()}
              labelFormatter={(label) => `Year: ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="avgWords" 
              name="Avg Words per Regulation"
              stroke={theme.palette.primary.main} 
              fillOpacity={1} 
              fill="url(#colorGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Key Statistics
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Average Annual Growth
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {((trendData[trendData.length-1].avgWords / trendData[0].avgWords - 1) * 100 / (trendData.length - 1)).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Growth
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {((trendData[trendData.length-1].avgWords / trendData[0].avgWords - 1) * 100).toFixed(1)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Highest Year
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {trendData.reduce((max, item) => 
                      item.avgWords > max.avgWords ? item : max, trendData[0]).year}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Projected Next Year
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {Math.round(trendData[trendData.length-1].avgWords * 1.06).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: `radial-gradient(circle at top right, ${alpha(theme.palette.info.main, 0.08)}, transparent 70%)`
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TimelineIcon sx={{ mr: 1 }} />
          {title || 'Trend Analysis'}
        </Box>
        <IconButton onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {renderContent()}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          sx={{ mr: 'auto' }}
        >
          Close
        </Button>
        <Button 
          variant="contained" 
          endIcon={<AnalyticsIcon />}
          onClick={onClose}
        >
          Detailed Analytics
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Interactive card with hover effects
const DrilldownCard = ({ title, value, subtitle, icon, trend, trendValue, onClick, color }) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        background: hovered 
          ? `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.1)} 0%, ${alpha(color || theme.palette.primary.main, 0.2)} 100%)`
          : `linear-gradient(135deg, ${alpha(color || theme.palette.primary.main, 0.05)} 0%, ${alpha(color || theme.palette.primary.main, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? `0 8px 16px ${alpha(color || theme.palette.primary.main, 0.2)}` : 'none',
        cursor: 'pointer'
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -20, 
          right: -20, 
          opacity: 0.1,
          transform: hovered ? 'rotate(20deg) scale(1.2)' : 'rotate(15deg)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        {icon}
      </Box>
      
      {hovered && (
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(4px)',
            borderRadius: '50%',
            p: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 2px 6px ${alpha(theme.palette.common.black, 0.2)}`
          }}
        >
          <ZoomInIcon fontSize="small" color="primary" />
        </Box>
      )}
      
      <CardContent>
        <Box sx={{ mb: 1 }}>
          <Typography 
            variant="overline" 
            color={color || "primary.main"} 
            fontWeight="bold"
            sx={{ 
              transition: 'letter-spacing 0.3s ease',
              letterSpacing: hovered ? '0.08em' : '0.05em'
            }}
          >
            {title}
          </Typography>
        </Box>
        <Typography 
          variant="h3" 
          component="div" 
          fontWeight="bold"
          sx={{ 
            transition: 'transform 0.3s ease',
            transform: hovered ? 'scale(1.05)' : 'none',
            transformOrigin: 'left'
          }}
        >
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {trend && (
            <>
              {trendValue > 0 ? (
                <TrendingUpIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
              ) : (
                <TrendingDownIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
              )}
              <Typography 
                variant="body2" 
                color={trendValue > 0 ? "error" : "success"}
              >
                {Math.abs(trendValue).toFixed(1)}% {trendValue > 0 ? "increase" : "decrease"}
              </Typography>
            </>
          )}
          {!trend && subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        {hovered && (
          <Box 
            sx={{ 
              mt: 2, 
              height: 2, 
              width: '100%', 
              backgroundColor: color || theme.palette.primary.main,
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.4 },
                '50%': { opacity: 0.8 },
                '100%': { opacity: 0.4 }
              }
            }} 
          />
        )}
      </CardContent>
    </Card>
  );
};

// Enhanced interactive bar chart component
const EnhancedBarChart = ({ data, dataKey, xAxisKey, color, title, height, onItemClick }) => {
  const theme = useTheme();
  
  const handleBarClick = (data, index) => {
    if (onItemClick) {
      onItemClick(data, index);
    }
  };
  
  return (
    <Paper sx={{ p: 3, height }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Tooltip title="Click any bar for detailed breakdown">
          <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, borderRadius: 1, px: 1, py: 0.5 }}>
            <TouchAppIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
            <Typography variant="caption" color="primary.main">Interactive</Typography>
          </Box>
        </Tooltip>
      </Box>
      
      <ResponsiveContainer width="100%" height="85%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
          barSize={40}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color || theme.palette.primary.main} stopOpacity={1} />
              <stop offset="100%" stopColor={color || theme.palette.primary.main} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis 
            dataKey={xAxisKey} 
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
          <RechartsTooltip 
            content={<CustomTooltip onItemClick={(entry) => handleBarClick(entry.payload, entry.index)} />} 
          />
          <Bar 
            dataKey={dataKey} 
            name={dataKey} 
            fill="url(#barGradient)" 
            radius={[4, 4, 0, 0]}
            onClick={handleBarClick}
            cursor="pointer"
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

// Enhanced treemap component with drilldown
const EnhancedTreemap = ({ data, title, onClick }) => {
  const theme = useTheme();
  
  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Relative size represents word count proportion. Click any segment to explore details.
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={data}
          dataKey="size"
          nameKey="name"
          aspectRatio={4/3}
          stroke={theme.palette.background.paper}
          onClick={onClick}
          content={({ root, depth, x, y, width, height, index, payload, colors, rank, name }) => {
            const percentage = payload && payload.percentage ? payload.percentage : 
                              (root && root.value && payload && payload.value) ? 
                              (payload.value / root.value) * 100 : 0;
            
            return (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  style={{
                    fill: theme.palette.chart[index % theme.palette.chart.length],
                    stroke: theme.palette.background.paper,
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    cursor: 'pointer'
                  }}
                />
                {width > 30 && height > 30 && (
                  <text
                    x={x + width / 2}
                    y={y + height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: Math.min(width, height) > 60 ? 14 : 10,
                      fill: '#fff',
                      pointerEvents: 'none'
                    }}
                  >
                    {name}
                  </text>
                )}
                {width > 60 && height > 40 && (
                  <text
                    x={x + width / 2}
                    y={y + height / 2 + 15}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{
                      fontSize: 10,
                      fill: '#fff',
                      opacity: 0.7,
                      pointerEvents: 'none'
                    }}
                  >
                    {`${percentage.toFixed(1)}%`}
                  </text>
                )}
              </g>
            );
          }}
        />
      </ResponsiveContainer>
    </Paper>
  );
};

const AgencyAnalysis = ({ agenciesData }) => {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('wordCount');
  const [order, setOrder] = useState('desc');
  const [expandedView, setExpandedView] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [showTrendDialog, setShowTrendDialog] = useState(false);
  
  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter and sort agencies data
  const filteredAgencies = useMemo(() => {
    return agenciesData
      .filter(agency => 
        agency.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        // Handle numeric values specially for correct sorting
        if (typeof a[orderBy] === 'number' && typeof b[orderBy] === 'number') {
          return order === 'asc' ? a[orderBy] - b[orderBy] : b[orderBy] - a[orderBy];
        }
        
        // Normal string comparison
        if (order === 'asc') {
          return (a[orderBy] || '').toString().localeCompare((b[orderBy] || '').toString());
        } else {
          return (b[orderBy] || '').toString().localeCompare((a[orderBy] || '').toString());
        }
      });
  }, [agenciesData, search, orderBy, order]);
  
  // Calculate avg words per regulation for each agency
  const agenciesWithAvg = useMemo(() => {
    return filteredAgencies.map(agency => ({
      ...agency,
      avgWordsPerRegulation: agency.regulationCount > 0 
        ? Math.round(agency.wordCount / agency.regulationCount) 
        : 0
    }));
  }, [filteredAgencies]);
  
  // Paginate the data
  const paginatedAgencies = useMemo(() => {
    return agenciesWithAvg.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [agenciesWithAvg, page, rowsPerPage]);
  
  // Top agencies by word count (for the chart)
  const topByWordCount = useMemo(() => {
    return [...agenciesWithAvg]
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 10)
      .map(agency => ({
        name: agency.name.length > 25 ? agency.name.substring(0, 25) + '...' : agency.name,
        wordCount: agency.wordCount,
        regulationCount: agency.regulationCount,
        avgWordsPerRegulation: agency.avgWordsPerRegulation,
        lastUpdated: agency.lastUpdated,
        agencyId: agency.agencyId,
        shortName: agency.shortName,
        totalWordCount: agenciesWithAvg.reduce((sum, a) => sum + a.wordCount, 0)
      }));
  }, [agenciesWithAvg]);
  
  // Top 5 agencies by average words per regulation (for the chart)
  const topByAvgWords = useMemo(() => {
    return [...agenciesWithAvg]
      .sort((a, b) => b.avgWordsPerRegulation - a.avgWordsPerRegulation)
      .slice(0, 5)
      .map(agency => ({
        name: agency.name.length > 25 ? agency.name.substring(0, 25) + '...' : agency.name,
        avgWords: agency.avgWordsPerRegulation,
        wordCount: agency.wordCount,
        regulationCount: agency.regulationCount,
        lastUpdated: agency.lastUpdated,
        agencyId: agency.agencyId,
        shortName: agency.shortName,
        totalWordCount: agenciesWithAvg.reduce((sum, a) => sum + a.wordCount, 0)
      }));
  }, [agenciesWithAvg]);

  // Calculate total word count
  const totalWordCount = agenciesData.reduce((sum, agency) => sum + agency.wordCount, 0);
  
  // Calculate total regulations
  const totalRegulations = agenciesData.reduce((sum, agency) => sum + agency.regulationCount, 0);
  
  // Create data for treemap visualization of agency word count
  const treemapData = useMemo(() => {
    return topByWordCount.map(agency => ({
      name: agency.name,
      size: agency.wordCount,
      percentage: (agency.wordCount / totalWordCount) * 100,
      ...agency
    }));
  }, [topByWordCount, totalWordCount]);
  
  // Calculate the complexity growth rate (mock data for illustration)
  const complexityGrowthRate = 2.7;
  
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
  
  // Handle agency selection for detail dialog
  const handleAgencySelect = (agency) => {
    setSelectedAgency(agency);
  };
  
  // Handle regulation selection for detail dialog
  const handleRegulationSelect = (regulation) => {
    setSelectedRegulation(regulation);
    setSelectedAgency(null); // Close agency dialog when opening regulation
  };
  
  // Chart colors
  const chartColors = [theme.palette.primary.main, theme.palette.secondary.main];
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 0.5 }}>
            Agency Analysis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Detailed breakdown of regulatory agencies and their impact
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Analysis Options">
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
              Share Analysis
            </MenuItem>
            <MenuItem onClick={handleExpandView}>
              <ZoomInIcon fontSize="small" sx={{ mr: 1 }} />
              {expandedView ? 'Compact View' : 'Expanded View'}
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={expandedView ? 3 : 4}>
          <DrilldownCard
            title="TOTAL AGENCIES"
            value={agenciesData.length.toLocaleString()}
            subtitle="Federal regulatory bodies"
            icon={<BusinessIcon sx={{ fontSize: 120 }} />}
            color={theme.palette.primary.main}
            onClick={() => setShowTrendDialog(true)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={expandedView ? 3 : 4}>
          <DrilldownCard
            title="AVERAGE REGULATIONS"
            value={Math.round(agenciesData.reduce((sum, agency) => sum + agency.regulationCount, 0) / 
              (agenciesData.length || 1)).toLocaleString()}
            subtitle="Per agency"
            icon={<DescriptionIcon sx={{ fontSize: 120 }} />}
            color={theme.palette.secondary.main}
            onClick={() => setSelectedRegulation({
              title: "Average Regulation",
              words: Math.round(totalWordCount / totalRegulations),
              lastUpdate: new Date().toISOString(),
              category: "All Categories"
            })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={expandedView ? 3 : 4}>
          <DrilldownCard
            title="AVERAGE WORD COUNT"
            value={Math.round(agenciesData.reduce((sum, agency) => sum + agency.wordCount, 0) / 
              (agenciesData.length || 1)).toLocaleString()}
            subtitle="Words per agency"
            trend={true}
            trendValue={complexityGrowthRate}
            icon={<SortIcon sx={{ fontSize: 120 }} />}
            color={theme.palette.chart[2]}
            onClick={() => setShowTrendDialog(true)}
          />
        </Grid>
        
        {expandedView && (
          <Grid item xs={12} sm={6} md={3}>
            <DrilldownCard
              title="COMPLEXITY SCORE"
              value={(Math.log(totalWordCount) / Math.log(10)).toFixed(1)}
              subtitle="Logarithmic complexity index"
              icon={<AnalyticsIcon sx={{ fontSize: 120 }} />}
              color={theme.palette.chart[3]}
              onClick={() => setShowTrendDialog(true)}
            />
          </Grid>
        )}
      </Grid>
      
      {/* Main Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Treemap visualization (visible in expanded view) */}
        {expandedView && (
          <Grid item xs={12}>
            <EnhancedTreemap 
              data={treemapData}
              title="Regulatory Footprint - Agency Distribution"
              onClick={(data) => {
                const agency = topByWordCount.find(a => a.name === data.name);
                if (agency) {
                  handleAgencySelect(agency);
                }
              }}
            />
          </Grid>
        )}
        
        <Grid item xs={12} lg={expandedView ? 8 : 7}>
          <EnhancedBarChart
            data={topByWordCount}
            dataKey="wordCount"
            xAxisKey="name"
            color={theme.palette.primary.main}
            title="Top 10 Agencies by Word Count"
            height={450}
            onItemClick={(data) => {
              const agency = topByWordCount.find(a => a.name === data.name);
              if (agency) {
                handleAgencySelect(agency);
              }
            }}
          />
        </Grid>
        <Grid item xs={12} lg={expandedView ? 4 : 5}>
          <Paper sx={{ p: 3, height: 450 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Top 5 Agencies by Complexity
              </Typography>
              <Tooltip title="Click any bar for detailed breakdown">
                <Box sx={{ display: 'flex', alignItems: 'center', border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`, borderRadius: 1, px: 1, py: 0.5 }}>
                  <TouchAppIcon fontSize="small" color="secondary" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" color="secondary.main">Interactive</Typography>
                </Box>
              </Tooltip>
            </Box>
            
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                layout="vertical"
                data={topByAvgWords}
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
                <RechartsTooltip 
                  content={<CustomTooltip onItemClick={(entry) => {
                    const agency = topByAvgWords.find(a => a.name === entry.name);
                    if (agency) {
                      handleAgencySelect(agency);
                    }
                  }} />} 
                />
                <defs>
                  <linearGradient id="complexityGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={theme.palette.secondary.dark} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={theme.palette.secondary.main} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Bar 
                  dataKey="avgWords" 
                  name="Avg Words per Regulation" 
                  fill="url(#complexityGradient)" 
                  radius={[0, 4, 4, 0]}
                  cursor="pointer"
                  onClick={(data) => {
                    const agency = topByAvgWords.find(a => a.name === data.name);
                    if (agency) {
                      handleAgencySelect(agency);
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Agencies Table */}
      <Paper sx={{ p: 3, width: '100%', mb: 3 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold">
              Agency Database
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive list of all regulatory agencies. Click on any row for detailed analysis.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search agencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              }}
            />
          </Grid>
        </Grid>
        
        <Box 
          sx={{ 
            width: '100%', 
            overflowX: 'auto',
            background: alpha(theme.palette.background.paper, 0.5),
            borderRadius: 1,
            mb: 2
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5)
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleRequestSort('name')}
                    >
                      Agency Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5)
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === 'wordCount'}
                      direction={orderBy === 'wordCount' ? order : 'asc'}
                      onClick={() => handleRequestSort('wordCount')}
                    >
                      Word Count
                    </TableSortLabel>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5)
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === 'regulationCount'}
                      direction={orderBy === 'regulationCount' ? order : 'asc'}
                      onClick={() => handleRequestSort('regulationCount')}
                    >
                      Regulations
                    </TableSortLabel>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5)
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === 'avgWordsPerRegulation'}
                      direction={orderBy === 'avgWordsPerRegulation' ? order : 'asc'}
                      onClick={() => handleRequestSort('avgWordsPerRegulation')}
                    >
                      Avg Words/Regulation
                    </TableSortLabel>
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5)
                    }}
                  >
                    <TableSortLabel
                      active={orderBy === 'lastUpdated'}
                      direction={orderBy === 'lastUpdated' ? order : 'asc'}
                      onClick={() => handleRequestSort('lastUpdated')}
                    >
                      Last Updated
                    </TableSortLabel>
                  </TableCell>
                  <TableCell 
                    align="center"
                    sx={{ 
                      fontWeight: 'bold',
                      backgroundColor: alpha(theme.palette.background.paper, 0.5)
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAgencies.map((agency) => (
                  <TableRow 
                    key={agency.agencyId}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: alpha(theme.palette.primary.main, 0.05) 
                      },
                      transition: 'background-color 0.2s',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleAgencySelect({
                      ...agency,
                      totalWordCount
                    })}
                  >
                    <TableCell component="th" scope="row" sx={{ maxWidth: 250 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="medium" 
                        sx={{ 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {agency.name}
                      </Typography>
                      {agency.shortName && agency.shortName !== agency.name && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ display: 'block' }}
                        >
                          {agency.shortName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {agency.wordCount >= 1000000 ? (
                        <Chip 
                          label={`${(agency.wordCount / 1000000).toFixed(1)}M`}
                          size="small"
                          sx={{ 
                            fontWeight: 'bold',
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }}
                        />
                      ) : agency.wordCount >= 1000 ? (
                        <Chip 
                          label={`${(agency.wordCount / 1000).toFixed(1)}K`} 
                          size="small"
                          sx={{ 
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main
                          }}
                        />
                      ) : (
                        agency.wordCount.toLocaleString()
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {agency.regulationCount.toLocaleString()}
                    </TableCell>
                    <TableCell align="right">
                      {agency.avgWordsPerRegulation > 0 ? (
                        <Typography 
                          variant="body2"
                          sx={{
                            fontWeight: agency.avgWordsPerRegulation > 10000 ? 'bold' : 'normal',
                            color: agency.avgWordsPerRegulation > 10000 
                              ? theme.palette.warning.main 
                              : 'text.primary'
                          }}
                        >
                          {agency.avgWordsPerRegulation.toLocaleString()}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {new Date(agency.lastUpdated).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAgencySelect({
                              ...agency,
                              totalWordCount
                            });
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Options">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Additional action menu could be implemented here
                          }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedAgencies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No agencies found matching your search.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => setSearch('')}
                      >
                        Clear Search
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredAgencies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '.MuiTablePagination-select': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1,
              px: 1
            }
          }}
        />
      </Paper>
      
      {/* Additional Information */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Agency Complexity Analysis
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Understanding how agencies compare in regulatory verbosity
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Key Insights
            </Typography>
            <Typography variant="body2" paragraph>
              The analysis reveals significant variation in regulatory complexity across federal agencies. 
              While some agencies maintain concise regulations, others exhibit substantially higher word counts 
              per regulation, which may indicate more complex or detailed regulatory frameworks.
            </Typography>
            <Typography variant="body2" paragraph>
              Agencies with higher average word counts per regulation often operate in technically complex 
              domains requiring precise specification of requirements and procedures. This complexity metric 
              serves as an indicator of the regulatory burden each agency imposes.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Distribution Statistics
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Highest complexity:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {[...agenciesWithAvg]
                    .sort((a, b) => b.avgWordsPerRegulation - a.avgWordsPerRegulation)[0]?.name || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Lowest complexity:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                {[...agenciesWithAvg]
                    .filter(a => a.avgWordsPerRegulation > 0)
                    .sort((a, b) => a.avgWordsPerRegulation - b.avgWordsPerRegulation)[0]?.name || 'N/A'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Median complexity:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {(() => {
                    const sorted = [...agenciesWithAvg]
                      .filter(a => a.avgWordsPerRegulation > 0)
                      .sort((a, b) => a.avgWordsPerRegulation - b.avgWordsPerRegulation);
                    
                    if (sorted.length === 0) return 'N/A';
                    
                    const middle = Math.floor(sorted.length / 2);
                    return sorted.length % 2 === 0
                      ? Math.round((sorted[middle - 1].avgWordsPerRegulation + sorted[middle].avgWordsPerRegulation) / 2).toLocaleString()
                      : sorted[middle].avgWordsPerRegulation.toLocaleString();
                  })()} words per regulation
                </Typography>
              </Box>
              
              <Box sx={{ mt: 3 }}>
                <Button 
                  variant="outlined" 
                  startIcon={<AnalyticsIcon />} 
                  fullWidth
                  onClick={() => setShowTrendDialog(true)}
                >
                  View Historical Trends
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {/* Interactive regulatory impact visualization - Added in expanded view */}
        {expandedView && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Regulatory Impact by Agency Type
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Comparison between executive departments and independent agencies
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={[
                        { 
                          name: 'Executive Departments', 
                          value: agenciesData
                            .filter(a => a.name.includes('Department'))
                            .reduce((sum, a) => sum + a.wordCount, 0) 
                        },
                        { 
                          name: 'Independent Agencies', 
                          value: agenciesData
                            .filter(a => !a.name.includes('Department'))
                            .reduce((sum, a) => sum + a.wordCount, 0) 
                        }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={true}
                      onClick={(data) => {
                        // Could implement additional filtering by agency type
                        setSearch(data.name.includes('Executive') ? 'Department' : '');
                      }}
                    >
                      <Cell fill={theme.palette.primary.main} />
                      <Cell fill={theme.palette.secondary.main} />
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => value.toLocaleString()}
                      cursor={{ fill: 'transparent' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Regulatory Distribution
                </Typography>
                <Typography variant="body2" paragraph>
                  Executive departments and independent agencies differ significantly in their regulatory footprint.
                  Executive departments, being part of the cabinet, tend to have broader regulatory authority over 
                  fundamental aspects of governance and commerce.
                </Typography>
                <Typography variant="body2" paragraph>
                  Independent agencies, while more numerous, often have more specialized and targeted regulatory domains.
                  The chart shows the relative distribution of regulatory word count between these two categories of 
                  federal agencies.
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Key Statistics
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Executive Count
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            {agenciesData.filter(a => a.name.includes('Department')).length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined">
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Independent Count
                          </Typography>
                          <Typography variant="h6" color="secondary.main">
                            {agenciesData.filter(a => !a.name.includes('Department')).length}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
      
      {/* Dialogs for drill-down analysis */}
      
      {/* Agency Detail Dialog */}
      <AgencyDetailDialog 
        open={selectedAgency !== null}
        onClose={() => setSelectedAgency(null)}
        agency={selectedAgency}
        onRegulationSelect={handleRegulationSelect}
      />
      
      {/* Regulation Detail Dialog */}
      <RegulationDetailDialog 
        open={selectedRegulation !== null}
        onClose={() => setSelectedRegulation(null)}
        regulation={selectedRegulation}
      />
      
      {/* Trend Analysis Dialog */}
      <TrendAnalysisDialog 
        open={showTrendDialog}
        onClose={() => setShowTrendDialog(false)}
        title="Agency Complexity Trends"
        data={null} // Would pass historical data here if available
      />
      
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

export default AgencyAnalysis;