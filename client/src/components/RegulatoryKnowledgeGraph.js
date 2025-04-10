import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Paper, Typography, Button, Card, CardContent,
  Chip, Divider, useTheme, alpha, CircularProgress,
  IconButton, Tooltip, Switch, FormControlLabel, 
  FormGroup, Grid, Slider, Select, MenuItem, Alert
} from '@mui/material';

// Import D3.js for visualization
import * as d3 from 'd3';

// Import Material UI icons
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';
import BusinessIcon from '@mui/icons-material/Business';
import GavelIcon from '@mui/icons-material/Gavel';
import CategoryIcon from '@mui/icons-material/Category';
import LinkIcon from '@mui/icons-material/Link';
import ArticleIcon from '@mui/icons-material/Article';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Mock service for knowledge graph data
const knowledgeGraphService = {
  getRegulatoryGraph: async (options = { depth: 2, agencyFilter: null }) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Generate mock data for a knowledge graph
    // In a real application, this would come from a graph database
    const mockNodes = [
      { id: 'reg1', label: 'Clean Water Act', type: 'legislation', group: 'environmental', size: 20 },
      { id: 'reg2', label: 'Safe Drinking Water Act', type: 'legislation', group: 'environmental', size: 18 },
      { id: 'reg3', label: 'Clean Air Act', type: 'legislation', group: 'environmental', size: 19 },
      { id: 'reg4', label: '40 CFR Part 122', type: 'regulation', group: 'environmental', size: 16 },
      { id: 'reg5', label: '40 CFR Part 131', type: 'regulation', group: 'environmental', size: 15 },
      { id: 'reg6', label: '40 CFR Part 50', type: 'regulation', group: 'environmental', size: 14 },
      { id: 'reg7', label: '40 CFR Part 60', type: 'regulation', group: 'environmental', size: 13 },
      { id: 'reg8', label: 'NPDES Permit Program', type: 'program', group: 'environmental', size: 12 },
      { id: 'reg9', label: 'Water Quality Standards', type: 'standard', group: 'environmental', size: 12 },
      { id: 'reg10', label: 'Air Quality Standards', type: 'standard', group: 'environmental', size: 11 },
      { id: 'agency1', label: 'EPA', type: 'agency', group: 'agency', size: 18 },
      { id: 'reg11', label: 'Sarbanes-Oxley Act', type: 'legislation', group: 'financial', size: 16 },
      { id: 'reg12', label: 'Dodd-Frank Act', type: 'legislation', group: 'financial', size: 17 },
      { id: 'reg13', label: '17 CFR Part 240', type: 'regulation', group: 'financial', size: 14 },
      { id: 'reg14', label: '17 CFR Part 275', type: 'regulation', group: 'financial', size: 13 },
      { id: 'reg15', label: 'SEC Reporting Requirements', type: 'requirement', group: 'financial', size: 11 },
      { id: 'agency2', label: 'SEC', type: 'agency', group: 'agency', size: 17 },
      { id: 'reg16', label: 'OSHA Act of 1970', type: 'legislation', group: 'labor', size: 15 },
      { id: 'reg17', label: '29 CFR Part 1910', type: 'regulation', group: 'labor', size: 14 },
      { id: 'reg18', label: 'Workplace Safety Standards', type: 'standard', group: 'labor', size: 12 },
      { id: 'agency3', label: 'OSHA', type: 'agency', group: 'agency', size: 16 },
      { id: 'reg19', label: 'HIPAA', type: 'legislation', group: 'healthcare', size: 15 },
      { id: 'reg20', label: '45 CFR Part 160', type: 'regulation', group: 'healthcare', size: 13 },
      { id: 'reg21', label: 'Privacy Rule', type: 'rule', group: 'healthcare', size: 11 },
      { id: 'agency4', label: 'HHS', type: 'agency', group: 'agency', size: 15 }
    ];
    
    const mockLinks = [
      { source: 'reg1', target: 'reg4', value: 5, type: 'implements' },
      { source: 'reg1', target: 'reg5', value: 4, type: 'implements' },
      { source: 'reg2', target: 'reg9', value: 4, type: 'establishes' },
      { source: 'reg3', target: 'reg6', value: 5, type: 'implements' },
      { source: 'reg3', target: 'reg7', value: 4, type: 'implements' },
      { source: 'reg3', target: 'reg10', value: 5, type: 'establishes' },
      { source: 'reg4', target: 'reg8', value: 4, type: 'authorizes' },
      { source: 'reg5', target: 'reg9', value: 4, type: 'defines' },
      { source: 'reg6', target: 'reg10', value: 4, type: 'defines' },
      { source: 'agency1', target: 'reg1', value: 5, type: 'administers' },
      { source: 'agency1', target: 'reg2', value: 5, type: 'administers' },
      { source: 'agency1', target: 'reg3', value: 5, type: 'administers' },
      { source: 'agency1', target: 'reg4', value: 4, type: 'enforces' },
      { source: 'agency1', target: 'reg5', value: 4, type: 'enforces' },
      { source: 'agency1', target: 'reg6', value: 4, type: 'enforces' },
      { source: 'agency1', target: 'reg7', value: 4, type: 'enforces' },
      { source: 'reg11', target: 'reg13', value: 5, type: 'implements' },
      { source: 'reg12', target: 'reg14', value: 5, type: 'implements' },
      { source: 'reg13', target: 'reg15', value: 4, type: 'establishes' },
      { source: 'agency2', target: 'reg11', value: 5, type: 'administers' },
      { source: 'agency2', target: 'reg12', value: 5, type: 'administers' },
      { source: 'agency2', target: 'reg13', value: 4, type: 'enforces' },
      { source: 'agency2', target: 'reg14', value: 4, type: 'enforces' },
      { source: 'reg16', target: 'reg17', value: 5, type: 'implements' },
      { source: 'reg17', target: 'reg18', value: 4, type: 'establishes' },
      { source: 'agency3', target: 'reg16', value: 5, type: 'administers' },
      { source: 'agency3', target: 'reg17', value: 4, type: 'enforces' },
      { source: 'reg19', target: 'reg20', value: 5, type: 'implements' },
      { source: 'reg20', target: 'reg21', value: 4, type: 'establishes' },
      { source: 'agency4', target: 'reg19', value: 5, type: 'administers' },
      { source: 'agency4', target: 'reg20', value: 4, type: 'enforces' },
      { source: 'reg1', target: 'reg2', value: 3, type: 'related' },
      { source: 'reg1', target: 'reg3', value: 3, type: 'related' },
      { source: 'reg11', target: 'reg12', value: 3, type: 'related' },
      { source: 'reg16', target: 'reg19', value: 2, type: 'references' }
    ];
    
    // Apply filtering based on options
    let filteredNodes = [...mockNodes];
    let filteredLinks = [...mockLinks];
    
    // Agency filter
    if (options.agencyFilter) {
      // Find all nodes connected to the agency (direct and indirect up to depth)
      const connectedNodeIds = new Set();
      const agencyId = mockNodes.find(n => n.label === options.agencyFilter)?.id;
      
      if (agencyId) {
        // Add the agency node itself
        connectedNodeIds.add(agencyId);
        
        // First level connections
        mockLinks.forEach(link => {
          if (link.source === agencyId) {
            connectedNodeIds.add(link.target);
          }
          if (link.target === agencyId) {
            connectedNodeIds.add(link.source);
          }
        });
        
        // Additional levels based on depth
        for (let i = 1; i < options.depth; i++) {
          const currentNodeIds = [...connectedNodeIds];
          currentNodeIds.forEach(nodeId => {
            mockLinks.forEach(link => {
              if (link.source === nodeId) {
                connectedNodeIds.add(link.target);
              }
              if (link.target === nodeId) {
                connectedNodeIds.add(link.source);
              }
            });
          });
        }
        
        // Filter nodes and links
        filteredNodes = mockNodes.filter(node => connectedNodeIds.has(node.id));
        filteredLinks = mockLinks.filter(link => 
          connectedNodeIds.has(link.source) && connectedNodeIds.has(link.target)
        );
      }
    }
    
    return {
      nodes: filteredNodes,
      links: filteredLinks,
      metadata: {
        nodeCount: filteredNodes.length,
        linkCount: filteredLinks.length,
        nodeTypes: [...new Set(filteredNodes.map(n => n.type))],
        groups: [...new Set(filteredNodes.map(n => n.group))],
        agencies: filteredNodes.filter(n => n.type === 'agency').map(n => n.label)
      }
    };
  },
  
  getNodeDetails: async (nodeId) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Sample node details
    const nodeDetails = {
      'reg1': {
        title: 'Clean Water Act',
        fullName: 'Federal Water Pollution Control Act (Clean Water Act)',
        description: 'The primary federal law governing water pollution, established to restore and maintain the chemical, physical, and biological integrity of the nation\'s waters.',
        enacted: '1972-10-18',
        lastAmended: '1987-02-04',
        citations: ['33 U.S.C. §1251 et seq.'],
        keyProvisions: [
          'Prohibits the discharge of pollutants from point sources into navigable waters without a permit',
          'Establishes the National Pollutant Discharge Elimination System (NPDES)',
          'Requires states to set water quality standards for contaminants in surface waters'
        ],
        implementingAgencies: ['Environmental Protection Agency'],
        url: 'https://www.epa.gov/laws-regulations/summary-clean-water-act'
      },
      'agency1': {
        title: 'EPA',
        fullName: 'Environmental Protection Agency',
        description: 'A federal agency whose mission is to protect human health and the environment.',
        established: '1970-12-02',
        administrator: 'Michael S. Regan',
        headquarters: 'Washington, D.C.',
        jurisdiction: 'Federal government of the United States',
        keyResponsibilities: [
          'Developing and enforcing environmental regulations',
          'Conducting environmental research',
          'Providing grants to state environmental programs',
          'Studying environmental issues'
        ],
        administeredRegulations: ['Clean Water Act', 'Clean Air Act', 'Safe Drinking Water Act'],
        url: 'https://www.epa.gov/'
      },
      // Additional node details would be included here...
    };
    
    return nodeDetails[nodeId] || {
      title: 'Unknown Node',
      description: 'Detailed information not available for this node.'
    };
  }
};

