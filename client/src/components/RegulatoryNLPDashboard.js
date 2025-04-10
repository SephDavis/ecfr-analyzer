import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, Paper, Typography, Grid, CircularProgress, 
  Card, CardContent, Divider, Button, Chip, 
  useTheme, alpha, Tab, Tabs, LinearProgress,
  Alert, List, ListItem, ListItemText, ToggleButton,
  ToggleButtonGroup, Tooltip
} from '@mui/material';

// Import icons
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ScienceIcon from '@mui/icons-material/Science';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import SubjectIcon from '@mui/icons-material/Subject';
import SpeedIcon from '@mui/icons-material/Speed';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Import visualization components
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap,
  LineChart, Line, ScatterChart, Scatter, ZAxis, Radar, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Area, AreaChart
} from 'recharts';

// Placeholder API service for NLP analysis
// In a real implementation, this would connect to a Python backend
const nlpService = {
  getSentimentAnalysis: async (agenciesData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return agenciesData.map(agency => ({
      name: agency.name,
      sentiment: (Math.random() * 2 - 1) * 0.4 + (agency.name.includes('Protection') ? 0.3 : agency.name.includes('Security') ? -0.2 : 0.1),
      toneScores: {
        objective: 0.5 + Math.random() * 0.3,
        formal: 0.6 + Math.random() * 0.3,
        prescriptive: 0.7 + Math.random() * 0.2,
        complex: 0.2 + Math.random() * 0.6,
        detailed: 0.4 + Math.random() * 0.4
      },
      wordCount: agency.wordCount
    }));
  },
  
  getTopicModeling: async (agenciesData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate sample topics
    const topicTemplates = [
      { name: "Health & Safety", keywords: ["safety", "health", "protection", "prevention", "risk"] },
      { name: "Environmental", keywords: ["environmental", "emissions", "pollution", "conservation", "climate"] },
      { name: "Financial", keywords: ["financial", "reporting", "disclosure", "compliance", "transactions"] },
      { name: "Administrative", keywords: ["procedures", "requirements", "documentation", "submission", "approval"] },
      { name: "Consumer Protection", keywords: ["consumer", "disclosure", "protection", "rights", "privacy"] },
      { name: "Technical Standards", keywords: ["standards", "specifications", "technical", "requirements", "certification"] },
      { name: "Security", keywords: ["security", "protection", "requirements", "measures", "controls"] },
      { name: "Transportation", keywords: ["transportation", "vehicles", "traffic", "safety", "operation"] }
    ];
    
    // Generate topics for each agency with weights
    const agencyTopics = agenciesData.map(agency => {
      // Select 3-5 topics that make sense for this agency
      const numTopics = Math.floor(Math.random() * 3) + 3;
      const agencyName = agency.name.toLowerCase();
      
      // Weight topics based on agency name for more realistic results
      const relevanceScores = topicTemplates.map(topic => {
        let score = Math.random();
        
        // Boost scores for topics relevant to the agency name
        if (agencyName.includes("health") && topic.name.includes("Health")) score += 0.5;
        if (agencyName.includes("environment") && topic.name.includes("Environmental")) score += 0.5;
        if (agencyName.includes("financial") && topic.name.includes("Financial")) score += 0.5;
        if (agencyName.includes("transportation") && topic.name.includes("Transportation")) score += 0.5;
        if (agencyName.includes("consumer") && topic.name.includes("Consumer")) score += 0.5;
        if (agencyName.includes("security") && topic.name.includes("Security")) score += 0.5;
        
        return { topic, score };
      });
      
      // Sort by score and take top numTopics
      const topTopics = relevanceScores
        .sort((a, b) => b.score - a.score)
        .slice(0, numTopics)
        .map(item => {
          // Normalize to make sure total is 100%
          return {
            name: item.topic.name,
            weight: Math.round(item.score * 100) / 100,
            keywords: item.topic.keywords
          };
        });
      
      // Normalize weights to sum to 1
      const totalWeight = topTopics.reduce((sum, t) => sum + t.weight, 0);
      topTopics.forEach(t => t.weight = Math.round((t.weight / totalWeight) * 100) / 100);
      
      return {
        agencyId: agency.agencyId,
        name: agency.name,
        wordCount: agency.wordCount,
        topics: topTopics
      };
    });
    
    // Generate global topic distribution across all agencies
    const globalTopics = topicTemplates.map(topic => {
      return {
        name: topic.name,
        totalWeight: 0,
        agencies: [],
        keywords: topic.keywords
      };
    });
    
    // Calculate global topic weights
    agencyTopics.forEach(agency => {
      agency.topics.forEach(topic => {
        const globalTopic = globalTopics.find(t => t.name === topic.name);
        if (globalTopic) {
          globalTopic.totalWeight += topic.weight * (agency.wordCount / 1000000);
          globalTopic.agencies.push({
            name: agency.name,
            weight: topic.weight
          });
        }
      });
    });
    
    return {
      agencyTopics,
      globalTopics: globalTopics
        .sort((a, b) => b.totalWeight - a.totalWeight)
        .map(topic => ({
          ...topic,
          totalWeight: Math.round(topic.totalWeight * 100) / 100
        }))
    };
  },
  
  getComplexityAnalysis: async (agenciesData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    return agenciesData.map(agency => {
      // Calculate complexity metrics
      const avgSentenceLength = 15 + Math.random() * 15;
      const fogIndex = 9 + Math.random() * 8;
      const technicalTermDensity = 0.1 + Math.random() * 0.2;
      
      // Add bias based on agency name for more realistic results
      const complexityScore = Math.round((
        // Base complexity
        (Math.random() * 60 + 40) +
        // Bias based on agency name
        (agency.name.includes('Health') ? 15 : 0) +
        (agency.name.includes('Treasury') ? 25 : 0) +
        (agency.name.includes('Transportation') ? 20 : 0) +
        (agency.name.includes('Environment') ? 20 : 0) +
        (agency.name.includes('Energy') ? 25 : 0) +
        (agency.name.includes('Commerce') ? 10 : 0)
      ) / 10);
      
      return {
        name: agency.name,
        shortName: agency.shortName || agency.name.split(' ').pop(),
        wordCount: agency.wordCount,
        regulationCount: agency.regulationCount,
        avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
        fogIndex: Math.round(fogIndex * 10) / 10,
        technicalTermDensity: Math.round(technicalTermDensity * 100),
        complexityScore: Math.min(10, complexityScore),
        readabilityGrade: Math.round(8 + fogIndex / 2),
        avgWordsPerRegulation: Math.round(agency.wordCount / (agency.regulationCount || 1))
      };
    });
  },
  
  getRegulatoryBurdenEstimate: async (agenciesData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Average burden hours per 1000 words for different complexity levels
    const burdenRates = {
      low: 0.1,    // 0.1 hours per 1000 words for low complexity
      medium: 0.25, // 0.25 hours per 1000 words for medium complexity
      high: 0.5     // 0.5 hours per 1000 words for high complexity
    };
    
    return agenciesData.map(agency => {
      // Get complexity rating
      let complexityLevel;
      if (agency.name.includes('Treasury') || agency.name.includes('Securities') || agency.name.includes('Tax')) {
        complexityLevel = 'high';
      } else if (agency.name.includes('Transportation') || agency.name.includes('Environmental') || 
                 agency.name.includes('Health') || agency.name.includes('Energy')) {
        complexityLevel = 'medium';
      } else {
        complexityLevel = 'low';
      }
      
      // Calculate burden metrics
      const rate = burdenRates[complexityLevel];
      const totalHours = Math.round(agency.wordCount / 1000 * rate);
      const costPerHour = 38.5; // Average hourly wage for compliance work
      const totalCost = Math.round(totalHours * costPerHour);
      
      return {
        name: agency.name,
        shortName: agency.shortName || agency.name.split(' ').pop(),
        wordCount: agency.wordCount,
        complexityLevel,
        burdenHoursPerThousandWords: rate,
        totalBurdenHours: totalHours,
        totalBurdenCost: totalCost,
        burdenHoursPerRegulation: Math.round(totalHours / (agency.regulationCount || 1)),
        costPerRegulation: Math.round(totalCost / (agency.regulationCount || 1))
      };
    });
  },
  
  getRegulationForecast: async (historicalData, agenciesData) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1700));
    
    // Sort historical data by date
    const sortedData = [...historicalData].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate growth rate
    const firstDate = new Date(sortedData[0]?.date || new Date());
    const lastDate = new Date(sortedData[sortedData.length - 1]?.date || new Date());
    const daysDiff = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
    const firstCount = sortedData[0]?.totalWordCount || 0;
    const lastCount = sortedData[sortedData.length - 1]?.totalWordCount || 0;
    
    // Calculate daily growth rate
    const dailyGrowthRate = Math.pow(lastCount / firstCount, 1 / daysDiff) - 1;
    
    // Generate forecast for the next 5 years
    const forecastData = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentDay = today.getDate();
    
    // Start with the last actual data point
    let wordCount = lastCount;
    
    // We'll forecast in quarterly increments
    for (let i = 1; i <= 20; i++) {
      // Calculate date: current date + i * 3 months
      const forecastDate = new Date(currentYear, currentMonth + (i * 3), currentDay);
      
      // Calculate forecast word count with some randomness
      // We use a 90-day quarter for simplicity
      const growthMultiplier = Math.pow(1 + dailyGrowthRate, 90);
      wordCount = Math.round(wordCount * growthMultiplier * (1 + (Math.random() * 0.02 - 0.01)));
      
      forecastData.push({
        date: forecastDate.toISOString().split('T')[0],
        wordCount: wordCount,
        projected: true
      });
    }
    
    // Add confidence intervals to the forecast
    const forecastWithConfidence = forecastData.map((item, index) => {
      const variance = 0.03 * Math.sqrt(index + 1); // Increasing uncertainty over time
      return {
        ...item,
        lowConfidence: Math.round(item.wordCount * (1 - variance)),
        highConfidence: Math.round(item.wordCount * (1 + variance))
      };
    });
    
    // Format historical data for the chart
    const historicalChartData = sortedData.map(item => ({
      date: new Date(item.date).toISOString().split('T')[0],
      wordCount: item.totalWordCount,
      projected: false
    }));
    
    // Combine historical data with forecast
    const combinedData = [...historicalChartData, ...forecastWithConfidence];
    
    // Agency-specific forecasts
    const agencyForecasts = agenciesData
      .filter(agency => agency.wordCount > 500000) // Only forecast for major agencies
      .map(agency => {
        // Calculate agency-specific growth rates
        // Some agencies grow faster than others
        let agencyGrowthModifier;
        
        if (agency.name.includes('Health') || agency.name.includes('Environment')) {
          agencyGrowthModifier = 1.2; // Growing faster than average
        } else if (agency.name.includes('Treasury') || agency.name.includes('Securities')) {
          agencyGrowthModifier = 1.3; // Growing much faster than average
        } else if (agency.name.includes('Labor') || agency.name.includes('Transportation')) {
          agencyGrowthModifier = 1.1; // Growing slightly faster than average
        } else if (agency.name.includes('Interior') || agency.name.includes('Agriculture')) {
          agencyGrowthModifier = 0.9; // Growing slower than average
        } else {
          agencyGrowthModifier = 1.0; // Growing at average rate
        }
        
        // Generate agency forecast for 5 years
        let agencyWordCount = agency.wordCount;
        const agencyForecast = [];
        
        for (let year = 1; year <= 5; year++) {
          const yearlyGrowthRate = dailyGrowthRate * 365 * agencyGrowthModifier;
          agencyWordCount = Math.round(agencyWordCount * (1 + yearlyGrowthRate));
          
          agencyForecast.push({
            year: currentYear + year,
            wordCount: agencyWordCount,
            agency: agency.name
          });
        }
        
        return {
          agency: agency.name,
          shortName: agency.shortName || agency.name.split(' ').pop(),
          currentWordCount: agency.wordCount,
          fiveYearForecast: agencyWordCount,
          growthPercent: Math.round(((agencyWordCount / agency.wordCount) - 1) * 100),
          forecast: agencyForecast
        };
      });
    
    return {
      historicalData: historicalChartData,
      forecastData: forecastWithConfidence,
      combinedData: combinedData,
      dailyGrowthRate: dailyGrowthRate,
      yearlyGrowthRate: Math.pow(1 + dailyGrowthRate, 365) - 1,
      fiveYearProjection: forecastWithConfidence[forecastWithConfidence.length - 1]?.wordCount,
      agencyForecasts
    };
  }
};

