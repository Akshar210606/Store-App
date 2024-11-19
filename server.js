require('dotenv').config(); // Load environment variables at the very top

const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeService = require('./store-service'); // Import store-service
const Handlebars = require('handlebars'); // Import Handlebars

const app = express();
const upload = multer(); // Initialize multer for handling file uploads
const exphbs = require('express-handlebars');

// Set up Handlebars view engine
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    helpers: {
        navLink: function(url, options) {
            return `<li class="nav-item${url === options.data.root.activeRoute ? ' active' : ''}">
                        <a class="nav-link" href="${url}">${options.fn(this)}</a>
                    </li>`;
        },        
        equal: function(lvalue, rvalue, options) {
            if (arguments.length < 3) {
                throw new Error("Handlebars Helper equal needs 2 parameters");
            }
            return lvalue != rvalue ? options.inverse(this) : options.fn(this);
        },
        safeHTML: function (context) {
            return context ? new Handlebars.SafeString(context) : "";
        }
        }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views')); // Set the correct views directory

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Middleware to set the active route
app.use(function(req, res, next) {
    res.locals.activeRoute = req.baseUrl + req.path; // Use baseUrl and path to correctly determine active route
    next();
});

// Redirect root ("/") to the about page
app.get('/', (req, res) => {
    res.redirect('/shop');
});

// Render the about.hbs view
app.get('/about', (req, res) => {
    res.render('about');
});

// Render the addItem.hbs view for adding a new item
app.get('/items/add', (req, res) => {
    res.render('addItem'); // Ensure this matches the file name of your Handlebars view
});

// Handle form submission for adding a new item
app.post('/items/add', upload.single('featureImage'), async (req, res) => {
    try {
        let imageUrl = '';

        // If an image is uploaded, upload it to Cloudinary
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
                    if (result) {
                        resolve(result.url);
                    } else {
                        reject(error);
                    }
                });
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });

            imageUrl = result;
        }

        // Add featureImage URL to the item data
        req.body.featureImage = imageUrl;

        // Add the new item using store-service
        await storeService.addItem(req.body);
        res.redirect('/items');
    } catch (error) {
        console.error("Error adding item:", error);
        res.status(500).send("Error adding item");
    }
});

// Render all items
app.get('/items', async (req, res) => {
    let viewData = {};
  
    try {
      const items = await storeService.getPublishedItems();
      viewData.items = items;
    } catch (err) {
      viewData.message = "No items available.";
    }
  
    try {
      const categories = await storeService.getCategories();
      viewData.categories = categories;
    } catch (err) {
      viewData.categoriesMessage = "No categories available.";
    }
  
    res.render('items', { data: viewData });
  });
   

// Render categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await storeService.getCategories();
        res.render('categories', { categories });
    } catch (error) {
        console.error("Error retrieving categories:", error); // Log the error for debugging
        res.render('categories', { message: "No categories available" });
    }
});

// Render the shop.hbs view to show all published items or filter by category
app.get('/shop', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "item" objects
        let items = [];

        // if there's a "category" query, filter the returned items by category
        if (req.query.category) {
            // Obtain the published "item" by category
            items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            // Obtain the published "items"
            items = await storeService.getPublishedItems();
        }

        // sort the published items by itemDate
        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

        // get the latest item from the front of the list (element 0)
        let item = items[0];

        // store the "items" and "item" data in the viewData object (to be passed to the view)
        viewData.posts = items;
        viewData.post = item;
    } catch (err) {
        viewData.message = "No results";
    }

    try {
        // Obtain the full list of "categories"
        let categories = await storeService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "No categories available";
    }

    // render the "shop" view with all of the data (viewData)
    res.render('shop', { data: viewData });
});

app.get('/shop/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try {
        // declare empty array to hold "item" objects
        let items = [];

        // if there's a "category" query, filter the returned items by category
        if (req.query.category) {
            // Obtain the published "items" by category
            items = await storeService.getPublishedItemsByCategory(req.query.category);
        } else {
            // Obtain the published "items"
            items = await storeService.getPublishedItems();
        }

        // sort the published items by itemDate
        items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));

        // store the "items" data in the viewData object (to be passed to the view)
        viewData.posts = items;

    } catch (err) {
        viewData.message = "No results";
    }

    try {
        // Obtain the item by "id"
        viewData.post = await storeService.getItemById(req.params.id);
    } catch (err) {
        viewData.message = "No results"; 
    }

    try {
        // Obtain the full list of "categories"
        let categories = await storeService.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "No categories available";
    }

    // render the "shop" view with all of the data (viewData)
    res.render('shop', { data: viewData });
});


// Initialize store-service and start the server
storeService.initialize()
    .then(() => {
        const PORT = process.env.PORT || 8080;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize data:", err);
    });
