const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/database');
const { User, Restaurant, Category, Dish, Table } = require('./models');

// Demo data
const seedData = async () => {
    try {
        await connectDB();

        console.log('🗑️ Clearing existing data...');
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Category.deleteMany({});
        await Dish.deleteMany({});
        await Table.deleteMany({});

        console.log('👤 Creating demo users...');
        const adminUser = await User.create({
            email: 'demo@restaurant.com',
            password: 'demo123456',
            name: 'Demo Restaurant Owner',
            role: 'admin',
            isEmailVerified: true
        });

        const customerUser = await User.create({
            email: 'customer@example.com',
            password: 'customer123',
            name: 'John Doe',
            role: 'customer',
            phone: '+91 98765 00000',
            isEmailVerified: true
        });

        console.log('🏪 Creating demo restaurant...');
        const restaurant = await Restaurant.create({
            name: 'The Spice Garden',
            description: 'Experience authentic Indian cuisine with a modern twist. Our dishes are crafted with love and served with passion.',
            owner: adminUser._id,
            cuisine: ['Indian', 'Asian', 'Fusion'],
            address: {
                street: '123 Food Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                country: 'India',
                zipCode: '400001'
            },
            contact: {
                phone: '+91 98765 43210',
                email: 'info@spicegarden.com',
                website: 'https://spicegarden.com'
            },
            settings: {
                primaryColor: '#FF6B6B',
                secondaryColor: '#4ECDC4',
                theme: 'dark',
                showAR: true,
                showVR: true,
                show360: true
            }
        });

        // Update admin user with restaurant
        adminUser.restaurant = restaurant._id;
        await adminUser.save();

        console.log('📂 Creating categories...');
        const categories = await Category.create([
            { name: 'Starters', description: 'Delicious appetizers to begin your meal', icon: '🥗', restaurant: restaurant._id, displayOrder: 1 },
            { name: 'Main Course', description: 'Hearty main dishes', icon: '🍛', restaurant: restaurant._id, displayOrder: 2 },
            { name: 'Biryanis', description: 'Aromatic rice dishes', icon: '🍚', restaurant: restaurant._id, displayOrder: 3 },
            { name: 'Breads', description: 'Fresh baked Indian breads', icon: '🫓', restaurant: restaurant._id, displayOrder: 4 },
            { name: 'Desserts', description: 'Sweet endings', icon: '🍮', restaurant: restaurant._id, displayOrder: 5 },
            { name: 'Beverages', description: 'Refreshing drinks', icon: '🥤', restaurant: restaurant._id, displayOrder: 6 }
        ]);

        console.log('🍽️ Creating dishes...');
        const dishes = await Dish.create([
            // Starters
            {
                name: 'Paneer Tikka',
                description: 'Marinated cottage cheese cubes grilled to perfection with bell peppers and onions',
                price: 295,
                currency: 'INR',
                category: categories[0]._id,
                categoryName: 'Starters',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 2,
                isFeatured: true,
                isPopular: true,
                preparationTime: 20,
                servingSize: '8 pieces',
                processingStatus: 'no_model',
                displayOrder: 1
            },
            {
                name: 'Chicken Malai Kebab',
                description: 'Creamy, tender chicken pieces marinated in cheese and cream, grilled on skewers',
                price: 345,
                currency: 'INR',
                category: categories[0]._id,
                categoryName: 'Starters',
                restaurant: restaurant._id,
                isVeg: false,
                spiceLevel: 1,
                isFeatured: false,
                isPopular: true,
                preparationTime: 25,
                servingSize: '6 pieces',
                processingStatus: 'no_model',
                displayOrder: 2
            },
            {
                name: 'Crispy Vegetable Spring Rolls',
                description: 'Crispy rolls stuffed with fresh vegetables and served with sweet chili sauce',
                price: 195,
                currency: 'INR',
                category: categories[0]._id,
                categoryName: 'Starters',
                restaurant: restaurant._id,
                isVeg: true,
                isVegan: true,
                spiceLevel: 1,
                preparationTime: 15,
                servingSize: '4 pieces',
                processingStatus: 'no_model',
                displayOrder: 3
            },

            // Main Course
            {
                name: 'Butter Chicken',
                description: 'Tender chicken in a rich, creamy tomato-based sauce with butter and aromatic spices',
                price: 395,
                currency: 'INR',
                category: categories[1]._id,
                categoryName: 'Main Course',
                restaurant: restaurant._id,
                isVeg: false,
                spiceLevel: 2,
                isFeatured: true,
                isPopular: true,
                preparationTime: 30,
                servingSize: 'Serves 2',
                processingStatus: 'no_model',
                displayOrder: 1
            },
            {
                name: 'Paneer Butter Masala',
                description: 'Cottage cheese cubes in a luscious, creamy tomato gravy',
                price: 325,
                currency: 'INR',
                category: categories[1]._id,
                categoryName: 'Main Course',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 1,
                isFeatured: true,
                isPopular: true,
                preparationTime: 25,
                servingSize: 'Serves 2',
                processingStatus: 'no_model',
                displayOrder: 2
            },
            {
                name: 'Dal Makhani',
                description: 'Black lentils slow-cooked overnight with butter and cream',
                price: 275,
                currency: 'INR',
                category: categories[1]._id,
                categoryName: 'Main Course',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 1,
                preparationTime: 20,
                servingSize: 'Serves 2',
                processingStatus: 'no_model',
                displayOrder: 3
            },
            {
                name: 'Lamb Rogan Josh',
                description: 'Slow-cooked lamb in a rich Kashmiri red chili gravy',
                price: 495,
                currency: 'INR',
                category: categories[1]._id,
                categoryName: 'Main Course',
                restaurant: restaurant._id,
                isVeg: false,
                spiceLevel: 3,
                isFeatured: true,
                preparationTime: 40,
                servingSize: 'Serves 2',
                processingStatus: 'no_model',
                displayOrder: 4
            },

            // Biryanis
            {
                name: 'Hyderabadi Chicken Biryani',
                description: 'Fragrant basmati rice layered with spiced chicken and cooked in dum style',
                price: 345,
                currency: 'INR',
                category: categories[2]._id,
                categoryName: 'Biryanis',
                restaurant: restaurant._id,
                isVeg: false,
                spiceLevel: 3,
                isFeatured: true,
                isPopular: true,
                preparationTime: 45,
                servingSize: 'Serves 1',
                processingStatus: 'no_model',
                displayOrder: 1
            },
            {
                name: 'Vegetable Biryani',
                description: 'Aromatic rice layered with mixed vegetables and fragrant spices',
                price: 275,
                currency: 'INR',
                category: categories[2]._id,
                categoryName: 'Biryanis',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 2,
                preparationTime: 40,
                servingSize: 'Serves 1',
                processingStatus: 'no_model',
                displayOrder: 2
            },

            // Breads
            {
                name: 'Butter Naan',
                description: 'Soft, fluffy leavened bread brushed with butter',
                price: 65,
                currency: 'INR',
                category: categories[3]._id,
                categoryName: 'Breads',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 0,
                preparationTime: 10,
                servingSize: '1 piece',
                processingStatus: 'no_model',
                displayOrder: 1
            },
            {
                name: 'Garlic Naan',
                description: 'Naan bread topped with fresh garlic and coriander',
                price: 75,
                currency: 'INR',
                category: categories[3]._id,
                categoryName: 'Breads',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 0,
                isPopular: true,
                preparationTime: 10,
                servingSize: '1 piece',
                processingStatus: 'no_model',
                displayOrder: 2
            },
            {
                name: 'Cheese Naan',
                description: 'Naan stuffed with melted cheese',
                price: 95,
                currency: 'INR',
                category: categories[3]._id,
                categoryName: 'Breads',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 0,
                preparationTime: 12,
                servingSize: '1 piece',
                processingStatus: 'no_model',
                displayOrder: 3
            },

            // Desserts
            {
                name: 'Gulab Jamun',
                description: 'Soft milk dumplings soaked in rose-flavored sugar syrup',
                price: 145,
                currency: 'INR',
                category: categories[4]._id,
                categoryName: 'Desserts',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 0,
                isPopular: true,
                preparationTime: 5,
                servingSize: '4 pieces',
                processingStatus: 'no_model',
                displayOrder: 1
            },
            {
                name: 'Rasmalai',
                description: 'Soft cottage cheese patties in sweetened, thickened milk',
                price: 165,
                currency: 'INR',
                category: categories[4]._id,
                categoryName: 'Desserts',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 0,
                isFeatured: true,
                preparationTime: 5,
                servingSize: '3 pieces',
                processingStatus: 'no_model',
                displayOrder: 2
            },
            {
                name: 'Kulfi',
                description: 'Traditional Indian ice cream with pistachios and cardamom',
                price: 125,
                currency: 'INR',
                category: categories[4]._id,
                categoryName: 'Desserts',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 0,
                preparationTime: 5,
                servingSize: '1 piece',
                processingStatus: 'no_model',
                displayOrder: 3
            },

            // Beverages
            {
                name: 'Mango Lassi',
                description: 'Creamy yogurt drink blended with sweet mangoes',
                price: 125,
                currency: 'INR',
                category: categories[5]._id,
                categoryName: 'Beverages',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 0,
                isPopular: true,
                preparationTime: 5,
                servingSize: '300ml',
                processingStatus: 'no_model',
                displayOrder: 1
            },
            {
                name: 'Masala Chai',
                description: 'Traditional spiced Indian tea with milk',
                price: 65,
                currency: 'INR',
                category: categories[5]._id,
                categoryName: 'Beverages',
                restaurant: restaurant._id,
                isVeg: true,
                spiceLevel: 0,
                preparationTime: 5,
                servingSize: '200ml',
                processingStatus: 'no_model',
                displayOrder: 2
            },
            {
                name: 'Fresh Lime Soda',
                description: 'Refreshing lime juice with soda water - sweet or salted',
                price: 85,
                currency: 'INR',
                category: categories[5]._id,
                categoryName: 'Beverages',
                restaurant: restaurant._id,
                isVeg: true,
                isVegan: true,
                spiceLevel: 0,
                preparationTime: 3,
                servingSize: '300ml',
                processingStatus: 'no_model',
                displayOrder: 3
            }
        ]);

        console.log('🪑 Creating tables with QR codes...');
        const tables = [];
        for (let i = 1; i <= 10; i++) {
            const table = await Table.create({
                number: i.toString(),
                name: `Table ${i}`,
                capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
                location: i <= 6 ? 'indoor' : 'outdoor',
                restaurant: restaurant._id
            });
            tables.push(table);
        }

        console.log('\n✅ Database seeded successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Demo Login: demo@restaurant.com`);
        console.log(`🔑 Password: demo123456`);
        console.log(`🏪 Restaurant ID: ${restaurant._id}`);
        console.log(`📊 Created: ${dishes.length} dishes, ${categories.length} categories, ${tables.length} tables`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n🌐 View menu at: http://localhost:3000/menu/${restaurant._id}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
