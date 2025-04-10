// components/AgencyAnalysis.js
import React, { useState } from 'react';
import { 
  Grid, Paper, Typography, Box, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, 
  TablePagination, TableSortLabel, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Function to truncate agency names
const truncateAgencyName = (name, maxLength = 20) => {
  if (!name) return '';
  // For names with Department/Agency, keep only that part
  if (name.includes('Department of')) {
    return 'Dept. of ' + name.split('Department of')[1].trim();
  }
  if (name.includes('Agency')) {
    return name.split(' ').slice(-2).join(' ');
  }
  // Otherwise truncate
  return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
};

const AgencyAnalysis = ({ agenciesData }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('wordCount');
  const [order, setOrder] = useState('desc');
  
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
  const filteredAgencies = agenciesData
    .filter(agency => 
      agency.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (order === 'asc') {
        return a[orderBy] < b[orderBy] ? -1 : 1;
      } else {
        return a[orderBy] > b[orderBy] ? -1 : 1;
      }
    });
  
  // Calculate avg words per regulation for each agency
  const agenciesWithAvg = filteredAgencies.map(agency => ({
    ...agency,
    avgWordsPerRegulation: agency.regulationCount > 0 
      ? Math.round(agency.wordCount / agency.regulationCount) 
      : 0
  }));
  
  // Paginate the data
  const paginatedAgencies = agenciesWithAvg
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Top 5 agencies by average words per regulation (for the chart)
  const topByAvgWords = [...agenciesWithAvg]
    .sort((a, b) => b.avgWordsPerRegulation - a.avgWordsPerRegulation)
    .slice(0, 5)
    .map(agency => ({
      name: truncateAgencyName(agency.name, 15),
      fullName: agency.name,
      avgWords: agency.avgWordsPerRegulation
    }));
  
  return (
    <Box sx={{ flexGrow: 1, py: 3 }}>
      <Typography variant="h4" gutterBottom component="div">
        Agency Analysis
      </Typography>
      
      {/* Chart - Top Agencies by Avg Words per Regulation */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Top 5 Agencies by Average Words per Regulation
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={topByAvgWords}
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => value.toLocaleString()}
                  labelFormatter={(label) => {
                    const agency = topByAvgWords.find(a => a.name === label);
                    return agency ? agency.fullName : label;
                  }}
                />
                <Legend />
                <Bar dataKey="avgWords" name="Avg Words per Regulation" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Agencies Table */}
      <Paper sx={{ p: 2, width: '100%', mb: 2 }}>
        <Box sx={{ mb: 2 }}>
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
          />
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    Agency Name
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'wordCount'}
                    direction={orderBy === 'wordCount' ? order : 'asc'}
                    onClick={() => handleRequestSort('wordCount')}
                  >
               Word Count
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'regulationCount'}
                    direction={orderBy === 'regulationCount' ? order : 'asc'}
                    onClick={() => handleRequestSort('regulationCount')}
                  >
                    Regulation Count
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'avgWordsPerRegulation'}
                    direction={orderBy === 'avgWordsPerRegulation' ? order : 'asc'}
                    onClick={() => handleRequestSort('avgWordsPerRegulation')}
                  >
                    Avg Words per Regulation
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={orderBy === 'lastUpdated'}
                    direction={orderBy === 'lastUpdated' ? order : 'asc'}
                    onClick={() => handleRequestSort('lastUpdated')}
                  >
                    Last Updated
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAgencies.map((agency) => (
                <TableRow key={agency.agencyId}>
                  <TableCell component="th" scope="row">
                    {agency.name}
                  </TableCell>
                  <TableCell align="right">{agency.wordCount.toLocaleString()}</TableCell>
                  <TableCell align="right">{agency.regulationCount.toLocaleString()}</TableCell>
                  <TableCell align="right">{agency.avgWordsPerRegulation.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    {new Date(agency.lastUpdated).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {paginatedAgencies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No agencies found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAgencies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default AgencyAnalysis;