import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../style.css";
axios.defaults.withCredentials = true;


const Profile = () => {
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [showJoinDialog, setShowJoinDialog] = useState(true);
  const [newGroupDialog, setNewGroupDialog] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true); // Default to false
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState(""); // For registration
  const [displayName, setDisplayName] = useState(""); // For registration
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false); // Track if we are in registration mode
  const [userDisplayName, setUserDisplayName] = useState(""); // Store display name for logged-in user


  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups/user', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Check if the user is logged in by checking cookies (but don't block rendering)
  useEffect(() => {
      axios
      .post("https://spotyour.club/api/auth/verify", {}, { withCredentials: true })
        .then((res) => {
          fetchGroups();
          setLoggedIn(true);
          setUserDisplayName(res.data.displayName); // Set displayName
          setUsername(res.data.username); // Set username from the decoded token
        })
        .catch(() => {setLoggedIn(false);}); // If token is invalid, show logged out state
       
        


    }, []); // Only run on mount
    

  const handleLogin = () => {
    axios
      .post("https://spotyour.club/api/auth/login", {
        username,
        password,
      })
      .then((res) => {
        Cookies.set("authToken", res.data.token, { expires: 1 }); // Save token in a cookie for 1 day
        setUserDisplayName(res.data.displayName); // Set display name from the response
        fetchGroups();
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
      .post("https://spotyour.club/api/auth/register", {
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

  const handleLogout = () => {
    axios
      .post("https://spotyour.club/api/auth/logout", {}, { withCredentials: true }) // Notify the backend to clear the cookie
      .then(() => {
        setLoggedIn(false); // Update state
        setUserDisplayName(""); // Clear user display name
        setUsername(""); // Clear username
      })
      .catch((err) => {
        console.error("Logout failed:", err);
      });
  };
  
  return (
    <div className="App">
      <div className="container">
        {loggedIn ? (
          // After logging in, show the welcome message
          <div className="profile">
            <div className="welcomeMessage">
              <h2>You are currently signed in as {userDisplayName}, click below to sign out.</h2>
              <input className="signout" type="button" value="Sign Out" onClick={handleLogout} />
              <h3>You are a memeber of the following groups</h3>
              <ul>
          <h1 className="arialstyle">My Groups</h1>
          {groups.map(group => (
            <li className="myGroups"  key={group._id}>{group.name}</li>
          ))}
        </ul>
            </div>
          </div>
        ) : (
          // If not logged in, show login or register form
          <div className="card">
            {isRegistering ? (
              // Registration Form
              <>
                <div className="regForm">
                  <h2>Register</h2>
                  <hr />
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
                  <div className="row">
                    <p className="arialstyle">Already have an account?</p>
                    <a className="regLink" onClick={() => setIsRegistering(false)}>
                      Login
                    </a>
                  </div>
                </div>
              </>
            ) : (
              // Login Form
              <>
                <h2>Login</h2>
                <hr />
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
                <div className="row">
                  <p className="arialstyle">New User?</p>
                  <a className="regLink" onClick={() => setIsRegistering(true)}>
                    Register
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      {!loggedIn && <p>Please log in to access more features.</p>}
    </div>
  );
};

export default Profile;
