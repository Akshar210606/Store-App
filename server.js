/************************************************************* 
 * WEB 322 - ASSIGNMENT 4
 * Name: Aksharkumar Anilkumar Patel
 * Student Id: 137902235
 * Date: 18/11/2024
 * Replit URL:
 * Github link: 
***************************************************************/

require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeService = require('./store-service');
const Handlebars = require('handlebars');

const app = express();
const upload = multer();
const exphbs = require('express-handlebars');

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
    safeHTML: function(context) {
      return context ? new Handlebars.SafeString(context) : "";
    }
  }
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
  res.locals.activeRoute = req.baseUrl + req.path;
  next();
});

app.get('/', (req, res) => {
  res.redirect('/shop');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/items/add', (req, res) => {
  res.render('addItem');
});

app.post('/items/add', upload.single('featureImage'), async (req, res) => {
  try {
    let imageUrl = '';
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
    req.body.featureImage = imageUrl;
    await storeService.addItem(req.body);
    res.redirect('/items');
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).send("Error adding item");
  }
});

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

app.get('/categories', async (req, res) => {
  try {
    const categories = await storeService.getCategories();
    res.render('categories', { categories });
  } catch (error) {
    console.error("Error retrieving categories:", error);
    res.render('categories', { message: "No categories available" });
  }
});

app.get('/shop', async (req, res) => {
  let viewData = {};
  try {
    let items = [];
    if (req.query.category) {
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      items = await storeService.getPublishedItems();
    }
    items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
    let item = items[0];
    viewData.posts = items;
    viewData.post = item;
  } catch (err) {
    viewData.message = "No results";
  }
  try {
    let categories = await storeService.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "No categories available";
  }
  res.render('shop', { data: viewData });
});

app.get('/shop/:id', async (req, res) => {
  let viewData = {};
  try {
    let items = [];
    if (req.query.category) {
      items = await storeService.getPublishedItemsByCategory(req.query.category);
    } else {
      items = await storeService.getPublishedItems();
    }
    items.sort((a, b) => new Date(b.itemDate) - new Date(a.itemDate));
    viewData.posts = items;
  } catch (err) {
    viewData.message = "No results";
  }
  try {
    viewData.post = await storeService.getItemById(req.params.id);
  } catch (err) {
    viewData.message = "No results";
  }
  try {
    let categories = await storeService.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "No categories available";
  }
  res.render('shop', { data: viewData });
});

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
