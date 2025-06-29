import React, { useEffect, useState } from "react";
import "./App.css";

interface User {
  id: string;
  title: string;
  description: string;
  userId: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("http://localhost:7071/api/GetUser")
      .then((res) => res.json())
      .then(setUsers)
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:7071/api/CreateUser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "beta"
      },
      body: JSON.stringify({ title, description })
    });

    if (response.ok) {
      const newUser = await response.json();
      setUsers([...users, newUser]);
      setTitle("");
      setDescription("");
      setShowForm(false);
    } else {
      console.error("Failed to create user");
    }
  };

  const handleDelete = async (id: string, userId: string) => {
    const response = await fetch(
      `http://localhost:7071/api/DeleteUser?id=${id}`,
      {
        method: "DELETE",
        headers: { "x-user-id": userId }
      }
    );

    if (response.ok) {
      setUsers(users.filter((user) => user.id !== id));
    } else {
      console.error("Failed to delete user");
    }
  };

  const handleEditClick = (user: User) => {
    setEditUserId(user.id);
    setEditTitle(user.title);
    setEditDescription(user.description);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId) return;

    const response = await fetch(
      `http://localhost:7071/api/EditUser?id=${editUserId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "beta"
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          userId: "beta"
        })
      }
    );

    if (response.ok) {
      const updatedUser = await response.json();
      setUsers(users.map((u) => (u.id === editUserId ? updatedUser : u)));
      setEditUserId(null);
    } else {
      console.error("Failed to update user");
    }
  };

  return (
    <>
      <nav className="navbar">
        <h1>Beta Users</h1>
        <button className="plus-btn" onClick={() => setShowForm(true)}>
          ➕
        </button>
      </nav>

      {showForm && (
        <div className="modal">
          <form onSubmit={handleCreateUser} className="form">
            <h2>Create User</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <div className="form-buttons">
              <button type="submit">Add User</button>
              <button type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
<main>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {editUserId === user.id ? (
              <form onSubmit={handleEditSubmit}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditUserId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <strong>{user.title}</strong>
                <span>{user.description}</span>
                <div style={{ marginTop: "0.5rem" }}>
                  <button onClick={() => handleEditClick(user)}>Edit</button>
                  <button onClick={() => handleDelete(user.id, user.userId)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      </main>
    </>
  );
}

export default App;
