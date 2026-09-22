import React, { useEffect, useState } from "react";
import {
  Users,
  Mail,
  UserCheck,
  RefreshCw,
} from "lucide-react";

const API = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem(
    "access_token"
  )}`,
  "Content-Type": "application/json",
});

function SupportTeam({ onLogout }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadAgents() {
    try {
      setError("");

      const response = await fetch(
        `${API}/support-agents/`,
        {
          headers: authHeaders(),
        }
      );

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Unable to load support team."
        );
      }

      const data = await response.json();

      setAgents(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAgents();
  }, []);

  async function refreshTeam() {
    setRefreshing(true);
    await loadAgents();
  }

  return (
    <section className="support-page">
      <div className="support-page-header">
        <div>
          <p className="eyebrow">
            TEAM MANAGEMENT
          </p>

          <h1>Support team</h1>

          <p>
            View the agents who handle customer
            support requests.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={refreshTeam}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={
              refreshing ? "spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {error && (
        <div className="support-error">
          {error}
        </div>
      )}

      <div className="team-summary">
        <div className="team-summary-icon">
          <Users size={22} />
        </div>

        <div>
          <span>Active support agents</span>

          <strong>{agents.length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="support-empty">
          Loading support team...
        </div>
      ) : agents.length === 0 ? (
        <div className="support-empty">
          <Users size={24} />

          <p>
            No support agents are available.
          </p>
        </div>
      ) : (
        <div className="team-grid">
          {agents.map((agent) => (
            <article
              className="team-card"
              key={agent.id}
            >
              <div className="team-avatar">
                {agent.username
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="team-details">
                <h3>{agent.username}</h3>

                <div>
                  <Mail size={14} />

                  <span>
                    {agent.email ||
                      "No email provided"}
                  </span>
                </div>

                <div className="team-active">
                  <UserCheck size={14} />

                  <span>
                    Active support agent
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default SupportTeam;