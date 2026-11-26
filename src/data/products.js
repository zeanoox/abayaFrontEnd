// Demo catalogue — used until the backend API is connected (see src/api.js).
export const categories = [
  { id: 'daily', name: 'عبايات يومية', desc: 'قصّات عملية بأناقة هادئة' },
  { id: 'colored', name: 'عبايات ملوّنة', desc: 'ألوان ترابية ناعمة' },
  { id: 'occasion', name: 'عبايات المناسبات', desc: 'تطريز وتفاصيل فاخرة' },
  { id: 'hijab', name: 'الطُّرَح', desc: 'أقمشة خفيفة بألوان متناسقة' },
];

export const products = [
  { id: 1, name: 'عباية زيتون مطرّزة', category: 'occasion', price: 389, color: '#5f6146', accent: '#e9e1cf', isNew: true },
  { id: 2, name: 'عباية رملية كلاسيك', category: 'daily', price: 259, color: '#b9a88c', accent: '#f3ede2', isNew: true },
  { id: 3, name: 'عباية سوداء بكم واسع', category: 'daily', price: 229, color: '#1f1e1c', accent: '#cbb994', isNew: true },
  { id: 4, name: 'عباية موكا بحزام', category: 'colored', price: 279, oldPrice: 319, color: '#6e5848', accent: '#efe6d8', isNew: true },
  { id: 5, name: 'عباية مريمية ناعمة', category: 'colored', price: 269, color: '#8f9a7f', accent: '#f1efe5', isNew: true },
  { id: 6, name: 'عباية كحلي دانتيل', category: 'occasion', price: 419, color: '#252b3d', accent: '#d8c9a8', isNew: false },
  { id: 7, name: 'عباية بيج كتان', category: 'daily', price: 239, color: '#d3c3a6', accent: '#faf6ee', isNew: false },
  { id: 8, name: 'عباية عنابي مخملية', category: 'colored', price: 339, color: '#5b2430', accent: '#e6cfc0', isNew: false },
  { id: 9, name: 'طرحة شيفون – زيتي', category: 'hijab', price: 49, color: '#5f6146', accent: '#f3ede2', isNew: false, type: 'hijab' },
  { id: 10, name: 'طرحة جيرسي – بيج', category: 'hijab', price: 45, color: '#cdbb9c', accent: '#faf6ee', isNew: false, type: 'hijab' },
  { id: 11, name: 'طرحة دانتيل – أسود', category: 'hijab', price: 59, color: '#1f1e1c', accent: '#cbb994', isNew: false, type: 'hijab' },
  { id: 12, name: 'طرحة حرير – موكا', category: 'hijab', price: 55, color: '#6e5848', accent: '#efe6d8', isNew: false, type: 'hijab' },
];

export const CURRENCY = 'ر.س';
