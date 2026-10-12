import React, { useCallback, useEffect, useState } from "react";
import { UserPlus, Users, RefreshCw, ShieldCheck, UserRound, Headset, Power } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  "Content-Type": "application/json",
});
const roleLabels = { customer: "Customer", support_agent: "Support agent", admin: "Admin" };

export default function UserManagement({ onLogout, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ username: "", email: "", password: "", role: "customer" });

  const loadUsers = useCallback(async () => {
    try {
      setError("");
      const response = await fetch(`${API}/users/`, { headers: authHeaders() });
      if (response.status === 401) { onLogout(); return; }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.detail || "Unable to load users. Make sure you are signed in as an admin.");
      setUsers(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onLogout]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function createUser(event) {
    event.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    try {
      const response = await fetch(`${API}/users/`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { onLogout(); return; }
      if (!response.ok) {
        const firstError = Object.values(data).flat()[0];
        throw new Error(typeof firstError === "string" ? firstError : "Unable to create user.");
      }
      setSuccess(`${roleLabels[data.user?.role] || "User"} created successfully.`);
      setForm({ username: "", email: "", password: "", role: "customer" });
      await loadUsers();
    } catch (err) {
      setError(err.message || "Unable to create user.");
    } finally { setSaving(false); }
  }

  async function toggleActive(user) {
    setError(""); setSuccess("");
    try {
      const response = await fetch(`${API}/users/${user.id}/`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify({ is_active: !user.is_active }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) { onLogout(); return; }
      if (!response.ok) throw new Error(data.detail || "Unable to update account status.");
      setUsers((previous) => previous.map((item) => item.id === user.id ? data : item));
      setSuccess(`${user.username} is now ${data.is_active ? "active" : "inactive"}.`);
    } catch (err) { setError(err.message || "Unable to update account status."); }
  }

  return (
    <section className="support-page user-management-page">
      <div className="support-page-header">
        <div><p className="eyebrow">ADMINISTRATION</p><h1>User management</h1><p>Create customer accounts, support agents, and administrator accounts.</p></div>
        <button className="refresh-button" type="button" onClick={() => { setRefreshing(true); loadUsers(); }} disabled={refreshing}>
          <RefreshCw size={17} className={refreshing ? "spin" : ""} /> Refresh
        </button>
      </div>
      {error && <div className="support-error" role="alert">{error}</div>}
      {success && <div className="user-success" role="status">{success}</div>}

      <div className="user-admin-layout">
        <form className="user-create-card" onSubmit={createUser}>
          <div className="user-form-title"><span><UserPlus size={19} /></span><div><h2>Create a user</h2><p>Choose the account type and set initial login details.</p></div></div>
          <label>Username<input required minLength={3} autoComplete="off" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. support.jane" /></label>
          <label>Email address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@example.com" /></label>
          <label>Temporary password<input type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></label>
          <label>Account role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="customer">Customer</option><option value="support_agent">Support agent</option><option value="admin">Administrator</option></select></label>
          <p className="user-form-hint">Only existing superusers can access this page or create administrator accounts.</p>
          <button className="user-create-button" type="submit" disabled={saving}><UserPlus size={17} />{saving ? "Creating…" : "Create account"}</button>
        </form>

        <div className="user-list-card">
          <div className="user-list-heading"><div><h2><Users size={19} /> Accounts</h2><p>Manage access for registered users.</p></div><span>{users.length} total</span></div>
          {loading ? <div className="support-empty">Loading users…</div> : users.length === 0 ? <div className="support-empty">No user accounts found.</div> : (
            <div className="managed-user-list">{users.map((user) => {
              const RoleIcon = user.role === "admin" ? ShieldCheck : user.role === "support_agent" ? Headset : UserRound;
              return <article className="managed-user-row" key={user.id}>
                <div className="managed-user-avatar">{user.username?.slice(0, 1).toUpperCase()}</div>
                <div className="managed-user-main"><strong>{user.username}</strong><span>{user.email || "No email address"}</span><div className="managed-user-tags"><span className={`role-pill ${user.role}`}><RoleIcon size={12} />{roleLabels[user.role] || user.role}</span><span className={`account-state ${user.is_active ? "active" : "inactive"}`}>{user.is_active ? "Active" : "Inactive"}</span></div></div>
                <button className="account-toggle" type="button" onClick={() => toggleActive(user)} disabled={user.id === currentUserId} title={user.is_active ? "Deactivate account" : "Activate account"}><Power size={15} />{user.is_active ? "Deactivate" : "Activate"}</button>
              </article>;
            })}</div>
          )}
        </div>
      </div>
    </section>
  );
}
