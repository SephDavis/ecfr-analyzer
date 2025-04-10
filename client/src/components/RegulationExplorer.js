import React, { useState, useEffect } from 'react';
import { Search, Building2, BookOpen, History, AlertTriangle, 
  ZoomIn, ChevronDown, X, RefreshCw, CalendarDays, Filter, Info } from 'lucide-react';

// Main Regulation Explorer Component
const RegulationExplorer = ({ agenciesData = [] }) => {
  // Core states
  const [activeView, setActiveView] = useState('search'); // 'search', 'agency', 'title', 'history', 'corrections'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Data states
  const [agencies, setAgencies] = useState(agenciesData || []);
  const [titles, setTitles] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [corrections, setCorrections] = useState([]);
  const [versions, setVersions] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedTerms, setSuggestedTerms] = useState([]);
  const [searchFilterOpen, setSearchFilterOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    agencies: [],
    dateFrom: '',
    dateTo: new Date().toISOString().split('T')[0],
    resultLimit: 20
  });

  // Fetch agencies on mount if needed
  useEffect(() => {
    if (agencies.length === 0) {
      fetchAgencies();
    }
    
    // Also load titles on mount
    fetchTitles();
    
    // Generate some suggested search terms for common regulation topics
    setSuggestedTerms([
      "environmental protection", "financial disclosure", "safety requirements",
      "reporting obligations", "compliance standards", "data privacy",
      "consumer protection", "licensing requirements", "emissions standards",
      "healthcare compliance"
    ]);
  }, []);

  // Mock API calls - these would connect to your actual API
  const fetchAgencies = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(r => setTimeout(r, 800));
      
      // Generate mock data if none provided
      if (agencies.length === 0) {
        const mockAgencies = [
          { id: 1, name: "Environmental Protection Agency", shortName: "EPA", wordCount: 2450000, regulationCount: 1243, lastUpdated: "2024-12-15" },
          { id: 2, name: "Department of Transportation", shortName: "DOT", wordCount: 1820000, regulationCount: 987, lastUpdated: "2025-01-10" },
          { id: 3, name: "Food and Drug Administration", shortName: "FDA", wordCount: 3100000, regulationCount: 1567, lastUpdated: "2025-02-22" },
          { id: 4, name: "Securities and Exchange Commission", shortName: "SEC", wordCount: 1540000, regulationCount: 643, lastUpdated: "2025-03-05" },
          { id: 5, name: "Federal Communications Commission", shortName: "FCC", wordCount: 985000, regulationCount: 421, lastUpdated: "2025-02-18" }
        ];
        setAgencies(mockAgencies);
      }
    } catch (err) {
      setError("Failed to load agencies. Please try again.");
      console.error("Error fetching agencies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTitles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(r => setTimeout(r, 600));
      
      // Mock titles data
      const mockTitles = [
        { id: 1, number: "1", name: "General Provisions", lastAmended: "2024-12-10", upToDate: "2025-03-15" },
        { id: 2, number: "2", name: "Grants and Agreements", lastAmended: "2025-01-22", upToDate: "2025-03-10" },
        { id: 3, number: "3", name: "The President", lastAmended: "2024-11-05", upToDate: "2025-02-28" },
        { id: 4, number: "4", name: "Accounts", lastAmended: "2025-02-18", upToDate: "2025-03-20" },
        { id: 5, number: "5", name: "Administrative Personnel", lastAmended: "2025-01-30", upToDate: "2025-03-12" },
        { id: 6, number: "6", name: "Domestic Security", lastAmended: "2025-02-10", upToDate: "2025-03-18" },
        { id: 7, number: "7", name: "Agriculture", lastAmended: "2025-03-01", upToDate: "2025-03-25" }
      ];
      
      setTitles(mockTitles);
    } catch (err) {
      setError("Failed to load titles. Please try again.");
      console.error("Error fetching titles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const searchRegulations = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(r => setTimeout(r, 1200));
      
      // Generate mock search results based on query
      const mockResults = {
        totalCount: 53,
        currentPage: 1,
        totalPages: 3,
        results: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          title: `Regulation Related to "${searchQuery}" (Part ${i + 100})`,
          citation: `${Math.floor(Math.random() * 50) + 1} CFR § ${Math.floor(Math.random() * 1000) + 100}.${Math.floor(Math.random() * 100)}`,
          snippet: `This section provides guidelines for ${searchQuery} related activities. Entities must comply with the requirements set forth in paragraph (b) of this section...`,
          agency: searchFilters.agencies.length > 0 
            ? searchFilters.agencies[Math.floor(Math.random() * searchFilters.agencies.length)]
            : agencies[Math.floor(Math.random() * agencies.length)].name,
          updatedDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
        }))
      };
      
      setSearchResults(mockResults);
      setActiveView('results');
    } catch (err) {
      setError("Search failed. Please try again with different terms.");
      console.error("Error searching regulations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgencyDetails = async (agency) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedAgency(agency);
      
      // Simulate API delay
      await new Promise(r => setTimeout(r, 800));
      
      // In a real implementation, we'd fetch additional agency data here
      
      setActiveView('agency');
    } catch (err) {
      setError(`Failed to load details for ${agency.name}. Please try again.`);
      console.error("Error fetching agency details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTitleDetails = async (title) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedTitle(title);
      
      // Simulate API delay
      await new Promise(r => setTimeout(r, 1000));
      
      // Generate mock version history
      const mockVersions = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        title: `Title ${title.number} - ${title.name}`,
        effectiveDate: new Date(2020 + i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        changesDescription: i === 0 
          ? "Initial publication" 
          : `Amendment ${i}: Updated sections related to ${["reporting", "compliance", "definitions", "exemptions", "enforcement", "penalties", "procedures"][i % 7]}`,
        changeType: i === 0 ? "publication" : ["minor", "significant", "technical", "clarification"][i % 4]
      })).sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
      
      setVersions(mockVersions);
      setActiveView('title');
    } catch (err) {
      setError(`Failed to load details for Title ${title.number}. Please try again.`);
      console.error("Error fetching title details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCorrections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API delay
      await new Promise(r => setTimeout(r, 700));
      
      // Generate mock corrections data
      const mockCorrections = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: Math.floor(Math.random() * 50) + 1,
        cfrReference: `${Math.floor(Math.random() * 50) + 1} CFR § ${Math.floor(Math.random() * 1000) + 100}.${Math.floor(Math.random() * 100)}`,
        correctiveAction: ["Typographical error correction", "Citation correction", "Technical amendment", "Clarification of requirements", "Update to reference", "Error in calculation formula"][i % 6],
        errorOccurred: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        errorCorrected: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        agency: agencies[Math.floor(Math.random() * agencies.length)].name
      }));
      
      setCorrections(mockCorrections);
      setActiveView('corrections');
    } catch (err) {
      setError("Failed to load corrections data. Please try again.");
      console.error("Error fetching corrections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search query change with autofill suggestions
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // If we'd have real API suggestions, we'd call it here
    // For now, just filter our mock suggestions
    if (query.length > 2) {
      const filtered = suggestedTerms.filter(term => 
        term.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestedTerms(filtered.length > 0 ? filtered : suggestedTerms);
    }
  };

  // Clear all filters and states
  const handleReset = () => {
    setSearchQuery('');
    setSearchFilters({
      agencies: [],
      dateFrom: '',
      dateTo: new Date().toISOString().split('T')[0],
      resultLimit: 20
    });
    setSearchResults(null);
    setSelectedAgency(null);
    setSelectedTitle(null);
    setActiveView('search');
  };

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header Bar */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-xl font-semibold">Regulation Explorer</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setActiveView('search')}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1 ${activeView === 'search' || activeView === 'results' ? 'bg-white text-blue-600 font-medium' : 'bg-blue-700 hover:bg-blue-800'}`}
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
          
          <button 
            onClick={fetchCorrections}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1 ${activeView === 'corrections' ? 'bg-white text-blue-600 font-medium' : 'bg-blue-700 hover:bg-blue-800'}`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Corrections</span>
          </button>
          
          <button 
            onClick={handleReset}
            className="ml-2 px-3 py-1.5 rounded-md bg-blue-800 hover:bg-blue-900 flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset</span>
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-4">
        {/* Error message display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Search Interface */}
        {activeView === 'search' && (
          <div className="space-y-6">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Federal Regulation Search</h2>
              <p className="text-gray-600 mb-6">
                Search the full text of the Code of Federal Regulations (CFR) for keywords, 
                explore by title or agency, and track regulatory changes.
              </p>
            
              {/* Search Box */}
              <div className="relative">
                <div className="flex">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search regulations (e.g., 'environmental protection', 'financial disclosure')"
                      className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    
                    {/* Autofill Suggestions */}
                    {searchQuery.length > 2 && suggestedTerms.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {suggestedTerms.map((term, i) => (
                          <div
                            key={i}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-left"
                            onClick={() => {
                              setSearchQuery(term);
                              setSuggestedTerms([]);
                            }}
                          >
                            {term}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setSearchFilterOpen(!searchFilterOpen)}
                    className="px-3 bg-gray-100 border-y border-r border-gray-300 text-gray-600 hover:bg-gray-200"
                  >
                    <Filter className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={searchRegulations}
                    disabled={!searchQuery.trim() || isLoading}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-r-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-5 w-5" />
                        <span>Search</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Search Filters Panel */}
                {searchFilterOpen && (
                  <div className="absolute z-10 mt-2 p-4 bg-white border border-gray-200 rounded-md shadow-lg w-full text-left">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-gray-700">Advanced Filters</h3>
                      <button onClick={() => setSearchFilterOpen(false)}>
                        <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Agency</label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          multiple
                          value={searchFilters.agencies}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                            setSearchFilters({...searchFilters, agencies: selected});
                          }}
                        >
                          {agencies.map(agency => (
                            <option key={agency.id} value={agency.name}>
                              {agency.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple agencies</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-500">From</label>
                            <input
                              type="date"
                              value={searchFilters.dateFrom}
                              onChange={(e) => setSearchFilters({...searchFilters, dateFrom: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">To</label>
                            <input
                              type="date"
                              value={searchFilters.dateTo}
                              onChange={(e) => setSearchFilters({...searchFilters, dateTo: e.target.value})}
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSearchFilters({
                            agencies: [],
                            dateFrom: '',
                            dateTo: new Date().toISOString().split('T')[0],
                            resultLimit: 20
                          });
                        }}
                        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
                      >
                        Clear Filters
                      </button>
                      <button
                        onClick={() => setSearchFilterOpen(false)}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Access Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              {/* Agencies Section */}
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <Building2 className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-800">Agencies</h3>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">{agencies.length} Total</span>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {agencies.slice(0, 5).map(agency => (
                    <div
                      key={agency.id}
                      onClick={() => fetchAgencyDetails(agency)}
                      className="bg-white p-3 rounded border border-blue-100 hover:border-blue-300 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{agency.name}</span>
                        <ZoomIn className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {agency.regulationCount.toLocaleString()} regulations · Updated {new Date(agency.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  
                  {agencies.length > 5 && (
                    <button
                      onClick={() => setActiveView('agencies')}
                      className="w-full text-center text-sm text-blue-600 hover:text-blue-800 py-1"
                    >
                      View All Agencies →
                    </button>
                  )}
                </div>
              </div>
              
              {/* Titles Section */}
              <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium text-gray-800">CFR Titles</h3>
                  </div>
                  <span className="text-sm text-green-600 font-medium">{titles.length} Total</span>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {titles.slice(0, 5).map(title => (
                    <div
                      key={title.id}
                      onClick={() => fetchTitleDetails(title)}
                      className="bg-white p-3 rounded border border-green-100 hover:border-green-300 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Title {title.number}</span>
                        <ZoomIn className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="text-sm">{title.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last amended: {new Date(title.lastAmended).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  
                  {titles.length > 5 && (
                    <button
                      onClick={() => setActiveView('titles')}
                      className="w-full text-center text-sm text-green-600 hover:text-green-800 py-1"
                    >
                      View All Titles →
                    </button>
                  )}
                </div>
              </div>
              
              {/* Recent Updates Section */}
              <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                <div className="flex items-center mb-3">
                  <History className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-medium text-gray-800">Recent Updates</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 text-purple-400 mr-2" />
                        <span className="text-sm font-medium">April 5, 2025</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">New</span>
                    </div>
                    <p className="text-sm mt-1">Title 40 Environmental Protection updated with new emissions standards</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 text-purple-400 mr-2" />
                        <span className="text-sm font-medium">March 28, 2025</span>
                      </div>
                    </div>
                    <p className="text-sm mt-1">Title 17 Commodity and Securities Exchanges regulatory amendments</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 text-purple-400 mr-2" />
                        <span className="text-sm font-medium">March 15, 2025</span>
                      </div>
                    </div>
                    <p className="text-sm mt-1">Title 21 Food and Drugs updated with revised safety protocols</p>
                  </div>
                  
                  <button
                    onClick={() => setActiveView('updates')}
                    className="w-full text-center text-sm text-purple-600 hover:text-purple-800 py-1"
                  >
                    View All Updates →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Search Results View */}
        {activeView === 'results' && searchResults && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Search Results: "{searchQuery}"
              </h2>
              <div className="text-sm text-gray-500">
                {searchResults.totalCount} results found
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
              <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  Showing results {searchResults.results.length > 0 ? "1" : "0"}-{searchResults.results.length} of {searchResults.totalCount}.
                  {searchFilters.agencies.length > 0 && (
                    ` Filtered by: ${searchFilters.agencies.join(", ")}`
                  )}
                  {searchFilters.dateFrom && (
                    ` From: ${searchFilters.dateFrom}`
                  )}
                  {searchFilters.dateTo && (
                    ` To: ${searchFilters.dateTo}`
                  )}
                </p>
                <div className="mt-2 flex space-x-2">
                  <button 
                    onClick={() => setSearchFilterOpen(!searchFilterOpen)}
                    className="text-xs px-2 py-1 bg-white border border-blue-200 rounded-md text-blue-600 hover:bg-blue-100"
                  >
                    Modify Filters
                  </button>
                  <button 
                    onClick={() => setActiveView('search')}
                    className="text-xs px-2 py-1 bg-white border border-blue-200 rounded-md text-blue-600 hover:bg-blue-100"
                  >
                    New Search
                  </button>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {searchResults.results.map((result) => (
                <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-blue-800 mb-1">
                      {result.title}
                    </h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {result.agency}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-2">
                    Citation: {result.citation} · Updated: {new Date(result.updatedDate).toLocaleDateString()}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{result.snippet}</p>
                  
                  <div className="flex space-x-2">
                    <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                      View Full Text
                    </button>
                    <button className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                      Related Regulations
                    </button>
                    <button className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                      Version History
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            {searchResults.totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-6">
                <button 
                  disabled={searchResults.currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded bg-white disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center px-4">
                  <span className="text-sm">
                    Page {searchResults.currentPage} of {searchResults.totalPages}
                  </span>
                </div>
                <button 
                  disabled={searchResults.currentPage === searchResults.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Agency Detail View */}
        {activeView === 'agency' && selectedAgency && (
          <div>
            <div className="flex items-center mb-4">
              <button 
                onClick={() => setActiveView('search')}
                className="text-blue-600 hover:text-blue-800 mr-2"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                {selectedAgency.name}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Total Regulations</div>
                <div className="text-3xl font-bold text-blue-700">
                  {selectedAgency.regulationCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Last updated on {new Date(selectedAgency.lastUpdated).toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-sm text-gray-600 mb-1">Total Word Count</div>
                <div className="text-3xl font-bold text-green-700">
                  {selectedAgency.wordCount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Avg. {Math.round(selectedAgency.wordCount / selectedAgency.regulationCount).toLocaleString()} words per regulation
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="text-sm text-gray-600 mb-1">Acronym / Short Name</div>
                <div className="text-3xl font-bold text-purple-700">
                  {selectedAgency.shortName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Used in {Math.round(selectedAgency.regulationCount * 0.8).toLocaleString()} citations
                </div>
              </div>
            </div>
            
            {/* Top Regulations */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Most Referenced Regulations
              </h3>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Citation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        References
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: 5 }, (_, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {["Environmental Standards", "Reporting Requirements", "Safety Protocols", "Compliance Procedures", "Enforcement Guidelines"][i]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.floor(Math.random() * 50) + 1} CFR § {Math.floor(Math.random() * 1000) + 100}.{Math.floor(Math.random() * 100)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(2025, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.floor(Math.random() * 1000) + 100}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-2 text-right">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View All Agency Regulations →
                </button>
              </div>
            </div>
            
            {/* Recent Updates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Recent Regulatory Updates
              </h3>
              
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium">
                          {["Final Rule", "Notice of Proposed Rulemaking", "Correction"][i]}
                        </div>
                        <h4 className="text-base font-semibold text-gray-800 mt-1">
                          {["Standards Update", "New Compliance Requirements", "Technical Amendment"][i]}
                        </h4>
                      </div>
                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {new Date(2025, 3 - i, 10 - (i * 5)).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {["This update includes revised standards for emissions and reporting deadlines.", 
                      "New requirements for data collection and submission procedures.", 
                      "Correction of typographical errors and citation references."][i]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Title Detail View */}
        {activeView === 'title' && selectedTitle && (
          <div>
            <div className="flex items-center mb-4">
              <button 
                onClick={() => setActiveView('search')}
                className="text-blue-600 hover:text-blue-800 mr-2"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-800">
                Title {selectedTitle.number} - {selectedTitle.name}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="text-sm text-gray-600 mb-1">Last Amended</div>
                <div className="text-2xl font-bold text-green-700">
                  {new Date(selectedTitle.lastAmended).toLocaleDateString()}
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full mr-2">
                    Up to date as of {new Date(selectedTitle.upToDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="text-sm text-gray-600 mb-1">Version History</div>
                <div className="text-2xl font-bold text-blue-700">
                  {versions.length} Versions
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  First published: {versions.length > 0 ? new Date(versions[versions.length - 1].effectiveDate).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
            
            {/* Version History Timeline */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Version History
              </h3>
              
              <div className="relative pb-2">
                {/* Vertical Timeline Line */}
                <div className="absolute h-full w-0.5 bg-blue-200 left-3 top-1.5"></div>
                
                {/* Timeline Items */}
                <div className="space-y-6">
                  {versions.map((version, i) => (
                    <div key={i} className="relative pl-10">
                      {/* Timeline Dot */}
                      <div className={`absolute left-0 rounded-full h-7 w-7 flex items-center justify-center ${i === 0 ? 'bg-blue-600' : 'bg-blue-100 border-2 border-blue-200'}`}>
                        <span className={`text-xs font-bold ${i === 0 ? 'text-white' : 'text-blue-600'}`}>{i + 1}</span>
                      </div>
                      
                      {/* Timeline Content */}
                      <div className={`bg-white rounded-lg border ${i === 0 ? 'border-blue-300 shadow-sm' : 'border-gray-200'} p-4`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {new Date(version.effectiveDate).toLocaleDateString()}
                              {i === 0 && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  Current Version
                                </span>
                              )}
                            </div>
                            <h4 className="text-gray-800 mt-1">
                              {version.changesDescription}
                            </h4>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full capitalize">
                            {version.changeType}
                          </span>
                        </div>
                        
                        {i === 0 ? (
                          <div className="mt-3 flex space-x-2">
                            <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                              View Current Version
                            </button>
                            <button className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                              Compare with Previous
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 text-right">
                            <button className="text-sm text-blue-600 hover:text-blue-800">
                              View this version →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Corrections View */}
        {activeView === 'corrections' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Regulatory Corrections</h2>
              <button
                onClick={() => setActiveView('search')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Search
              </button>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg mb-6 flex items-start">
              <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800">
                  Corrections are published to fix errors in previously published regulatory text. This may include typographical errors, incorrect citations, or clarifications.
                </p>
              </div>
            </div>
            
            {/* Corrections List */}
            <div className="space-y-4">
              {corrections.map((correction) => (
                <div key={correction.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {correction.cfrReference}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{correction.correctiveAction}</p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      {correction.agency}
                    </span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Error Occurred:</span>{' '}
                      <span className="font-medium">{new Date(correction.errorOccurred).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Error Corrected:</span>{' '}
                      <span className="font-medium">{new Date(correction.errorCorrected).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex justify-end">
                    <button className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                      View Correction Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Load More Button */}
            <div className="mt-6 text-center">
              <button className="px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50">
                Load More Corrections
              </button>
            </div>
          </div>
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
              <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
              <div>
                <p className="font-medium">Loading...</p>
                <p className="text-sm text-gray-500">Please wait while we process your request</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegulationExplorer;