// import { Paper, Typography, Grid, Box } from '@mui/material';
// import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { useState, useEffect } from 'react';
// import { getPlasticColor } from '../utils/colorMapping';

// export default function PlasticChart() {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     fetch('/data.json')
//       .then(response => response.json())
//       .then(jsonData => {
//         const dataWithColors = jsonData.map(item => ({
//           ...item,
//           color: getPlasticColor(item.type)
//         }));
//         setData(dataWithColors);
//       })
//       .catch(error => console.error('Error loading data:', error));
//   }, []);

//   return (
//     <Paper 
//       elevation={3} 
//       sx={{ 
//         p: { xs: 2, sm: 3, md: 4 }, 
//         mb: { xs: 2, sm: 3, md: 4 },
//         width: '100%',
//         boxSizing: 'border-box'
//       }}
//     >
//       <Typography 
//         variant="h5" 
//         gutterBottom 
//         sx={{ 
//           mb: 3, 
//           fontWeight: 'bold', 
//           color: '#2196F3',
//           fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2rem' }
//         }}
//       >
//         📈 Data Visualization
//       </Typography>
//       <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
//         {/* Bar Chart */}
//         <Grid item xs={12} lg={6}>
//           <Box sx={{ width: '100%', height: 400 }}>
//             <Typography 
//               variant="h6" 
//               align="center"
//               sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } }}
//             >
//               Bar Chart
//             </Typography>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis 
//                   dataKey="type" 
//                   angle={-45} 
//                   textAnchor="end" 
//                   height={100}
//                   style={{ fontSize: '14px' }}
//                 />
//                 <YAxis style={{ fontSize: '14px' }} />
//                 <Tooltip contentStyle={{ fontSize: '14px' }} />
//                 <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
//                 <Bar dataKey="count" fill="#2196F3" radius={[8, 8, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </Box>
//         </Grid>
        
//         {/* Pie Chart */}
//         <Grid item xs={12} lg={6}>
//           <Box sx={{ width: '100%', height: 400 }}>
//             <Typography 
//               variant="h6" 
//               align="center"
//               sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.25rem' } }}
//             >
//               Pie Chart
//             </Typography>
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={data}
//                   dataKey="count"
//                   nameKey="type"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   label={(entry) => entry.type}
//                   labelLine={true}
//                 >
//                   {data.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip contentStyle={{ fontSize: '14px' }} />
//                 <Legend wrapperStyle={{ fontSize: '13px' }} />
//               </PieChart>
//             </ResponsiveContainer>
//           </Box>
//         </Grid>
//       </Grid>
//     </Paper>
//   );
// }


// PlasticChart.jsx
import { Paper, Typography, Grid, Box } from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { getPlasticColor } from '../utils/colorMapping';

export default function PlasticChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/data.json')
      .then((r) => r.json())
      .then((jsonData) =>
        setData(jsonData.map((it) => ({ ...it, color: getPlasticColor(it.type) })))
      )
      .catch(console.error);
  }, []);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Data Visualization
      </Typography>

      <Grid container spacing={2} alignItems="stretch">
        {/* Bar Chart */}
        <Grid item xs={12} md={7}>
          <Box sx={{ width: '100%', height: 360 }}>
            <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
              Bar Chart
            </Typography>
            <Box sx={{ width: '100%', height: 'calc(100% - 28px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 16, right: 16, left: 8, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="type"
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="count" fill="#2196F3" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={5}>
          <Box sx={{ width: '100%', height: 360 }}>
            <Typography variant="subtitle1" align="center" sx={{ mb: 1 }}>
              Pie Chart
            </Typography>
            <Box sx={{ width: '100%', height: 'calc(100% - 28px)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="count"
                    nameKey="type"
                    cx="45%"
                    cy="50%"
                    outerRadius="70%"
                  >
                    {data.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
