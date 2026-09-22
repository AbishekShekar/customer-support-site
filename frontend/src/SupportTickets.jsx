import React, { useMemo, useState } from "react";
import {
  Ticket,
  Search,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

const statusLabels = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

function SupportTickets({
  tickets,
  onRefresh,
  refreshing,
  onAssign,
}) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesFilter =
        filter === "all" || ticket.status === filter;

      const searchable = `
        ${ticket.id || ""}
        ${ticket.subject || ""}
        ${ticket.category || ""}
        ${ticket.order_id || ""}
        ${ticket.customer_name || ""}
        ${ticket.assigned_to_name || ""}
      `.toLowerCase();

      return (
        matchesFilter &&
        searchable.includes(search.toLowerCase())
      );
    });
  }, [tickets, filter, search]);

  return (
    <section className="support-page">
      <div className="support-page-header">
        <div>
          <p className="eyebrow">ALL REQUESTS</p>

          <h1>Tickets</h1>

          <p>
            View and manage all customer support requests.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={onRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            size={17}
            className={refreshing ? "spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* SEARCH */}

      <div className="ticket-search">
        <Search size={18} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search tickets..."
        />
      </div>

      {/* FILTERS */}

      <div className="ticket-filters">
        {[
          ["all", "All tickets"],
          ["open", "Open"],
          ["in_progress", "In progress"],
          ["resolved", "Resolved"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={
              filter === key ? "active" : ""
            }
            onClick={() => setFilter(key)}
          >
            {label}

            <span>
              {key === "all"
                ? tickets.length
                : tickets.filter(
                    (ticket) =>
                      ticket.status === key
                  ).length}
            </span>
          </button>
        ))}
      </div>

      {/* TICKETS */}

      <div className="full-ticket-list">
        {filteredTickets.length === 0 ? (
          <div className="support-empty">
            <Ticket size={24} />

            <p>No tickets found.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <article
              className="full-ticket-card"
              key={ticket.id}
            >
              <div className="full-ticket-main">
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

              <div className="full-ticket-info">
                <span
                  className={`status ${ticket.status}`}
                >
                  {statusLabels[ticket.status] ||
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
                    className="assign-button"
                    onClick={() =>
                      onAssign(ticket)
                    }
                  >
                    Assign agent
                    <ChevronRight size={15} />
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default SupportTickets;