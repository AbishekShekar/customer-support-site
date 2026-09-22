import React, { useEffect, useState } from "react";
import {
  Ticket,
  Users,
  Clock3,
  CheckCircle2,
  UserPlus,
  RefreshCw,
  LogOut,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

import SupportTickets from "./SupportTickets";
import SupportTeam from "./SupportTeam";
import SupportChat from "./SupportChat";

const API = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

const getAccessToken = () =>
  localStorage.getItem("access_token");

const authHeaders = () => ({
  Authorization: `Bearer ${getAccessToken()}`,
  "Content-Type": "application/json",
});

const statusLabels = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

function SupportDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState("");

  const [refreshing, setRefreshing] = useState(false);

  /* =====================================================
     LOAD TICKETS
  ===================================================== */

  async function loadTickets() {
    try {
      const response = await fetch(
        `${API}/tickets/`,
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
          "Unable to load support tickets."
        );
      }

      const data = await response.json();

      setTickets(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error(error);
      setError(error.message);
    }
  }

  /* =====================================================
     LOAD SUPPORT AGENTS
  ===================================================== */

  async function loadAgents() {
    try {
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
          "Unable to load support agents."
        );
      }

      const data = await response.json();

      setAgents(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error(
        "Could not load support agents:",
        error
      );

      setAgents([]);
    }
  }

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      await Promise.all([
        loadTickets(),
        loadAgents(),
      ]);

      setLoading(false);
    }

    loadDashboard();
  }, []);

  /* =====================================================
     REFRESH
  ===================================================== */

  async function refreshDashboard() {
    setRefreshing(true);
    setError("");

    await Promise.all([
      loadTickets(),
      loadAgents(),
    ]);

    setRefreshing(false);
  }

  /* =====================================================
     ASSIGN TICKET
  ===================================================== */

  async function assignTicket() {
    if (!selectedTicket || !selectedAgent) {
      return;
    }

    setAssigning(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/tickets/${selectedTicket.id}/assign/`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            agent_id: Number(selectedAgent),
          }),
        }
      );

      if (response.status === 401) {
        onLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Unable to assign ticket."
        );
      }

      // Refresh tickets so assignment appears immediately.
      await loadTickets();

      setSelectedTicket(null);
      setSelectedAgent("");
    } catch (error) {
      console.error(
        "Ticket assignment failed:",
        error
      );

      setError(
        error.message ||
          "Unable to assign ticket."
      );
    } finally {
      setAssigning(false);
    }
  }

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) =>
      ticket.status === "open"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) =>
      ticket.status === "in_progress"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      ticket.status === "resolved"
  ).length;

  const unassignedTickets = tickets.filter(
    (ticket) =>
      !ticket.assigned_to
  );

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="support-dashboard">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="support-sidebar">

        <div className="support-logo">
          <span className="brand-mark">
            r
          </span>

          resolvedesk
        </div>

        <nav className="support-nav">

          <button
            type="button"
            className={
              activePage === "dashboard"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            <Ticket size={18} />
            Dashboard
          </button>

          <button
            type="button"
            className={
              activePage === "tickets"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("tickets")
            }
          >
            <Ticket size={18} />
            Tickets
          </button>

          <button
            type="button"
            className={
                activePage === "chat"
                ? "active"
                : ""
            }
            onClick={() =>
                setActivePage("chat")
            }
            >
            <MessageCircle size={18} />
            Chat
            </button>

          <button
            type="button"
            className={
              activePage === "team"
                ? "active"
                : ""
            }
            onClick={() =>
              setActivePage("team")
            }
          >
            <Users size={18} />
            Support team
          </button>

        </nav>

        <div className="support-sidebar-bottom">

          <button
            type="button"
            onClick={onLogout}
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>

      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="support-main">

        {/* =================================================
            TICKETS PAGE
        ================================================= */}

        {activePage === "tickets" && (
          <SupportTickets
            tickets={tickets}
            onRefresh={refreshDashboard}
            refreshing={refreshing}
            onAssign={(ticket) =>
              setSelectedTicket(ticket)
            }
          />
        )}
        {/* =================================================
            CHAT PAGE
        ================================================= */}
        {activePage === "chat" && (
            <SupportChat
                onLogout={onLogout}
            />
            )}


        {/* =================================================
            SUPPORT TEAM PAGE
        ================================================= */}

        {activePage === "team" && (
          <SupportTeam
            onLogout={onLogout}
          />
        )}

        {/* =================================================
            DASHBOARD PAGE
        ================================================= */}

        {activePage === "dashboard" && (
          <>
            {/* =================================================
                HEADER
            ================================================= */}

            <header className="support-header">

              <div>

                <p className="eyebrow">
                  SUPPORT OPERATIONS
                </p>

                <h1>
                  Support Dashboard
                </h1>

                <p>
                  Manage customer requests and
                  assign tickets to your team.
                </p>

              </div>

              <button
                type="button"
                className="refresh-button"
                onClick={refreshDashboard}
                disabled={refreshing}
              >

                <RefreshCw
                  size={17}
                  className={
                    refreshing
                      ? "spin"
                      : ""
                  }
                />

                Refresh

              </button>

            </header>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="support-error">
                {error}
              </div>
            )}

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="support-stats">

              <div className="support-stat-card">

                <div className="support-stat-icon">
                  <Ticket size={20} />
                </div>

                <div>
                  <span>
                    Total tickets
                  </span>

                  <strong>
                    {totalTickets}
                  </strong>
                </div>

              </div>

              <div className="support-stat-card">

                <div className="support-stat-icon">
                  <Clock3 size={20} />
                </div>

                <div>
                  <span>
                    Open
                  </span>

                  <strong>
                    {openTickets}
                  </strong>
                </div>

              </div>

              <div className="support-stat-card">

                <div className="support-stat-icon">
                  <UserPlus size={20} />
                </div>

                <div>
                  <span>
                    In progress
                  </span>

                  <strong>
                    {inProgressTickets}
                  </strong>
                </div>

              </div>

              <div className="support-stat-card">

                <div className="support-stat-icon">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <span>
                    Resolved
                  </span>

                  <strong>
                    {resolvedTickets}
                  </strong>
                </div>

              </div>

            </section>

            {/* =================================================
                UNASSIGNED TICKETS
            ================================================= */}

            <section className="support-section">

              <div className="support-section-heading">

                <div>

                  <p className="eyebrow">
                    NEEDS ATTENTION
                  </p>

                  <h2>
                    Unassigned tickets
                  </h2>

                </div>

                <span className="ticket-count">
                  {unassignedTickets.length}
                </span>

              </div>

              {loading ? (

                <div className="support-empty">
                  Loading tickets...
                </div>

              ) : unassignedTickets.length === 0 ? (

                <div className="support-empty">

                  <CheckCircle2 size={24} />

                  <p>
                    All tickets have been assigned.
                  </p>

                </div>

              ) : (

                <div className="support-ticket-list">

                  {unassignedTickets.map(
                    (ticket) => (

                      <article
                        className="support-ticket"
                        key={ticket.id}
                      >

                        <div className="support-ticket-main">

                          <div className="support-ticket-id">
                            CS-{ticket.id}
                          </div>

                          <h3>
                            {ticket.subject}
                          </h3>

                          <p>
                            {ticket.category}
                            {" · "}
                            {ticket.order_id ||
                              "No order ID"}
                          </p>

                        </div>

                        <div className="support-ticket-status">

                          <span
                            className={`status ${ticket.status}`}
                          >
                            {statusLabels[
                              ticket.status
                            ] ||
                              ticket.status}
                          </span>

                          <button
                            type="button"
                            className="assign-button"
                            onClick={() =>
                              setSelectedTicket(
                                ticket
                              )
                            }
                          >
                            Assign agent

                            <ChevronRight
                              size={16}
                            />
                          </button>

                        </div>

                      </article>

                    )
                  )}

                </div>

              )}

            </section>

            {/* =================================================
                RECENT TICKETS
            ================================================= */}

            <section className="support-section">

              <div className="support-section-heading">

                <div>

                  <p className="eyebrow">
                    ALL REQUESTS
                  </p>

                  <h2>
                    Recent tickets
                  </h2>

                </div>

              </div>

              <div className="support-ticket-list">

                {tickets.length === 0 ? (

                  <div className="support-empty">
                    <Ticket size={24} />

                    <p>
                      No tickets available.
                    </p>
                  </div>

                ) : (

                  tickets.map(
                    (ticket) => (

                      <article
                        className="support-ticket"
                        key={ticket.id}
                      >

                        <div className="support-ticket-main">

                          <div className="support-ticket-id">
                            CS-{ticket.id}
                          </div>

                          <h3>
                            {ticket.subject}
                          </h3>

                          <p>
                            {ticket.customer_name ||
                              "Customer"}
                            {" · "}
                            {ticket.category}
                            {" · "}
                            {ticket.order_id ||
                              "No order ID"}
                          </p>

                        </div>

                        <div className="support-ticket-status">

                          <span
                            className={`status ${ticket.status}`}
                          >
                            {statusLabels[
                              ticket.status
                            ] ||
                              ticket.status}
                          </span>

                          {ticket.assigned_to_name ? (

                            <small>
                              Assigned to{" "}

                              <strong>
                                {ticket.assigned_to_name}
                              </strong>
                            </small>

                          ) : (

                            <button
                              type="button"
                              className="assign-button"
                              onClick={() =>
                                setSelectedTicket(
                                  ticket
                                )
                              }
                            >
                              Assign agent

                              <ChevronRight
                                size={15}
                              />
                            </button>

                          )}

                        </div>

                      </article>

                    )
                  )

                )}

              </div>

            </section>

          </>
        )}

      </main>

      {/* =================================================
          ASSIGN MODAL
      ================================================= */}

      {selectedTicket && (
        <div className="overlay">

          <section className="modal assign-modal">

            <button
              type="button"
              className="close"
              onClick={() => {
                setSelectedTicket(null);
                setSelectedAgent("");
              }}
            >
              ×
            </button>

            <p className="eyebrow">
              ASSIGN TICKET
            </p>

            <h2>
              CS-{selectedTicket.id}
            </h2>

            <p className="modal-copy">
              Assign this request to a
              support team member.
            </p>

            <div className="assign-ticket-preview">

              <strong>
                {selectedTicket.subject}
              </strong>

              <span>
                {selectedTicket.category}
              </span>

            </div>

            <label>

              Support agent

              <select
                value={selectedAgent}
                onChange={(event) =>
                  setSelectedAgent(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select an agent
                </option>

                {agents.map(
                  (agent) => (

                    <option
                      key={agent.id}
                      value={agent.id}
                    >
                      {agent.username}
                    </option>

                  )
                )}

              </select>

            </label>

            {!agents.length && (
              <div className="assign-info">
                No active support agents
                are available.
              </div>
            )}

            <button
              type="button"
              className="primary submit"
              disabled={
                assigning ||
                !selectedAgent
              }
              onClick={assignTicket}
            >

              {assigning
                ? "Assigning..."
                : "Assign ticket"}

              <ChevronRight size={17} />

            </button>

          </section>

        </div>
      )}

    </div>
  );
}

export default SupportDashboard;