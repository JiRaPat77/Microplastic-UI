// import { Card, CardMedia, CardContent, Typography, Grid, Paper } from '@mui/material';
// import { useState, useEffect } from 'react';

// export default function ImageGallery() {
//   const [images, setImages] = useState([]);

//   useEffect(() => {
//     const imageList = [
//       { id: 1, src: '/images/sample1.png', caption: 'Sample 1' },
//       { id: 2, src: '/images/sample2.png', caption: 'Sample 2' },
//     ];
//     setImages(imageList);
//   }, []);

//   return (
//     <Paper 
//       elevation={3} 
//       sx={{ 
//         p: { xs: 2, sm: 2.5, md: 3 }, // padding ปรับตามหน้าจอ
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
//         📸 Captured Images
//       </Typography>
//       <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
//         {images.map((image) => (
//           <Grid 
//             item 
//             xs={12}  // มือถือ: 1 คอลัมน์ (full width)
//             sm={6}   // แท็บเล็ต: 2 คอลัมน์
//             md={4}   // คอม: 3 คอลัมน์
//             lg={3}   // จอใหญ่: 4 คอลัมน์
//             key={image.id}
//           >
//             <Card 
//               elevation={4} 
//               sx={{ 
//                 transition: 'transform 0.3s', 
//                 '&:hover': { transform: 'scale(1.05)' } 
//               }}
//             >
//               <CardMedia
//                 component="img"
//                 height="200"
//                 image={image.src}
//                 alt={image.caption}
//                 onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
//                 sx={{ objectFit: 'cover' }}
//               />
//               <CardContent>
//                 <Typography variant="body2" color="text.secondary">
//                   {image.caption}
//                 </Typography>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Paper>
//   );
// }


// ImageGallery.jsx
import { Card, CardMedia, CardContent, Typography, Grid, Paper } from '@mui/material';
import { useEffect, useState } from 'react';

export default function ImageGallery() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const imageList = [
      { id: 1, src: '/images/sample1.png', caption: 'Sample 1' },
      { id: 2, src: '/images/sample2.png', caption: 'Sample 2' },
    ];
    setImages(imageList);
  }, []);

  return (
    <Paper elevation={2} sx={{ p: 2.5 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Captured Images
      </Typography>
      <Grid container spacing={2}>
        {images.map((image) => (
          <Grid item xs={12} sm={6} key={image.id}>
            <Card sx={{ height: '100%' }}>
              <CardMedia
                component="img"
                src={image.src}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x250?text=No+Image';
                }}
                sx={{ height: 180, objectFit: 'cover' }}
              />
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="body2">{image.caption}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
