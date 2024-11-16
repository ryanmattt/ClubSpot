import '../App.css';
import React from 'react';



const Profile = () => {
    return ( 
    <div className="App">
        {/* top justify */}
             {/*logo feed, groups, login/profile */}
        <div className = "card">



        <input type="text" name = "email" placeholder="Email"/>
        <input type="text" name = "pword" placeholder="Password"/>
        <Button variant="primary">Primary</Button>
        

        </div>
           
         
   
         <header className="App-header">
           <p>
             THE IS THE PROFILE
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
  
  export default Profile;
  