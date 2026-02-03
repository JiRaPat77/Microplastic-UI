import React, { useState, useEffect, useMemo } from 'react';
import { Camera, BarChart2, PieChart, List, Filter, AlertCircle, PlayCircle, RefreshCw } from 'lucide-react';
import emblemLogo from './assets/emblem_brand_pg.png'; 
import nanotecLogo from './assets/Logo_NANOTEC-2020.png';


const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-400">No Data</div>;
  const maxVal = Math.max(...data.map(d => d.count)) || 1;
  return (
    <div className="flex justify-around h-40 sm:h-48 w-full gap-2 pt-4">
      {data.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center justify-end w-full group h-full">
          <div className="relative w-full flex-1 flex justify-center items-end pb-2">
            <div 
              className="w-full sm:w-2/3 rounded-t-md transition-all duration-500 hover:opacity-80 relative"
              style={{ height: `${(item.count / maxVal) * 100}%`, backgroundColor: item.color }}
            >
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.count}
              </span>
            </div>
          </div>
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium truncate w-full text-center h-4">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const SimplePieChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-32 flex items-center justify-center text-gray-400">No Data</div>;
  const total = data.reduce((acc, cur) => acc + cur.count, 0) || 1;
  const conicGradient = data.reduce((acc, item, index) => {
    const prevPerc = data.slice(0, index).reduce((p, c) => p + (c.count / total) * 100, 0);
    const currentPerc = (item.count / total) * 100;
    return `${acc}${index === 0 ? '' : ','} ${item.color} ${prevPerc}% ${prevPerc + currentPerc}%`;
  }, '');

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
      <div 
        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full shadow-inner relative flex-shrink-0"
        style={{ background: `conic-gradient(${conicGradient})` }}
      >
        <div className="absolute inset-0 m-auto w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
           <div className="text-center">
             <span className="block text-xl sm:text-2xl font-bold text-gray-800">{total}</span>
             <span className="text-[10px] text-gray-500 uppercase">Total</span>
           </div>
        </div>
      </div>
      <div className="space-y-2 w-full sm:w-auto">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center text-sm justify-between sm:justify-start gap-4">
            <div className="flex items-center">
               <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
               <span className="text-gray-600">{item.label}</span>
            </div>
            <span className="font-bold text-gray-800">{Math.round((item.count/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function MicroplasticDashboard() {
  // Main State 
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  console.log("apiUrl",apiUrl);


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/analysis`);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      setApiData(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

const handleStartAnalysis = async () => {
    if (analyzing) return;

    setAnalyzing(true);
    setError(null);

    try {
      
      const currentId = apiData?.analysisId;

    
      const startRes = await fetch(`${apiUrl}/api/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: 'start' })
      });

      if (!startRes.ok) throw new Error('Failed to start analysis');

      
      const maxRetries = 30;
      let retries = 0;
      let isNewDataReceived = false;

      while (retries < maxRetries && !isNewDataReceived) {
       
        await new Promise(resolve => setTimeout(resolve, 2000));
        
       
        const res = await fetch(`${apiUrl}/api/analysis`);
        if (res.ok) {
          const newData = await res.json();
          
          
          if (newData.analysisId !== currentId) {
             setApiData(newData);
             isNewDataReceived = true;
          }
        }
        retries++;
      }

      if (!isNewDataReceived) {
        throw new Error("Timeout: AI ใช้เวลานานเกินไป หรือข้อมูลไม่ถูกส่งกลับมา");
      }

    } catch (err) {
      console.error("Error starting analysis:", err);
      setError("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  
  const chartData = useMemo(() => {
    
    
    // if (!apiData) return [];
    // const rawList = Array.isArray(apiData) ? apiData : (apiData.summary || []);

    if (!apiData || !apiData.data || !apiData.data.type) return [];
    const rawTypeData = apiData.data.type;

    const colorMap = {
      'PET': '#3B82F6',   // Blue
      'HDPE': '#10B981',  // Green
      'PVC': '#EF4444',   // Red
      'LDPE': '#F59E0B',  // Yellow
      'PP': '#8B5CF6',    // Purple
      'PS': '#EC4899',
      'PC': '#06B6D4',   // Pink
      'Other': '#6B7280'  // Gray
    };

    return Object.entries(rawTypeData).map(([key, count]) => ({
      label: key,
      count: count,
      color: colorMap[key] || '#9CA3AF'
    }));
  }, [apiData]);

  if (analyzing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 z-50 fixed inset-0">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing..</h2>
          <p className="text-gray-500">System analyze AI Plese Wait</p>
          <p className="text-xs text-gray-400 mt-4 animate-pulse">Waiting for update...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                 <Filter className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">MicroPlast AI</h1>
              </div>
            </div>

            {/* Action Button*/}
            <button 
              onClick={handleStartAnalysis}
              disabled={analyzing || loading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all
                ${analyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}
              `}
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <PlayCircle className="w-5 h-5" />
                  Start Analysis
                </>
              )}
            </button>

          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-pulse">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Header Section*/}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time microplastic detection results</p>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-start gap-6 mx-8">
            <img 
              src={emblemLogo} 
              alt="Sponsor Logo 1" 
              className="h-16 w-auto object-contain" 
            />
            <img 
              src={nanotecLogo} 
              alt="Sponsor Logo 2" 
              className="h-16 w-auto object-contain" 
            />
          </div>
          {/* Status Badge */}
          {!loading && !analyzing && apiData && (
             <span className="hidden sm:flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium border border-green-100">
               <AlertCircle className="w-4 h-4" /> System Ready
             </span>
          )}
        </div>

        
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-gray-500 space-y-4">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
             <p>Fetching latest data...</p>
          </div>
        ) : (
          /* Content Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Image & Detection */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Camera className="w-5 h-5 text-blue-500" />
                    Detected Image
                  </h3>
                </div>
                
                {/* Image Container */}
                <div className="relative bg-gray-900 w-full aspect-video overflow-hidden group flex items-center justify-center">
                   {apiData?.imageUrl ? (
                    <img 
                      src={apiData.imageUrl || ''} 
                      alt="Microplastic Sample" 
                      className="w-full h-full object-cover"
                    />
                   ) : (
                     <div className="text-gray-400 text-sm flex flex-col items-center">
                        <Camera className="w-8 h-8 mb-2 opacity-50" />
                        <span>No Image Data</span>
                     </div>
                   )}
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold flex items-center gap-2">
                    <List className="w-5 h-5 text-blue-500" />
                    Classification Results
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                      <tr>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {chartData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-3 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                              {item.label}
                          </td>
                          <td className="px-6 py-3 font-mono font-bold text-right">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Analytics */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Objects</div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                     {chartData.reduce((acc, cur) => acc + cur.count, 0)}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Dominant</div>
                  <div className="text-3xl font-bold text-blue-600 mt-1 truncate">
                    {chartData.length > 0 ? [...chartData].sort((a,b) => b.count - a.count)[0]?.label : '-'}
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-6">
                  <PieChart className="w-5 h-5 text-purple-500" /> Distribution
                </h3>
                <SimplePieChart data={chartData} />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold flex items-center gap-2 mb-4">
                  <BarChart2 className="w-5 h-5 text-orange-500" /> Count by Type
                </h3>
                <SimpleBarChart data={chartData} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}