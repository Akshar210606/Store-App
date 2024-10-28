const fs = require('fs');
const path = require('path');

let items = [];     // Array to hold item objects
let categories = []; // Array to hold category objects

// Function to initialize the module by reading the JSON files
module.exports.initialize = function() {
    return new Promise((resolve, reject) => {
        // Read items.json
        fs.readFile(path.join(__dirname, 'data', 'items.json'), 'utf8', (err, data) => {
            if (err) {
                return reject('Unable to read items.json'); // Reject promise if there’s an error
            }
            items = JSON.parse(data); // Parse and assign items array

            // Read categories.json
            fs.readFile(path.join(__dirname, 'data', 'categories.json'), 'utf8', (err, data) => {
                if (err) {
                    return reject('Unable to read categories.json'); // Reject promise if there’s an error
                }
                categories = JSON.parse(data); // Parse and assign categories array

                resolve(); // Resolve promise when both files are read successfully
            });
        });
    });
};

<<<<<<< HEAD
// Function to add a new item to the items array
module.exports.addItem = function(itemData) {
    return new Promise((resolve, reject) => {
        // Set published to true if defined, otherwise set to false
        itemData.published = itemData.published !== undefined;

        // Assign a unique id based on the current length of the items array
        itemData.id = items.length + 1;

        // Add the item to the items array
        items.push(itemData);

        // Resolve the promise with the new item data
        resolve(itemData);
    });
};

=======
>>>>>>> edce93c71e8a8c564f5fd8c0cd767de2b92ef99a
// Export additional methods
module.exports.getAllItems = function() {
    return new Promise((resolve, reject) => {
        if (items.length === 0) {
            return reject('No results returned'); // Reject if no items found
        }
        resolve(items); // Resolve with items array
    });
};

module.exports.getPublishedItems = function() {
    return new Promise((resolve, reject) => {
        const publishedItems = items.filter(item => item.published === true); // Filter for published items
        if (publishedItems.length === 0) {
            return reject('No results returned'); // Reject if no published items found
        }
        resolve(publishedItems); // Resolve with filtered published items
    });
};

module.exports.getCategories = function() {
    return new Promise((resolve, reject) => {
        if (categories.length === 0) {
            return reject('No results returned'); // Reject if no categories found
        }
        resolve(categories); // Resolve with categories array
    });
};
<<<<<<< HEAD

// Function to get items by category
module.exports.getItemsByCategory = function(category) {
    return new Promise((resolve, reject) => {
        const filteredItems = items.filter(item => item.category === parseInt(category));
        if (filteredItems.length === 0) {
            return reject('No results returned'); // Reject if no items found for the category
        } else {
            resolve(filteredItems); // Resolve with filtered items
        }
    });
};

// Function to get items by minimum date
module.exports.getItemsByMinDate = function(minDateStr) {
    return new Promise((resolve, reject) => {
        const minDate = new Date(minDateStr);
        const filteredItems = items.filter(item => new Date(item.postDate) >= minDate);
        if (filteredItems.length === 0) {
            return reject('No results returned'); // Reject if no items found for the date filter
        } else {
            resolve(filteredItems);
        }
    });
};

module.exports.getItemById = function(id) {
    return new Promise((resolve, reject) => {
        const item = items.find(item => item.id === parseInt(id));
        if (!item) {
            return reject('Item not found'); // Reject if no item matches the id
        } else {
            resolve(item);
        }
    });
};


=======
>>>>>>> edce93c71e8a8c564f5fd8c0cd767de2b92ef99a
