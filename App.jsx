import React, { useState, useEffect, useMemo } from 'react';
import { Camera, BarChart2, PieChart, List, FileText, Download, Share2, Filter, AlertCircle, Calendar } from 'lucide-react';

// --- MOCK_DATA เดิม (เก็บไว้กัน Error กรณี API ไม่ทำงาน) ---
// ส่วนนี้จะถูกแทนที่ด้วยข้อมูลจาก API ถ้าเชื่อมต่อสำเร็จ
const FALLBACK_DATA = [
  { id: 1, label: 'No Data', confidence: 0, x: 0, y: 0, width: 0, height: 0, color: '#9CA3AF' }
];

// --- Helper Components for Charts (คงเดิม) ---

const SimpleBarChart = ({ data }) => {
  // ป้องกัน Error กรณี data ว่าง
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-400">No Data</div>;
  
  const maxVal = Math.max(...data.map(d => d.count)) || 1;
  return (
    // แก้ไข 1: ลบ items-end ออก เพื่อให้มันยืดเต็มความสูง (items-stretch)
    <div className="flex justify-around h-40 sm:h-48 w-full gap-2 pt-4">
      {data.map((item, idx) => (
        // แก้ไข 2: เพิ่ม h-full และ justify-end เพื่อดันกราฟกับตัวหนังสือให้เต็มพื้นที่และอยู่ล่างสุด
        <div key={idx} className="flex flex-col items-center justify-end w-full group h-full">
          
          {/* แก้ไข 3: เปลี่ยนจาก h-full เป็น flex-1 เพื่อให้พื้นที่กราฟกินที่ว่างที่เหลือทั้งหมดเหนือตัวหนังสือ */}
          <div className="relative w-full flex-1 flex justify-center items-end pb-2">
            <div 
              className="w-full sm:w-2/3 rounded-t-md transition-all duration-500 hover:opacity-80 relative"
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
          
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium truncate w-full text-center h-4">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const SimplePieChart = ({ data }) => {
  // ป้องกัน Error กรณี data ว่าง
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State สำหรับรับข้อมูล API
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch API
  useEffect(() => {
    // รีเซ็ต state ก่อนโหลดใหม่
    setLoading(true);
    setError(null);

    fetch('http://localhost:3000/api/analysis')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setApiData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching API:", err);
        setError("ไม่สามารถเชื่อมต่อกับ Server ได้ (แสดงข้อมูลตัวอย่างแทน)");
        setLoading(false);
      });
  }, []); // ทำงานครั้งเดียวเมื่อเปิดเว็บ

  // 2. แปลงข้อมูล (Transform Data)
  const chartData = useMemo(() => {
    // ถ้าไม่มีข้อมูลจาก API หรือกำลังโหลด ให้ใช้ค่าว่าง
    if (!apiData || !apiData.summary) return [];

    // Map สีตามประเภทพลาสติก
    const colorMap = {
      'PET': '#3B82F6',   // Blue
      'HDPE': '#10B981',  // Green
      'PVC': '#EF4444',   // Red
      'LDPE': '#F59E0B',  // Yellow
      'PP': '#8B5CF6',    // Purple
      'PS': '#EC4899',    // Pink
      'Other': '#6B7280', // Gray
      'Fragment': '#EF4444', // (เผื่อชื่อเดิม)
      'Pellet': '#3B82F6',
      'Fiber': '#10B981',
      'Film': '#F59E0B'
    };

    return apiData.summary.map(item => ({
      label: item.type,            // API ส่งมาเป็น 'type' เราใช้ 'label'
      count: item.count,           // เหมือนเดิม
      color: colorMap[item.type] || '#9CA3AF' // สีเริ่มต้นถ้าหาไม่เจอ
    }));
  }, [apiData]);

  // Handle Export
  const handleExport = () => {
    alert(`กำลัง Export ข้อมูลของวันที่: ${selectedDate}`);
  };

  // ถ้ากำลังโหลด ให้แสดงหน้า Loading
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">
       <div className="text-center">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
         <p>Loading Dashboard...</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-10">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between h-auto sm:h-16 py-3 sm:py-0 gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                 <Filter className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">MicroPlast AI</h1>
                <p className="text-xs text-gray-500">Automated Analysis System</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">ผลลัพธ์การวิเคราะห์</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2">
            <span>Date: {selectedDate}</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" /> Analysis Complete
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Image & Detection */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <Camera className="w-5 h-5 text-blue-500" />
                  ภาพที่ตรวจจับ
                </h3>
                <span className="text-[10px] sm:text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Processing Done</span>
              </div>
              
              {/* Image Container */}
              <div className="relative bg-gray-900 w-full aspect-video overflow-hidden group flex items-center justify-center">
                 {apiData?.imageUrl ? (
                   <img 
                     src={apiData.imageUrl} 
                     alt="Microplastic Sample" 
                     className="w-full h-full object-cover opacity-90"
                     onError={(e) => {
                       e.target.onerror = null; 
                       e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found"; // รูปสำรองถ้าหาไฟล์ไม่เจอ
                     }}
                   />
                 ) : (
                   <div className="text-gray-400 text-sm">No Image Available</div>
                 )}
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <List className="w-5 h-5 text-blue-500" />
                  สรุปจำนวนตามชนิด
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                      <th className="px-4 sm:px-6 py-3">ชนิด (Type)</th>
                      <th className="px-4 sm:px-6 py-3 text-right sm:text-left">จำนวน (Count)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {chartData.length > 0 ? chartData.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3">
                          <span className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                            {item.label}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 font-mono text-gray-700 font-bold text-lg text-right sm:text-left">
                          {item.count}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="2" className="px-6 py-4 text-center text-gray-400">ไม่มีข้อมูล</td>
                      </tr>
                    )}
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
                <div className="text-gray-500 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Total Count</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                   {chartData.reduce((acc, cur) => acc + cur.count, 0)}
                </div>
                <div className="text-green-600 text-[10px] sm:text-xs mt-1 flex items-center">
                  Detected objects
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-[10px] sm:text-xs uppercase font-bold tracking-wider">Dominant Type</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1 truncate">
                  {chartData.length > 0 
                    ? [...chartData].sort((a,b) => b.count - a.count)[0]?.label 
                    : '-'}
                </div>
                <div className="text-gray-400 text-[10px] sm:text-xs mt-1">
                  Most frequent
                </div>
              </div>
            </div>

            {/* Pie Chart Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-6 text-sm sm:text-base">
                <PieChart className="w-5 h-10 text-purple-500" />
                สัดส่วนชนิดพลาสติก
              </h3>
              <SimplePieChart data={chartData} />
            </div>

            {/* Bar Chart Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm sm:text-base">
                <BarChart2 className="w-5 h-10 text-orange-500" />
                จำนวนแยกตามประเภท
              </h3>
              <SimpleBarChart data={chartData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
