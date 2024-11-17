import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../feed.css';

import { useNavigate } from "react-router-dom"; // React Router for navigation

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [boardGroups, setBoardGroups] = useState([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postName, setPostName] = useState("");
  const [description, setDescription] = useState("");
  const [isEvent, setIsEvent] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const authToken = localStorage.getItem('authToken');

  // Fetch all posts from all groups the user belongs to
  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts/user', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const sortedPosts = response.data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      // set urls to group photos
      setPosts(sortedPosts);
    } catch (error) {
      console.log('No posts', error);
    }
  };


  // Handle post creation
  const handleCreatePost = async () => {
    const postData = {
      group: selectedGroup,
      postName,
      description,
      isEvent,
      date: isEvent ? eventDate : null,
      location: isEvent ? eventLocation : null,
      imageUrl: !isEvent ? imageUrl : null,
    };

    try {
       await axios.post('/api/posts', postData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      // Reset form and refresh posts
      setPostName("");
      setDescription("");
      setIsEvent(false);
      setEventDate("");
      setEventLocation("");
      setImageUrl("");
      setSelectedGroup("");
      setError(""); // Clear any previous errors
      setIsCreatingPost(false);
      fetchPosts(); // Refresh the posts
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  useEffect(() => {

    const authToken = localStorage.getItem('authToken');

    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts/user', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const sortedPosts = response.data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(sortedPosts);
      } catch (error) {
        console.log('No posts', error);
      }
    };
  
    // Fetch user's groups
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setBoardGroups(response.data.board_groups);
      } catch (error) {
        console.error('Error fetching user groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    fetchUserData();
  }, []);

  return (
    <div className="App">
      <div className="feed">
        {isCreatingPost ? (
          <div className="create-post-dialog">
            <h2>Create Post</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={(e) => e.preventDefault()}>
              <label>Group</label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                required
              >
                <option value="">Select Group</option>
                {boardGroups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>

              <label>Post Name</label>
              <input
                type="text"
                value={postName}
                onChange={(e) => setPostName(e.target.value)}
                required
              />

              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>

              <label>Event</label>
              <input
                type="checkbox"
                checked={isEvent}
                onChange={() => setIsEvent(!isEvent)}
              />

              {isEvent ? (
                <>
                  <label>Event Date</label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />

                  <label>Event Location</label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required
                  />
                </>
              ) : (
                <>
                  <label>Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </>
              )}

              <button type="submit" onClick={handleCreatePost}>Submit</button>
              <button
                type="button"
                onClick={() => {
                  setError(""); // Clear any errors
                  setPostName("");
                  setDescription("");
                  setIsEvent(false);
                  setEventDate("");
                  setEventLocation("");
                  setImageUrl("");
                  setSelectedGroup("Select Group");
                  setIsCreatingPost(false);
                  navigate("/Feed"); 
                }}
              >
                Cancel
              </button>
            </form>
          </div>
        ) : (
          <>
            <h1>Feed</h1>
            <div className="joinFeed">
              <button
                className="joinFeedButton"
                onClick={() => setIsCreatingPost(true)}
              >
                Create Post
              </button>
            </div>
            {loading ? (
              <p>Loading...</p>
            ) : posts.length === 0 ? (
              <p>No posts available.</p>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="post">
                  <div className="post-header">
                    <img
                      src={post.group.photoUrl || '/placeholder.png'}
                      alt={post.group.name}
                      className="group-image"
                    />
                    <div className="post-info">
                      <h3>{post.name}</h3>
                      <p>{post.description}</p>
                      <small>
                        Posted in {post.group.name} by {post.username}
                      </small>
                      {post.date && (
                        <p>
                          Event Date: {new Date(post.date).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Feed;
