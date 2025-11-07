import React from "react";

export default function PiiPanel({ items, onToggleAll, onToggleItem }) {
  return (
    <div className="pii-panel">
      <div className="pii-header">
        <h2>Detected PII ({items.length})</h2>
        <div className="pii-header-buttons">
          <button onClick={() => onToggleAll(true)}>Redact All</button>
          <button onClick={() => onToggleAll(false)}>Clear All</button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="pii-empty">No PII detected yet. Upload an image first.</p>
      ) : (
        <ul className="pii-list">
          {items.map((item) => (
            <li key={item.id} className="pii-item">
              <div className="pii-text">
                <div className="pii-value">{item.text}</div>
                <div className="pii-type">Type: {item.type}</div>
              </div>
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => onToggleItem(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
