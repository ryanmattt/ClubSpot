import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../style.css";

const Profile = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState(""); // For registration
  const [displayName, setDisplayName] = useState(""); // For registration
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Track if we are in registration mode

  // Check if the user is logged in by checking cookies (but don't block rendering)
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      axios
        .post("http://localhost:3009/api/auth/verify", { token })
        .then((res) => setLoggedIn(true))
        .catch(() => setLoggedIn(false)); // If token is invalid, still show the page
    } else {
      setLoggedIn(false); // No token, show the page as not logged in
    }
  }, []); // Only run on mount

  const handleLogin = () => {
    axios
      .post("http://localhost:3009/api/auth/login", {
        username,
        password,
      })
      .then((res) => {
        Cookies.set("authToken", res.data.token, { expires: 1 }); // Save token in a cookie for 1 day
        setLoggedIn(true);
      })
      .catch((err) => setError(err.response.data.message));
  };

  const handleRegister = () => {
    if (password !== repeatPassword) {
      setError("Passwords do not match!");
      return;
    }

    axios
      .post("http://localhost:3009/api/auth/register", {
        username,
        password,
        displayName,
      })
      .then((res) => {
        setError(""); // Clear previous errors
        setIsRegistering(false); // Go back to login form
      })
      .catch((err) => setError(err.response.data.message));
  };

  return (
    <div className="App">
      <div className="container">
        <div className="card">
          {isRegistering ? (
            // Registration Form
            <>
              <h2>Register</h2>
              <input
                type="text"
                name="displayName"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <input
                type="text"
                name="username"
                placeholder="Username (used for login)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                name="repeatPassword"
                placeholder="Confirm Password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
              <button className="submitButton" onClick={handleRegister}>
                Register
              </button>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <button className="regButton" onClick={() => setIsRegistering(false)}>
                Already have an account? Login
              </button>
            </>
          ) : (
            // Login Form Lets put hte login and register in the divcard
            <>
              <h2>Login</h2>
              <hr></hr>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="submitButton" onClick={handleLogin}>
                Login
              </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <div >
            <p className="arialstyle">New User?</p>
              <a className="regLink" onClick={() => setIsRegistering(true)}>
                Register
              </a>
            </div>
            </>
          )}

        </div>
        <div>
        </div>
      </div>
      {loggedIn ? <p>Welcome! You are logged in.</p> : <p>Please log in to access more features.</p>}
    </div>
  );
};

export default Profile;
