import { Outlet, Link } from "react-router-dom";








const Layout = () => {
    return (
      <>
        <nav className="navbar">
          <div className="navbar-left">
            <a href="/"> <img src="logo192.png" className="topLeftImage" alt="Logo" /></a>
          </div>
          <div className="navbar-right">
            <Link className="topButton" to="/Feed">Feed</Link>
            <Link className="topButton" to="/Groups">Groups</Link>
            <Link className="topButton" to="/Profile">Profile</Link>
          </div>
        </nav>
  
        <Outlet />
      </>
    );
  };
export default Layout;