// Node detail panel component
const NodeDetailPanel = ({ nodeId, onClose }) => {
  const theme = useTheme();
  const [nodeDetails, setNodeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchNodeDetails = async () => {
      try {
        setLoading(true);
        const details = await knowledgeGraphService.getNodeDetails(nodeId);
        setNodeDetails(details);
      } catch (error) {
        console.error('Error fetching node details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (nodeId) {
      fetchNodeDetails();
    }
  }, [nodeId]);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }
  
  if (!nodeDetails) {
    return (
      <Alert severity="info">
        No details available for this node.
      </Alert>
    );
  }
  
  return (
    <Card variant="outlined" sx={{ overflow: 'auto', maxHeight: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {nodeDetails.title}
          </Typography>
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        {nodeDetails.fullName && (
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            {nodeDetails.fullName}
          </Typography>
        )}
        
        <Typography variant="body2" paragraph>
          {nodeDetails.description}
        </Typography>
        
        <Grid container spacing={2}>
          {nodeDetails.enacted && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Enacted
              </Typography>
              <Typography variant="body2">
                {new Date(nodeDetails.enacted).toLocaleDateString()}
              </Typography>
            </Grid>
          )}
          
          {nodeDetails.lastAmended && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Last Amended
              </Typography>
              <Typography variant="body2">
                {new Date(nodeDetails.lastAmended).toLocaleDateString()}
              </Typography>
            </Grid>
          )}
          
          {nodeDetails.established && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Established
              </Typography>
              <Typography variant="body2">
                {new Date(nodeDetails.established).toLocaleDateString()}
              </Typography>
            </Grid>
          )}
          
          {nodeDetails.administrator && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Administrator
              </Typography>
              <Typography variant="body2">
                {nodeDetails.administrator}
              </Typography>
            </Grid>
          )}
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        {nodeDetails.keyProvisions && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key Provisions
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {nodeDetails.keyProvisions.map((provision, i) => (
                <li key={i}>
                  <Typography variant="body2">{provision}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}
        
        {nodeDetails.keyResponsibilities && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Key Responsibilities
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {nodeDetails.keyResponsibilities.map((responsibility, i) => (
                <li key={i}>
                  <Typography variant="body2">{responsibility}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}
        
        {nodeDetails.citations && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Citations
            </Typography>
            {nodeDetails.citations.map((citation, i) => (
              <Chip 
                key={i} 
                label={citation} 
                size="small" 
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}
        
        {nodeDetails.implementingAgencies && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Implementing Agencies
            </Typography>
            {nodeDetails.implementingAgencies.map((agency, i) => (
              <Chip 
                key={i} 
                icon={<BusinessIcon fontSize="small" />}
                label={agency} 
                size="small" 
                color="primary"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}
        
        {nodeDetails.administeredRegulations && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Administered Regulations
            </Typography>
            {nodeDetails.administeredRegulations.map((regulation, i) => (
              <Chip 
                key={i} 
                icon={<GavelIcon fontSize="small" />}
                label={regulation} 
                size="small" 
                color="secondary"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}
        
        {nodeDetails.url && (
          <Button 
            variant="outlined" 
            startIcon={<LinkIcon />} 
            size="small" 
            href={nodeDetails.url} 
            target="_blank" 
            rel="noopener noreferrer"
            fullWidth
            sx={{ mt: 1 }}
          >
            View Official Source
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Main Knowledge Graph Component
const RegulatoryKnowledgeGraph = () => {
  const theme = useTheme();
  const svgRef = useRef(null);
  const legendRef = useRef(null);
  
  // State for simulation
  const [simulation, setSimulation] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [graphOptions, setGraphOptions] = useState({
    depth: 2,
    agencyFilter: null
  });
  
  // State for visualization options
  const [showLinkLabels, setShowLinkLabels] = useState(false);
  const [highlightConnections, setHighlightConnections] = useState(true);
  const [nodeSize, setNodeSize] = useState(1);
  const [forceStrength, setForceStrength] = useState(0.5);
  
  // Color scheme for node types
  const nodeColors = {
    legislation: theme.palette.primary.main,
    regulation: theme.palette.secondary.main,
    program: theme.palette.success.main,
    standard: theme.palette.info.main,
    requirement: theme.palette.warning.main,
    rule: theme.palette.error.main,
    agency: theme.palette.grey[700]
  };
  
  // Color scheme for link types
  const linkColors = {
    implements: theme.palette.primary.main,
    establishes: theme.palette.secondary.main,
    authorizes: theme.palette.success.main,
    defines: theme.palette.info.main,
    administers: theme.palette.warning.main,
    enforces: theme.palette.error.main,
    related: theme.palette.grey[400],
    references: theme.palette.grey[600]
  };
  
  // Load graph data when component mounts or options change
  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setIsLoading(true);
        const data = await knowledgeGraphService.getRegulatoryGraph(graphOptions);
        setGraphData(data);
      } catch (error) {
        console.error("Error loading graph data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGraphData();
  }, [graphOptions]);
  
  // Create and update force simulation when graph data changes
  useEffect(() => {
    if (!graphData || !svgRef.current) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();
    d3.select(legendRef.current).selectAll("*").remove();
    
    // Get SVG dimensions
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Create the force simulation
    const sim = d3.forceSimulation(graphData.nodes)
      .force("link", d3.forceLink(graphData.links)
        .id(d => d.id)
        .distance(d => 100 / (d.value || 1) * (3 - forceStrength * 2))
      )
      .force("charge", d3.forceManyBody()
        .strength(-100 * forceStrength)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => (d.size || 10) * nodeSize + 5));
    
    // Create container for zoom behavior
    const container = svg.append("g");
    
    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });
    
    svg.call(zoom);
    
    // Create the links
    const link = container.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graphData.links)
      .enter().append("line")
      .attr("stroke-width", d => Math.sqrt(d.value))
      .attr("stroke", d => linkColors[d.type] || theme.palette.grey[400])
      .attr("stroke-opacity", 0.6);
    
    // Create the link labels
    const linkLabel = container.append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(graphData.links)
      .enter().append("text")
      .text(d => d.type)
      .attr("font-size", 8)
      .attr("text-anchor", "middle")
      .attr("dy", -3)
      .attr("opacity", showLinkLabels ? 0.7 : 0)
      .attr("fill", d => linkColors[d.type] || theme.palette.grey[700]);
    
    // Create the nodes
    const node = container.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(graphData.nodes)
      .enter().append("circle")
      .attr("r", d => (d.size || 10) * nodeSize)
      .attr("fill", d => nodeColors[d.type] || theme.palette.grey[500])
      .attr("stroke", theme.palette.background.paper)
      .attr("stroke-width", 1.5)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Add node labels
    const nodeLabel = container.append("g")
      .attr("class", "node-labels")
      .selectAll("text")
      .data(graphData.nodes)
      .enter().append("text")
      .text(d => d.label)
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .attr("dy", d => -((d.size || 10) * nodeSize + 8))
      .attr("fill", theme.palette.text.primary)
      .attr("pointer-events", "none");
    
    // Define drag behavior
    function dragstarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event,d) {
        if (!event.active) sim.alphaTarget(0);
        if (!d.fixed) {
          d.fx = null;
          d.fy = null;
        }
      }
      
      // Node click handler
      node.on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(d.id);
        
        if (highlightConnections) {
          // Highlight connected nodes and links
          const connectedNodeIds = new Set();
          connectedNodeIds.add(d.id);
          
          // Find connected nodes
          graphData.links.forEach(link => {
            if (link.source.id === d.id || link.source === d.id) {
              connectedNodeIds.add(link.target.id || link.target);
            } else if (link.target.id === d.id || link.target === d.id) {
              connectedNodeIds.add(link.source.id || link.source);
            }
          });
          
          // Update visual elements
          node.attr("opacity", node => connectedNodeIds.has(node.id) ? 1 : 0.2);
          link.attr("opacity", link => 
            connectedNodeIds.has(link.source.id || link.source) && 
            connectedNodeIds.has(link.target.id || link.target) ? 0.8 : 0.1
          );
          nodeLabel.attr("opacity", node => connectedNodeIds.has(node.id) ? 1 : 0.2);
          linkLabel.attr("opacity", link => 
            showLinkLabels && connectedNodeIds.has(link.source.id || link.source) && 
            connectedNodeIds.has(link.target.id || link.target) ? 0.9 : 0
          );
        }
      });
      
      // Reset highlights on canvas click
      svg.on("click", () => {
        if (highlightConnections) {
          node.attr("opacity", 1);
          link.attr("opacity", 0.6);
          nodeLabel.attr("opacity", 1);
          linkLabel.attr("opacity", showLinkLabels ? 0.7 : 0);
        }
      });
      
      // Create a legend
      const legend = d3.select(legendRef.current);
      const legendTypes = Object.keys(nodeColors);
      const legendLinkTypes = Object.keys(linkColors);
      
      // Node type legend
      const nodeLegend = legend.append("g")
        .attr("class", "node-legend")
        .attr("transform", "translate(10,10)");
      
      nodeLegend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .text("Node Types")
        .style("font-weight", "bold")
        .style("font-size", "12px");
      
      legendTypes.forEach((type, i) => {
        const g = nodeLegend.append("g")
          .attr("transform", `translate(0, ${i * 20 + 20})`);
        
        g.append("circle")
          .attr("r", 6)
          .attr("fill", nodeColors[type]);
        
        g.append("text")
          .attr("x", 15)
          .attr("y", 4)
          .text(type)
          .style("font-size", "10px")
          .style("text-transform", "capitalize");
      });
      
      // Link type legend
      const linkLegend = legend.append("g")
        .attr("class", "link-legend")
        .attr("transform", `translate(100, 10)`);
      
      linkLegend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .text("Relationship Types")
        .style("font-weight", "bold")
        .style("font-size", "12px");
      
      legendLinkTypes.forEach((type, i) => {
        const g = linkLegend.append("g")
          .attr("transform", `translate(0, ${i * 20 + 20})`);
        
        g.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 10)
          .attr("y2", 0)
          .attr("stroke", linkColors[type])
          .attr("stroke-width", 2);
        
        g.append("text")
          .attr("x", 15)
          .attr("y", 4)
          .text(type)
          .style("font-size", "10px")
          .style("text-transform", "capitalize");
      });
      
      // Set up the simulation tick function
      sim.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
        
        linkLabel
          .attr("x", d => (d.source.x + d.target.x) / 2)
          .attr("y", d => (d.source.y + d.target.y) / 2);
        
        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
        
        nodeLabel
          .attr("x", d => d.x)
          .attr("y", d => d.y);
      });
      
      // Save the simulation reference for controls
      setSimulation(sim);
      
      // Cleanup function
      return () => {
        sim.stop();
        setSimulation(null);
      };
    }, [graphData, theme, showLinkLabels, highlightConnections, nodeSize, forceStrength, nodeColors, linkColors]);
    
    // Effect to update link labels when showLinkLabels changes
    useEffect(() => {
      if (!svgRef.current || !graphData) return;
      
      d3.select(svgRef.current)
        .selectAll(".link-labels text")
        .transition()
        .duration(300)
        .attr("opacity", showLinkLabels ? 0.7 : 0);
    }, [showLinkLabels, graphData]);
    
    // Zoom control functions
    const handleZoomIn = () => {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(d3.zoom().scaleBy, 1.5);
    };
    
    const handleZoomOut = () => {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(d3.zoom().scaleBy, 0.75);
    };
    
    const handleZoomReset = () => {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(d3.zoom().transform, d3.zoomIdentity);
    };
    
    // Handle agency filter change
    const handleAgencyFilterChange = (event) => {
      setGraphOptions(prev => ({
        ...prev,
        agencyFilter: event.target.value || null
      }));
    };
    
    // Handle depth change
    const handleDepthChange = (event, newValue) => {
      setGraphOptions(prev => ({
        ...prev,
        depth: newValue
      }));
    };
    
    // Handle node size change
    const handleNodeSizeChange = (event, newValue) => {
      setNodeSize(newValue);
    };
    
    // Handle force strength change
    const handleForceStrengthChange = (event, newValue) => {
      setForceStrength(newValue);
      
      // Update the simulation if it exists
      if (simulation) {
        simulation
          .force("link", d3.forceLink(graphData.links)
            .id(d => d.id)
            .distance(d => 100 / (d.value || 1) * (3 - newValue * 2))
          )
          .force("charge", d3.forceManyBody()
            .strength(-100 * newValue)
          )
          .alpha(0.3)
          .restart();
      }
    };
    
    // Handle reheat simulation
    const handleReheatSimulation = () => {
      if (simulation) {
        simulation.alpha(0.3).restart();
      }
    };
    
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          <AccountTreeIcon sx={{ mr: 1, verticalAlign: 'top' }} />
          Regulatory Knowledge Graph
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Interactive visualization of relationships between regulations, agencies, and requirements
        </Typography>
        
        <Grid container spacing={3}>
          {/* Control Panel */}
          <Grid item xs={12} md={3}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <FilterListIcon sx={{ mr: 1, verticalAlign: 'top' }} />
                  Graph Controls
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Agency Filter
                  </Typography>
                  <Select
                    value={graphOptions.agencyFilter || ''}
                    onChange={handleAgencyFilterChange}
                    fullWidth
                    size="small"
                    displayEmpty
                  >
                    <MenuItem value="">All Agencies</MenuItem>
                    {graphData?.metadata?.agencies?.map(agency => (
                      <MenuItem key={agency} value={agency}>{agency}</MenuItem>
                    ))}
                  </Select>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Connection Depth: {graphOptions.depth}
                  </Typography>
                  <Slider
                    value={graphOptions.depth}
                    min={1}
                    max={3}
                    step={1}
                    marks
                    onChange={handleDepthChange}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Node Size: {nodeSize.toFixed(1)}x
                  </Typography>
                  <Slider
                    value={nodeSize}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    onChange={handleNodeSizeChange}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Force Strength: {forceStrength.toFixed(1)}
                  </Typography>
                  <Slider
                    value={forceStrength}
                    min={0.1}
                    max={1}
                    step={0.1}
                    onChange={handleForceStrengthChange}
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={showLinkLabels} 
                        onChange={e => setShowLinkLabels(e.target.checked)} 
                      />
                    } 
                    label="Show Relationship Labels" 
                  />
                  <FormControlLabel 
                    control={
                      <Switch 
                        checked={highlightConnections} 
                        onChange={e => setHighlightConnections(e.target.checked)} 
                      />
                    } 
                    label="Highlight Connections on Click" 
                  />
                </FormGroup>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Zoom Controls
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<ZoomInIcon />}
                    onClick={handleZoomIn}
                    sx={{ flex: 1 }}
                  >
                    Zoom In
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<ZoomOutIcon />}
                    onClick={handleZoomOut}
                    sx={{ flex: 1 }}
                  >
                    Zoom Out
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<RestartAltIcon />}
                    onClick={handleZoomReset}
                    sx={{ flex: 1 }}
                  >
                    Reset
                  </Button>
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleReheatSimulation}
                  sx={{ mt: 2 }}
                >
                  Reheat Simulation
                </Button>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Graph Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Nodes:</Typography>
                    <Typography variant="body2" fontWeight="medium">{graphData?.metadata?.nodeCount || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Relationships:</Typography>
                    <Typography variant="body2" fontWeight="medium">{graphData?.metadata?.linkCount || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Node Types:</Typography>
                    <Typography variant="body2" fontWeight="medium">{graphData?.metadata?.nodeTypes?.length || 0}</Typography>
                  </Box>
                </Box>
                
                <svg ref={legendRef} width="100%" height="200" />
              </CardContent>
            </Card>
          </Grid>
          
          {/* Graph Visualization and Detail Panel */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2} sx={{ height: '100%' }}>
              {/* Graph Visualization */}
              <Grid item xs={12} sx={{ height: selectedNode ? 'calc(100% - 300px)' : '100%' }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    height: '100%', 
                    minHeight: 500, 
                    position: 'relative',
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  {isLoading ? (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '100%' 
                      }}
                    >
                      <CircularProgress size={50} sx={{ mb: 2 }} />
                      <Typography variant="body1">
                        Building knowledge graph...
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <svg 
                        ref={svgRef} 
                        width="100%" 
                        height="100%"
                        style={{ cursor: 'grab' }}
                      />
                      {!graphData && (
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            No graph data available
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              </Grid>
              
              {/* Detail Panel */}
              {selectedNode && (
                <Grid item xs={12} sx={{ height: 300 }}>
                  <NodeDetailPanel 
                    nodeId={selectedNode} 
                    onClose={() => setSelectedNode(null)}
                  />
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  };
  
  export default RegulatoryKnowledgeGraph;