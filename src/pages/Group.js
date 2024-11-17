import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../group.css';

const Group = () => {
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [newGroupDialog, setNewGroupDialog] = useState(false);
  const [joinableGroups, setJoinableGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const authToken = localStorage.getItem('authToken');

  // Filtered groups
  const filteredMyGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm) ||
    group.description.toLowerCase().includes(searchTerm)
  );

  const filteredJoinableGroups = joinableGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm) ||
    group.description.toLowerCase().includes(searchTerm)
  );

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

  // Fetch all groups
  const fetchAllGroups = async () => {
    try {
      const response = await axios.get('/api/groups');
      setAllGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching all groups:', error);
    }
  };

  // Fetch joinable groups
  const fetchJoinableGroups = async () => {
    fetchGroups();
    fetchAllGroups();

    setJoinableGroups(
      allGroups.filter(
        (group) => !groups.some((userGroup) => userGroup._id === group._id)
      )
    );
  };

  useEffect(() => {
    fetchGroups();
    fetchAllGroups();
    fetchJoinableGroups(); // eslint-disable-next-line
  }, [authToken]); 

  // Handle Join Group
  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(
        '/api/groups/join',
        { groupId },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      alert('Joined the group successfully!');
      fetchJoinableGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  // Handle Create Group
  const handleCreateGroup = async (groupData) => {
    try {
      await axios.post('/api/groups/create', groupData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setNewGroupDialog(false);
      alert('Group created successfully!');
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  // Handle Leave Group
  const handleLeaveGroup = async (groupId) => {
    try {
      await axios.post(
        '/api/groups/leave',
        { groupId },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      fetchGroups();
      alert('Left the group successfully!');
    } catch (error) {
      console.error('Error leaving group:', error);
      alert('Failed to leave the group. Please try again.');
    }
  };

  return (
    <div className="App">
      <div className="group">
        <button
          className="joinButton"
          onClick={() => {
            setShowJoinDialog(true);
            setNewGroupDialog(false);
            fetchJoinableGroups();
          }}
        >
          Join Groups
        </button>
        <button
          className="joinButton"
          onClick={() => {
            setNewGroupDialog(true);
            setShowJoinDialog(false);
          }}
        >
          Create a Group
        </button>

        {/* Join Groups Dialog */}
        {showJoinDialog ? (
          <div>
            <h1 className="arialstyle">Join Groups</h1>
            <div className="container2">
              <input
                type="text"
                className="textStyle"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              />
            </div>
            <div className="groupList">
              {filteredJoinableGroups.length > 0 ? (
                filteredJoinableGroups.map((group) => (
                  <div key={group._id} className="groupCard">
                    <img
                      src={group.photoUrl || '/placeholder.png'}
                      alt={group.name}
                    />
                    <div className="groupContent">
                      <h3>{group.name}</h3>
                      <p>{group.description}</p>
                      <button
                        className="joinClub"
                        onClick={() => handleJoinGroup(group._id)}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No groups found.</p>
              )}
            </div>
            <button
              className="leaveButton"
              onClick={() => setShowJoinDialog(false)}
            >
              Close
            </button>
          </div>
        ) : newGroupDialog ? (
          // Create a Group Dialog
          <div>
            <h1 className="arialstyle">Create a New Group</h1>
            <form
              className="groupForm"
              onSubmit={(e) => {
                e.preventDefault();
                const groupData = {
                  name: e.target.name.value,
                  description: e.target.comments.value,
                  photoUrl: e.target.photoUrl.value,
                };
                handleCreateGroup(groupData);
              }}
            >
              <div className="textArea">
                <label htmlFor="name">Group Name:</label>
                <input
                  type="text"
                  name="name"
                  className="textStyle"
                  placeholder="Group Name"
                  required
                />
                <label htmlFor="comments">Group Description:</label>
                <textarea
                  id="comments"
                  name="comments"
                  placeholder="Write your group description here..."
                ></textarea>
                <label className="groupUrl" htmlFor="photoUrl">
                  Group Image URL:
                </label>
                <input
                  className="textStyle"
                  type="text"
                  name="photoUrl"
                  placeholder="Photo URL"
                />
                <button className="joinButton" type="submit">
                  Create Group
                </button>
              </div>
            </form>
            <button
              className="leaveButton"
              onClick={() => setNewGroupDialog(false)}
            >
              Close
            </button>
          </div>
        ) : (
          // My Groups
          <div>
            <h1 className="arialstyle">My Groups</h1>
            <div className="container2">
              <input
                type="text"
                className="textStyle"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              />
            </div>
            <div className="groupList">
              {filteredMyGroups.length > 0 ? (
                filteredMyGroups.map((group) => (
                  <div key={group._id} className="groupCard">
                    <img
                      src={group.photoUrl || '/placeholder.png'}
                      alt={group.name}
                    />
                    <div className="groupContent">
                      <h3>{group.name}</h3>
                      <p>{group.description}</p>
                      <div className="buttonCon">
                        <button
                          className="leaveButton"
                          onClick={() => handleLeaveGroup(group._id)}
                        >
                          Leave Group
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No groups found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Group;
