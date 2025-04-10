// components/HistoricalAnalysis.js
import React, { useState, useMemo } from 'react';
import { 
  Grid, Paper, Typography, Box, 
  FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, useTheme, alpha,
  ToggleButtonGroup, ToggleButton,
  Chip, Divider, CircularProgress
} from '@mui/material';

// Import icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SpeedIcon from '@mui/icons-material/Speed';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

// Import custom components
import FuturisticChart from './FuturisticChart';

const HistoricalAnalysis = ({ historicalData }) => {
  const theme = useTheme();
  const [timeframe, setTimeframe] = useState('all');
  const [viewType, setViewType] = useState('area');
  
  // Process historical data based on selected timeframe
  const processedData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    
    // Sort by date
    const sortedData = [...historicalData].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Filter based on timeframe
    const filteredData = (() => {
      const now = new Date();
      switch (timeframe) {
        case 'month':
          const oneMonthAgo = new Date();
          oneMonthAgo.setMonth(now.getMonth() - 1);
          return sortedData.filter(item => new Date(item.date) >= oneMonthAgo);
        case 'quarter':
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(now.getMonth() - 3);
          return sortedData.filter(item => new Date(item.date) >= threeMonthsAgo);
        case 'year':
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          return sortedData.filter(item => new Date(item.date) >= oneYearAgo);
        case 'all':
        default:
          return sortedData;
      }
    })();
    
    // Format data for chart
    return filteredData.map(record => ({
      date: new Date(record.date).toLocaleDateString(),
      wordCount: record.totalWordCount,
      changeRate: record.changes?.reduce(
        (sum, change) => sum + Math.abs(change.wordDifference), 
        0
      ) || 0
    }));
  }, [historicalData, timeframe]);
  
  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (processedData.length === 0) return { 
      totalChange: 0, 
      avgChange: 0,
      maxChange: 0,
      percentChange: 0
    };
    
    const firstRecord = processedData[0];
    const lastRecord = processedData[processedData.length - 1];
    const totalChange = lastRecord.wordCount - firstRecord.wordCount;
    const percentChange = firstRecord.wordCount > 0 
      ? (totalChange / firstRecord.wordCount) * 100 
      : 0;
    
    const changeRates = processedData.map(record => record.changeRate).filter(rate => !isNaN(rate));
    const avgChange = changeRates.length > 0 
      ? changeRates.reduce((sum, rate) => sum + rate, 0) / changeRates.length 
      : 0;
    const maxChange = changeRates.length > 0 
      ? Math.max(...changeRates) 
      : 0;
    
    return {
      totalChange,
      avgChange: Math.round(avgChange),
      maxChange,
      percentChange
    };
  }, [processedData]);
  
  // Handle chart type change
  const handleChartTypeChange = (event, newType) => {
    if (newType !== null) {
      setViewType(newType);
    }
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 0.5 }}>
          Historical Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track the evolution of federal regulations over time
        </Typography>
      </Box>
      
      {/* Controls */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={8}>
          <Card 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              p: 2,
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Timeframe:
              </Typography>
            </Box>
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: { xs: '100%', sm: 200 },
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1
              }}
            >
              <Select
                value={timeframe}
                onChange={handleTimeframeChange}
                displayEmpty
                variant="outlined"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
              </Select>
            </FormControl>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              justifyContent: 'space-between',
              p: 2,
              gap: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShowChartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="medium">
                Chart Type:
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleChartTypeChange}
              aria-label="chart type"
              size="small"
              sx={{ 
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                '& .MuiToggleButton-root': {
                  border: 'none',
                  px: 1.5
                }
              }}
            >
              <ToggleButton value="area" aria-label="area chart">
                <TimelineIcon />
              </ToggleButton>
              <ToggleButton value="line" aria-label="line chart">
                <ShowChartIcon />
              </ToggleButton>
              <ToggleButton value="bar" aria-label="bar chart">
                <BarChartIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Card>
        </Grid>
      </Grid>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.15)} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: -30, 
                right: -30, 
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}
            >
              <TrendingUpIcon sx={{ fontSize: 140 }} />
            </Box>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" color="primary.main" fontWeight="bold">
                  TOTAL CHANGE IN WORDS
                </Typography>
              </Box>
              <Typography 
                variant="h3" 
                component="div" 
                fontWeight="bold"
                color={summaryMetrics.totalChange >= 0 ? 'error.main' : 'success.main'}
              >
                {summaryMetrics.totalChange >= 0 ? '+' : ''}{summaryMetrics.totalChange.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {summaryMetrics.percentChange > 0 ? (
                  <TrendingUpIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDownIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                )}
                <Typography 
                  variant="body2" 
                  color={summaryMetrics.percentChange > 0 ? "error" : "success"}
                >
                  {Math.abs(summaryMetrics.percentChange).toFixed(2)}% {summaryMetrics.percentChange > 0 ? "increase" : "decrease"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: -30, 
                right: -30, 
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}
            >
              <SpeedIcon sx={{ fontSize: 140 }} />
            </Box>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" color="secondary.main" fontWeight="bold">
                  AVERAGE CHANGE RATE
                </Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {summaryMetrics.avgChange.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  words per day on average
                </Typography>
              </Box>
              <Chip 
                label={`~${Math.round(summaryMetrics.avgChange * 365 / 1000)}K words per year`} 
                color="secondary" 
                variant="outlined" 
                size="small" 
                sx={{ mt: 1, fontSize: '0.75rem' }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ 
            height: '100%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.chart[2], 0.05)} 0%, ${alpha(theme.palette.chart[2], 0.15)} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: -30, 
                right: -30, 
                opacity: 0.1,
                transform: 'rotate(15deg)'
              }}
            >
              <ShowChartIcon sx={{ fontSize: 140 }} />
            </Box>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" sx={{ color: theme.palette.chart[2] }} fontWeight="bold">
                  MAXIMUM DAILY CHANGE
                </Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {summaryMetrics.maxChange.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  words in a single day
                </Typography>
              </Box>
              <Chip 
                label="Peak regulatory activity" 
                sx={{ 
                  mt: 1, 
                  fontSize: '0.75rem',
                  backgroundColor: alpha(theme.palette.chart[2], 0.2),
                  color: theme.palette.chart[2],
                  borderColor: theme.palette.chart[2]
                }} 
                variant="outlined" 
                size="small" 
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Chart */}
      <FuturisticChart
        type={viewType}
        data={processedData}
        dataKey="wordCount"
        secondaryDataKey="changeRate"
        nameKey="date"
        height={500}
        title="Regulation Growth Over Time"
        subtitle="Historical tracking of total word count and change rate"
        rotateLabels={processedData.length > 10}
        fillGradient={true}
        loading={historicalData.length === 0}
        noDataMessage="No historical data is available for analysis."
        colors={[theme.palette.primary.main, theme.palette.secondary.main]}
      />
      
      {/* Data Analysis Section */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Regulatory Trends Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Historical analysis of federal regulation growth patterns
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Key Insights
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" paragraph>
                      The federal regulatory framework has {summaryMetrics.totalChange > 0 ? 'expanded' : 'contracted'} by{' '}
                      <Box component="span" sx={{ color: summaryMetrics.totalChange > 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                        {Math.abs(summaryMetrics.totalChange).toLocaleString()} words
                      </Box>{' '}
                      during the analyzed period, representing a{' '}
                      <Box component="span" sx={{ color: summaryMetrics.percentChange > 0 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                        {Math.abs(summaryMetrics.percentChange).toFixed(2)}%
                      </Box>{' '}
                      {summaryMetrics.percentChange > 0 ? 'increase' : 'decrease'}.
                    </Typography>
                    
                    <Typography variant="body2" paragraph>
                      The data shows an average daily change rate of {summaryMetrics.avgChange.toLocaleString()} words,
                      projecting to approximately {Math.round(summaryMetrics.avgChange * 365).toLocaleString()} words per year.
                    </Typography>
                    
                    {processedData.length >= 2 && (
                      <Typography variant="body2">
                        The highest single-day change was {summaryMetrics.maxChange.toLocaleString()} words,
                        which is {Math.round((summaryMetrics.maxChange / summaryMetrics.avgChange) * 100)}% higher than the average daily change.
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Growth Projection
                  </Typography>
                  
                  {processedData.length >= 2 ? (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Annual growth rate:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {Math.abs(summaryMetrics.percentChange).toFixed(2)}%
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Projected in 1 year:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {processedData.length > 0 
                            ? Math.round(processedData[processedData.length - 1].wordCount * (1 + (summaryMetrics.percentChange / 100))).toLocaleString()
                            : 'N/A'} words
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Projected in 5 years:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {processedData.length > 0 
                            ? Math.round(processedData[processedData.length - 1].wordCount * Math.pow((1 + (summaryMetrics.percentChange / 100)), 5)).toLocaleString()
                            : 'N/A'} words
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                      <Typography variant="body2" color="text.secondary">
                        Insufficient data for growth projection
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HistoricalAnalysis;