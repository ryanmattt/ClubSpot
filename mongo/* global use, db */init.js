/* global use, db */

// MongoDB Playground

const database = 'clubspot';
const collection = 'login';

// Use the specified database
use(database);

// Create a new collection with a validator to ensure the desired schema
db.createCollection(collection, {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["display_name", "username", "password", "Groups", "Board_Groups", "Site_admin"],
      properties: {
        display_name: {
          bsonType: "string",
          description: "must be a string"
        },
        username: {
          bsonType: "string",
          description: "must be a string"
        },
        password: {
          bsonType: "string",
          description: "must be a string"
        },
        Groups: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "must be an array of strings"
        },
        Board_Groups: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "must be an array of strings"
        },
        Site_admin: {
          bsonType: "bool",
          description: "must be a boolean"
        }
      }
    }
  },
  validationLevel: "strict",  // Enforces the schema strictly
  validationAction: "error"  // If any document doesn't follow the schema, it will throw an error
});

