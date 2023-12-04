const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');

const app = express();

// In-memory storage for simplicity (use a database in production)
const users = {};

passport.use(new GoogleStrategy({
    clientID: '197869100303-29e4j2atip7ofsk170advdo545i6tvti.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3001/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
    // Store user information in the 'users' object
    users[profile.id] = profile;
    return done(null, profile);
}));

app.use(passport.initialize());

// Google OAuth login route
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback route
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

// Invoice details route (dummy data for demonstration)
app.get('/api/invoices', (req, res) => {
    const userId = req.user.id; // Assuming user is authenticated
    const dueInvoices = [
        { id: 1, amount: 100, dueDate: '2023-12-31', recipient: 'Client A' },
        { id: 2, amount: 200, dueDate: '2023-12-15', recipient: 'Client B' },
        // Add more invoices as needed
    ];

    // Implement logic to fetch and return due invoices
    res.json({ invoices: dueInvoices });
});

// Zapier integration route to trigger past-due invoice reminders
app.post('/api/zapier/triggerReminders', (req, res) => {
    // Assuming authenticated user triggers the reminders
    const userId = req.user.id;

    // Fetch past-due invoices
    // You can customize this logic based on your actual data source
    const pastDueInvoices = [
        { id: 1, amount: 100, dueDate: '2023-12-01', recipient: 'Client A' },
        { id: 2, amount: 200, dueDate: '2023-11-15', recipient: 'Client B' },
        // Add more past-due invoices as needed
    ];

    // Trigger Zapier automation using Axios
    axios.post('https://hooks.zapier.com/hooks/catch/1234567/abcde', { invoices: pastDueInvoices })
        .then(response => {
            console.log('Zapier response:', response.data);
            res.json({ success: true });
        })
        .catch(error => {
            console.error('Error triggering Zapier:', error);
            res.status(500).json({ error: 'Failed to trigger Zapier' });
        });
});
 
const express = require('express');
const session = require('express-session');

const app = express();

// Use the session middleware
app.use(session({ secret: 'keyboard cat' }));

// Create a route that uses the session
app.get('/', (req, res) => {
  // Get the session data
  const sess = req.session;

  // If the user is logged in, show them a message
  if (sess.user) {
    res.send('You are logged in!');
  } else {
    // Otherwise, show them a login form
    res.send('Please log in!');
  }
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
