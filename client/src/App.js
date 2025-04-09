// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, AppBar, Toolbar, Typography, Box, 
  Paper, Grid, CircularProgress
} from '@mui/material';
import Dashboard from './components/Dashboard';
import AgencyAnalysis from './components/AgencyAnalysis';
import HistoricalAnalysis from './components/HistoricalAnalysis';
import Search from './components/Search';
import './App.css';

const API_BASE_URL = '/data';

function App() {
  const [loading, setLoading] = useState(true);
  const [agenciesData, setAgenciesData] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch agencies data
        const agenciesResponse = await axios.get(`${API_BASE_URL}/agencies.json`);
        setAgenciesData(agenciesResponse.data);
        
        // Fetch historical data
        const historicalResponse = await axios.get(`${API_BASE_URL}/historical.json`);
        setHistoricalData(historicalResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <Router>
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              eCFR Analyzer
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/agencies" className="nav-link">Agencies</Link>
              <Link to="/historical" className="nav-link">Historical</Link>
              <Link to="/search" className="nav-link">Search</Link>
            </Box>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    agenciesData={agenciesData} 
                    historicalData={historicalData} 
                  />
                } 
              />
              <Route 
                path="/agencies" 
                element={<AgencyAnalysis agenciesData={agenciesData} />} 
              />
              <Route 
                path="/historical" 
                element={<HistoricalAnalysis historicalData={historicalData} />} 
              />
              <Route path="/search" element={<Search />} />
            </Routes>
          )}
        </Container>
      </div>
    </Router>
  );
}

export default App;