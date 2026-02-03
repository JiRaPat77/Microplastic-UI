// import { DataGrid } from '@mui/x-data-grid';
// import { Paper, Typography, Box, Chip, useMediaQuery, useTheme } from '@mui/material';
// import { useState, useEffect } from 'react';
// import { getPlasticColor } from '../utils/colorMapping';

// export default function PlasticTable() {
//   const [data, setData] = useState([]);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // ตรวจสอบว่าเป็นมือถือหรือไม่

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

//   const columns = [
//     { 
//       field: 'id', 
//       headerName: 'ลำดับ', 
//       width: isMobile ? 70 : 100, // ปรับความกว้างตามหน้าจอ
//       headerAlign: 'center',
//       align: 'center'
//     },
//     { 
//       field: 'type', 
//       headerName: 'ชนิด Plastic', 
//       flex: 1, // ใช้ flex แทน width เพื่อให้ยืดหยุ่น
//       minWidth: isMobile ? 150 : 250,
//       renderCell: (params) => (
//         <Chip 
//           label={params.value} 
//           size={isMobile ? "small" : "medium"} // ขนาด chip ปรับตามหน้าจอ
//           sx={{ 
//             bgcolor: params.row.color, 
//             color: 'white', 
//             fontWeight: 'bold',
//             fontSize: { xs: '0.75rem', sm: '0.875rem' }
//           }}
//         />
//       )
//     },
//     { 
//       field: 'count', 
//       headerName: 'จำนวน', 
//       width: isMobile ? 80 : 150,
//       headerAlign: 'center',
//       align: 'center',
//       renderCell: (params) => (
//         <Typography 
//           variant={isMobile ? "body1" : "h6"}
//           sx={{ fontWeight: 'bold', color: '#2196F3' }}
//         >
//           {params.value}
//         </Typography>
//       )
//     }
//   ];

//   return (
//     <Paper 
//       elevation={3} 
//       sx={{ 
//         p: { xs: 2, sm: 2.5, md: 3 }, 
//         mb: { xs: 2, sm: 2.5, md: 3 } 
//       }}
//     >
//       <Typography 
//         variant="h5" 
//         gutterBottom 
//         sx={{ 
//           mb: { xs: 2, md: 3 }, 
//           fontWeight: 'bold', 
//           color: '#2196F3',
//           fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
//         }}
//       >
//         📊 Detected Plastic Types
//       </Typography>
//       <Box sx={{ 
//         height: { xs: 400, sm: 450, md: 500 }, // ความสูงปรับตามหน้าจอ
//         width: '100%' 
//       }}>
//         <DataGrid
//           rows={data}
//           columns={columns}
//           pageSize={isMobile ? 5 : 10} // แสดงน้อยกว่าบนมือถือ
//           rowsPerPageOptions={isMobile ? [5, 10] : [10, 20]}
//           disableSelectionOnClick
//           sx={{
//             '& .MuiDataGrid-cell': { 
//               fontSize: { xs: '12px', sm: '13px', md: '14px' }
//             },
//             '& .MuiDataGrid-columnHeaders': { 
//               backgroundColor: '#f5f5f5', 
//               fontSize: { xs: '13px', sm: '14px', md: '16px' },
//               fontWeight: 'bold'
//             }
//           }}
//         />
//       </Box>
//     </Paper>
//   );
// }




// PlasticTable.jsx
import { DataGrid } from '@mui/x-data-grid';
import { Paper, Typography, Box, Chip, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { getPlasticColor } from '../utils/colorMapping';

export default function PlasticTable() {
  const [data, setData] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetch('/data.json')
      .then((r) => r.json())
      .then((jsonData) =>
        setData(
          jsonData.map((item, idx) => ({
            id: idx + 1,
            ...item,
            color: getPlasticColor(item.type),
          }))
        )
      )
      .catch(console.error);
  }, []);

  const columns = [
    {
      field: 'id',
      headerName: 'ลำดับ',
      width: isMobile ? 60 : 80,
      headerAlign: 'center',
      align: 'center',
    },
    {
      field: 'type',
      headerName: 'ชนิด Plastic',
      flex: 1,
      minWidth: isMobile ? 150 : 220,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: params.row.color,
            color: '#fff',
            fontWeight: 500,
          }}
        />
      ),
    },
    {
      field: 'count',
      headerName: 'จำนวน',
      width: isMobile ? 80 : 100,
      headerAlign: 'center',
      align: 'center',
    },
  ];

  return (
    <Paper elevation={2} sx={{ p: 2.5, width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Detected Plastic Types
      </Typography>
      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 6, page: 0 } },
          }}
          disableRowSelectionOnClick
          density="compact"
        />
      </Box>
    </Paper>
  );
}

