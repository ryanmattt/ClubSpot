import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // React Router for navigation
import "../style.css";

axios.defaults.withCredentials = true; // Ensure credentials are sent with requests

const Home = () => {
  const [loggedIn, setLoggedIn] = useState(true); // Default to false
  const navigate = useNavigate(); // React Router's navigate hook for redirection

  useEffect(() => {
    axios
      .post("https://spotyour.club/api/auth/verify", {}, { withCredentials: true })
      .then((res) => {
        setLoggedIn(true);
        console.log("Logged in successfully"); 
        navigate("/Feed"); // Redirect to the feed page
      })
      .catch(() => {
        setLoggedIn(false);
        console.log("User not logged in");
      });
      // eslint-disable-next-line
  }, []); // Run only on component mount

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1 className="title">Welcome to ClubSpot!</h1>
          <p className="description">
            Discover clubs, connect with members, and explore exclusive content in a space designed for meaningful interaction.
          </p>
          <p className="cta-text">
            Your gateway to an engaging and collaborative community experience.
          </p> 
          {!loggedIn && (
            <a className="App-link" href="/profile">
              Sign In
            </a>
          )}
        </div>
      </header>
    </div>
  );
};

export default Home;
