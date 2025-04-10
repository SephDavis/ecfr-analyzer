# eCFR Analyzer

The eCFR Analyzer is a modern web application for analyzing and exploring the Code of Federal Regulations (CFR). It provides an intuitive interface for understanding regulatory complexity, tracking changes over time, and exploring relationships between agencies and regulations.

## Features

- **Interactive Dashboard** - Visualize regulatory data with charts and metrics
- **Agency Analysis** - Detailed breakdown of regulatory agencies and their impact (Real Data)
- **Historical Analysis** - Monitor regulation growth trends over time (Real Data)
- **Advanced Search** - Find specific regulations with powerful filtering options (Real Data)
- **Semantic Search** - AI-powered search that understands regulatory intent (Mock Data)
- **Knowledge Graph** - Interactive visualization of regulatory relationships (Mock Data)
- **NLP Insights** - Machine learning analysis of regulation complexity and sentiment (Mock Data)

## Data Sources
The application combines real regulatory data with mock data for demonstration purposes:
### Real Data Sources

- Basic agency information and metadata from the eCFR API
- Historical regulatory data tracking
- Standard search functionality

### Mock Data Sources

- Advanced AI features (semantic search, NLP analysis)
- Knowledge graph relationships
- Sentiment analysis
- Complexity scoring
- Topic modeling

The application's sidebar clearly indicates which features use real data (marked with "REAL") versus mock data (marked with "MOCK") for transparency.
## Technology Stack

### Frontend:

- React.js for the UI components
- React Router for navigation
- Material UI for styling and components
- Recharts for data visualization
- D3.js for advanced visualizations

### Backend:

- Node.js/Express server
- MongoDB for data storage
- RESTful API architecture

## Getting Started
### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas connection)

### Installation

1. Clone the repository
git clone https://github.com/your-username/ecfr-analyzer.git
cd ecfr-analyzer

2. Install dependencies
npm install

3. Set up environment variables
Create a `.env` file in the root directory with:
MONGODB_URI=your_mongodb_connection_string
PORT=5000

4. Start the development server
npm run dev

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser

## 📁 Project Structure

```text
ecfr-analyzer/
├── client/                    # React frontend (build artifacts live here)
│   ├── build/                 # Production build output
│   ├── public/                # Static frontend assets
│   └── src/                   # React source code
│       ├── components/        # Dashboard, Graphs, Modals, etc.
│       ├── App.js             # Main React component
│       └── index.js           # React DOM entrypoint
│
├── proxy-server/              # Dev proxy config (optional if using CORS)
│   └── index.js               # Proxy logic for eCFR API passthrough
│
├── services/                  # Backend services
│   ├── DirectECFRService.js  # Raw data fetcher
│   └── ecfrService.js         # Parsing and transformation logic
│
├── server.js                  # Express backend server
│
├── LICENSE.md                 # Reticuli proprietary license
├── .gitignore                 # Git ignored files
├── README.md                  # Main project documentation
├── readme.md                  # (dupe — should clean up)
├── railway.json               # Railway deployment config
├── serve.json                 # Railway serve config
├── wrangler.toml              # Cloudflare Worker config (if used)
│
├── package.json               # Root dependencies (may be shared or split)
├── package-lock.json          # Dependency lockfile
```

## Core Components

1. **Dashboard** - Main analytics overview with key metrics and charts
2. **AgencyAnalysis** - Detailed analysis of regulatory agencies (Real Data)
3. **HistoricalAnalysis** - Charts and trends of regulation growth over time (Real Data)
4. **SemanticSearchEngine** - AI-powered search for finding relevant regulations (Mock Data)
5. **RegulatoryKnowledgeGraph** - Interactive network visualization of regulatory relationships (Mock Data)
6. **RegulatoryNLPDashboard** - ML-based analysis of regulation complexity and sentiment (Mock Data)

## API Endpoints
The backend provides several RESTful API endpoints:

