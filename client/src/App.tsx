import React, { useEffect, useState } from "react";

interface User {
  id: string;
  title: string;
  description: string;
  userId: string;
}

const API_BASE = "http://localhost:7071/api";
const API_KEY = "mySuperSecretKey123";
const USER_ID = "beta";

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/GetUser`, {
      headers: {
        "x-api-key": API_KEY
      }
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Failed to fetch users:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/CreateUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "x-user-id": USER_ID
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription
        })
      });

      window.location.reload();
    } catch (err) {
      console.error("Failed to create user:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE}/DeleteUser?id=${id}`, {
        method: "DELETE",
        headers: {
          "x-api-key": API_KEY,
          "x-user-id": USER_ID
        }
      });

      window.location.reload();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await fetch(`${API_BASE}/EditUser?id=${editingUser.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "x-user-id": USER_ID
        },
        body: JSON.stringify({
          userId: editingUser.userId,
          title: editTitle,
          description: editDescription
        })
      });

      window.location.reload();
    } catch (err) {
      console.error("Failed to update user:", err);
    }
  };

  return (
    <div className="container">
      <div className="navbar">
        <h1>Beta Users</h1>
        <button className="button" onClick={() => setShowForm(true)}>
          + Add User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="input"
            required
          />
          <button type="submit" className="button">
            Create User
          </button>
        </form>
      )}

      {editingUser && (
        <form onSubmit={handleEditSubmit} className="form">
          <input
            type="text"
            placeholder="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="input"
            required
          />
          <button type="submit" className="edit-btn">
            Save Changes
          </button>
        </form>
      )}

      <ul className="user-list">
        {users.map(user => (
          <li key={user.id} className="user-item">
            <div>
              <strong>{user.title}</strong>
              <p>{user.description}</p>
            </div>
            <div>
              <button
                className="edit-btn"
                onClick={() => {
                  setEditingUser(user);
                  setEditTitle(user.title);
                  setEditDescription(user.description);
                }}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDelete(user.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
