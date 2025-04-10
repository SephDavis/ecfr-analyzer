// components/HistoricalAnalysis.js
import React, { useState, useMemo } from 'react';
import { 
  Grid, Paper, Typography, Box, 
  FormControl, InputLabel, Select, MenuItem,
  Card, CardContent
} from '@mui/material';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const HistoricalAnalysis = ({ historicalData }) => {
  const [timeframe, setTimeframe] = useState('all');
  const [viewType, setViewType] = useState('line');
  
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
      changeRate: record.changes.reduce(
        (sum, change) => sum + Math.abs(change.wordDifference), 
        0
      )
    }));
  }, [historicalData, timeframe]);
  
  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    if (processedData.length === 0) return { 
      totalChange: 0, 
      avgChange: 0,
      maxChange: 0
    };
    
    const firstRecord = processedData[0];
    const lastRecord = processedData[processedData.length - 1];
    const totalChange = lastRecord.wordCount - firstRecord.wordCount;
    
    const changeRates = processedData.map(record => record.changeRate);
    const avgChange = changeRates.reduce((sum, rate) => sum + rate, 0) / changeRates.length;
    const maxChange = Math.max(...changeRates);
    
    return {
      totalChange,
      avgChange: Math.round(avgChange),
      maxChange
    };
  }, [processedData]);
  
  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Historical Analysis
      </Typography>
      
      {/* Controls */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={timeframe}
              label="Timeframe"
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
              <MenuItem value="quarter">Last Quarter</MenuItem>
              <MenuItem value="month">Last Month</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Chart Type</InputLabel>
            <Select
              value={viewType}
              label="Chart Type"
              onChange={(e) => setViewType(e.target.value)}
            >
              <MenuItem value="line">Line Chart</MenuItem>
              <MenuItem value="area">Area Chart</MenuItem>
              <MenuItem value="bar">Bar Chart</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Change in Words
              </Typography>
              <Typography variant="h4" component="div" color={summaryMetrics.totalChange >= 0 ? 'error' : 'success'}>
                {summaryMetrics.totalChange >= 0 ? '+' : ''}{summaryMetrics.totalChange.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Change Rate
              </Typography>
              <Typography variant="h4" component="div">
                {summaryMetrics.avgChange.toLocaleString()} words/day
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Maximum Daily Change
              </Typography>
              <Typography variant="h4" component="div">
                {summaryMetrics.maxChange.toLocaleString()} words
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Chart */}
      <Paper sx={{ p: 2, height: 500 }}>
        <Typography variant="h6" gutterBottom>
          Regulation Word Count Over Time
        </Typography>
        <ResponsiveContainer width="100%" height="90%">
          {viewType === 'line' && (
            <LineChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end"
                height={60}
                interval={Math.ceil(processedData.length / 15)}
              />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="wordCount" 
                stroke="#8884d8" 
                name="Total Word Count"
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="changeRate" 
                stroke="#82ca9d" 
                name="Change Rate"
              />
            </LineChart>
          )}
          
          {viewType === 'area' && (
            <AreaChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end"
                height={60}
                interval={Math.ceil(processedData.length / 15)}
              />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="wordCount" 
                fill="#8884d8" 
                stroke="#8884d8"
                name="Total Word Count"
              />
              <Area 
                type="monotone" 
                dataKey="changeRate" 
                fill="#82ca9d" 
                stroke="#82ca9d"
                name="Change Rate"
              />
            </AreaChart>
          )}
          
          {viewType === 'bar' && (
            <BarChart
              data={processedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={60}
                interval={Math.ceil(processedData.length / 15)}
              />
              <YAxis />
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
              <Bar dataKey="wordCount" name="Total Word Count" fill="#8884d8" />
              <Bar dataKey="changeRate" name="Change Rate" fill="#82ca9d" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default HistoricalAnalysis;