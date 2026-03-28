const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// First create tables if they don't exist
function createTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                phone TEXT,
                address TEXT,
                city TEXT,
                state TEXT,
                pincode TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) reject(err);
            });

            // Products table
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                originalPrice REAL,
                description TEXT,
                category TEXT NOT NULL,
                image TEXT NOT NULL,
                badge TEXT,
                stock INTEGER DEFAULT 10,
                rating REAL DEFAULT 0,
                numReviews INTEGER DEFAULT 0,
                isFeatured INTEGER DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) reject(err);
            });

            // Cart table
            db.run(`CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                productId INTEGER NOT NULL,
                quantity INTEGER DEFAULT 1,
                addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id),
                FOREIGN KEY (productId) REFERENCES products (id),
                UNIQUE(userId, productId)
            )`, (err) => {
                if (err) reject(err);
            });

            // Orders table
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                items TEXT NOT NULL,
                totalAmount REAL NOT NULL,
                shippingAddress TEXT NOT NULL,
                paymentMethod TEXT NOT NULL,
                paymentStatus TEXT DEFAULT 'pending',
                orderStatus TEXT DEFAULT 'pending',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users (id)
            )`, (err) => {
                if (err) reject(err);
            });

            resolve();
        });
    });
}

const products = [
    // Women
    {
        name: "Floral Print Maxi Dress",
        price: 2499,
        originalPrice: 3999,
        description: "Beautiful floral print maxi dress for summer",
        category: "women",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600",
        badge: "new",
        stock: 15,
        isFeatured: 1
    },
    {
        name: "Women's Denim Jacket",
        price: 2999,
        originalPrice: 4499,
        description: "Classic denim jacket for women",
        category: "women",
        image: "https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?w=600",
        badge: null,
        stock: 10,
        isFeatured: 0
    },
    {
        name: "Printed Kurta Set",
        price: 2199,
        originalPrice: 3499,
        description: "Traditional printed kurta set",
        category: "women",
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600",
        badge: null,
        stock: 20,
        isFeatured: 1
    },
    // Men
    {
        name: "Slim Fit Casual Shirt",
        price: 1599,
        originalPrice: 2499,
        description: "Slim fit casual shirt for men",
        category: "men",
        image: "https://images.unsplash.com/photo-1596755094518-9943c9e1552f?w=600",
        badge: "sale",
        stock: 25,
        isFeatured: 1
    },
    {
        name: "Men's Formal Shirt",
        price: 1899,
        originalPrice: 2899,
        description: "Premium formal shirt",
        category: "men",
        image: "https://images.unsplash.com/photo-1598033129078-9c1a3b7e3b7d?w=600",
        badge: null,
        stock: 30,
        isFeatured: 0
    },
    {
        name: "Classic Sneakers",
        price: 3999,
        originalPrice: 5999,
        description: "Comfortable classic sneakers",
        category: "men",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
        badge: "sale",
        stock: 12,
        isFeatured: 1
    },
    // Kids
    {
        name: "Kids Party Wear Set",
        price: 1899,
        originalPrice: 2799,
        description: "Beautiful party wear for kids",
        category: "kids",
        image: "https://images.unsplash.com/photo-1503919545889-a8c6c33fede2?w=600",
        badge: "new",
        stock: 15,
        isFeatured: 1
    },
    {
        name: "Girls Frill Dress",
        price: 1799,
        originalPrice: 2799,
        description: "Cute frill dress for girls",
        category: "kids",
        image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600",
        badge: "new",
        stock: 18,
        isFeatured: 0
    },
    // Accessories
    {
        name: "Leather Crossbody Bag",
        price: 3499,
        originalPrice: 4999,
        description: "Genuine leather crossbody bag",
        category: "accessories",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600",
        badge: null,
        stock: 10,
        isFeatured: 1
    },
    {
        name: "Analog Watch",
        price: 4499,
        originalPrice: 6999,
        description: "Premium analog watch",
        category: "accessories",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600",
        badge: "new",
        stock: 8,
        isFeatured: 0
    }
];

async function seed() {
    try {
        console.log('🌱 Creating tables...');
        await createTables();
        
        console.log('🌱 Seeding data...');
        
        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Admin', 'admin@stylestreet.com', hashedPassword, 'admin'],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Create test user
        const userPassword = await bcrypt.hash('user123', 10);
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['Test User', 'user@test.com', userPassword, 'user'],
                function(err) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Clear existing products
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM products', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Insert products
        for (const product of products) {
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO products 
                    (name, price, originalPrice, description, category, image, badge, stock, isFeatured) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        product.name, 
                        product.price, 
                        product.originalPrice, 
                        product.description,
                        product.category, 
                        product.image, 
                        product.badge, 
                        product.stock, 
                        product.isFeatured
                    ],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }

        console.log('✅ Database seeded successfully');
        console.log('👤 Admin: admin@stylestreet.com / admin123');
        console.log('👤 User: user@test.com / user123');
        console.log(`📦 Products: ${products.length} items`);

    } catch (error) {
        console.error('❌ Seed error:', error);
    } finally {
        db.close();
    }
}

seed();