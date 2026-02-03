// กำหนดสีสำหรับแต่ละประเภท plastic
export const plasticColorMap = {
  'PET': '#FF6384',
  'HDPE': '#36A2EB',
  'PVC': '#FFCE56',
  'LDPE': '#4BC0C0',
  'PP': '#9966FF',
  'PS': '#FF9F40',
  // เพิ่มประเภทอื่นๆ ตามต้องการ
};

// ฟังก์ชันสำหรับดึงสีตาม type (มี fallback color ถ้าไม่เจอ)
export const getPlasticColor = (type) => {
  return plasticColorMap[type] || '#999999';
};
