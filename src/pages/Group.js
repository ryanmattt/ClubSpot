import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [newGroupDialog, setNewGroupDialog] = useState(false);
  const authToken = localStorage.getItem('authToken'); // Or from context

  useEffect(() => {
    // Fetch user's groups
    const fetchGroups = async () => {
      try {
        const response = await axios.get('/api/groups/user', {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setGroups(response.data.groups);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, [authToken]);

  // Fetch all groups for the join dialog
  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        const response = await axios.get('/api/groups'); // A new endpoint to fetch all groups
        setAllGroups(response.data.groups);
      } catch (error) {
        console.error('Error fetching all groups:', error);
      }
    };

    fetchAllGroups();
  }, []);

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post('/api/groups/join', { groupId }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setShowJoinDialog(false);
      alert('Joined the group successfully!');
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await axios.post('/api/groups/create', groupData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setNewGroupDialog(true);
      alert('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  return ( <div className="App">
    <div className="group">
        <button onClick={() => setShowJoinDialog(true)}>Join Groups</button>
        <button onClick={() => setNewGroupDialog(true)}>Create a Group</button>

        {showJoinDialog ? (
        <div>
           <h1 className="arialstyle">Join Groups</h1>
          <div className='container2'>
            <input type='text' placeholder='Search....'/>
        </div>
          <ul>
            {allGroups.map(group => (
              <li key={group._id}>
                {group.name}
                <button onClick={() => handleJoinGroup(group._id)}>Join</button>
              </li>
            ))}
          </ul>
          <button onClick={() => setShowJoinDialog(false)}>Close</button>
        </div>
      ) : (
        // Content to display when `showJoinDialog` is false
        <div>
           <h1 className='arialstyle'>My Groups</h1>
          <div className='container2'>
            <input type='text' placeholder='Search....'/>
            <ul>
            {groups.map(group => (
            <li className="myGroups"  key={group._id}>{group.name}</li>
          ))}
          </ul>
        </div>
        </div>
      )}

       {newGroupDialog && (
        <div>
          <h2>Create a New Group</h2>
          <form className="groupForm" onSubmit={(e) => {
            e.preventDefault();
            const groupData = {
              name: e.target.name.value,
              description: e.target.description.value,
              photoUrl: e.target.photoUrl.value,
            };
            handleCreateGroup(groupData);
          }}>
            <input type="text" name="name" placeholder="Group Name" required />
            <textarea className = "groupText" name="description" placeholder="Group Description" required></textarea>
            <input type="text" name="photoUrl" placeholder="Photo URL" />
            <button type="submit">Create Group</button>
          </form>
<button  onClick={() => setNewGroupDialog(false)}>Close</button>
        </div>
      )}
    </div>
  </div>
  ); 
}
     

export default Group;