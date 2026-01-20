import { useEffect, useState } from "react";
import "./App.css";
import Register from "./Register";


const API_URL = "http://localhost:3000";

function App() {
  const [user, setUser] = useState(null);

  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [appointments, setAppointments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    personName: "",
    title: "",
    date: "",
    time: ""
  });

  const token = localStorage.getItem("token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  });

  /* ---------------- FETCH ---------------- */
  async function fetchAppointments() {
    const res = await fetch(`${API_URL}/appointments`, {
      headers: authHeaders()
    });

    const data = await res.json();
     if (!res.ok) {
      setError(data.error || "Failed to fetch appointments");
      return;
    }

    const formatted = data.map(a => {
      const dt = new Date(a.appointment_datetime);
      return {
        ...a,
        date: dt.toISOString().split("T")[0],
        time: dt.toTimeString().slice(0, 5)
      };
    });

    setAppointments(formatted);
  }

  useEffect(() => {
    if (!user) return;

    fetchAppointments(); // initial load
    const interval = setInterval(() => {
      fetchAppointments(); 
    }, 5000);  

    return () => clearInterval(interval); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ---------------- FORM ---------------- */
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function hasConflict() {
    return appointments.some(a =>
      a.date === form.date &&
      a.time === form.time &&
      a.id !== editingId
    );
  }

  async function submitAppointment() {
    const url = editingId
      ? `${API_URL}/appointments/${editingId}`
      : `${API_URL}/appointments`;

    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(form)
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    fetchAppointments();
    setForm({ personName: "", title: "", date: "", time: "" });
    setEditingId(null);
    setConfirmUpdate(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.personName || !form.title || !form.date || !form.time) {
      setError("All fields are required");
      return;
    }

    if (hasConflict()) {
      setError("This time slot is already booked");
      return;
    }

    if (editingId) {
      setConfirmUpdate(true);
    } else {
      submitAppointment();
    }
  }

  async function handleDelete(id) {
    await fetch(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    setAppointments(prev => prev.filter(a => a.id !== id));
  }

  function startEdit(a) {
    setEditingId(a.id);
    setForm({
      personName: a.personName,
      title: a.title,
      date: a.date,
      time: a.time
    });
  }


  /* ---------------- LOGIN ---------------- */
  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");

    if (!loginName || !password) {
      setLoginError("Username and password are required");
      return;
    }

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loginName, password })
    });

    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error || "Invalid credentials");
      return;
    }


    localStorage.setItem("token", data.token);
    setUser(data.user);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    setAppointments([]);
  }

  /* ---------------- DATE & TIME ---------------- */
  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const timeOptions = [];
  for (let h = 9; h <= 20; h++) {
    timeOptions.push(`${String(h).padStart(2, "0")}:00`);
    timeOptions.push(`${String(h).padStart(2, "0")}:30`);
  }

  /* ---------------- SORT ---------------- */
  const filteredAppointments = [...appointments]
    .sort((a, b) => b.id - a.id)
    .filter(a => {
      if (filter === "ACTIVE") return a.status === "ACTIVE";
      if (filter === "EXPIRED") return a.status === "EXPIRED";
      return true;
    });

  /* ---------------- LOGIN UI ---------------- */
  if (!user) {
  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Appointment Booking</h1>
        <p className="login-subtitle">Secure login</p>

        <form onSubmit={handleLogin} className="login-form">
          <input
            placeholder="Username"
            value={loginName}
            onChange={e => setLoginName(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>
        <p className="auth-link">
          Don’t have an account?{" "}
          <a href="/register">Create one</a>
        </p>

        {loginError && <p className="login-error">{loginError}</p>}
      </div>
    </div>
  );
}


  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="page">
      <header className="header">
        <h1>Appointment Booking</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className="grid">
        <div className="card">
          <h2>{editingId ? "Edit Appointment" : "Create Appointment"}</h2>

          <input name="personName" placeholder="Person Name" value={form.personName} onChange={handleChange} />
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />

          <select name="date" value={form.date} onChange={handleChange}>
            <option value="">Select Date</option>
            {dateOptions.map(d => <option key={d}>{d}</option>)}
          </select>

          <select name="time" value={form.time} onChange={handleChange}>
            <option value="">Select Time</option>
            {timeOptions.map(t => <option key={t}>{t}</option>)}
          </select>

          <button onClick={handleSubmit}>
            {editingId ? "Update" : "Add"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        <div className="card">
          <div className="filters">
            {["ALL", "ACTIVE", "EXPIRED"].map(f => (
              <button
                key={f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredAppointments.map(a => (
            <div key={a.id} className="appointment">
              <div>
                <h3>{a.personName} – {a.title}</h3>
                <p>{a.date} {a.time} <span className={`badge ${a.status.toLowerCase()}`}>{a.status}</span></p>
              </div>
              <div>
                <button
                  disabled={a.status === "EXPIRED"}
                  className={`btn ${a.status === "EXPIRED" ? "btn-disabled" : ""}`}
                  onClick={() => a.status !== "EXPIRED" && startEdit(a)}
                >
                  Edit
                </button>
                

                <button onClick={() => setDeleteTarget(a)}>Delete</button>
                
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmUpdate && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Confirm update?</p>
            <button className="btn btn-cancel" onClick={() => setConfirmUpdate(false)}>
              Cancel
            </button>

            <button className="danger" onClick={submitAppointment}>Update</button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Delete <b>{deleteTarget.title}</b>?</p>
            <button className="btn btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="danger" onClick={() => {
              handleDelete(deleteTarget.id);
              setDeleteTarget(null);
            }}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
