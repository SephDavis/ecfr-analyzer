// components/Dashboard.js
import React from 'react';
import { 
  Grid, Paper, Typography, Box, 
  Card, CardContent, Divider
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const Dashboard = ({ agenciesData, historicalData }) => {
  // Calculate total word count
  const totalWordCount = agenciesData.reduce((sum, agency) => sum + agency.wordCount, 0);
  
  // Get top agencies by word count
  const topAgencies = [...agenciesData]
    .sort((a, b) => b.wordCount - a.wordCount)
    .slice(0, 10)
    .map(agency => ({
      name: agency.name,
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
      .slice(0, 5)
      .map(change => {
        const agency = agenciesData.find(a => a.agencyId === change.agencyId) || { name: change.agencyId };
        return {
          name: agency.name,
          change: change.wordDifference,
          isIncrease: change.wordDifference > 0
        };
      })
    : [];
  
  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Federal Regulations Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Regulations
              </Typography>
              <Typography variant="h4" component="div">
                {agenciesData.reduce((sum, agency) => sum + agency.regulationCount, 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Word Count
              </Typography>
              <Typography variant="h4" component="div">
                {totalWordCount.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Regulatory Agencies
              </Typography>
              <Typography variant="h4" component="div">
                {agenciesData.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Charts */}
      <Grid container spacing={3}>
        {/* Bar Chart - Top Agencies */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Agencies by Word Count
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={topAgencies}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString()} />
                <Legend />
                <Bar dataKey="wordCount" name="Word Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Pie Chart - Agency Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Regulation Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={topAgencies}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="wordCount"
                >
                  {topAgencies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Line Chart - Historical Trends */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Regulation Growth Over Time
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart
                data={historicalChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
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
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Recent Changes */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Regulatory Changes
            </Typography>
            {recentChanges.length > 0 ? (
              <Grid container spacing={2}>
                {recentChanges.map((change, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{change.name}</Typography>
                        <Typography 
                          variant="h6" 
                          color={change.isIncrease ? 'error' : 'success'}
                        >
                          {change.isIncrease ? '+' : ''}{change.change.toLocaleString()} words
                        </Typography>
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
    </Box>
  );
};

export default Dashboard;