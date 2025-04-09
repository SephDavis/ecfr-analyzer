# eCFR Analyzer

A web application for analyzing the Electronic Code of Federal Regulations (eCFR) data with interactive visualizations and search capabilities.

![Dashboard Screenshot](./screenshots/dashboard.png)

## Features

- **Dashboard**: Overview of regulation statistics with charts and key metrics
- **Agency Analysis**: Detailed breakdown of regulations by agency
- **Historical Analysis**: Track changes in federal regulations over time
- **Search**: Full-text search across all federal regulations
- **Interactive Visualizations**: Charts, graphs, and tables for data exploration
- **Custom Metrics**: Word count, regulation density, and complexity scoring

## Live Demo

[View the eCFR Analyzer Demo](https://ecfr-analyzer.herokuapp.com)

## Technology Stack

- **Frontend**: React, Material-UI, Recharts
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Data Processing**: Natural language processing for text analysis
- **API Integration**: eCFR public API integration

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ecfr-analyzer.git
   cd ecfr-analyzer
   ```

2. Install dependencies:
   ```
   npm install
   cd client
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory:
   ```
   MONGO_URI=mongodb://localhost:27017/ecfr_analyzer
   PORT=5000
   NODE_ENV=development
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

```
ecfr-analyzer/
├── client/                  # React frontend
│   ├── public/
│   └── src/
│       ├── components/      # React components
│       ├── services/        # API service layer
│       └── App.js           # Main app component
├── models/                  # Mongoose models
├── routes/                  # Express routes
├── services/                # Backend services
├── screenshots/             # App screenshots
├── server.js                # Express server
└── README.md                # Project documentation
```

## API Endpoints

- `GET /api/agencies` - Get all agencies with regulation statistics
- `GET /api/historical` - Get historical data for regulation changes
- `GET /api/search?query=<term>` - Search regulations by keyword

## Analytics & Metrics

The application provides several custom metrics for analyzing federal regulations:

1. **Word Count by Agency**: Total words used in regulations per agency
2. **Regulation Density**: Average words per regulation
3. **Historical Growth Rate**: Change in regulation word count over time
4. **Complexity Score**: Analysis of regulation complexity based on language patterns

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Data provided by the [Electronic Code of Federal Regulations](https://www.ecfr.gov/)
- Built as part of the Federal Regulation Analysis Project