import React, { useMemo, useState } from "react";
import { Ticket, Search, RefreshCw, ChevronRight, Save, ChevronDown } from "lucide-react";

const statusLabels = { open: "Open", in_progress: "In progress", resolved: "Resolved" };

function SupportTickets({ tickets, onRefresh, refreshing, onAssign, onUpdateStatus }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draftStatus, setDraftStatus] = useState("open");
  const [draftNote, setDraftNote] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  const filteredTickets = useMemo(() => tickets.filter((ticket) => {
    const matchesFilter = filter === "all" || ticket.status === filter;
    const searchable = `${ticket.id || ""} ${ticket.subject || ""} ${ticket.category || ""} ${ticket.order_id || ""} ${ticket.customer_name || ""} ${ticket.assigned_to_name || ""}`.toLowerCase();
    return matchesFilter && searchable.includes(search.toLowerCase());
  }), [tickets, filter, search]);

  function openEditor(ticket) {
    setEditingId(ticket.id);
    setDraftStatus(ticket.status || "open");
    setDraftNote(ticket.resolution_note || "");
    setUpdateError(""); setUpdateSuccess("");
  }

  async function saveStatus(ticket) {
    setSavingId(ticket.id); setUpdateError(""); setUpdateSuccess("");
    try {
      await onUpdateStatus(ticket, draftStatus, draftNote);
      setUpdateSuccess(`Ticket CS-${ticket.id} updated.`);
      setEditingId(null);
    } catch (error) {
      setUpdateError(error.message || "Unable to update ticket.");
    } finally { setSavingId(null); }
  }

  return (
    <section className="support-page">
      <div className="support-page-header"><div><p className="eyebrow">ALL REQUESTS</p><h1>Tickets</h1><p>Track customer requests, assign agents, and update resolution status.</p></div>
        <button className="refresh-button" type="button" onClick={onRefresh} disabled={refreshing}><RefreshCw size={17} className={refreshing ? "spin" : ""} /> Refresh</button>
      </div>
      {updateError && <div className="support-error" role="alert">{updateError}</div>}
      {updateSuccess && <div className="user-success" role="status">{updateSuccess}</div>}
      <div className="ticket-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by ticket, customer, order, or agent..." /></div>
      <div className="ticket-filters">{[["all", "All tickets"], ["open", "Open"], ["in_progress", "In progress"], ["resolved", "Resolved"]].map(([key, label]) => <button key={key} type="button" className={filter === key ? "active" : ""} onClick={() => setFilter(key)}>{label}<span>{key === "all" ? tickets.length : tickets.filter((ticket) => ticket.status === key).length}</span></button>)}</div>
      <div className="full-ticket-list">
        {filteredTickets.length === 0 ? <div className="support-empty"><Ticket size={24} /><p>No tickets found.</p></div> : filteredTickets.map((ticket) => (
          <article className="full-ticket-card ticket-management-card" key={ticket.id}>
            <div className="full-ticket-main"><div className="support-ticket-id">CS-{ticket.id}</div><h3>{ticket.subject}</h3><p>{ticket.customer_name || "Customer"} · {ticket.category} · {ticket.order_id || "No order ID"}</p>
              {ticket.resolution_note && <p className="ticket-resolution-preview"><strong>Latest update:</strong> {ticket.resolution_note}</p>}
            </div>
            <div className="full-ticket-info"><span className={`status ${ticket.status}`}>{statusLabels[ticket.status] || ticket.status}</span>
              {ticket.assigned_to_name ? <small>Assigned to <strong>{ticket.assigned_to_name}</strong></small> : <button className="assign-button" type="button" onClick={() => onAssign(ticket)}>Assign agent <ChevronRight size={15} /></button>}
              <button className="ticket-edit-toggle" type="button" onClick={() => editingId === ticket.id ? setEditingId(null) : openEditor(ticket)}>{editingId === ticket.id ? "Cancel" : "Update status"}<ChevronDown size={14} /></button>
            </div>
            {editingId === ticket.id && <div className="ticket-status-editor">
              <label>Status<select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></label>
              <label>Customer-visible update / resolution note<textarea value={draftNote} onChange={(event) => setDraftNote(event.target.value)} rows={3} placeholder="Explain the progress or how the issue was resolved..." /></label>
              <button type="button" className="user-create-button" onClick={() => saveStatus(ticket)} disabled={savingId === ticket.id}><Save size={16} />{savingId === ticket.id ? "Saving…" : "Save ticket update"}</button>
            </div>}
          </article>
        ))}
      </div>
    </section>
  );
}

export default SupportTickets;
