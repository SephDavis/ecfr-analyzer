import React, { useState } from 'react';

/**
 * Enhanced integration component for the Regulation Explorer that
 * clearly shows what's real vs. mock data and provides context
 */
const ImprovedRegulationExplorerIntegration = ({ agenciesData, historicalData }) => {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Extract real data metrics for display
  const totalAgencies = agenciesData?.length || 0;
  const totalWordCount = agenciesData?.reduce((sum, agency) => sum + agency.wordCount, 0) || 0;
  const totalRegulations = agenciesData?.reduce((sum, agency) => sum + agency.regulationCount, 0) || 0;
  
  // Calculate percentage distributions for top agencies
  const topAgencies = agenciesData
    ? [...agenciesData]
        .sort((a, b) => b.wordCount - a.wordCount)
        .slice(0, 5)
        .map(agency => ({
          name: agency.name,
          wordCount: agency.wordCount,
          percentage: ((agency.wordCount / totalWordCount) * 100).toFixed(1)
        }))
    : [];
  
  const handleOpenExplorer = () => {
    setExplorerOpen(true);
  };
  
  const handleCloseExplorer = () => {
    setExplorerOpen(false);
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  return (
    <div className="regulation-explorer-integration">
      <div className="main-panel p-4 mb-4 bg-white rounded shadow">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h5 className="fw-bold mb-2">
              <i className="bi bi-bar-chart-fill me-2"></i>
              Advanced Regulation Analysis
            </h5>
            <p className="text-muted small">
              Dive deeper into federal regulations with advanced exploration tools.
            </p>
          </div>
          
          <div className="alert alert-info py-1 px-3 d-flex align-items-center">
            <i className="bi bi-info-circle me-2"></i>
            <span className="small">
              <strong>Data Source:</strong> Real CFR data from {totalAgencies} agencies
            </span>
          </div>
        </div>
        
        <div className="row g-3">
          {/* Current Data Overview */}
          <div className="col-12">
            <div className="card border-success mb-3 bg-success-subtle">
              <div className="card-body p-3">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  <h6 className="mb-0">Current Regulatory Landscape</h6>
                </div>
                
                <div className="d-flex flex-wrap justify-content-around gap-3">
                  <div className="text-center p-2">
                    <h5 className="fw-bold text-primary">
                      {totalAgencies.toLocaleString()}
                    </h5>
                    <p className="text-muted small mb-0">
                      Federal Agencies
                    </p>
                  </div>
                  
                  <div className="text-center p-2">
                    <h5 className="fw-bold text-primary">
                      {totalRegulations.toLocaleString()}
                    </h5>
                    <p className="text-muted small mb-0">
                      Regulations
                    </p>
                  </div>
                  
                  <div className="text-center p-2">
                    <h5 className="fw-bold text-primary">
                      {(totalWordCount / 1000000).toFixed(2)}M
                    </h5>
                    <p className="text-muted small mb-0">
                      Total Words
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Agency Footprint */}
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-2">
                  <i className="bi bi-building me-2"></i>
                  Agency Regulatory Footprint
                </h6>
                <p className="text-muted small mb-3">
                  Actual proportional word count by top regulatory agencies
                </p>
                
                <div className="list-group list-group-flush mt-2">
                  {topAgencies.map((agency, index) => (
                    <div key={index} className="list-group-item border-0 px-0 py-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="text-truncate" style={{maxWidth: '70%'}}>
                          {agency.name}
                        </span>
                        <span className="fw-medium">
                          {agency.percentage}%
                        </span>
                      </div>
                      <div className="progress" style={{height: '8px'}}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{width: `${agency.percentage}%`}}
                          aria-valuenow={agency.percentage}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="d-flex justify-content-center mt-3">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleOpenExplorer}
                  >
                    <i className="bi bi-zoom-in me-1"></i>
                    Explore All Agencies
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Deep Dive Analysis Panel */}
          <div className="col-12 col-md-6">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="fw-bold mb-2">
                  <i className="bi bi-zoom-in me-2"></i>
                  Deep Dive Analysis
                </h6>
                <p className="text-muted small mb-3">
                  Available specialized tools for regulatory exploration
                </p>
                
                <div className="list-group list-group-flush">
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex">
                      <div className="me-2">
                        <i className="bi bi-search text-primary"></i>
                      </div>
                      <div>
                        <div className="fw-medium">Full-text search & filtering capabilities</div>
                        <div className="text-muted small">Find specific regulations with advanced search options</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex">
                      <div className="me-2">
                        <i className="bi bi-diagram-3 text-primary"></i>
                      </div>
                      <div>
                        <div className="fw-medium">Title structure browser</div>
                        <div className="text-muted small">Navigate the complete hierarchy of federal regulations</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="list-group-item border-0 px-0 py-2">
                    <div className="d-flex">
                      <div className="me-2">
                        <i className="bi bi-graph-up text-primary"></i>
                      </div>
                      <div>
                        <div className="fw-medium">Version history tracking</div>
                        <div className="text-muted small">See how regulations have changed over time</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="d-flex justify-content-center mt-3">
                  <button 
                    className="btn btn-primary"
                    onClick={handleOpenExplorer}
                  >
                    <i className="bi bi-zoom-in me-1"></i>
                    Open Regulation Explorer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI/ML Features Panel (Clearly Marked as Planned) */}
      <div className="future-panel p-4 mb-4 bg-white rounded shadow" 
           style={{background: 'linear-gradient(135deg, rgba(0,123,255,0.05) 0%, rgba(0,123,255,0.15) 100%)'}}>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="fw-bold mb-2">
              <i className="bi bi-rocket-takeoff me-2"></i>
              Future AI Capabilities
            </h5>
            <p className="text-muted small">
              Planned machine learning enhancements for advanced regulatory analysis
            </p>
          </div>
          
          <span className="badge bg-info px-3 py-2 fw-bold">
            PLANNED FEATURES
          </span>
        </div>
        
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 0 ? 'active' : ''}`} href="#" 
               onClick={(e) => { e.preventDefault(); handleTabChange(e, 0); }}>
              <i className="bi bi-info-circle me-1"></i> Overview
            </a>
          </li>
          <li className="nav-item">
            <a className={`nav-link ${activeTab === 1 ? 'active' : ''}`} href="#" 
               onClick={(e) => { e.preventDefault(); handleTabChange(e, 1); }}>
              <i className="bi bi-code-slash me-1"></i> Technical Details
            </a>
          </li>
        </ul>
        
        {activeTab === 0 ? (
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-2">
                    <i className="bi bi-brain text-primary me-2"></i>
                    NLP Analytics
                  </h6>
                  <p className="text-muted small mb-3">
                    Advanced language analysis of regulatory text to identify patterns, complexity, and sentiment.
                  </p>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="badge bg-light text-dark">Text Analysis</span>
                    <span className="badge bg-light text-dark">Sentiment Analysis</span>
                    <span className="badge bg-light text-dark">Complexity Scoring</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-2">
                    <i className="bi bi-search text-primary me-2"></i>
                    Semantic Search
                  </h6>
                  <p className="text-muted small mb-3">
                    AI-powered search that understands the meaning behind regulatory text, not just keywords.
                  </p>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="badge bg-light text-dark">Neural Embeddings</span>
                    <span className="badge bg-light text-dark">Intent Recognition</span>
                    <span className="badge bg-light text-dark">Relevance Ranking</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-4">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="fw-bold mb-2">
                    <i className="bi bi-diagram-3 text-primary me-2"></i>
                    Knowledge Graph
                  </h6>
                  <p className="text-muted small mb-3">
                    Visual network of relationships between regulations, agencies, and requirements.
                  </p>
                  <div className="d-flex flex-wrap gap-1">
                    <span className="badge bg-light text-dark">Relationship Mapping</span>
                    <span className="badge bg-light text-dark">Network Analysis</span>
                    <span className="badge bg-light text-dark">3D Visualization</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="card h-100 bg-white bg-opacity-75">
                <div className="card-body">
                  <h6 className="fw-medium mb-2">
                    <i className="bi bi-database me-2"></i>
                    Data Infrastructure
                  </h6>
                  
                  <div className="list-group list-group-flush">
                    <div className="list-group-item border-0 px-0 py-1">
                      <div className="fw-medium">Vector Database</div>
                      <div className="text-muted small">For semantic embeddings & similarity search</div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-1">
                      <div className="fw-medium">Graph Database</div>
                      <div className="text-muted small">To store regulatory relationships</div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-1">
                      <div className="fw-medium">Document Store</div>
                      <div className="text-muted small">For efficient text retrieval</div>
                    </div>
                  </div>
                  
                  <span className="badge border border-info text-info bg-transparent mt-2">
                    Planned: Neo4j + Pinecone + Elasticsearch
                  </span>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-4">
              <div className="card h-100 bg-white bg-opacity-75">
                <div className="card-body">
                  <h6 className="fw-medium mb-2">
                    <i className="bi bi-cpu me-2"></i>
                    ML Models
                  </h6>
                  
                  <div className="list-group list-group-flush">
                    <div className="list-group-item border-0 px-0 py-1">
                      <div className="fw-medium">BERT-based Language Models</div>
                      <div className="text-muted small">Pretrained on regulatory text</div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-1">
                      <div className="fw-medium">Topic Modeling</div>
                      <div className="text-muted small">For thematic analysis</div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-1">
                      <div className="fw-medium">Time Series Models</div>
                      <div className="text-muted small">For regulatory growth forecasting</div>
                    </div>
                  </div>
                  
                  <span className="badge border border-info text-info bg-transparent mt-2">
                    Planned: PyTorch + Hugging Face + Prophet
                  </span>
                </div>
              </div>
            </div>
            
            <div className="col-12 col-md-4">
              <div className="card h-100 bg-white bg-opacity-75">
                <div className="card-body">
                  <h6 className="fw-medium mb-2">
                    <i className="bi bi-diagram-2 me-2"></i>
                    API Infrastructure
                  </h6>
                  
                  <div className="list-group list-group-flush">
                    <div className="list-group-item border-0 px-0 py-1">
                      <div className="fw-medium">GraphQL API</div>
                      <div className="text-muted small">For flexible regulatory data queries</div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-1">
                      <div className="fw-medium">Vector Search API</div>
                      <div className="text-muted small">For semantic similarity matching</div>
                    </div>
                    <div className="list-group-item border-0 px-0 py-1">
                      <div className="fw-medium">Real-time Analysis API</div>
                      <div className="text-muted small">For on-demand processing</div>
                    </div>
                  </div>
                  
                  <span className="badge border border-info text-info bg-transparent mt-2">
                    Planned: FastAPI + Apollo + Redis
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center mt-3">
          <a 
            href="https://www.technologyreview.com/topic/artificial-intelligence/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-outline-info"
          >
            <i className="bi bi-cup-hot me-1"></i>
            Learn More About AI/ML for Regulatory Analysis
          </a>
        </div>
      </div>
      
      {/* Dialog for Full Explorer */}
      {explorerOpen && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-bar-chart me-2"></i>
                  Advanced Regulation Explorer
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseExplorer}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-0">
                {/* This would render the RegulationExplorer component */}
                <div className="d-flex justify-content-center align-items-center h-100">
                  <p>
                    RegulationExplorer would load here with real data from {totalAgencies} agencies
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </div>
      )}
    </div>
  );
};

export default ImprovedRegulationExplorerIntegration;