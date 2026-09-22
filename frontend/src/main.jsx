import React, { useCallback, useEffect, useRef, useState } from "react";
import SupportDashboard from "./SupportDashboard";
import { createRoot } from "react-dom/client";
import {
  Search,
  Plus,
  Package,
  CreditCard,
  RotateCcw,
  Truck,
  MessageCircle,
  ChevronRight,
  Bell,
  HelpCircle,
  ArrowUpRight,
  X,
  Send,
  LoaderCircle,
} from "lucide-react";
import "./styles.css";

/* =========================================================
   API / AUTH HELPERS
========================================================= */

const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

const getRefreshToken = () => {
  return localStorage.getItem("refresh_token");
};

const authHeaders = () => {
  const token = getAccessToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};

const API = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"
).replace(/\/$/, "");

/*
  Temporary customer display information.

  The backend currently authenticates using Django JWT,
  but Conversation does not yet have a customer ForeignKey.
  Therefore this is kept for chat display.
*/

/* =========================================================
   DEMO DATA
========================================================= */

const demoTickets = [
  {
    id: 20491,
    subject: "Return request for AirFlex running shoes",
    order_id: "OD229104853",
    category: "Returns & refunds",
    status: "in_progress",
    updated_at: "Updated 2h ago",
  },
  {
    id: 20384,
    subject: "Delivery date changed after dispatch",
    order_id: "OD229092116",
    category: "Orders & delivery",
    status: "open",
    updated_at: "Updated yesterday",
  },
  {
    id: 20176,
    subject: "Invoice needed for business purchase",
    order_id: "OD228771905",
    category: "Payments",
    status: "resolved",
    updated_at: "Resolved Sep 12",
  },
];

const topics = [
  [
    Package,
    "Orders & delivery",
    "Track, cancel, or get help with an order",
  ],
  [
    RotateCcw,
    "Returns & refunds",
    "Start a return or check refund status",
  ],
  [
    CreditCard,
    "Payments",
    "Payment, invoice, and offer-related help",
  ],
  [
    Truck,
    "Account & delivery",
    "Addresses, account access, and more",
  ],
];

const statusLabels = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

/* =========================================================
   API HELPERS
========================================================= */

function getApiItems(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

/* =========================================================
   LOGIN
========================================================= */

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || "Invalid username or password"
        );
      }

      if (!data.access) {
        throw new Error("No access token was returned.");
      }

      localStorage.setItem("access_token", data.access);

      if (data.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      onLogin();
    } catch (error) {
      console.error("Login failed:", error);

      setError(
        error.message ||
          "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      {/* LEFT SIDE */}

      <section className="login-showcase">

        <div className="login-showcase-content">

          <div className="brand login-brand">
            <span className="brand-mark">r</span>
            resolvedesk
          </div>

          <div className="showcase-main">

            <p className="eyebrow">
              CUSTOMER SUPPORT PLATFORM
            </p>

            <h1>
              Resolve issues.
              <br />
              <span>Faster.</span>
            </h1>

            <p className="showcase-copy">
              Manage support requests, track tickets,
              and connect with your support team from
              one simple workspace.
            </p>

            <div className="login-features">

              <div className="login-feature">
                <span>✓</span>
                <div>
                  <strong>Track your tickets</strong>
                  <small>
                    Stay updated on every support request.
                  </small>
                </div>
              </div>

              <div className="login-feature">
                <span>✓</span>
                <div>
                  <strong>Chat with support</strong>
                  <small>
                    Get direct help from the support team.
                  </small>
                </div>
              </div>

              <div className="login-feature">
                <span>✓</span>
                <div>
                  <strong>Real-time updates</strong>
                  <small>
                    Follow the progress of your issues.
                  </small>
                </div>
              </div>

            </div>

          </div>

          <div className="login-showcase-footer">
            <span>© 2026 ResolveDesk</span>
            <span>Secure customer support portal</span>
          </div>

        </div>

      </section>

      {/* RIGHT SIDE */}

      <section className="login-form-section">

        <div className="login-card">

          <div className="mobile-login-brand">
            <div className="brand">
              <span className="brand-mark">r</span>
              resolvedesk
            </div>
          </div>

          <div className="login-heading">

            <p className="eyebrow">
              CUSTOMER PORTAL
            </p>

            <h2>
              Welcome back
            </h2>

            <p>
              Sign in to manage your support requests.
            </p>

          </div>

          <form onSubmit={handleSubmit}>

            {/* USERNAME */}

            <label className="login-label">

              <span>
                Username
              </span>

              <div className="login-input-wrapper">

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                />

              </div>

            </label>

            {/* PASSWORD */}

            <label className="login-label">

              <span>
                Password
              </span>

              <div className="login-input-wrapper">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </label>

            {/* ERROR */}

            {error && (
              <div className="login-error">

                <span>!</span>

                <p>
                  {error}
                </p>

              </div>
            )}

            {/* SUBMIT */}

            <button
              className="primary login-button"
              type="submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}

            </button>

          </form>

          <div className="login-security">

            <span className="security-dot" />

            Secure connection

          </div>

        </div>

      </section>

    </div>
  );
}
/* =========================================================
   MAIN APP
========================================================= */

