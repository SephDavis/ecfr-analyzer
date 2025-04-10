import React from 'react';

// Simple component that can be added directly to your existing sidebar items
const DataSourceBadge = ({ type }) => {
  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    padding: '2px 4px',
    borderRadius: '3px',
    marginLeft: '4px',
    backgroundColor: type === 'REAL' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
    color: type === 'REAL' ? '#4caf50' : '#ff9800',
    border: `1px solid ${type === 'REAL' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 152, 0, 0.3)'}`,
  };
  
  return (
    <span style={badgeStyle}>
      {type}
    </span>
  );
};

// Legend component that can be added at the top of your sidebar
const DataSourceLegend = () => {
  const containerStyle = {
    padding: '8px 16px',
    marginBottom: '8px',
    fontSize: '12px',
  };
  
  const titleStyle = {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: 'rgba(255, 255, 255, 0.7)', // Changed to lighter color for dark theme
  };
  
  const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
  };
  
  const realDotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4caf50',
    marginRight: '8px',
  };
  
  const mockDotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ff9800',
    marginRight: '8px',
  };
  
  return (
    <div style={containerStyle}>
      <div style={titleStyle}>DATA SOURCES</div>
      <div style={legendItemStyle}>
        <div style={realDotStyle}></div>
        <span>Real API Data</span>
      </div>
      <div style={legendItemStyle}>
        <div style={mockDotStyle}></div>
        <span>Mock Data</span>
      </div>
    </div>
  );
};

export { DataSourceBadge, DataSourceLegend };