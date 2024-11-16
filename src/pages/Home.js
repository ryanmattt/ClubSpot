import '../App.css';
import React from 'react';

import { BrowserRouter, Routes, Route, Router } from 'react-router-dom';
const Home = () => {
    return ( <div className="App">
        {/* top justify */}
             {/*logo feed, groups, login/profile */}
           
         
   
         <header className="App-header">
           <p>
             You'll soon be able to spot your club!
           </p>
           <a
             className="App-link"
             href="https://spotyour.club/"
             target="_blank"
             rel="noopener noreferrer"
           >
             ClubSpot
           </a>
         </header>
       </div>);
  };
  
  export default Home;
  