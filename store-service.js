// store-service.js

const path = require('path');
const items = require(path.join(__dirname, 'data', 'items.json')); // updated path to include 'data' folder
const categories = require(path.join(__dirname, 'data', 'categories.json')); // correct path for categories.json

function initialize() {
  return new Promise((resolve, reject) => {
    // Initialization logic if needed
    // If there's any async loading that needs to be done (e.g., reading from a database)
    // Otherwise, just resolve the promise
    resolve();
  });
}

module.exports = {
  initialize,
  getPublishedItems() {
    return new Promise((resolve, reject) => {
      const publishedItems = items.filter(item => item.published);
      console.log('Published Items:', publishedItems); // Log to see the filtered items
      if (publishedItems.length > 0) {
        resolve(publishedItems);
      } else {
        reject("no results");
      }
    });
  },
  

  getPublishedItemsByCategory(category) {
    return new Promise((resolve, reject) => {
      const filteredItems = items.filter(
        item => item.published && item.category == category
      );
      if (filteredItems.length > 0) {
        resolve(filteredItems);
      } else {
        reject("no results");
      }
    });
  },

  getCategories() {
    return new Promise((resolve, reject) => {
      if (categories.length > 0) {
        resolve(categories);
      } else {
        reject("no results");
      }
    });
  },

  getItemById(id) {
    return new Promise((resolve, reject) => {
      const item = items.find(item => item.id == id);
      if (item) {
        resolve(item);
      } else {
        reject("no results");
      }
    });
  },

  addItem(item) {
    return new Promise((resolve, reject) => {
      try {
        // Assign current date as postDate in YYYY-MM-DD format
        const currentDate = new Date();
        item.postDate = currentDate.toISOString().split('T')[0];
  
        // Ensure all necessary properties are provided
        if (!item.title || !item.body || !item.price || !item.featureImage || !item.category) {
          return reject("Missing required fields");
        }
  
        items.push(item);
        resolve(item);
      } catch (err) {
        reject("Unable to add item");
      }
    });
  }
};
