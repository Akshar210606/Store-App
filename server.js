/*********************************************************************************
WEB322 – Assignment 02
I declare that this assignment is my own work in accordance with Seneca 
Academic Policy. No part of this assignment has been copied manually or 
electronically from any other source (including 3rd party web sites) or 
distributed to other students.

Name: Aksharkumar Anilkumar Patel
Student ID: 137902235
Date: 07/10/2024
Cyclic Web App URL: https://replit.com/@aapatel67/web322-app-
GitHub Repository URL: https://github.com/Akshar2106/web322-app.git

********************************************************************************/

const express = require('express');
const path = require('path');
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { 
    initialize, 
    getAllItems, 
    getPublishedItems, 
    getCategories, 
    addItem, 
    getItemsByCategory, 
    getItemsByMinDate, 
    getItemById 
} = require('./store-service'); 

const app = express();

cloudinary.config({
    cloud_name: 'doszlj5lf',
    api_key: '158569399984422',
    api_secret: 'kblJGJxkoZvA3QLt_WP1H6xvTxo',
    secure: true
});

const upload = multer(); // Set up multer without disk storage

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
initialize()
    .then(() => {
        // Route to get all published items ("/shop")
        app.get('/shop', (req, res) => {
            getPublishedItems()
                .then(data => res.json(data))
                .catch(err => res.status(500).json({ message: err }));
        });

        // Route to get all items or filter by category or minDate
        app.get('/items', (req, res) => {
            const category = req.query.category;
            const minDate = req.query.minDate;

            if (category) {
                getItemsByCategory(category)
                    .then(data => res.json(data))
                    .catch(err => res.status(500).json({ message: err }));
            } else if (minDate) {
                getItemsByMinDate(minDate)
                    .then(data => res.json(data))
                    .catch(err => res.status(500).json({ message: err }));
            } else {
                getAllItems()
                    .then(data => res.json(data))
                    .catch(err => res.status(500).json({ message: err }));
            }
        });

        // Route to get all categories
        app.get('/categories', (req, res) => {
            getCategories()
                .then(data => res.json(data))
                .catch(err => res.status(500).json({ message: err }));
        });

        // Route to get a single item by id
        app.get('/item/:id', (req, res) => {
            const itemId = req.params.id;

            getItemById(itemId)
                .then(item => res.json(item))
                .catch(err => res.status(404).json({ message: err }));
        });

        // Route to serve the addItem.html file
        app.get('/items/add', (req, res) => {
            res.sendFile(path.join(__dirname, 'views', 'addItem.html'));
        });

        // POST route to add a new item with optional image upload to Cloudinary
        app.post('/items/add', upload.single('featureImage'), (req, res) => {
            if (req.file) {
                let streamUpload = (req) => {
                    return new Promise((resolve, reject) => {
                        let stream = cloudinary.uploader.upload_stream(
                            (error, result) => {
                                if (result) {
                                    resolve(result);
                                } else {
                                    reject(error);
                                }
                            }
                        );
                        streamifier.createReadStream(req.file.buffer).pipe(stream);
                    });
                };

                async function upload(req) {
                    let result = await streamUpload(req);
                    return result;
                }

                upload(req).then((uploaded) => {
                    processItem(uploaded.url);
                }).catch((err) => {
                    console.error("Image upload failed:", err);
                    res.status(500).send("Image upload failed");
                });
            } else {
                processItem(""); // No image provided, continue with empty URL
            }

            function processItem(imageUrl) {
                req.body.featureImage = imageUrl;

                // Use addItem function from store-service to add new item
                addItem(req.body)
                    .then(() => {
                        res.redirect('/items'); // Redirect to /items after successful addition
                    })
                    .catch((err) => {
                        console.error("Error adding item:", err);
                        res.status(500).send("Error adding item");
                    });
            }
        });

        // Route to handle unmatched routes (404)
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
        console.error(`Error initializing data: ${err}`);
    });
