// The current database to use.
const database = 'clubspot';
const collection = 'login';

// Use the specified database
use(database);
// Create a new document in the collection.
db.getCollection(collection).insertOne({
    "display_name": "John Doe",
    "username": "johndoe123",
    "password": "hashedpassword123",  // Use a hashed password in production
    "Groups": ["admin", "editor"],
    "Board_Groups": ["board1", "board2"],
    "Site_admin": true
  });