function App() {
  /* -------------------------------------------------------
     ALL HOOKS MUST BE DECLARED BEFORE ANY RETURN
  ------------------------------------------------------- */
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [authenticated, setAuthenticated] = useState(
    Boolean(getAccessToken())
  );

  const [tickets, setTickets] = useState(demoTickets);

  const [filter, setFilter] = useState("all");

  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const [online, setOnline] = useState(false);

  const [form, setForm] = useState({
    subject: "",
    order_id: "",
    category: "Orders & delivery",
    description: "",
  });

  const [chatOpen, setChatOpen] = useState(false);

  const [conversation, setConversation] = useState(null);

  const [messages, setMessages] = useState([]);

  const [messageText, setMessageText] = useState("");

  const [chatLoading, setChatLoading] = useState(false);

  const [chatError, setChatError] = useState("");

  const [chatStarting, setChatStarting] = useState(false);

  const messageEndRef = useRef(null);

  /* -------------------------------------------------------
     LOAD TICKETS
  ------------------------------------------------------- */

  useEffect(() => {
    if (!authenticated) {
      return undefined;
    }

    let cancelled = false;

    async function loadTickets() {
      try {
        const response = await fetch(`${API}/tickets/`, {
          method: "GET",
          headers: authHeaders(),
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          if (!cancelled) {
            setAuthenticated(false);
          }

          return;
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load tickets (${response.status})`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          const apiTickets = getApiItems(data);

          setTickets(apiTickets);
          setOnline(true);
        }
      } catch (error) {
        console.error("Ticket loading failed:", error);

        if (!cancelled) {
          setOnline(false);
        }
      }
    }

    loadTickets();

    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  /*--------------------------------------------------------
      LOAD CURRENT USER
    -------------------------------------------------------*/

    async function loadCurrentUser() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        setCurrentUser(null);
        setLoadingUser(false);
        return;
    }

    try {
        const response = await fetch(`${API}/me/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setAuthenticated(false);
            setCurrentUser(null);
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load user profile.");
        }

        const data = await response.json();

        setCurrentUser(data);
    } catch (error) {
        console.error("Failed to load current user:", error);
    } finally {
        setLoadingUser(false);
    }
}

useEffect(() => {
    if (authenticated) {
        loadCurrentUser();
    } else {
        setLoadingUser(false);
    }
}, [authenticated]);

  /* -------------------------------------------------------
     FILTER TICKETS
  ------------------------------------------------------- */

  const shownTickets = tickets.filter((ticket) => {
    const matchesFilter =
      filter === "all" || ticket.status === filter;

    const searchableText = `
      ${ticket.subject || ""}
      ${ticket.id || ""}
      ${ticket.order_id || ""}
      ${ticket.category || ""}
    `.toLowerCase();

    return (
      matchesFilter &&
      searchableText.includes(query.toLowerCase())
    );
  });

  /* -------------------------------------------------------
     TICKET DETAILS
  ------------------------------------------------------- */

  function openTicketDetails(ticket) {
    setSelectedTicket(ticket);
  }

  function closeTicketDetails() {
    setSelectedTicket(null);
  }

  function getTicketProgress(status) {
    if (status === "resolved") return 3;

    if (status === "in_progress") return 2;

    return 1;
  }

  /* -------------------------------------------------------
     CREATE TICKET MODAL
  ------------------------------------------------------- */

  function openTicketModal(category) {
    setForm((previous) => ({
      ...previous,
      category: category || previous.category,
    }));

    setModalOpen(true);
  }

  /* -------------------------------------------------------
     CREATE TICKET
  ------------------------------------------------------- */

  async function submitTicket(event) {
    event.preventDefault();

    try {
      const response = await fetch(`${API}/tickets/`, {
        method: "POST",

        /*
          IMPORTANT:
          Ticket creation requires authentication.
          Therefore we use authHeaders().
        */
        headers: authHeaders(),

        body: JSON.stringify({
          subject: form.subject,
          order_id: form.order_id,
          category: form.category,
          description: form.description,
          status: "open",
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setAuthenticated(false);

        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            errorData?.message ||
            "Ticket creation failed."
        );
      }

      const createdTicket = await response.json();

      setTickets((previous) => [
        createdTicket,
        ...previous,
      ]);

      setOnline(true);

      setModalOpen(false);

      setForm({
        subject: "",
        order_id: "",
        category: "Orders & delivery",
        description: "",
      });
    } catch (error) {
      console.error("Ticket creation failed:", error);

      alert(
        error.message ||
          "Could not create the ticket. Please try again."
      );
    }
  }

  /* -------------------------------------------------------
     LOAD CHAT MESSAGES
  ------------------------------------------------------- */

  const loadMessages = useCallback(async (conversationId) => {
    try {
      const response = await fetch(
        `${API}/conversations/${conversationId}/messages/`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setAuthenticated(false);

        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Could not load messages (${response.status})`
        );
      }

      const data = await response.json();

      setMessages(getApiItems(data));

      setChatError("");
    } catch (error) {
      console.error("Message loading failed:", error);

      setChatError(
        error.message || "Could not load messages"
      );
    }
  }, []);

  /* -------------------------------------------------------
     START CHAT
  ------------------------------------------------------- */

  async function startConversation() {
    setChatStarting(true);

    setChatError("");

    try {
      const response = await fetch(`${API}/conversations/`, {
        method: "POST",

        headers: authHeaders(),

        body: JSON.stringify({
        status: "active",
      }),
      });

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setAuthenticated(false);

        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Could not create conversation."
        );
      }

      const data = await response.json();

      setConversation(data);

      setMessages(data.messages || []);

      setMessageText("");

      setChatOpen(true);

      await loadMessages(data.id);
    } catch (error) {
      console.error("Conversation creation failed:", error);

      setChatError(
        error.message || "Could not start chat"
      );
    } finally {
      setChatStarting(false);
    }
  }

  /* -------------------------------------------------------
     SEND CHAT MESSAGE
  ------------------------------------------------------- */

  async function sendMessage(event) {
    event.preventDefault();

    const text = messageText.trim();

    if (
      !text ||
      !conversation ||
      conversation.status === "closed"
    ) {
      return;
    }

    setChatLoading(true);

    setChatError("");

    try {
      const response = await fetch(
        `${API}/conversations/${conversation.id}/messages/`,
        {
          method: "POST",

          headers: authHeaders(),

          body: JSON.stringify({
              body: text,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setAuthenticated(false);

        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.detail ||
            errorData?.message ||
            "Could not send message"
        );
      }

      const newMessage = await response.json();

      setMessages((previous) => {
        if (
          previous.some(
            (message) => message.id === newMessage.id
          )
        ) {
          return previous;
        }

        return [...previous, newMessage];
      });

      setMessageText("");
    } catch (error) {
      console.error("Message sending failed:", error);

      setChatError(
        error.message || "Could not send message"
      );
    } finally {
      setChatLoading(false);
    }
  }

  /* -------------------------------------------------------
     CLOSE CONVERSATION
  ------------------------------------------------------- */

  async function closeConversation() {
    if (
      !conversation ||
      conversation.status === "closed"
    ) {
      return;
    }

    setChatLoading(true);

    setChatError("");

    try {
      const response = await fetch(
        `${API}/conversations/${conversation.id}/close/`,
        {
          method: "POST",
          headers: authHeaders(),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setAuthenticated(false);

        throw new Error(
          "Your session has expired. Please sign in again."
        );
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => null);

        throw new Error(
          errorData?.detail ||
            "Could not close conversation"
        );
      }

      const updatedConversation = await response.json().catch(() => null);

      setConversation((previous) => ({
        ...previous,
        ...(updatedConversation || {}),
        status: "closed",
      }));
    } catch (error) {
      console.error("Conversation closing failed:", error);

      setChatError(
        error.message || "Could not close conversation"
      );
    } finally {
      setChatLoading(false);
    }
  }

  /* -------------------------------------------------------
     AUTO REFRESH CHAT
  ------------------------------------------------------- */

  useEffect(() => {
    if (
      !chatOpen ||
      !conversation?.id ||
      conversation.status === "closed"
    ) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadMessages(conversation.id);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    chatOpen,
    conversation?.id,
    conversation?.status,
    loadMessages,
  ]);

  /* -------------------------------------------------------
     AUTO SCROLL CHAT
  ------------------------------------------------------- */

  useEffect(() => {
    if (!chatOpen) {
      return;
    }

    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, chatOpen]);

  /* =========================================================
     LOGIN SCREEN
     
     IMPORTANT:
     All hooks are above this return.
  ========================================================= */

  if (!authenticated) {
  return (
    <Login
      onLogin={() => {
        setLoadingUser(true);
        setAuthenticated(true);
      }}
    />
  );
}

if (loadingUser) {
  return (
    <div className="app-loading">
      Loading ResolveDesk...
    </div>
  );
}

if (currentUser?.is_staff) {
  return (
    <SupportDashboard
      onLogout={() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setAuthenticated(false);
        setCurrentUser(null);
        setConversation(null);
        setMessages([]);
        setChatOpen(false);
      }}
    />
  );
}

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="app">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header>
        <div className="brand">
          <span className="brand-mark">r</span>
          resolvedesk
        </div>

        <nav>
          <a
            className="active"
            href="#support-home"
          >
            Support home
          </a>

          <a href="#tickets">
            My tickets
          </a>

          <a href="#help-centre">
            Help centre
          </a>
        </nav>

        <div className="header-right">

          <button
            className="icon-button"
            type="button"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <i />
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");

              setAuthenticated(false);

              setConversation(null);
              setMessages([]);
              setChatOpen(false);
            }}
          >
            Logout
          </button>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main id="support-home">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="hero">

          <div>

            <p className="eyebrow">
              CUSTOMER SUPPORT
            </p>

            <h1>
              Hi, Aditi. How can we help?
            </h1>

            <p className="hero-copy">
              Find quick answers or get personal help
              with an order.
            </p>

          </div>

          <div className="hero-art">

            <div className="art-circle" />

            <MessageCircle size={72} />

            <span>
              We're here
              <br />
              for you
            </span>

          </div>

        </section>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <div className="search">

          <Search size={20} />

          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search orders, tickets, or help articles"
            aria-label="Search tickets"
          />

          <kbd>⌘ K</kbd>

        </div>

        {/* ===================================================
            SUPPORT TOPICS
        =================================================== */}

        <section>

          <div className="section-heading">

            <div>

              <p className="eyebrow">
                START HERE
              </p>

              <h2>
                What do you need help with?
              </h2>

            </div>

            <button
              type="button"
              onClick={() => openTicketModal()}
              className="primary"
            >
              <Plus size={18} />
              Create a ticket
            </button>

          </div>

          <div className="topic-grid">

            {topics.map(
              ([Icon, title, copy]) => (
                <button
                  className="topic-card"
                  type="button"
                  onClick={() =>
                    openTicketModal(title)
                  }
                  key={title}
                >

                  <span className="topic-icon">
                    <Icon size={24} />
                  </span>

                  <span>

                    <b>
                      {title}
                    </b>

                    <small>
                      {copy}
                    </small>

                  </span>

                  <ChevronRight size={20} />

                </button>
              )
            )}

          </div>

        </section>

        {/* ===================================================
            TICKETS
        =================================================== */}

        <section
          className="tickets"
          id="tickets"
        >

          <div className="section-heading">

            <div>

              <p className="eyebrow">

                YOUR REQUESTS

                {online && (
                  <em>
                    LIVE
                  </em>
                )}

              </p>

              <h2>
                Recent support tickets
              </h2>

            </div>

            <button
              className="view-all"
              type="button"
            >
              View all
              <ArrowUpRight size={16} />
            </button>

          </div>

          {/* Ticket filters */}

          <div className="tabs">

            {[
              ["all", "All tickets"],
              ["open", "Open"],
              ["in_progress", "In progress"],
              ["resolved", "Resolved"],
            ].map(
              ([key, text]) => (
                <button
                  type="button"
                  onClick={() =>
                    setFilter(key)
                  }
                  className={
                    filter === key
                      ? "selected"
                      : ""
                  }
                  key={key}
                >

                  {text}

                  {key === "all" && (
                    <span>
                      {tickets.length}
                    </span>
                  )}

                </button>
              )
            )}

          </div>

          {/* Ticket list */}

          <div className="ticket-list">

            {shownTickets.map(
              (ticket) => (
                <article
                  className="ticket"
                  key={ticket.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    openTicketDetails(ticket)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      openTicketDetails(
                        ticket
                      );
                    }
                  }}
                >

                  <div
                    className={`ticket-accent ${ticket.status}`}
                  />

                  <div className="ticket-content">

                    <div className="ticket-top">

                      <span className="ticket-id">
                        CS-{ticket.id}
                      </span>

                      <span
                        className={`status ${ticket.status}`}
                      >
                        {statusLabels[
                          ticket.status
                        ] ||
                          ticket.status}
                      </span>

                    </div>

                    <h3>
                      {ticket.subject}
                    </h3>

                    <p>

                      <Package size={15} />

                      {ticket.order_id ||
                        "No order ID"}

                      <b>
                        ·
                      </b>

                      {ticket.category}

                    </p>

                  </div>

                  <span className="ticket-time">

                    {typeof ticket.updated_at ===
                    "string"
                      ? ticket.updated_at
                      : ticket.updated_at
                        ? new Date(
                            ticket.updated_at
                          ).toLocaleDateString()
                        : "Recently updated"}

                  </span>

                  <ChevronRight
                    className="ticket-chevron"
                    size={20}
                  />

                </article>
              )
            )}

            {!shownTickets.length && (
              <div className="empty">
                No tickets match your search.
              </div>
            )}

          </div>

        </section>

        {/* ===================================================
            HELP STRIP
        =================================================== */}

        <aside
          className="help-strip"
          id="help-centre"
        >

          <HelpCircle size={22} />

          <div>

            <b>
              Need to speak to someone?
            </b>

            <span>
              Our support team is available
              7 days a week, 8am–10pm.
            </span>

          </div>

          <button
            type="button"
            onClick={startConversation}
            disabled={chatStarting}
          >

            {chatStarting
              ? "Starting..."
              : "Chat with us"}

            {chatStarting ? (
              <LoaderCircle
                size={16}
                className="spin"
              />
            ) : (
              <ChevronRight size={16} />
            )}

          </button>

        </aside>

      </main>

      {/* =====================================================
          CREATE TICKET MODAL
      ===================================================== */}

      {modalOpen && (
        <div
          className="overlay"
          role="presentation"
        >

          <form
            className="modal"
            onSubmit={submitTicket}
          >

            <button
              type="button"
              className="close"
              onClick={() =>
                setModalOpen(false)
              }
              aria-label="Close ticket form"
            >
              <X size={20} />
            </button>

            <p className="eyebrow">
              NEW SUPPORT REQUEST
            </p>

            <h2>
              Tell us what happened
            </h2>

            <p className="modal-copy">
              We’ll connect you to the right
              team and keep you updated here.
            </p>

            <label>
              What can we help with?

              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category:
                      event.target.value,
                  })
                }
              >

                {topics.map(
                  ([, title]) => (
                    <option
                      key={title}
                    >
                      {title}
                    </option>
                  )
                )}

              </select>

            </label>

            <label>
              Order ID

              <input
                value={form.order_id}
                onChange={(event) =>
                  setForm({
                    ...form,
                    order_id:
                      event.target.value,
                  })
                }
                placeholder="e.g. OD229104853"
              />

            </label>

            <label>
              Subject

              <input
                required
                value={form.subject}
                onChange={(event) =>
                  setForm({
                    ...form,
                    subject:
                      event.target.value,
                  })
                }
                placeholder="Briefly describe the issue"
              />

            </label>

            <label>
              More details

              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description:
                      event.target.value,
                  })
                }
                placeholder="Add details that will help us resolve this faster"
              />

            </label>

            <button
              className="primary submit"
              type="submit"
            >
              Submit request
              <ChevronRight size={17} />
            </button>

          </form>

        </div>
      )}

      {/* =====================================================
          TICKET DETAILS MODAL
      ===================================================== */}

      {selectedTicket && (
        <div
          className="overlay"
          role="presentation"
          onClick={closeTicketDetails}
        >

          <section
            className="modal ticket-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-details-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              type="button"
              className="close"
              onClick={closeTicketDetails}
              aria-label="Close ticket details"
            >
              <X size={20} />
            </button>

            <p className="eyebrow">
              TICKET CS-{selectedTicket.id}
            </p>

            <h2 id="ticket-details-title">
              {selectedTicket.subject}
            </h2>

            <p className="modal-copy">
              Track the progress of your support
              request below.
            </p>

            <div className="ticket-detail-summary">

              <div>

                <strong>
                  Issue category
                </strong>

                <span>
                  {selectedTicket.category ||
                    "Not specified"}
                </span>

              </div>

              <div>

                <strong>
                  Order ID
                </strong>

                <span>
                  {selectedTicket.order_id ||
                    "Not provided"}
                </span>

              </div>

            </div>

            <div className="ticket-status-panel">

              <div className="ticket-top">

                <strong>
                  Ticket progress
                </strong>

                <span
                  className={`status ${selectedTicket.status}`}
                >
                  {statusLabels[
                    selectedTicket.status
                  ] ||
                    selectedTicket.status}
                </span>

              </div>

              <div className="ticket-progress-track">

                {[
                  "open",
                  "in_progress",
                  "resolved",
                ].map(
                  (stage, index) => (
                    <React.Fragment
                      key={stage}
                    >

                      <div
                        className={`progress-step ${
                          index + 1 <=
                          getTicketProgress(
                            selectedTicket.status
                          )
                            ? "completed"
                            : ""
                        }`}
                      >

                        <span>
                          {index + 1}
                        </span>

                        <small>
                          {statusLabels[
                            stage
                          ]}
                        </small>

                      </div>

                      {index < 2 && (
                        <div className="progress-line" />
                      )}

                    </React.Fragment>
                  )
                )}

              </div>

            </div>

            <div className="ticket-detail-block">

              <strong>
                Issue description
              </strong>

              <p>
                {selectedTicket.description ||
                  "No description was provided."}
              </p>

            </div>

            <div className="ticket-detail-block">

              <strong>
                Latest support update
              </strong>

              <p>

                {selectedTicket.resolution_note ||
                  (selectedTicket.status ===
                  "open"
                    ? "Your ticket has been received and is waiting for review."
                    : selectedTicket.status ===
                        "in_progress"
                      ? "Our support team is currently investigating your issue."
                      : "This ticket has been marked as resolved.")}

              </p>

            </div>

            <button
              type="button"
              className="primary submit"
              onClick={async () => {
                try {
                  setChatError("");

                  const response = await fetch(
                    `${API}/conversations/`,
                    {
                      method: "POST",
                      headers: authHeaders(),
                      body: JSON.stringify({
                        ticket: selectedTicket.id,
                        status: "active",
                      }),
                    }
                  );

                  if (response.status === 401) {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("refresh_token");
                    setAuthenticated(false);
                    return;
                  }

                  const data = await response.json();

                  if (!response.ok) {
                    throw new Error(
                      data?.detail ||
                      "Could not start ticket conversation."
                    );
                  }

                  setConversation(data);
                  setMessages(data.messages || []);
                  setMessageText("");
                  setChatOpen(true);

                  await loadMessages(data.id);

                } catch (error) {
                  console.error(error);

                  setChatError(
                    error.message ||
                    "Could not start chat."
                  );
                }
              }}
            >
              <MessageCircle size={17} />
              Chat with support
            </button>

            <div className="ticket-detail-meta">

              <span>
                Created:{" "}
                {selectedTicket.created_at
                  ? new Date(
                      selectedTicket.created_at
                    ).toLocaleString()
                  : "Not available"}
              </span>

              <span>
                Updated:{" "}
                {selectedTicket.updated_at
                  ? new Date(
                      selectedTicket.updated_at
                    ).toLocaleString()
                  : "Not available"}
              </span>

            </div>

          </section>

        </div>
      )}

      {/* =====================================================
          CHAT
      ===================================================== */}

      {chatOpen && (
        <div
          className="chat-overlay"
          role="presentation"
        >

          <section
            className="chat-panel"
            aria-label="ResolveDesk chat"
          >

            {/* Chat header */}

            <header className="chat-header">

              <div>

                <strong>
                  ResolveDesk Support
                </strong>

                <small>

                  {conversation?.status ===
                  "closed"
                    ? "Conversation closed"
                    : "We're here to help"}

                </small>

              </div>

              <button
                className="chat-close"
                type="button"
                onClick={() =>
                  setChatOpen(false)
                }
                aria-label="Close chat"
              >
                <X size={20} />
              </button>

            </header>

            {/* Messages */}

            <div
              className="chat-messages"
              aria-live="polite"
            >

              {!messages.length && (
                <div className="chat-empty">

                  <MessageCircle size={32} />

                  <p>
                    Start a conversation with
                    our support team.
                  </p>

                </div>
              )}

              {messages.map(
                (message) => (
                  <div
                    key={message.id}
                    className={`chat-message ${
                      message.sender_type ===
                      "customer"
                        ? "customer-message"
                        : "agent-message"
                    }`}
                  >

                    <div className="message-author">
                      {message.sender_name}
                    </div>

                    <div className="message-body">
                      {message.body}
                    </div>

                    <small>

                      {message.created_at
                        ? new Date(
                            message.created_at
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}

                    </small>

                  </div>
                )
              )}

              <div ref={messageEndRef} />

            </div>

            {/* Chat error */}

            {chatError && (
              <div className="chat-error">
                {chatError}
              </div>
            )}

            {/* Chat input */}

            {conversation?.status === "closed" ? (
              <div className="chat-closed">
                This conversation has been closed.
              </div>
            ) : (
              <form
                className="chat-input-area"
                onSubmit={sendMessage}
              >

                <input
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(
                      event.target.value
                    )
                  }
                  placeholder="Type your message..."
                  disabled={chatLoading}
                  maxLength={2000}
                  aria-label="Chat message"
                />

                <button
                  type="submit"
                  disabled={
                    chatLoading ||
                    !messageText.trim()
                  }
                  aria-label="Send message"
                >

                  {chatLoading ? (
                    <LoaderCircle
                      size={18}
                      className="spin"
                    />
                  ) : (
                    <Send size={18} />
                  )}

                </button>

              </form>
            )}

            {/* Close conversation */}

            {conversation?.status !==
              "closed" && (
              <button
                className="chat-close-conversation"
                type="button"
                onClick={
                  closeConversation
                }
                disabled={chatLoading}
              >
                Close conversation
              </button>
            )}

          </section>

        </div>
      )}

    </div>
  );
}

/* =========================================================
   REACT ROOT
========================================================= */

createRoot(
  document.getElementById("root")
).render(<App />);