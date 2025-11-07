import React, { useState } from "react";
import api from "./api";
import ChatMessage from "./components/ChatMessage";
import ImageUpload from "./components/ImageUpload";
import PiiPanel from "./components/PiiPanel";

function timestamp() {
  return new Date().toLocaleTimeString();
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [piiItems, setPiiItems] = useState([]);
  const [piiLoading, setPiiLoading] = useState(false);
  const [redactedPreview, setRedactedPreview] = useState(null);

  const addMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  // ---- TEXT ONLY CHAT ----
  const handleSendTextOnly = async () => {
    if (!input.trim()) return;
    const userMsg = {
      role: "user",
      text: input,
      timestamp: timestamp(),
    };
    addMessage(userMsg);
    setInput("");
    setLoadingChat(true);
    try {
      const formData = new FormData();
      formData.append("message", userMsg.text);
      const res = await api.post("/chat", formData);
      const reply = {
        role: "assistant",
        text: res.data.reply,
        timestamp: timestamp(),
      };
      addMessage(reply);
    } catch (err) {
      console.error(err);
      addMessage({
        role: "assistant",
        text: "Error: failed to contact AI.",
        timestamp: timestamp(),
      });
    } finally {
      setLoadingChat(false);
    }
  };

  // ---- IMAGE + PII DETECTION ----
  const handleFileSelect = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large (max 5MB).");
      return;
    }

    setImageFile(file);
    setRedactedPreview(null);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setPiiItems([]);
    setPiiLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/pii/detect", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const items = (res.data.items || []).map((item) => ({
        ...item,
        selected: true, // default: redact all
      }));
      setPiiItems(items);
    } catch (err) {
      console.error(err);
      alert("PII detection failed.");
    } finally {
      setPiiLoading(false);
    }
  };

  const toggleAllPii = (value) => {
    setPiiItems((prev) => prev.map((it) => ({ ...it, selected: value })));
  };

  const toggleItem = (id) => {
    setPiiItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, selected: !it.selected } : it
      )
    );
  };

  const handleRedactAndSend = async () => {
    if (!imageFile) {
      alert("Upload an image first.");
      return;
    }
    const selectedIds = piiItems.filter((it) => it.selected).map((it) => it.id);

    const userMsg = {
      role: "user",
      text: input || "(image message)",
      imageUrl: imagePreview,
      timestamp: timestamp(),
    };
    addMessage(userMsg);
    setInput("");
    setLoadingChat(true);

    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("message", userMsg.text);
      formData.append("selected_ids", JSON.stringify(selectedIds));

      const res = await api.post("/pii/redact-and-chat", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.redacted_image_base64) {
        const redUrl =
          "data:image/png;base64," + res.data.redacted_image_base64;
        setRedactedPreview(redUrl);
      }

      const reply = {
        role: "assistant",
        text: res.data.reply || "No response from AI.",
        timestamp: timestamp(),
      };
      addMessage(reply);
    } catch (err) {
      console.error(err);
      addMessage({
        role: "assistant",
        text: "Error: redaction or AI call failed.",
        timestamp: timestamp(),
      });
    } finally {
      setLoadingChat(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setImageFile(null);
    setImagePreview(null);
    setPiiItems([]);
    setRedactedPreview(null);
  };

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div>
          <h1>Secure AI Chat</h1>
          <p>PII-aware chat with image redaction (Flask + React)</p>
        </div>
        <button onClick={clearChat}>Clear Chat</button>
      </header>

      {/* Main layout */}
      <main className="app-main">
        {/* Left side: image + PII */}
        <section className="sidebar">
          <ImageUpload onFileSelect={handleFileSelect} disabled={piiLoading} />

          <div className="preview-grid">
            <div className="panel">
              <h2>Original Preview</h2>
              <div className="panel-body">
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className="preview-image" />
                ) : (
                  <p className="panel-placeholder">No image selected yet.</p>
                )}
              </div>
            </div>

            <div className="panel">
              <h2>Redacted Preview</h2>
              <div className="panel-body">
                {redactedPreview ? (
                  <a href={redactedPreview} download="redacted.png" className="download-link">
                    <img
                      src={redactedPreview}
                      alt="redacted"
                      className="preview-image"
                    />
                    <span>Download redacted image</span>
                  </a>
                ) : (
                  <p className="panel-placeholder">Redacted image will appear here.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right side: chat + PII list */}
        <section className="chat-section">
          <div className="chat-container">
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  Start chatting or upload an image to begin.
                </div>
              ) : (
                messages.map((m, idx) => <ChatMessage key={idx} message={m} />)
              )}
              {loadingChat && (
                <div className="chat-typing">AI is typing...</div>
              )}
            </div>

            <div className="chat-input-area">
              <textarea
                className="chat-input"
                placeholder="Type your message (optional for image)..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="chat-buttons">
                <button onClick={handleSendTextOnly} disabled={loadingChat}>
                  Send Text
                </button>
                <button
                  onClick={handleRedactAndSend}
                  disabled={loadingChat || !imageFile}
                >
                  Redact &amp; Send Image
                </button>
              </div>
            </div>
          </div>

          <PiiPanel
            items={piiItems}
            onToggleAll={toggleAllPii}
            onToggleItem={toggleItem}
          />
        </section>
      </main>
    </div>
  );
}
