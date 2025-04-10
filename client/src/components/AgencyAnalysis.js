// components/AgencyAnalysis.js
import React, { useState, useMemo } from 'react';
import { 
  Grid, Paper, Typography, Box, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, TablePagination, TableSortLabel, 
  Card, CardContent, Chip, alpha, useTheme,
  Button, IconButton, Tooltip, Divider
} from '@mui/material';

// Import icons
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Import custom components
import FuturisticChart from './FuturisticChart';

const AgencyAnalysis = ({ agenciesData }) => {
  const theme = useTheme();
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
        wordCount: agency.wordCount
      }));
  }, [agenciesWithAvg]);
  
  // Top 5 agencies by average words per regulation (for the chart)
  const topByAvgWords = useMemo(() => {
    return [...agenciesWithAvg]
      .sort((a, b) => b.avgWordsPerRegulation - a.avgWordsPerRegulation)
      .slice(0, 5)
      .map(agency => ({
        name: agency.name.length > 25 ? agency.name.substring(0, 25) + '...' : agency.name,
        avgWords: agency.avgWordsPerRegulation
      }));
  }, [agenciesWithAvg]);

  // Chart colors
  const chartColors = [theme.palette.primary.main, theme.palette.secondary.main];
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 0.5 }}>
          Agency Analysis
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Detailed breakdown of regulatory agencies and their impact
        </Typography>
      </Box>
      
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
              <BusinessIcon sx={{ fontSize: 140 }} />
            </Box>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" color="primary.main" fontWeight="bold">
                  TOTAL AGENCIES
                </Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {agenciesData.length.toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Federal regulatory bodies
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
              <DescriptionIcon sx={{ fontSize: 140 }} />
            </Box>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" color="secondary.main" fontWeight="bold">
                  AVERAGE REGULATIONS
                </Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {Math.round(agenciesData.reduce((sum, agency) => sum + agency.regulationCount, 0) / 
                  (agenciesData.length || 1)).toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Per agency
                </Typography>
              </Box>
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
              <SortIcon sx={{ fontSize: 140 }} />
            </Box>
            <CardContent>
              <Box sx={{ mb: 1 }}>
                <Typography variant="overline" sx={{ color: theme.palette.chart[2] }} fontWeight="bold">
                  AVERAGE WORD COUNT
                </Typography>
              </Box>
              <Typography variant="h3" component="div" fontWeight="bold">
                {Math.round(agenciesData.reduce((sum, agency) => sum + agency.wordCount, 0) / 
                  (agenciesData.length || 1)).toLocaleString()}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Words per agency
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={7}>
          <FuturisticChart
            type="bar"
            data={topByWordCount}
            dataKey="wordCount"
            title="Top 10 Agencies by Word Count"
            subtitle="Agencies with the largest regulatory footprint"
            height={450}
            rotateLabels={true}
            colors={[theme.palette.primary.main]}
          />
        </Grid>
        <Grid item xs={12} lg={5}>
          <FuturisticChart
            type="bar"
            data={topByAvgWords}
            dataKey="avgWords"
            title="Top 5 Agencies by Complexity"
            subtitle="Measured by average words per regulation"
            height={450}
            layout="vertical"
            colors={[theme.palette.secondary.main]}
          />
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
              Comprehensive list of all regulatory agencies
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
                      transition: 'background-color 0.2s'
                    }}
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
                        <IconButton size="small">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Options">
                        <IconButton size="small">
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
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default AgencyAnalysis;