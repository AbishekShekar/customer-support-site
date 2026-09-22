import React from "react";
import {
  Package,
  RotateCcw,
  CreditCard,
  UserRound,
  ChevronRight,
  Plus,
} from "lucide-react";

const categories = [
  {
    id: "orders",
    title: "Orders & delivery",
    description: "Track, cancel, or get help with an order",
    icon: Package,
  },
  {
    id: "returns",
    title: "Returns & refunds",
    description: "Start a return or check refund status",
    icon: RotateCcw,
  },
  {
    id: "payments",
    title: "Payments & billing",
    description: "Get help with payments and billing",
    icon: CreditCard,
  },
  {
    id: "account",
    title: "Account & profile",
    description: "Manage your account and personal details",
    icon: UserRound,
  },
];

function HelpCategories({ onCreateTicket }) {
  function handleCategory(category) {
    if (onCreateTicket) {
      onCreateTicket(category);
    }
  }

  return (
    <section className="help-categories-section">

      <div className="help-categories-heading">
        <div>
          <p className="help-eyebrow">START HERE</p>

          <h2>What do you need help with?</h2>
        </div>

        <button
          type="button"
          className="create-ticket-button"
          onClick={() => handleCategory(null)}
        >
          <Plus size={17} />
          Create a ticket
        </button>
      </div>

      <div className="help-category-grid">

        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              type="button"
              key={category.id}
              className="help-category-card"
              onClick={() => handleCategory(category)}
            >
              <span className="help-category-icon">
                <Icon size={21} />
              </span>

              <span className="help-category-content">
                <strong>{category.title}</strong>

                <span>{category.description}</span>
              </span>

              <ChevronRight
                size={20}
                className="help-category-arrow"
              />
            </button>
          );
        })}

      </div>

    </section>
  );
}

export default HelpCategories;