import React from "react";
import ReactMarkdown from "react-markdown";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`message-row ${isUser ? "message-row-user" : "message-row-assistant"}`}>
      <div className={`message-bubble ${isUser ? "message-bubble-user" : "message-bubble-assistant"}`}>
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="uploaded"
            className="message-image"
          />
        )}
        {isUser ? (
          <p className="message-text">{message.text}</p>
        ) : (
          <div className="message-markdown">
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
        )}
        <div className="message-timestamp">{message.timestamp}</div>
      </div>
    </div>
  );
}
