import React, { useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom"; // for navigation
import "../style.css";

axios.defaults.withCredentials = true; // Ensure credentials are sent with requests

const Home = () => {
  const navigate = useNavigate(); // React Router's navigate hook for redirection

  // Function to check if the user is logged in by verifying the auth token via cookies
  const verifyUser = async () => {
    try {
      // This should be a backend endpoint that verifies the user based on the cookie
      const response = await axios.post("https://spotyour.club/api/auth/verify", {}, { withCredentials: true });
      // If the response is successful, navigate to the feed page
      navigate("/feed");
    } catch (error) {
      // If verification fails, you can leave the user on the home page
      console.log("No valid auth token or user is not logged in.");
    }
  };

  // Check for cookies and verify the user when the component mounts
  useEffect(() => {
    // Check if there are any cookies (this is a generic check for the presence of cookies)
    const cookies = Cookies.get(); // This will get all cookies
    if (Object.keys(cookies).length > 0) {
      // If there are cookies, attempt to verify the user with the server
      verifyUser();
    } else {
      console.log("No cookies found.");
    }
  }, [navigate]);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1 className="title">Welcome to ClubSpot!</h1>
          <p className="description">
            Discover clubs, connect with members, and explore exclusive content in a space designed for meaningful interaction.
          </p>
          <p className="cta-text">
            You'll soon be able to spot your club and join a growing community!
          </p>
          <a className="App-link" href="/profile">Sign In</a> {/* Show sign-in link if not logged in */}
        </div>
      </header>
    </div>
  );
};

export default Home;
