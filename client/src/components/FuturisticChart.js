// components/FuturisticChart.js
import React from 'react';
import { 
  Box, Paper, Typography, useTheme, alpha,
  CircularProgress
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

// Custom tooltip component
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

const FuturisticChart = ({
  type = 'line',
  data = [],
  title,
  subtitle,
  dataKey,
  nameKey = 'name',
  secondaryDataKey,
  colors,
  height = 400,
  loading = false,
  noDataMessage = 'No data available',
  labelFormatter,
  XAxisFormatter,
  YAxisFormatter,
  rotateLabels = false,
  stacked = false,
  fillGradient = true,
  barSize = 30,
  layout = 'horizontal',
  hideAxis = false,
  hideLegend = false,
  customMargin,
  ...props
}) => {
  const theme = useTheme();
  const chartColors = colors || [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
    theme.palette.info.main,
  ];

  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {title && (
          <Typography variant="h6" gutterBottom fontWeight="bold">
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary" paragraph>
            {subtitle}
          </Typography>
        )}
        <Typography color="text.secondary">{noDataMessage}</Typography>
      </Paper>
    );
  }

  // Custom margin based on layout and other factors
  const defaultMargin = { top: 20, right: 30, left: 20, bottom: rotateLabels ? 70 : 30 };
  const margin = customMargin || defaultMargin;

  // Format Y-axis ticks for readability
  const formatYAxis = YAxisFormatter || ((value) => {
    if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value/1000).toFixed(0)}K`;
    return value;
  });

  // Format X-axis ticks based on provided formatter or default
  const formatXAxis = XAxisFormatter || (value => value);

  return (
    <Paper
      sx={{
        p: 3,
        height,
        position: 'relative',
        overflow: 'hidden',
        '&::before': fillGradient ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `radial-gradient(circle at top right, ${alpha(chartColors[0], 0.05)}, transparent 70%)`,
          pointerEvents: 'none',
        } : {},
      }}
      {...props}
    >
      {/* Header Section */}
      {(title || subtitle) && (
        <Box sx={{ mb: 2, position: 'relative', zIndex: 2 }}>
          {title && (
            <Typography variant="h6" gutterBottom fontWeight="bold">
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}

      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            backdropFilter: 'blur(4px)',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {/* Chart Container */}
      <Box
        sx={{
          height: `calc(100% - ${(title || subtitle) ? 60 : 0}px)`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {type === 'bar' && (
            <BarChart
              data={data}
              margin={margin}
              layout={layout}
              barSize={barSize}
              barGap={4}
            >
              {!hideAxis && <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />}
              
              {/* Gradient definitions */}
              <defs>
                {chartColors.map((color, index) => (
                  <linearGradient 
                    key={`gradient-${index}`} 
                    id={`barGradient-${index}`}
                    x1={layout === 'vertical' ? "0" : "0"}
                    y1={layout === 'vertical' ? "0" : "0"}
                    x2={layout === 'vertical' ? "1" : "0"}
                    y2={layout === 'vertical' ? "0" : "1"}
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={alpha(color, 0.6)} stopOpacity={0.8} />
                  </linearGradient>
                ))}
              </defs>
              
              {layout === 'horizontal' ? (
                <>
                  <XAxis
                    dataKey={nameKey}
                    angle={rotateLabels ? -45 : 0}
                    textAnchor={rotateLabels ? "end" : "middle"}
                    height={rotateLabels ? 70 : 30}
                    interval={0}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    tickFormatter={formatXAxis}
                    hide={hideAxis}
                  />
                  <YAxis
                    width={60}
                    tickFormatter={formatYAxis}
                    tick={{ fill: theme.palette.text.secondary }}
                    hide={hideAxis}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    type="number"
                    tickFormatter={formatYAxis}
                    tick={{ fill: theme.palette.text.secondary }}
                    hide={hideAxis}
                  />
                  <YAxis
                    dataKey={nameKey}
                    type="category"
                    width={150}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                    tickFormatter={formatXAxis}
                    hide={hideAxis}
                  />
                </>
              )}
              
              <Tooltip content={<CustomTooltip />} formatter={labelFormatter} />
              {!hideLegend && <Legend wrapperStyle={{ paddingTop: 10 }} />}
              
              {Array.isArray(dataKey) ? (
                dataKey.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key}
                    fill={`url(#barGradient-${index})`}
                    radius={[4, 4, 0, 0]}
                    stackId={stacked ? "stack" : null}
                  />
                ))
              ) : (
                <Bar
                  dataKey={dataKey}
                  name={dataKey}
                  fill={`url(#barGradient-0)`}
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          )}

          {type === 'line' && (
            <LineChart data={data} margin={margin}>
              {!hideAxis && <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />}
              
              {/* Gradient definitions */}
              <defs>
                {chartColors.map((color, index) => (
                  <linearGradient 
                    key={`gradient-${index}`} 
                    id={`lineGradient-${index}`} 
                 x1="0" 
                    y1="0"
                    x2="0" 
                    y2="1"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                ))}
              </defs>
              
              <XAxis
                dataKey={nameKey}
                angle={rotateLabels ? -45 : 0}
                textAnchor={rotateLabels ? "end" : "middle"}
                height={rotateLabels ? 70 : 30}
                interval="preserveStartEnd"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickFormatter={formatXAxis}
                hide={hideAxis}
              />
              <YAxis
                width={60}
                tickFormatter={formatYAxis}
                tick={{ fill: theme.palette.text.secondary }}
                hide={hideAxis}
              />
              
              <Tooltip content={<CustomTooltip />} formatter={labelFormatter} />
              {!hideLegend && <Legend wrapperStyle={{ paddingTop: 10 }} />}
              
              {Array.isArray(dataKey) ? (
                dataKey.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={chartColors[index % chartColors.length]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: chartColors[index % chartColors.length] }}
                    activeDot={{ r: 6, fill: chartColors[index % chartColors.length] }}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  name={dataKey}
                  stroke={chartColors[0]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: chartColors[0] }}
                  activeDot={{ r: 6, fill: chartColors[0] }}
                />
              )}
              
              {secondaryDataKey && (
                <Line
                  type="monotone"
                  dataKey={secondaryDataKey}
                  name={secondaryDataKey}
                  stroke={chartColors[1]}
                  strokeWidth={2}
                  dot={{ r: 4, fill: chartColors[1] }}
                  activeDot={{ r: 6, fill: chartColors[1] }}
                />
              )}
            </LineChart>
          )}

          {type === 'area' && (
            <AreaChart data={data} margin={margin}>
              {!hideAxis && <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />}
              
              {/* Gradient definitions */}
              <defs>
                {chartColors.map((color, index) => (
                  <linearGradient 
                    key={`gradient-${index}`} 
                    id={`areaGradient-${index}`} 
                    x1="0" 
                    y1="0" 
                    x2="0" 
                    y2="1"
                  >
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              
              <XAxis
                dataKey={nameKey}
                angle={rotateLabels ? -45 : 0}
                textAnchor={rotateLabels ? "end" : "middle"}
                height={rotateLabels ? 70 : 30}
                interval="preserveStartEnd"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                tickFormatter={formatXAxis}
                hide={hideAxis}
              />
              <YAxis
                width={60}
                tickFormatter={formatYAxis}
                tick={{ fill: theme.palette.text.secondary }}
                hide={hideAxis}
              />
              
              <Tooltip content={<CustomTooltip />} formatter={labelFormatter} />
              {!hideLegend && <Legend wrapperStyle={{ paddingTop: 10 }} />}
              
              {Array.isArray(dataKey) ? (
                dataKey.map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={chartColors[index % chartColors.length]}
                    fill={`url(#areaGradient-${index})`}
                    fillOpacity={1}
                    strokeWidth={2}
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  name={dataKey}
                  stroke={chartColors[0]}
                  fill={`url(#areaGradient-0)`}
                  fillOpacity={1}
                  strokeWidth={2}
                />
              )}
              
              {secondaryDataKey && (
                <Area
                  type="monotone"
                  dataKey={secondaryDataKey}
                  name={secondaryDataKey}
                  stroke={chartColors[1]}
                  fill={`url(#areaGradient-1)`}
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          )}

          {type === 'pie' && (
            <PieChart margin={margin}>
              <Tooltip content={<CustomTooltip />} formatter={labelFormatter} />
              {!hideLegend && <Legend wrapperStyle={{ paddingTop: 10 }} />}
              
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                innerRadius={60}
                dataKey={dataKey}
                nameKey={nameKey}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartColors[index % chartColors.length]} 
                    strokeWidth={1}
                    stroke={theme.palette.background.paper}
                  />
                ))}
              </Pie>
              
              {/* Add a glowing center */}
              <circle cx="50%" cy="50%" r="30" fill="none" stroke={theme.palette.primary.main} strokeWidth="1" />
              <circle cx="50%" cy="50%" r="25" fill={alpha(theme.palette.primary.main, 0.1)} />
              <circle cx="50%" cy="50%" r="20" fill={alpha(theme.palette.primary.main, 0.2)} />
              <circle cx="50%" cy="50%" r="15" fill={alpha(theme.palette.primary.main, 0.3)} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default FuturisticChart;