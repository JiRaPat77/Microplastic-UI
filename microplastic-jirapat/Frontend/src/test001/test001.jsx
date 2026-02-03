import React, { useState, useMemo } from 'react';
import { Camera, BarChart2, PieChart, List, FileText, Download, Share2, Filter, AlertCircle } from 'lucide-react';

// --- Mock Data: จำลองข้อมูล Output จาก ML Model ---
const MOCK_IMAGE_URL = "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1000&auto=format&fit=crop";

const MOCK_DETECTIONS = [
  { id: 1, label: 'Fragment', confidence: 0.98, x: 20, y: 30, width: 10, height: 8, color: '#EF4444' }, // Red
  { id: 2, label: 'Pellet', confidence: 0.95, x: 50, y: 40, width: 5, height: 5, color: '#3B82F6' },   // Blue
  { id: 3, label: 'Fiber', confidence: 0.88, x: 70, y: 20, width: 15, height: 2, color: '#10B981' },   // Green
  { id: 4, label: 'Fragment', confidence: 0.92, x: 30, y: 60, width: 12, height: 10, color: '#EF4444' },
  { id: 5, label: 'Film', confidence: 0.85, x: 60, y: 70, width: 20, height: 15, color: '#F59E0B' },   // Yellow
  { id: 6, label: 'Pellet', confidence: 0.91, x: 10, y: 80, width: 6, height: 6, color: '#3B82F6' },
  { id: 7, label: 'Fiber', confidence: 0.82, x: 80, y: 50, width: 10, height: 3, color: '#10B981' },
];

// --- Helper Components for Charts (Custom SVG to avoid external deps) ---

const SimpleBarChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.count));
  return (
    <div className="flex items-end justify-around h-48 w-full gap-2 pt-4">
      {data.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center w-full group">
          <div className="relative w-full flex justify-center items-end h-full">
            <div 
              className="w-2/3 rounded-t-md transition-all duration-500 hover:opacity-80"
              style={{ 
                height: `${(item.count / maxVal) * 100}%`, 
                backgroundColor: item.color 
              }}
            >
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.count}
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-500 mt-2 font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const SimplePieChart = ({ data }) => {
  const total = data.reduce((acc, cur) => acc + cur.count, 0);
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((item) => {
    const startPercent = cumulativePercent;
    const slicePercent = item.count / total;
    cumulativePercent += slicePercent;
    const endPercent = cumulativePercent;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    const pathData = [
      `M 1 0`, // Move to center (normalized coords, handled by viewbox)
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, // Draw Arc
      `L 0 0`, // Line back to center
    ].join(' ');

    return { ...item, percent: slicePercent * 100 };
  });

  // Using Conic Gradient for easiest pure CSS implementation in React without heavy math libraries
  const conicGradient = data.reduce((acc, item, index) => {
    const prevPerc = data.slice(0, index).reduce((p, c) => p + (c.count / total) * 100, 0);
    const currentPerc = (item.count / total) * 100;
    return `${acc}${index === 0 ? '' : ','} ${item.color} ${prevPerc}% ${prevPerc + currentPerc}%`;
  }, '');

  return (
    <div className="flex items-center justify-center gap-8">
      <div 
        className="w-40 h-40 rounded-full shadow-inner relative"
        style={{ background: `conic-gradient(${conicGradient})` }}
      >
        <div className="absolute inset-0 m-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
           <div className="text-center">
             <span className="block text-2xl font-bold text-gray-800">{total}</span>
             <span className="text-[10px] text-gray-500 uppercase">ชิ้นทั้งหมด</span>
           </div>
        </div>
      </div>
      
      <div className="space-y-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center text-sm">
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
            <span className="text-gray-600 w-20">{item.label}</span>
            <span className="font-bold text-gray-800">{Math.round((item.count/total)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function MicroplasticDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Process Data for Charts
  const chartData = useMemo(() => {
    const counts = {};
    const colors = {};
    
    MOCK_DETECTIONS.forEach(d => {
      counts[d.label] = (counts[d.label] || 0) + 1;
      colors[d.label] = d.color;
    });

    return Object.keys(counts).map(key => ({
      label: key,
      count: counts[key],
      color: colors[key]
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                 <Filter className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">MicroPlast AI</h1>
                <p className="text-xs text-gray-500">Automated Analysis System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">ผลลัพธ์การวิเคราะห์ (Analysis Results)</h2>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span>ID: #MP-2023-8842</span>
            <span>•</span>
            <span>Date: 25 Oct 2023, 14:30</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" /> Analysis Complete
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image & Detection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  ภาพที่ตรวจจับ (Detection Output)
                </h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Confidence &gt; 80%</span>
              </div>
              
              {/* Image Container */}
              <div className="relative bg-gray-900 w-full aspect-video overflow-hidden group">
                {/* Background Image */}
                <img 
                  src={MOCK_IMAGE_URL} 
                  alt="Microplastic Sample" 
                  className="w-full h-full object-cover opacity-80"
                />
                
                {/* Bounding Boxes Overlay */}
                {MOCK_DETECTIONS.map((det) => (
                  <div
                    key={det.id}
                    className="absolute border-2 hover:bg-white/10 cursor-pointer transition-colors group/box"
                    style={{
                      left: `${det.x}%`,
                      top: `${det.y}%`,
                      width: `${det.width}%`,
                      height: `${det.height}%`,
                      borderColor: det.color,
                    }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-7 left-0 bg-gray-900/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover/box:opacity-100 transition-opacity pointer-events-none z-10">
                      {det.label} ({Math.round(det.confidence * 100)}%)
                    </div>
                  </div>
                ))}
                
                <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                  Found {MOCK_DETECTIONS.length} Objects
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold flex items-center gap-2">
                  <List className="w-5 h-5 text-blue-500" />
                  สรุปจำนวนตามชนิด (Summary by Type)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-6 py-3">ชนิด (Type)</th>
                      <th className="px-6 py-3">จำนวน (Count)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {chartData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                            {item.label}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono text-gray-700 font-bold text-lg">
                          {item.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Analytics (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total Count</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{MOCK_DETECTIONS.length}</div>
                <div className="text-green-600 text-xs mt-1 flex items-center">
                  +12% from last sample
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-xs uppercase font-bold tracking-wider">Dominant Type</div>
                <div className="text-3xl font-bold text-blue-600 mt-1">
                  {chartData.sort((a,b) => b.count - a.count)[0]?.label}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  Most frequent
                </div>
              </div>
            </div>

            {/* Pie Chart Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-purple-500" />
                สัดส่วนชนิดพลาสติก (Distribution)
              </h3>
              <SimplePieChart data={chartData} />
            </div>

            {/* Bar Chart Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <BarChart2 className="w-5 h-5 text-orange-500" />
                จำนวนแยกตามประเภท (Count by Type)
              </h3>
              <SimpleBarChart data={chartData} />
            </div>

            {/* Export Actions */}
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
              <div className="flex items-start gap-3">
                 <FileText className="w-5 h-5 text-blue-600 mt-1" />
                 <div>
                   <h4 className="font-semibold text-blue-900 text-sm">ดาวน์โหลดรายงานฉบับเต็ม</h4>
                   <p className="text-blue-700 text-xs mt-1">รวมรูปภาพต้นฉบับ ข้อมูล Metadata และไฟล์ CSV</p>
                   <button className="mt-3 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors">
                     Download .PDF
                   </button>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}