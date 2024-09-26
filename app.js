const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./my_database.db'); // Path to your SQLite database

const app = express();

// Set up view engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static assets (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup for login functionality
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

// ------------------ ROUTES ------------------

// Home page route
app.get('/', (req, res) => {
    res.render('pages/index', { title: 'Home' });
});

// About Us page
app.get('/about', (req, res) => {
    res.render('pages/about', { title: 'About Us' });
});

// Customer Service Pages
app.get('/shipping', (req, res) => {
    res.render('pages/shipping', { title: 'Shipping Information' });
});

app.get('/returns', (req, res) => {
    res.render('pages/returns', { title: 'Returns & Exchanges' });
});

app.get('/size-guide', (req, res) => {
    res.render('pages/size-guide', { title: 'Size Guide' });
});

// About Us Pages
app.get('/our-story', (req, res) => {
    res.render('pages/our-story', { title: 'Our Story' });
});

app.get('/careers', (req, res) => {
    res.render('pages/careers', { title: 'Careers' });
});

app.get('/sustainability', (req, res) => {
    res.render('pages/sustainability', { title: 'Sustainability' });
});

app.get('/press', (req, res) => {
    res.render('pages/press', { title: 'Press' });
});

// Legal Pages
app.get('/privacy-policy', (req, res) => {
    res.render('pages/privacy-policy', { title: 'Privacy Policy' });
});

app.get('/terms-of-use', (req, res) => {
    res.render('pages/terms-of-use', { title: 'Terms of Use' });
});

app.get('/sales-and-refunds', (req, res) => {
    res.render('pages/sales-and-refunds', { title: 'Sales and Refunds' });
});

// Contact Us page
app.get('/contact', (req, res) => {
    res.render('pages/contact', { title: 'Contact Us' });
});

app.get('/site-map', (req, res) => {
    res.render('pages/site-map', { title: 'Site Map' });
});

app.post('/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    db.run(`INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`,
        [name, email, subject, message],
        (err) => {
            if (err) {
                console.error("Error saving contact form data:", err);
                return res.send('Error submitting contact form');
            }
            res.redirect('/contact');
        }
    );
});

// FAQs page
app.get('/faqs', (req, res) => {
    res.render('pages/faqs', { title: 'FAQs' });
});

// Legal page
app.get('/legal', (req, res) => {
    res.render('pages/legal', { title: 'Legal' });
});

// My Account (Login/Registration) route
app.get('/account', (req, res) => {
    res.render('pages/account', { message: null, title: 'My Account' });
});

app.post('/account/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) {
            return res.render('pages/account', { message: 'User not found', title: 'My Account' });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.render('pages/account', { message: 'Incorrect password', title: 'My Account' });
        }

        req.session.userId = user.id;
        res.redirect('/products/men');
    });
});

// Register GET Route
app.get('/account/register', (req, res) => {
    res.render('pages/register', { message: null });
});

// Register POST Route
app.post('/account/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    const currentTime = new Date();

    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`,
        [username, hashedPassword],
        (err) => {
            if (err) {
                return res.render('pages/register', { message: 'Error registering user' });
            }
            res.render('pages/thank-you', { username, currentTime });
        }
    );
});

// Logout route
app.get('/account/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/account');
});

// Product Listing for each category
app.get('/products/:category', (req, res) => {
    const category = req.params.category;
    let query = `SELECT * FROM products WHERE category = ?`;
    let params = [category];

    // Handle price filter
    if (req.query.price) {
        if (req.query.price === 'under50') {
            query += ` AND price < 50`;
        } else if (req.query.price === '50to100') {
            query += ` AND price BETWEEN 50 AND 100`;
        } else if (req.query.price === 'over100') {
            query += ` AND price > 100`;
        }
    }

    // Handle size filter
    if (req.query.size) {
        query += ` AND size = ?`;
        params.push(req.query.size);
    }

    // Handle color filter
    if (req.query.color) {
        const colors = Array.isArray(req.query.color) ? req.query.color : [req.query.color];
        const colorPlaceholders = colors.map(() => '?').join(', ');
        query += ` AND color IN (${colorPlaceholders})`;
        params.push(...colors);
    }

    // Handle sort filter
    if (req.query.sort) {
        if (req.query.sort === 'price-asc') {
            query += ` ORDER BY price ASC`;
        } else if (req.query.sort === 'price-desc') {
            query += ` ORDER BY price DESC`;
        } else if (req.query.sort === 'popularity') {
            query += ` ORDER BY popularity DESC`;
        }
    }

    // Execute the query and pass req to the EJS template
    db.all(query, params, (err, products) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error retrieving products");
        }

        // Render the products page with the filtered/sorted products and the request object
        res.render('pages/products', { products, category, req });
    });
});

// Admin: View All Users Route
app.get('/admin/users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, users) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error fetching users');
        }
        res.render('pages/admin-users', { users, title: 'User Data' });
    });
});

// Admin: View All Contact Submissions Route
app.get('/admin/contacts', (req, res) => {
    db.all(`SELECT * FROM contacts`, [], (err, contacts) => {
        if (err) {
            console.error("Error fetching contacts:", err);
            return res.status(500).send('Error fetching contacts');
        }
        res.render('pages/admin-contacts', { contacts, title: 'Contact Form Submissions' });
    });
});

// ------------------ ERROR HANDLING ------------------

// 404 Error Handler (Page Not Found)
app.use((req, res, next) => {
    res.status(404).render('pages/404', { title: '404 - Page Not Found' });
});

// Generic Error Handler (500 Internal Server Error)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/error', { message: 'Something went wrong on the server.', title: 'Server Error' });
});

// ------------------ SERVER START ------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});