import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000";

function App() {
  const [user, setUser] = useState(null);
  const [loginName, setLoginName] = useState("");
  const [password, setPassword] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({
    personName: "",
    title: "",
    date: "",
    time: ""
  });
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const token = localStorage.getItem("token");

  /* ---------------- AUTH HEADER ---------------- */
  function authHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
  }
  /* ---------------- FETCH APPOINTMENTS ---------------- */
  async function fetchAppointments() {
    const res = await fetch(`${API_URL}/appointments`, {
      headers: authHeaders()
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to fetch appointments");
      return;
    }
    // Split datetime into date + time (UI compatibility)
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

  /* ---------------- AUTO REFRESH ---------------- */
  useEffect(() => {
    if (!user) return;

    fetchAppointments(); // initial load
    const interval = setInterval(() => {
      fetchAppointments(); 
    }, 5000);  

    return () => clearInterval(interval); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  /* ---------------- FORM HANDLERS ---------------- */
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

 //Submit
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

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
  }

 //Delete
  async function handleDelete(id) {
    setError("");

    const res = await fetch(`${API_URL}/appointments/${Number(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to delete appointment");
      return;
    }

    setAppointments(prev => prev.filter(a => a.id !== id));
  }



  function startEdit(appt) {
    setEditingId(appt.id);
    setForm({
      personName: appt.personName,
      title: appt.title,
      date: appt.date,
      time: appt.time
    });
  }

  /* ---------------- FILTER ---------------- */
  const filteredAppointments = [...appointments]
  .sort(
    (a, b) =>
      new Date(b.appointment_datetime) -
      new Date(a.appointment_datetime)
  )
  .filter(a => {
    if (filter === "ACTIVE") return a.status === "ACTIVE";
    if (filter === "EXPIRED") return a.status === "EXPIRED";
    return true;
  });


  /* ---------------- LOGIN ---------------- */
  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: loginName,
        password
      })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    localStorage.setItem("token", data.token);
    setUser(data.user);
    setLoginName("");
    setPassword("");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setUser(null);
    setAppointments([]);
  }

  /* ---------------- LOGIN UI ---------------- */
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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
          <br /><br />
          <button type="submit">Login</button>
        </form>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  }

  /* ---------------- MAIN UI ---------------- */
  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>Appointment Booking</h1>
          <p className="logged">Logged in as <b>{user.username}</b></p>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="grid">
        <div className="card">
          <h2>{editingId ? "Edit Appointment" : "Create Appointment"}</h2>

          <input name="personName" placeholder="Person Name" value={form.personName} onChange={handleChange} />
          <input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          <input type="date" name="date" value={form.date} onChange={handleChange} />
          <input type="time" name="time" value={form.time} onChange={handleChange} />

          <button onClick={handleSubmit}>
            {editingId ? "Update" : "Add"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        <div className="card">
          <h2>Appointments</h2>

          <div className="filters">
            {["ALL", "ACTIVE", "EXPIRED"].map(f => (
              <button key={f} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          <div className="list">
            {filteredAppointments.length === 0 ? (
              <p>No appointments</p>
            ) : (
              filteredAppointments.map(appt => (
                <div key={appt.id} className="appointment">
                  <div>
                    <h3>{appt.personName} – {appt.title}</h3>
                    <p>{appt.date} {appt.time} · {appt.status}</p>
                  </div>
                  <div>
                    <button onClick={() => startEdit(appt)}>Edit</button>
                    <button onClick={() => setDeleteTarget(appt)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="modal-backdrop">
          <div className="modal">
            <p>Delete {deleteTarget.title}?</p>
            <button onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button onClick={() => {
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
