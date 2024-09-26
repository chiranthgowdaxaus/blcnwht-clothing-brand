const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('my_database.db');

// ------------------ USER QUERIES ------------------

// Add a new user (for registration)
exports.addUser = (username, password, callback) => {
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(query, [username, password], callback);
};

exports.getAllUsers = (callback) => {
    const query = `SELECT * FROM users`;
    db.all(query, [], callback);
};

// Get user by username (for login)
exports.getUser = (username, callback) => {
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], callback);
};

// ------------------ PRODUCT QUERIES ------------------

// Add a new product with category
exports.addProduct = (name, description, price, category, callback) => {
    const query = `INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, description, price, category], callback);
};

// Get products by category with filters and sorting
exports.getFilteredProducts = (category, filters, sort, callback) => {
    let query = `SELECT * FROM products WHERE category = ?`;
    const params = [category];

    // Apply filters
    if (filters.size) {
        query += ` AND size = ?`;
        params.push(filters.size);
    }
    if (filters.color) {
        query += ` AND color = ?`;
        params.push(filters.color);
    }

    // Apply sorting options
    if (sort === 'price-asc') {
        query += ` ORDER BY price ASC`;
    } else if (sort === 'price-desc') {
        query += ` ORDER BY price DESC`;
    } else if (sort === 'popularity') {
        query += ` ORDER BY popularity DESC`;  // Assuming you track popularity in your product data
    }

    db.all(query, params, callback);
};

// Get all products (without filters or sorting)
exports.getProductsByCategory = (category, callback) => {
    const query = `SELECT * FROM products WHERE category = ?`;
    db.all(query, [category], callback);
};

// ------------------ CONTACT QUERIES ------------------

// Add a new contact form submission
exports.addContact = (name, email, subject, message, callback) => {
    const query = `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`;

    console.log("Inserting data:", { name, email, subject, message });
    db.run(query, [name, email, subject, message], (err) => {
        if (err) {
            console.error("Error inserting contact data:", err);
        }
        callback(err);  // Call the callback function after query execution
    });
};



exports.getAllContacts = (callback) => {
    const query = `SELECT * FROM contacts`;
    db.all(query, [], callback);
};

// ------------------ OPTIONAL: DATABASE INITIALIZATION ------------------

// Initialize the database with users, products, and contacts tables
exports.initializeDatabase = () => {
    db.serialize(() => {
        // Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        )`);

        // Create Products Table
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            size TEXT,       -- Optional: if you want to filter by size
            color TEXT,      -- Optional: if you want to filter by color
            image TEXT  -- Add image column here
        )`);

        // Create Contacts Table
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT NOT NULL,
            message TEXT NOT NULL
        )`);
    });
};

// Close the database connection (optional)
exports.closeDatabase = () => {
    db.close();
};