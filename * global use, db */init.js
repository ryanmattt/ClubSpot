/* global use, db */

// MongoDB Playground

const database = 'clubspot';

// Use the specified database
use(database);

// Create a new collection with a validator to ensure the desired schema
db.createCollection('Login', {
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

// MongoDB Playground

// Create 'Group' collection with a validator to ensure the desired schema
db.createCollection('Group', {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["Name", "Description", "Id", "photo-url", "posts", "members", "admins"],
        properties: {
          Name: {
            bsonType: "string",
            description: "must be a string"
          },
          Description: {
            bsonType: "string",
            description: "must be a long string"
          },
          Id: {
            bsonType: "int",
            description: "must be an auto-increment integer"
          },
          "photo-url": {
            bsonType: "string",
            description: "must be a string representing a URL"
          },
          posts: {
            bsonType: "array",
            items: {
              bsonType: "object"
            },
            description: "must be an array of post objects"
          },
          members: {
            bsonType: "array",
            items: {
              bsonType: "object"
            },
            description: "must be an array of user objects"
          },
          admins: {
            bsonType: "array",
            items: {
              bsonType: "object"
            },
            description: "must be an array of user objects"
          }
        }
      }
    },
    validationLevel: "strict",
    validationAction: "error"
  });
  
  // Create 'Post' collection with a validator to ensure the desired schema
  db.createCollection('Post', {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["Name", "Group", "isEvent"],
        properties: {
          Name: {
            bsonType: "string",
            description: "must be a string"
          },
          Description: {
            bsonType: "string",
            description: "must be a long string, not required"
          },
          Group: {
            bsonType: "object",
            description: "must be a group object"
          },
          isEvent: {
            bsonType: "bool",
            description: "must be a boolean"
          },
          date: {
            bsonType: "date",
            description: "must be a datetime, not required"
          },
          location: {
            bsonType: "string",
            description: "must be a string, not required"
          },
          "photo-url": {
            bsonType: "string",
            description: "must be a string representing a URL, not required"
          }
        }
      }
    },
    validationLevel: "strict",
    validationAction: "error"
  });