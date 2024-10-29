const fs = require('fs');
const path = require('path');

let items = [];      // Array to hold item objects
let categories = []; // Array to hold category objects

// Initialize the module by reading JSON files
module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        // Read items.json
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                return reject('Unable to read items.json');
            }
            items = JSON.parse(data);

            // Read categories.json
            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    return reject('Unable to read categories.json');
                }
                categories = JSON.parse(data);
                resolve(); // Resolve when both files are successfully read
            });
        });
    });
};

// Get all items
module.exports.getAllItems = function() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            reject('No results returned');
        } else {
            resolve(items);
        }
    });
};

// Get all published items
module.exports.getPublishedItems = function() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true);
        if (publishedItems.length === 0) {
            reject('No results returned');
        } else {
            resolve(publishedItems);
        }
    });
};

// Get all categories
module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            reject('No results returned');
        } else {
            resolve(categories);
        }
    });
};

// Add a new item
module.exports.addItem = function(itemData) {
    return new Promise((resolve, reject) => {
        // Set published status based on checkbox
        itemData.published = itemData.published ? true : false;

        // Assign a unique ID by adding 1 to the length of items array
        itemData.id = items.length + 1;

        // Push the new item onto the items array
        items.push(itemData);

        // For now, resolve with the newly added item (no persistence in file)
        resolve(itemData);
    });
};

// Get items by category
module.exports.getItemsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category == category);
        if (filteredItems.length === 0) {
            reject('No results returned');
        } else {
            resolve(filteredItems);
        }
    });
};

// Get items by minimum date
module.exports.getItemsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);

        if (filteredItems.length === 0) {
            reject('No results returned');
        } else {
            resolve(filteredItems);
        }
    });
};

// Get item by ID
module.exports.getItemById = function(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id == id);
        if (!item) {
            reject('No result returned');
        } else {
            resolve(item);
        }
    });
};