- `GET /api/agencies` - List all regulatory agencies with metadata (Real Data)
- `GET /api/titles` - List all CFR titles (Real Data)
- `GET /api/historical` - Get historical data for trend analysis (Real Data)
- `GET /api/search?query=keyword` - Search regulations by keyword (Real Data)
- `GET /api/corrections` - Get regulatory corrections data (Real Data)
- `GET /api/force-refresh` - Manually refresh data from the eCFR API (Real Data)

## 📁 Project Structure

This project is structured as a full-stack application designed for extensibility, modularity, and integration into secure environments (e.g., federal intranets or CI/CD enclaves).

```text
ecfr-analyzer/
├── client/                    # React frontend
│   ├── build/                 # Production build output
│   ├── public/                # Static assets (logos, meta)
│   └── src/                   # Frontend logic
│       ├── components/        # UI components and layout
│       ├── theme.js           # MUI theming config
│       ├── App.js             # Main React wrapper
│       └── index.js           # Entry point
│
├── proxy-server/              # Dev-time proxy for API passthrough
│   └── index.js               # Lightweight Express proxy logic
│
├── services/                  # Backend and analytics logic
│   ├── DirectECFRService.js  # Fetches raw CFR data
│   └── ecfrService.js         # Parsing, metrics, and normalization
│
├── server.js                  # Express backend server
│
├── railway.json               # Railway deployment manifest
├── serve.json                 # Static host config (Railway/Render/etc.)
├── wrangler.toml              # Cloudflare Worker config (not active)
│
├── LICENSE.md                 # Reticuli LLC proprietary license
├── .gitignore                 # Ignored files
├── README.md                  # Project documentation
├── package.json               # Dependencies and scripts
├── package-lock.json          # Dependency lockfile
```

---

## ⚠️ Data Integrity and Historical Limitations

> **Important:** This application currently includes **mock data** and **partially implemented backend logic** due to time constraints imposed by the 24-hour evaluation window.

### ✅ What’s Functional:
- UI and chart components are live and fully navigable
- Realistic metrics such as total word count, agency breakdown, and regulation density are shown using structured simulated data
- System architecture is designed to support full CFR ingestion, historical delta tracking, and real-time updates

### ⚠️ What’s Simulated:
- **Historical change tracking** currently uses a placeholder dataset  
- **Version comparisons and correction logs** are structurally integrated but not populated from real eCFR archival sources

---

## 📅 Why Historical Data Is Missing

The **eCFR API does not provide historical snapshots** or changelogs directly. To track regulation changes over time, a **custom archival database must be created from scratch** using daily or weekly scrapes.

> This historical database must begin at the **moment of application deployment** and accumulate deltas over time. Until enough data is collected, the version comparison logic is effectively forward-looking only.

This limitation is technical and infrastructural — not conceptual — and would be resolved in a production deployment or post-MVP phase by initiating a durable historical snapshot pipeline (e.g., using PostgreSQL with versioned document storage or object-diff tracking).

---

## License
This project is licensed under the **Reticuli LLC Proprietary License**.
Key terms of the license include:

- The software may be used for evaluation purposes only
- Special exceptions exist for:
  - Unnamed Federal Agency for recruitment and evaluation (60 days)
  - Federal Government Employment
  - Qualified Nonprofit Organizations
  - Educational institutions for research and teaching

For commercial or production use, please contact Reticuli LLC to discuss commercial licensing options:
- Email: Toby.Davis@ReticuliTech.com

The full license terms can be found in the LICENSE file in the root directory of this project.
## Future Enhancements

- Integration with additional regulatory databases
- Full-text regulation viewing with highlights
- Export capabilities for reports and visualizations
- User accounts for saving searches and preferences
- Regulatory compliance recommendations
- Comparative analysis between agencies
- Replacing mock data with real implementations of AI features

## Acknowledgments

- Electronic Code of Federal Regulations (eCFR) for providing the API
- Material UI for the component library
- Recharts and D3.js for visualization libraries

## Contact
For questions or support, please open an issue in the GitHub repository or contact the project maintainers directly.

---

© 2025 Reticuli Technologies - All Rights Reserved
