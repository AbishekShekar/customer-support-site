import React, { useEffect, useMemo, useState } from "react";
import {
  MessageCircle,
  Send,
  RefreshCw,
  X,
  User,
  Ticket,
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

function SupportChat({ onLogout }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /* =====================================================
     LOAD CONVERSATIONS
  ===================================================== */

  async function loadConversations() {
    try {
      setError("");

      const response = await fetch(
        `${API}/conversations/`,
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
          "Unable to load conversations."
        );
      }

      const data = await response.json();

      const conversationList = Array.isArray(data)
        ? data
        : data.results || [];

      setConversations(conversationList);

      /*
       * Automatically select the first active
       * conversation if none is selected.
       */
      if (!selectedConversation && conversationList.length) {
        const activeConversation =
          conversationList.find(
            (conversation) =>
              conversation.status === "active"
          ) || conversationList[0];

        setSelectedConversation(
          activeConversation
        );
      }
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =====================================================
     LOAD MESSAGES
  ===================================================== */

  async function loadMessages(conversationId) {
    if (!conversationId) {
      return;
    }

    try {
      setMessagesLoading(true);

      const response = await fetch(
        `${API}/conversations/${conversationId}/messages/`,
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
          "Unable to load conversation messages."
        );
      }

      const data = await response.json();

      setMessages(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setMessagesLoading(false);
    }
  }

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadConversations();
  }, []);

  /* =====================================================
     SELECTED CONVERSATION
  ===================================================== */

  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    loadMessages(selectedConversation.id);
  }, [selectedConversation?.id]);

  /* =====================================================
     REFRESH
  ===================================================== */

  async function refreshChat() {
    setRefreshing(true);

    await loadConversations();

    if (selectedConversation) {
      await loadMessages(
        selectedConversation.id
      );
    }

    setRefreshing(false);
  }

  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  async function sendMessage(event) {
    event.preventDefault();

    const text = messageText.trim();

    if (
      !text ||
      !selectedConversation ||
      sending
    ) {
      return;
    }

    if (
      selectedConversation.status === "closed"
    ) {
      setError(
        "This conversation is closed."
      );
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        `${API}/conversations/${selectedConversation.id}/messages/`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            body: text,
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
            "Unable to send message."
        );
      }

      setMessageText("");

      /*
       * Reload both messages and conversations so
       * the latest message/count appears immediately.
       */
      await loadMessages(
        selectedConversation.id
      );

      await loadConversations();
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  /* =====================================================
     CLOSE CONVERSATION
  ===================================================== */

  async function closeConversation() {
    if (!selectedConversation) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API}/conversations/${selectedConversation.id}/close/`,
        {
          method: "POST",
          headers: authHeaders(),
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
            "Unable to close conversation."
        );
      }

      const updatedConversation = {
        ...selectedConversation,
        status: "closed",
      };

      setSelectedConversation(
        updatedConversation
      );

      await loadConversations();
      await loadMessages(
        selectedConversation.id
      );
    } catch (error) {
      console.error(error);

      setError(
        error.message ||
          "Unable to close conversation."
      );
    }
  }

  /* =====================================================
     ACTIVE CONVERSATIONS
  ===================================================== */

  const activeCount = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          conversation.status === "active"
      ).length,
    [conversations]
  );

  /* =====================================================
     UI
  ===================================================== */

  return (
    <section className="support-chat-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="support-chat-header">

        <div>
          <p className="eyebrow">
            CUSTOMER COMMUNICATION
          </p>

          <h1>Chat</h1>

          <p>
            Respond to customer conversations
            and resolve their requests.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={refreshChat}
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

      </div>

      {error && (
        <div className="support-error">
          {error}
        </div>
      )}

      {/* =================================================
          CHAT WORKSPACE
      ================================================= */}

      <div className="support-chat-workspace">

        {/* =================================================
            CONVERSATION LIST
        ================================================= */}

        <aside className="conversation-list">

          <div className="conversation-list-header">

            <div>
              <h2>
                Conversations
              </h2>

              <span>
                {activeCount} active
              </span>
            </div>

            <MessageCircle size={20} />

          </div>

          {loading ? (

            <div className="chat-empty">
              Loading conversations...
            </div>

          ) : conversations.length === 0 ? (

            <div className="chat-empty">
              <MessageCircle size={25} />

              <p>
                No conversations yet.
              </p>
            </div>

          ) : (

            <div className="conversation-items">

              {conversations.map(
                (conversation) => (

                  <button
                    type="button"
                    key={conversation.id}
                    className={
                      selectedConversation?.id ===
                      conversation.id
                        ? "conversation-item active"
                        : "conversation-item"
                    }
                    onClick={() =>
                      setSelectedConversation(
                        conversation
                      )
                    }
                  >

                    <div className="conversation-avatar">
                      {conversation.customer_name
                        ?.charAt(0)
                        .toUpperCase() || "C"}
                    </div>

                    <div className="conversation-info">

                      <div className="conversation-top">

                        <strong>
                          {conversation.customer_name ||
                            "Customer"}
                        </strong>

                        <span>
                          {conversation.status ===
                          "active"
                            ? "Active"
                            : "Closed"}
                        </span>

                      </div>

                      <p>
                        {conversation.ticket
                          ? `Ticket #${conversation.ticket}`
                          : "General support"}
                      </p>

                      <small>
                        {conversation.message_count ||
                          0}{" "}
                        messages
                      </small>

                    </div>

                  </button>

                )
              )}

            </div>

          )}

        </aside>

        {/* =================================================
            MESSAGE AREA
        ================================================= */}

        <section className="chat-panel">

          {!selectedConversation ? (

            <div className="chat-no-selection">

              <MessageCircle size={45} />

              <h2>
                Select a conversation
              </h2>

              <p>
                Choose a customer conversation
                from the left to start chatting.
              </p>

            </div>

          ) : (

            <>

              {/* CHAT HEADER */}

              <header className="chat-panel-header">

                <div className="chat-customer">

                  <div className="chat-customer-avatar">
                    {selectedConversation.customer_name
                      ?.charAt(0)
                      .toUpperCase() || "C"}
                  </div>

                  <div>

                    <h2>
                      {selectedConversation.customer_name ||
                        "Customer"}
                    </h2>

                    <p>
                      {selectedConversation.customer_email ||
                        "No email provided"}
                    </p>

                  </div>

                </div>

                <div className="chat-actions">

                  <span
                    className={
                      selectedConversation.status ===
                      "active"
                        ? "chat-status active"
                        : "chat-status closed"
                    }
                  >
                    {selectedConversation.status ===
                    "active"
                      ? "Active"
                      : "Closed"}
                  </span>

                  {selectedConversation.ticket && (
                    <span className="ticket-reference">
                      <Ticket size={14} />

                      Ticket #
                      {selectedConversation.ticket}
                    </span>
                  )}

                  {selectedConversation.status ===
                    "active" && (
                    <button
                      type="button"
                      className="close-chat-button"
                      onClick={
                        closeConversation
                      }
                    >
                      <X size={15} />

                      Close
                    </button>
                  )}

                </div>

              </header>

              {/* MESSAGES */}

              <div className="chat-messages">

                {messagesLoading ? (

                  <div className="chat-empty">
                    Loading messages...
                  </div>

                ) : messages.length === 0 ? (

                  <div className="chat-empty">
                    <MessageCircle size={24} />

                    <p>
                      No messages in this
                      conversation.
                    </p>
                  </div>

                ) : (

                  messages.map((message) => {

                    const isAgent =
                      message.sender_type ===
                      "agent";

                    const isSystem =
                      message.sender_type ===
                      "system";

                    return (
                      <div
                        key={message.id}
                        className={
                          isSystem
                            ? "chat-message system"
                            : isAgent
                            ? "chat-message agent"
                            : "chat-message customer"
                        }
                      >

                        {!isSystem && (
                          <div className="message-sender">
                            {message.sender_name}
                          </div>
                        )}

                        <div className="message-bubble">
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
                                  minute:
                                    "2-digit",
                                }
                              )
                            : ""}
                        </small>

                      </div>
                    );
                  })

                )}

              </div>

              {/* MESSAGE INPUT */}

              {selectedConversation.status ===
              "active" ? (

                <form
                  className="chat-input-area"
                  onSubmit={sendMessage}
                >

                  <input
                    type="text"
                    value={messageText}
                    onChange={(event) =>
                      setMessageText(
                        event.target.value
                      )
                    }
                    placeholder="Type your reply..."
                    disabled={sending}
                  />

                  <button
                type="submit"
                className="chat-send-button"
                disabled={
                    sending ||
                    !messageText.trim()
                }
                aria-label="Send message"
                title="Send message"
                >
                <Send size={18} />
                </button>
                </form>

              ) : (

                <div className="chat-closed-bar">
                  This conversation is closed.
                </div>

              )}

            </>

          )}

        </section>

      </div>

    </section>
  );
}

export default SupportChat;