// Custom chart tooltip
const CustomTooltip = ({ active, payload, label }) => {
  const theme = useTheme();
  
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          p: 1.5,
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography
            key={`tooltip-${index}`}
            variant="body2"
            sx={{ 
              color: entry.color || theme.palette.primary.main, 
              fontWeight: 600 
            }}
          >
            {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}`}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// Sentiment analysis card component
const SentimentAnalysisCard = ({ data }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // Sort data by sentiment for better visualization
  const sortedData = [...data].sort((a, b) => b.sentiment - a.sentiment);
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Regulatory Sentiment Analysis
          </Typography>
          <Button 
            variant="text" 
            size="small"
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          NLP analysis of regulatory tone and sentiment by agency
        </Typography>
        
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={120}
                interval={0}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis 
                domain={[-0.5, 0.5]} 
                ticks={[-0.5, -0.25, 0, 0.25, 0.5]} 
                tickFormatter={(value) => value.toFixed(2)}
                label={{ 
                  value: 'Sentiment Score', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: theme.palette.text.secondary }
                }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="sentiment" 
                name="Sentiment" 
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
              >
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.sentiment > 0 ? theme.palette.success.main : theme.palette.error.main} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        {expanded && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Regulatory Tone Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Detailed breakdown of regulatory language characteristics
            </Typography>
            
            <Grid container spacing={2}>
              {sortedData.slice(0, 6).map((agency, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom noWrap>
                        {agency.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: agency.sentiment > 0 ? 'success.main' : 'error.main',
                          fontWeight: 'medium'
                        }}
                      >
                        Sentiment: {agency.sentiment.toFixed(2)}
                      </Typography>
                      
                      <Box sx={{ mt: 1 }}>
                        {Object.entries(agency.toneScores).map(([tone, score]) => (
                          <Box key={tone} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                                {tone}
                              </Typography>
                              <Typography variant="caption">
                                {Math.round(score * 100)}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={score * 100}
                              sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.primary.main, 0.1)
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Topic modeling component
const TopicModelingCard = ({ data }) => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState('topics');
  const [selectedTopic, setSelectedTopic] = useState(null);
  
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };
  
  const handleTopicClick = (topic) => {
    setSelectedTopic(selectedTopic === topic ? null : topic);
  };
  
  // Format data for treemap visualization
  const treemapData = useMemo(() => {
    return {
      name: 'Regulatory Topics',
      children: data.globalTopics.map(topic => ({
        name: topic.name,
        size: Math.round(topic.totalWeight * 10000),
        keywords: topic.keywords.join(', ')
      }))
    };
  }, [data]);
  
  // Format agency topic data for comparison charts
  const agencyTopicData = useMemo(() => {
    if (!selectedTopic) return [];
    
    // Find all agencies with this topic
    const agenciesWithTopic = [];
    data.agencyTopics.forEach(agency => {
      const matchingTopic = agency.topics.find(t => t.name === selectedTopic.name);
      if (matchingTopic) {
        agenciesWithTopic.push({
          name: agency.name,
          weight: matchingTopic.weight,
          wordCount: agency.wordCount
        });
      }
    });
    
    // Sort by weight descending
    return agenciesWithTopic.sort((a, b) => b.weight - a.weight);
  }, [data, selectedTopic]);
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Regulatory Topic Analysis
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
          >
            <ToggleButton value="topics">
              <BubbleChartIcon fontSize="small" sx={{ mr: 0.5 }} />
              Topics
            </ToggleButton>
            <ToggleButton value="agencies">
              <AccountTreeIcon fontSize="small" sx={{ mr: 0.5 }} />
              Agencies
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          LDA topic modeling analysis of regulatory content
        </Typography>
        
        {viewMode === 'topics' ? (
          <Box>
            <Box sx={{ height: 400, mb: 3 }}>
              <ResponsiveContainer width="100%" height="100%">
                <Treemap
                  data={treemapData.children}
                  dataKey="size"
                  aspectRatio={4/3}
                  stroke="#fff"
                  fill={theme.palette.primary.main}
                  onClick={handleTopicClick}
                >
                  {treemapData.children.map((item, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={theme.palette.chart[index % theme.palette.chart.length]} 
                    />
                  ))}
                </Treemap>
              </ResponsiveContainer>
            </Box>
            
            {selectedTopic && (
              <Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Topic: {selectedTopic.name}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Keywords
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedTopic.keywords.map((keyword, i) => (
                            <Chip 
                              key={i} 
                              label={keyword} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={8}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" gutterBottom>
                          Top Agencies for {selectedTopic.name}
                        </Typography>
                        <Box sx={{ height: 250 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={agencyTopicData.slice(0, 5)}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                              <XAxis 
                                type="number" 
                                domain={[0, 1]} 
                                tickFormatter={(value) => `${Math.round(value * 100)}%`}
                              />
                              <YAxis type="category" dataKey="name" width={100} />
                              <RechartsTooltip 
                                formatter={(value) => [`${Math.round(value * 100)}%`, 'Topic Weight']}
                              />
                              <Bar dataKey="weight" name="Topic Weight" fill={theme.palette.secondary.main} />
                            </BarChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            <Grid container spacing={2}>
              {data.agencyTopics.slice(0, 4).map((agency, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom noWrap>
                        {agency.name}
                      </Typography>
                      
                      <Box sx={{ height: 240 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={agency.topics}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="weight"
                              nameKey="name"
                              label={({ name, percent }) => `${name.split(' ')[0]}: ${Math.round(percent * 100)}%`}
                            >
                              {agency.topics.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={theme.palette.chart[index % theme.palette.chart.length]} 
                                />
                              ))}
                            </Pie>
                            <RechartsTooltip formatter={(value) => [`${Math.round(value * 100)}%`, 'Weight']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Complexity analysis card component
const ComplexityAnalysisCard = ({ data }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // Sort agencies by complexity score
  const sortedByComplexity = [...data].sort((a, b) => b.complexityScore - a.complexityScore);
  
  // Calculate correlation between complexity and regulation size
  const complexityVsSize = data.map(agency => ({
    name: agency.name,
    x: agency.avgWordsPerRegulation / 1000, // Words per regulation (thousands)
    y: agency.complexityScore,
    z: Math.sqrt(agency.wordCount) / 100 // Size of bubble based on total word count
  }));
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Regulatory Complexity Analysis
          </Typography>
          <Button 
            variant="text" 
            size="small"
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Analysis of regulatory language complexity by agency
        </Typography>
        
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedByComplexity}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
              <XAxis 
                dataKey="shortName" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 10]} 
                ticks={[0, 2, 4, 6, 8, 10]} 
                label={{ 
                  value: 'Complexity Score (0-10)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: theme.palette.text.secondary }
                }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="complexityScore" 
                name="Complexity Score" 
                radius={[4, 4, 0, 0]}
              >
                {sortedByComplexity.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.complexityScore > 8 ? theme.palette.error.main :
                      entry.complexityScore > 6 ? theme.palette.warning.main :
                      entry.complexityScore > 4 ? theme.palette.info.main :
                      theme.palette.success.main
                    } 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        {expanded && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Complexity vs. Regulation Size
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Correlation between regulation length and complexity
            </Typography>
            
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Words per Regulation (thousands)"
                    label={{ 
                      value: 'Words per Regulation (thousands)', 
                      position: 'bottom',
                      style: { fill: theme.palette.text.secondary }
                    }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Complexity Score"
                    label={{ 
                      value: 'Complexity Score', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: theme.palette.text.secondary }
                    }}
                  />
                  <ZAxis
                    type="number"
                    dataKey="z"
                    range={[20, 60]}
                    name="Total Regulation Volume"
                  />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter
                    name="Agencies"
                    data={complexityVsSize}
                    fill={theme.palette.primary.main}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Box>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Highest Complexity Agencies
                    </Typography>
                    <List dense>
                      {sortedByComplexity.slice(0, 5).map((agency, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={agency.name}
                            secondary={`Score: ${agency.complexityScore}/10 | Grade Level: ${agency.readabilityGrade}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Lowest Complexity Agencies
                    </Typography>
                    <List dense>
                      {sortedByComplexity.slice(-5).reverse().map((agency, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={agency.name}
                            secondary={`Score: ${agency.complexityScore}/10 | Grade Level: ${agency.readabilityGrade}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Regulatory burden card component
const RegulatoryBurdenCard = ({ data }) => {
  const theme = useTheme();
  
  // Sort agencies by total burden hours
  const sortedByBurden = [...data].sort((a, b) => b.totalBurdenHours - a.totalBurdenHours);
  
  // Format data for radar chart
  const radarData = sortedByBurden.slice(0, 5).map(agency => ({
    name: agency.shortName,
    "Total Cost (Millions)": agency.totalBurdenCost / 1000000,
    "Burden Hours (Thousands)": agency.totalBurdenHours / 1000,
    "Words (Millions)": agency.wordCount / 1000000,
  }));
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Regulatory Burden Estimation
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Estimated compliance costs and burden hours by agency
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedByBurden.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 20, right: 20, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal opacity={0.1} />
                  <XAxis 
                    type="number"
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    label={{ 
                      value: 'Estimated Compliance Cost (USD)', 
                      position: 'bottom',
                      style: { fill: theme.palette.text.secondary }
                    }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={150}
                  />
                  <RechartsTooltip 
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Compliance Cost']}
                  />
                  <Bar 
                    dataKey="totalBurdenCost" 
                    name="Compliance Cost" 
                    fill={theme.palette.error.main}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          <Grid item xs={12} lg={4}>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
                  {Object.keys(radarData[0] || {}).filter(k => k !== 'name').map((key, index) => (
                    <Radar
                      key={key}
                      name={key}
                      dataKey={key}
                      stroke={theme.palette.chart[index + 1]}
                      fill={theme.palette.chart[index + 1]}
                      fillOpacity={0.5}
                    />
                  ))}
                  <Legend />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Card 
                variant="outlined" 
                sx={{ 
                  flex: '1 1 300px', 
                  backgroundColor: alpha(theme.palette.error.main, 0.05)
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    <SpeedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Total Estimated Compliance Cost
                  </Typography>
                  <Typography variant="h4" color="error.dark" fontWeight="bold">
                    ${data.reduce((total, agency) => total + agency.totalBurdenCost, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated annual cost across all federal agencies
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                variant="outlined" 
                sx={{ 
                  flex: '1 1 300px',
                  backgroundColor: alpha(theme.palette.warning.main, 0.05)
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                    <AlternateEmailIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Total Estimated Burden Hours
                  </Typography>
                  <Typography variant="h4" color="warning.dark" fontWeight="bold">
                    {data.reduce((total, agency) => total + agency.totalBurdenHours, 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total work hours required for regulatory compliance
                  </Typography>
                </CardContent>
              </Card>
              
              <Card 
                variant="outlined" 
                sx={{ 
                  flex: '1 1 300px',
                  backgroundColor: alpha(theme.palette.info.main, 0.05)
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" color="info.dark" gutterBottom>
                    <SubjectIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Average Hours per Regulation
                  </Typography>
                  <Typography variant="h4" color="info.dark" fontWeight="bold">
                    {Math.round(data.reduce((sum, agency) => sum + agency.burdenHoursPerRegulation, 0) / data.length).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average time to comply with a single regulation
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Regulatory forecast card component
const RegulatoryForecastCard = ({ data }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  
  // Format data for the chart
  const chartData = useMemo(() => {
    // Combine historical with forecast data
    return data.combinedData;
  }, [data]);
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Regulatory Growth Forecast
          </Typography>
          <Button 
            variant="text" 
            size="small"
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Machine learning forecast of regulatory growth patterns
        </Typography>
        
        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="historicalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.info.main} stopOpacity={0.1}/>
                  <stop offset="95%" stopColor={theme.palette.info.main} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                }}
                interval={Math.floor(chartData.length / 10)}
              />
              <YAxis 
                tickFormatter={(value) => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value}
              />
              <RechartsTooltip 
                formatter={(value, name) => {
                  if (name === 'wordCount') return [value.toLocaleString(), 'Word Count'];
                  if (name === 'lowConfidence') return [value.toLocaleString(), 'Lower Bound'];
                  if (name === 'highConfidence') return [value.toLocaleString(), 'Upper Bound'];
                  return [value, name];
                }}
                labelFormatter={(date) => {
                  const d = new Date(date);
                  const isProjected = chartData.find(item => item.date === date)?.projected;
                  return `${d.toLocaleDateString()} ${isProjected ? '(Projected)' : ''}`;
                }}
              />
              
              {/* Confidence interval area */}
              <Area
                type="monotone"
                dataKey="highConfidence"
                strokeOpacity={0}
                stroke={theme.palette.info.main}
                fillOpacity={1}
                fill="url(#confidenceGradient)"
                activeDot={false}
                isAnimationActive={true}
              />
              
              <Area
                type="monotone"
                dataKey="lowConfidence"
                strokeOpacity={0}
                stroke={theme.palette.info.main}
                fillOpacity={0}
                activeDot={false}
                isAnimationActive={true}
              />
              
              {/* Actual data line */}
              <Area
                type="monotone"
                dataKey="wordCount"
                name="Word Count"
                stroke={theme.palette.primary.main}
                fillOpacity={1}
                fill="none"
                strokeWidth={2}
                dot={{ 
                  r: 2, 
                  stroke: theme.palette.primary.main, 
                  fill: theme.palette.primary.main 
                }}
                activeDot={{ 
                  r: 6, 
                  stroke: theme.palette.background.paper, 
                  strokeWidth: 2, 
                  fill: theme.palette.primary.main 
                }}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Card 
            variant="outlined" 
            sx={{ 
              flex: '1 1 0', 
              minWidth: '240px',
              backgroundColor: alpha(theme.palette.primary.main, 0.05)
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color={theme.palette.primary.main} gutterBottom>
                Current Growth Rate
              </Typography>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {(data.yearlyGrowthRate * 100).toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Annual growth rate based on historical data
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            variant="outlined" 
            sx={{ 
              flex: '1 1 0', 
              minWidth: '240px',
              backgroundColor: alpha(theme.palette.secondary.main, 0.05)
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color={theme.palette.secondary.main} gutterBottom>
                5-Year Projection
              </Typography>
              <Typography variant="h4" color="secondary" fontWeight="bold">
                {(data.fiveYearProjection / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Projected total word count in 5 years
              </Typography>
            </CardContent>
          </Card>
          
          <Card 
            variant="outlined" 
            sx={{ 
              flex: '1 1 0', 
              minWidth: '240px',
              backgroundColor: alpha(theme.palette.warning.main, 0.05)
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color={theme.palette.warning.main} gutterBottom>
                Growth Percentage
              </Typography>
              <Typography variant="h4" color="warning.dark" fontWeight="bold">
                +{Math.round((data.fiveYearProjection / chartData[0].wordCount - 1) * 100)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total growth over next 5 years
              </Typography>
            </CardContent>
          </Card>
        </Box>
        
        {expanded && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Agency-Specific Forecasts
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Projected regulatory growth for major agencies
            </Typography>
            
            <Grid container spacing={2}>
              {data.agencyForecasts.slice(0, 9).map((forecast, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      backgroundColor: forecast.growthPercent > 30 
                        ? alpha(theme.palette.error.main, 0.05)
                        : forecast.growthPercent > 20
                        ? alpha(theme.palette.warning.main, 0.05)
                        : alpha(theme.palette.success.main, 0.05)
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom noWrap>
                        {forecast.agency}
                      </Typography>
                      
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: forecast.growthPercent > 30 
                            ? theme.palette.error.main
                            : forecast.growthPercent > 20
                            ? theme.palette.warning.main
                            : theme.palette.success.main,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <TrendingUpIcon sx={{ mr: 0.5 }} />
                        +{forecast.growthPercent}%
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Current: {(forecast.currentWordCount / 1000000).toFixed(1)}M words<br/>
                        5-Year: {(forecast.fiveYearForecast / 1000000).toFixed(1)}M words
                      </Typography>
                      
                      <Box sx={{ mt: 1, height: 60 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={forecast.forecast}
                            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                          >
                            <Line 
                              type="monotone" 
                              dataKey="wordCount" 
                              stroke={
                                forecast.growthPercent > 30 
                                  ? theme.palette.error.main
                                  : forecast.growthPercent > 20
                                  ? theme.palette.warning.main
                                  : theme.palette.success.main
                              } 
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Main NLP Dashboard component
const RegulatoryNLPDashboard = ({ agenciesData = [], historicalData = [] }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  
  // Analysis data states
  const [sentimentData, setSentimentData] = useState([]);
  const [topicData, setTopicData] = useState({ agencyTopics: [], globalTopics: [] });
  const [complexityData, setComplexityData] = useState([]);
  const [burdenData, setBurdenData] = useState([]);
  const [forecastData, setForecastData] = useState({
    historicalData: [],
    forecastData: [],
    combinedData: [],
    yearlyGrowthRate: 0,
    fiveYearProjection: 0,
    agencyForecasts: []
  });
  
  // Loading states
  const [loadingSentiment, setLoadingSentiment] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingComplexity, setLoadingComplexity] = useState(true);
  const [loadingBurden, setLoadingBurden] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(true);
  
  // Error states
  const [error, setError] = useState(null);
  
  // Load data on component mount or when agenciesData changes
  useEffect(() => {
    const loadAnalysisData = async () => {
      if (!agenciesData || agenciesData.length === 0) {
        setError('No agency data available for analysis');
        return;
      }
      
      try {
        // Load sentiment analysis
        setLoadingSentiment(true);
        const sentimentResults = await nlpService.getSentimentAnalysis(agenciesData);
        setSentimentData(sentimentResults);
        setLoadingSentiment(false);
        
        // Load topic modeling
        setLoadingTopics(true);
        const topicResults = await nlpService.getTopicModeling(agenciesData);
        setTopicData(topicResults);
        setLoadingTopics(false);
        
        // Load complexity analysis
        setLoadingComplexity(true);
        const complexityResults = await nlpService.getComplexityAnalysis(agenciesData);
        setComplexityData(complexityResults);
        setLoadingComplexity(false);
        
        // Load regulatory burden estimates
        setLoadingBurden(true);
        const burdenResults = await nlpService.getRegulatoryBurdenEstimate(agenciesData);
        setBurdenData(burdenResults);
        setLoadingBurden(false);
        
        // Load forecast data (if historical data available)
        setLoadingForecast(true);
        if (historicalData && historicalData.length > 0) {
          const forecastResults = await nlpService.getRegulationForecast(historicalData, agenciesData);
          setForecastData(forecastResults);
        } else {
          setError('No historical data available for forecasting');
        }
        setLoadingForecast(false);
        
      } catch (err) {
        setError(`Error performing analysis: ${err.message}`);
        console.error('Analysis error:', err);
        setLoadingSentiment(false);
        setLoadingTopics(false);
        setLoadingComplexity(false);
        setLoadingBurden(false);
        setLoadingForecast(false);
      }
    };
    
    loadAnalysisData();
  }, [agenciesData, historicalData]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <Paper sx={{ p: 3, position: 'relative' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            <PsychologyIcon sx={{ fontSize: 32, mr: 1, verticalAlign: 'top' }} />
            Regulatory NLP Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Advanced machine learning analysis of federal regulations
          </Typography>
        </Box>
        
        <Tooltip title="This dashboard uses natural language processing and machine learning to analyze regulatory content, complexity, sentiment, and predict future trends.">
          <Button
            startIcon={<ScienceIcon />}
            variant="outlined"
            color="secondary"
            sx={{ mt: 1 }}
          >
            About AI Analysis
          </Button>
        </Tooltip>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            icon={<AutoGraphIcon />}
            label="Growth Forecast" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<AssessmentIcon />}
            label="Complexity Analysis" 
            iconPosition="start"
            sx={{ minHeight: 48 }}
          />
          <Tab 
            icon={<PsychologyIcon />}
            label="Sentiment Analysis" 
            iconPosition="start"
            sx={{ minHeight: 48 }}/>
            <Tab 
              icon={<BubbleChartIcon />}
              label="Topic Modeling" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
            <Tab 
              icon={<FindReplaceIcon />}
              label="Regulatory Burden" 
              iconPosition="start"
              sx={{ minHeight: 48 }}
            />
          </Tabs>
        </Box>
        
        {/* Growth Forecast Tab */}
        {activeTab === 0 && (
          <Box>
            {loadingForecast ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1">
                  Running ML time series forecast algorithm...
                </Typography>
              </Box>
            ) : (
              <RegulatoryForecastCard data={forecastData} />
            )}
          </Box>
        )}
        
        {/* Complexity Analysis Tab */}
        {activeTab === 1 && (
          <Box>
            {loadingComplexity ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1">
                  Analyzing regulatory complexity...
                </Typography>
              </Box>
            ) : (
              <ComplexityAnalysisCard data={complexityData} />
            )}
          </Box>
        )}
        
        {/* Sentiment Analysis Tab */}
        {activeTab === 2 && (
          <Box>
            {loadingSentiment ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1">
                  Performing NLP sentiment analysis...
                </Typography>
              </Box>
            ) : (
              <SentimentAnalysisCard data={sentimentData} />
            )}
          </Box>
        )}
        
        {/* Topic Modeling Tab */}
        {activeTab === 3 && (
          <Box>
            {loadingTopics ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1">
                  Running topic modeling analysis...
                </Typography>
              </Box>
            ) : (
              <TopicModelingCard data={topicData} />
            )}
          </Box>
        )}
        
        {/* Regulatory Burden Tab */}
        {activeTab === 4 && (
          <Box>
            {loadingBurden ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1">
                  Calculating regulatory burden metrics...
                </Typography>
              </Box>
            ) : (
              <RegulatoryBurdenCard data={burdenData} />
            )}
          </Box>
        )}
      </Paper>
    );
  };
  
  export default RegulatoryNLPDashboard;