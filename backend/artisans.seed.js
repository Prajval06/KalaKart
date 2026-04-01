const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/user.model');

const artisans = [
  {
    full_name:    'Ramesh Kumar',
    email:        'ramesh@kalakart.com',
    role:         'artisan',
    authMethod:   'email',
    is_active:    true,
    profileImage: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
  },
  {
    full_name:    'Meera Devi',
    email:        'meera@kalakart.com',
    role:         'artisan',
    authMethod:   'email',
    is_active:    true,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  },
  {
    full_name:    'Anjali Patel',
    email:        'anjali@kalakart.com',
    role:         'artisan',
    authMethod:   'email',
    is_active:    true,
    profileImage: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=400',
  },
  {
    full_name:    'Vikram Joshi',
    email:        'vikram@kalakart.com',
    role:         'artisan',
    authMethod:   'email',
    is_active:    true,
    profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
  },
  {
    full_name:    'Priya Singh',
    email:        'priya@kalakart.com',
    role:         'artisan',
    authMethod:   'email',
    is_active:    true,
    profileImage: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400',
  },
  {
    full_name:    'Arjun Sharma',
    email:        'arjun@kalakart.com',
    role:         'artisan',
    authMethod:   'email',
    is_active:    true,
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
  {
    full_name:    'Lakshmi Nair',
    email:        'lakshmi@kalakart.com',
    role:         'artisan',
    authMethod:   'email',
    is_active:    true,
    profileImage: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=400',
  },
];

const seedArtisans = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected...');

    // Remove existing artisan accounts
    await User.deleteMany({ role: 'artisan' });
    console.log('🗑️  Cleared existing artisans');

    // Insert artisans
    const created = await User.insertMany(artisans);
    console.log(`🎉 Created ${created.length} artisans!`);

    created.forEach(a => console.log(`  ✅ ${a.full_name} — ${a.email}`));

    const total = await User.countDocuments({ role: 'artisan' });
    console.log(`\n📊 Total artisans in DB: ${total}`);
    console.log('✅ Done!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
};

seedArtisans();