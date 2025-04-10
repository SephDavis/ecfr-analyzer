import React, { useState } from 'react';
import { Search, BookOpen, BarChart3, X } from 'lucide-react';
import RegulationExplorer from './RegulationExplorer';

/**
 * This component integrates the improved RegulationExplorer
 * into dashboard or other components with a cleaner, more user-friendly design
 */
const RegulationExplorerIntegration = ({ agenciesData, historicalData }) => {
  const [explorerOpen, setExplorerOpen] = useState(false);
  
  const handleOpenExplorer = () => {
    setExplorerOpen(true);
  };
  
  const handleCloseExplorer = () => {
    setExplorerOpen(false);
  };
  
  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-800">
            Federal Regulation Explorer
          </h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Quickly search and analyze federal regulations, track regulatory changes, and explore the
          structure of the Code of Federal Regulations (CFR).
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg border border-blue-100 p-5">
            <div className="flex items-center mb-3">
              <Search className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-800">
                Powerful Search & Analysis
              </h3>
            </div>
            
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Intelligent search with auto-suggestions</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Visualize regulatory changes over time</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Track corrections and amendments</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Regulatory analytics and metrics</span>
              </li>
            </ul>
            
            <button
              onClick={handleOpenExplorer}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Open Regulation Explorer
            </button>
          </div>
          
          <div className="bg-purple-50 rounded-lg border border-purple-100 p-5">
            <div className="flex items-center mb-3">
              <BarChart3 className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="font-semibold text-gray-800">
                Regulatory Intelligence
              </h3>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="bg-white p-3 rounded border border-purple-100">
                <div className="text-sm font-medium text-gray-800">
                  Did you know?
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  The EPA has published over 1,200 regulatory updates in the past year, affecting environmental compliance requirements.
                </p>
              </div>
              
              <div className="bg-white p-3 rounded border border-purple-100">
                <div className="text-sm font-medium text-gray-800">
                  Trending Regulatory Topics
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Environmental Standards
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Data Privacy
                  </span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Financial Reporting
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleOpenExplorer}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze Regulatory Trends
            </button>
          </div>
        </div>
      </div>
      
      {/* Full-screen Explorer Dialog */}
      {explorerOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">
                  Federal Regulation Explorer
                </h2>
              </div>
              <button
                onClick={handleCloseExplorer}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto">
              <RegulationExplorer agenciesData={agenciesData} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulationExplorerIntegration;