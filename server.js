const express = require('express');
const path = require('path');
const storeService = require('./store-service'); // Import the store-service module

const app = express();

// Serve static files from the "public" folder
app.use(express.static('public'));

// Redirect root ("/") to the about page
app.get('/', (req, res) => {
    res.redirect('/about');
});

// Serve the about.html file
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Initialize store-service and only start the server if initialization is successful
storeService.initialize()
    .then(() => {
        // Route to get all published items ("/shop")
        app.get('/shop', (req, res) => {
            storeService.getPublishedItems()
                .then(data => res.json(data))  // Respond with JSON data
                .catch(err => res.status(500).json({ message: err }));
        });

        // Route to get all items ("/items")
        app.get('/items', (req, res) => {
            storeService.getAllItems()
                .then(data => res.json(data))  // Respond with JSON data
                .catch(err => res.status(500).json({ message: err }));
        });

        // Route to get all categories ("/categories")
        app.get('/categories', (req, res) => {
            storeService.getCategories()
                .then(data => res.json(data))  // Respond with JSON data
                .catch(err => res.status(500).json({ message: err }));
        });

        // Route to get item details
        app.get('/item/:id', (req, res) => {
            const id = parseInt(req.params.id);
            const item = items.find(i => i.id === id);
            if (!item) {
                return res.status(404).json({ message: 'Item not found.' });
            }
            res.json(item); // Respond with item details
        });

        // Route to delete an item
        app.delete('/delete-item/:id', (req, res) => {
            const id = parseInt(req.params.id);
            const index = items.findIndex(item => item.id === id);
            if (index === -1) {
                return res.status(404).json({ message: 'Item not found.' });
            }

            // Remove the item from the items array
            items.splice(index, 1);

            // Write updated items to items.json
            fs.writeFile(path.join(__dirname, 'data', 'items.json'), JSON.stringify(items, null, 2), (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Error deleting item.' });
                }
                res.json({ message: 'Item deleted successfully.' });
            });
        });

        // Handle unmatched routes (404)
        app.get('*', (req, res) => {
            res.status(404).sendFile(path.join(__dirname, 'views', '404.html')); // Serve custom 404 page
        });

        // Start the server
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Express http server listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error(`Error initializing data: ${err}`); // Output error to console if initialization fails
    });
