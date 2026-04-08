export interface Artisan {
  id: string;
  name: string;
  craft: string;
  state: string;
  bio: string;
  image: string;
  yearsOfExperience: number;
  specialization: string;
}

export const artisans: Artisan[] = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    craft: 'Pottery & Ceramics',
    state: 'Gujarat',
    bio: 'Third-generation potter specializing in traditional terracotta and blue pottery techniques.',
    image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=400&h=400&q=80',
    yearsOfExperience: 25,
    specialization: 'Terracotta & Blue Pottery',
  },
  {
    id: '2',
    name: 'Meera Devi',
    craft: 'Textiles & Fabrics',
    state: 'Rajasthan',
    bio: 'Master of traditional block printing and natural dyeing techniques passed down through generations.',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=400&h=400&q=80',
    yearsOfExperience: 18,
    specialization: 'Block Printing & Natural Dyes',
  },
  {
    id: '3',
    name: 'Lakshmi Sharma',
    craft: 'Jewelry',
    state: 'Rajasthan',
    bio: 'Skilled jewelry artisan creating exquisite Kundan and Meenakari pieces with traditional techniques.',
    image: 'https://images.unsplash.com/photo-1606406054219-619c4c2e2100?auto=format&fit=crop&w=400&h=400&q=80',
    yearsOfExperience: 22,
    specialization: 'Kundan & Meenakari',
  },
  {
    id: '4',
    name: 'Anjali Patel',
    craft: 'Art & Paintings',
    state: 'Maharashtra',
    bio: 'Contemporary artist specializing in mandala art and traditional Indian painting styles.',
    image: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?auto=format&fit=crop&w=400&h=400&q=80',
    yearsOfExperience: 15,
    specialization: 'Mandala Art',
  },
  {
    id: '5',
    name: 'Suresh Reddy',
    craft: 'Woodwork',
    state: 'Karnataka',
    bio: 'Expert woodcarver creating intricate designs inspired by temple architecture and nature.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
    yearsOfExperience: 30,
    specialization: 'Intricate Wood Carving',
  },
  {
    id: '6',
    name: 'Priya Singh',
    craft: 'Basket Weaving',
    state: 'Assam',
    bio: 'Traditional basket weaver using indigenous techniques and natural materials from the region.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
    yearsOfExperience: 12,
    specialization: 'Natural Fiber Weaving',
  },
  {
    id: '7',
    name: 'Vikram Joshi',
    craft: 'Metal Work',
    state: 'Uttar Pradesh',
    bio: 'Fourth-generation brass artisan specializing in traditional diyas and decorative items.',
    image: 'https://images.unsplash.com/photo-1614436163996-25cee5f54290?auto=format&fit=crop&w=400&h=400&q=80',
    yearsOfExperience: 28,
    specialization: 'Brass Metalwork',
  },
];
