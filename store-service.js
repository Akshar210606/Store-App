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
