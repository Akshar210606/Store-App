/************************************************************* 
 * WEB 322 - ASSIGNMENT 4
 * Name: Aksharkumar Anilkumar Patel
 * Student Id: 137902235
 * Date: 18/11/2024
 * Replit URL: https://a3b90235-cd62-4f56-834e-32ca4b798bf2-00-3kh0kkqiu322y.worf.repl.co/
 * Github link: https://github.com/Akshar2106/web322-app
***************************************************************/
require('dotenv').config();

const express = require('express');
const path = require('path');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const storeService = require('./store-service');
const Handlebars = require('handlebars');
const methodOverride = require('method-override');

const app = express();
const upload = multer();
const exphbs = require('express-handlebars');

app.engine('.hbs', exphbs.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
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
    },
    formatDate: function(dateObj) {
      let year = dateObj.getFullYear();
      let month = (dateObj.getMonth() + 1).toString();
      let day = dateObj.getDate().toString();
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
    }
  }
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

cloudinary.config({
  cloud_name: "doszlj5lf",
  api_key: "158569399984422",
  api_secret: "kblJGJxkoZvA3QLt_WP1H6xvTxo"
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

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
  storeService.getCategories()
    .then(data => {
      res.render('addPost', { categories: data });
    })
    .catch(() => {
      res.render('addPost', { categories: [] });
    });
});

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
      req.body.featureImage = uploaded.url;
      storeService.addItem(req.body)
        .then(() => res.redirect("/items"))
        .catch((err) => {
          res.status(500).render("addPost", {
            errorMessage: err,
            item: req.body
          });
        });
    });
  } else {
    req.body.featureImage = "";
    storeService.addItem(req.body)
      .then(() => res.redirect("/items"))
      .catch((err) => {
        res.status(500).render("addPost", {
          errorMessage: err,
          item: req.body
        });
      });
  }
});

app.get('/items', (req, res) => {
  storeService.getAllItems()
    .then(data => {
      if (data.length > 0) {
        res.render('items', { items: data });
      } else {
        res.render('items', { message: "No items available.", items: [] });
      }
    })
    .catch(err => {
      res.render('items', { message: err, items: [] });
    });
});

app.get('/shop', async (req, res) => {
  try {
      const items = await storeService.getAllItems();
      const categories = await storeService.getCategories();
      console.log('Items:', items);
      console.log('Categories:', categories);
      res.render('shop', { data: { posts: items, categories: categories } });
  } catch (error) {
      console.error('Error fetching shop data:', error.message);
      res.render('shop', { data: { posts: [], categories: [] }, message: "No results found" });
  }
});

app.get('/shop/:id', async (req, res) => {
  let viewData = {};
  try {
    const items = await storeService.getAllItems();
    viewData.posts = items;
    viewData.post = await storeService.getItemById(req.params.id);
  } catch (err) {
    viewData.message = "No results";
  }
  try {
    const categories = await storeService.getCategories();
    viewData.categories = categories;
  } catch (err) {
    viewData.categoriesMessage = "No categories available";
  }
  res.render('shop', { data: viewData });
});

app.get('/categories', (req, res) => {
  storeService.getCategories()
      .then((data) => {
          console.log(data);
          if (data.length > 0) {
              res.render('categories', { categories: data });
          } else {
              res.render('categories', { message: "No results" });
          }
      })
      .catch((err) => {
          res.render('categories', { message: "No results" });
      });
});

app.get('/categories/add', (req, res) => {
  res.render('addCategory');
});

app.post('/categories/add', (req, res) => {
  storeService.addCategory(req.body)
    .then(() => {
      res.redirect('/categories');
    })
    .catch((err) => {
      res.status(500).render('addCategory', {
        errorMessage: err,
        category: req.body.category
      });
    });
});

app.get('/categories/delete/:id', (req, res) => {
  storeService.deleteCategoryById(req.params.id)
      .then(() => {
          res.redirect('/categories');
      })
      .catch((err) => {
          res.status(500).render('categories', {
              message: "Unable to Remove Category / Category not found"
          });
      });
});

app.get('/items/delete/:id', (req, res) => {
  storeService.deleteItemById(req.params.id)
    .then(() => {
      res.redirect('/items');
    })
    .catch((err) => {
      res.status(500).send("Unable to Remove Post / Post not found");
    });
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
