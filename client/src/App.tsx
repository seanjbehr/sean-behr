import React, { useEffect, useState } from "react";

interface User {
  id: string;
  title: string;
  description: string;
  email: string;
  isApproved: boolean;
  userId: string;
}

const API_BASE = "http://localhost:7071/api";
const API_KEY = "mySuperSecretKey123";
const USER_ID = "beta";

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newApproved, setNewApproved] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editApproved, setEditApproved] = useState(false);

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
          description: newDescription,
          email: newEmail,
          isApproved: newApproved
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
          description: editDescription,
          email: editEmail,
          isApproved: editApproved
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
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="input"
            required
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={newApproved}
              onChange={(e) => setNewApproved(e.target.checked)}
            />
            Approved
          </label>
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
          <input
            type="email"
            placeholder="Email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            className="input"
            required
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={editApproved}
              onChange={(e) => setEditApproved(e.target.checked)}
            />
            Approved
          </label>
          <button type="submit" className="edit-btn">
            Save Changes
          </button>
        </form>
      )}

      <ul className="user-list">
        {users.map((user) => (
          <li key={user.id} className="user-item">
            <div>
              <strong>{user.title}</strong>
              <p>{user.description}</p>
              <p>Email: {user.email}</p>
              <p>Approved: {user.isApproved ? "✅" : "❌"}</p>
            </div>
            <div>
              <button
                className="edit-btn"
                onClick={() => {
                  setEditingUser(user);
                  setEditTitle(user.title);
                  setEditDescription(user.description);
                  setEditEmail(user.email);
                  setEditApproved(user.isApproved);
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
