export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  artisan: string;
  artisanId: string;
  image: string;
  description: string;
  state: string;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Handcrafted Terracotta Vase',
    price: 1299,
    category: 'Pottery & Ceramics',
    artisan: 'Ramesh Kumar',
    artisanId: '1',
    image: 'https://images.unsplash.com/photo-1768321481665-b40705ab11ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBoYW5kaWNyYWZ0cyUyMHBvdHRlcnl8ZW58MXx8fHwxNzcwOTE2MzMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Beautiful hand-molded terracotta vase with traditional designs from Gujarat.',
    state: 'Gujarat',
  },
  {
    id: '2',
    name: 'Block Printed Cotton Saree',
    price: 3499,
    category: 'Textiles & Fabrics',
    artisan: 'Meera Devi',
    artisanId: '2',
    image: 'https://images.unsplash.com/photo-1762764214015-d5c22646465b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB0ZXh0aWxlJTIwZmFicmljfGVufDF8fHx8MTc3MDkxNjMzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Traditional Rajasthani block-printed cotton saree with natural dyes.',
    state: 'Rajasthan',
  },
  {
    id: '3',
    name: 'Kundan Jewelry Set',
    price: 5999,
    category: 'Jewelry',
    artisan: 'Lakshmi Sharma',
    artisanId: '3',
    image: 'https://images.unsplash.com/photo-1707222609380-fe23be31c883?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBqZXdlbHJ5JTIwdHJhZGl0aW9uYWx8ZW58MXx8fHwxNzcwOTE2MzMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Exquisite Kundan jewelry set handcrafted with semi-precious stones.',
    state: 'Rajasthan',
  },
  {
    id: '4',
    name: 'Mandala Wall Art',
    price: 2499,
    category: 'Art & Paintings',
    artisan: 'Anjali Patel',
    artisanId: '4',
    image: 'https://images.unsplash.com/photo-1628450860617-97f211be90b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBtYW5kYWxhJTIwYXJ0fGVufDF8fHx8MTc3MDkxNjMzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Hand-painted mandala art on canvas with intricate patterns.',
    state: 'Maharashtra',
  },
  {
    id: '5',
    name: 'Carved Wooden Box',
    price: 1899,
    category: 'Home Decor',
    artisan: 'Suresh Reddy',
    artisanId: '5',
    image: 'https://images.unsplash.com/photo-1762342345465-d021b8491309?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjB3b29kZW4lMjBoYW5kaWNyYWZ0c3xlbnwxfHx8fDE3NzA5MTYzMzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Intricately carved wooden jewelry box with traditional motifs.',
    state: 'Karnataka',
  },
  {
    id: '6',
    name: 'Handwoven Basket Set',
    price: 899,
    category: 'Home Decor',
    artisan: 'Priya Singh',
    artisanId: '6',
    image: 'https://images.unsplash.com/photo-1768902406144-a348c559c73c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBiYXNrZXQlMjB3ZWF2aW5nfGVufDF8fHx8MTc3MDkxNjMzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Set of 3 handwoven baskets made from natural materials.',
    state: 'Assam',
  },
  {
    id: '7',
    name: 'Brass Diya Set',
    price: 1599,
    category: 'Home Decor',
    artisan: 'Vikram Joshi',
    artisanId: '7',
    image: 'https://images.unsplash.com/photo-1767338718657-9006d701ce6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBicmFzcyUyMG1ldGFsd29ya3xlbnwxfHx8fDE3NzA5MTYzMzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Traditional brass diyas with intricate engravings, set of 5.',
    state: 'Uttar Pradesh',
  },
  {
    id: '8',
    name: 'Blue Pottery Bowl',
    price: 799,
    category: 'Pottery & Ceramics',
    artisan: 'Ramesh Kumar',
    artisanId: '1',
    image: 'https://images.unsplash.com/photo-1768321481665-b40705ab11ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBoYW5kaWNyYWZ0cyUyMHBvdHRlcnl8ZW58MXx8fHwxNzcwOTE2MzMzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Classic Jaipur blue pottery bowl with floral patterns.',
    state: 'Rajasthan',
  },
];

export const categories = [
  'All',
  'Pottery & Ceramics',
  'Textiles & Fabrics',
  'Jewelry',
  'Art & Paintings',
  'Home Decor',
];
