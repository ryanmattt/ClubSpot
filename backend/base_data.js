const mongoose = require('mongoose');
const faker = require('faker');

// Define the post schema
const postSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  group: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  isEvent: { type: Boolean, required: true },
  date: { type: Date, required: false },
  location: { type: String, required: false },
  photoUrl: { type: String, required: false }, // 'photo-url' field
  username: { type: String, required: true },
});

// Create the Post model from the schema
const Post = mongoose.model('Post', postSchema);

// Connect to MongoDB (adjust the connection string as needed)
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

    
    // Generate and insert fake posts
    generateFakePosts(10); // Generate 10 fake posts

// Function to generate fake posts and insert into MongoDB
async function generateFakePosts(numPosts) {
  for (let i = 0; i < numPosts; i++) {
    const fakePost = {
      name: faker.lorem.words(3), // Generate a random name with 3 words
      description: faker.lorem.sentence(), // Generate a random description
      group: mongoose.Types.ObjectId(), // Create a random ObjectId for the group reference
      isEvent: faker.datatype.boolean(), // Random boolean for isEvent
      date: faker.datatype.boolean() ? faker.date.future() : null, // Random future date or null
      location: faker.address.city(), // Random city for location
      photoUrl: faker.image.imageUrl(), // Random photo URL
      username: faker.internet.userName(), // Random username
    };

    // Create a new post instance and save it to the database
    const post = new Post(fakePost);

    try {
      await post.save(); // Save the post to MongoDB
      console.log(`Fake post created: ${fakePost.name}`);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  }
}
