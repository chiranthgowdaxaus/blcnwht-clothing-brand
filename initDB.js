const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Create or connect to the SQLite database
const db = new sqlite3.Database('my_database.db');

// Initialize the database
db.serialize(() => {
    // Drop Products Table if it exists (to avoid conflict)
    db.run(`DROP TABLE IF EXISTS products`);

    // Recreate Products Table with category, size, and color fields
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,   -- Add the category column here
        size TEXT,                -- Optional: Size filter
        color TEXT,               -- Optional: Color filter
        image TEXT  -- Add image column to store image path or URL
    )`);

    // Recreate Users Table if necessary
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL
    )`);

    // Recreate Contacts Table for storing contact form submissions
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL
    )`);

    // Recreate Orders Table to track user orders and purchased products
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,   -- Reference to the user making the order
        product_id INTEGER NOT NULL, -- Reference to the purchased product
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
    )`);
});

// Pre-populate some tables with initial data
db.serialize(() => {
    // Add an admin user
    const adminPassword = bcrypt.hashSync('admin123', 8);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, ['admin', adminPassword]);

    // Pre-populate some product data (Men category)
    db.run(`INSERT INTO products (name, description, price, category, size, color) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Men Casual Shirt', 'Comfortable cotton shirt', 49.99, 'Men', 'M', 'Black']);
    db.run(`INSERT INTO products (name, description, price, category, size, color) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Men Leather Jacket', 'Stylish leather jacket', 129.99, 'Men', 'L', 'Brown']);
    
    // Pre-populate some product data (Women category)
    db.run(`INSERT INTO products (name, description, price, category, size, color) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Women Summer Dress', 'Light and stylish summer dress', 59.99, 'Women', 'M', 'White']);
    db.run(`INSERT INTO products (name, description, price, category, size, color) VALUES (?, ?, ?, ?, ?, ?)`,
        ['Women Winter Coat', 'Warm and comfortable winter coat', 149.99, 'Women', 'L', 'Red']);
});

// Insert six men's products into the 'products' table
db.serialize(() => {
    const products = [
        { name: 'Men Casual Shirt', description: 'Comfortable cotton shirt', price: 49.99, category: 'men', size: 'M', color: 'Black', image: '/images/casual-shirt.jpg' },
        { name: 'Men Leather Jacket', description: 'Stylish leather jacket', price: 129.99, category: 'men', size: 'L', color: 'Brown', image: '/images/leather-jacket.jpg' },
        { name: 'Men Slim Fit Jeans', description: 'Slim fit jeans with stretch', price: 59.99, category: 'men', size: '32', color: 'Blue', image: '/images/slim-fit-jeans.jpg' },
        { name: 'Men Sneakers', description: 'Trendy sneakers with breathable material', price: 79.99, category: 'men', size: '10', color: 'White', image: '/images/sneakers.jpg' },
        { name: 'Men Formal Shoes', description: 'Elegant leather shoes', price: 99.99, category: 'men', size: '9', color: 'Black', image: '/images/formal-shoes.jpg' },
        { name: 'Men T-Shirt', description: 'Soft cotton t-shirt', price: 29.99, category: 'men', size: 'L', color: 'Grey', image: '/images/t-shirt.jpg' }
    ];

    products.forEach(product => {
        db.run(`INSERT INTO products (name, description, price, category, size, color, image) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
            [product.name, product.description, product.price, product.category, product.size, product.color, product.image], 
            (err) => {
                if (err) {
                    console.error("Error inserting product:", err);
                }
            }
        );
    });

    console.log("6 Men's category products with images added successfully.");
});

// Close the database connection
db.close(() => {
    console.log("Database initialized successfully with recreated products table");
});