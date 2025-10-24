import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import { uploadMedia, showToast } from "../utils/helpers";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
} from "lucide-react";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    try {
      setLoading(true);
      let mediaUrl = null;
      let mediaType = null;

      if (mediaFile) {
        const { url, type } = await uploadMedia(mediaFile);
        mediaUrl = url;
        mediaType = type;
      }

      const { error } = await supabase.from("posts").insert([
        {
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaType,
        },
      ]);

      if (error) throw error;

      showToast("✨ Post shared successfully on Trendify!", "success");
      navigate("/home");
    } catch (error) {
      console.error("Error creating post:", error);
      showToast(error.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: {
      minHeight: "100vh",
      background:
        "linear-gradient(120deg, #a78bfa, #60a5fa, #f472b6, #fcd34d)",
      backgroundSize: "300% 300%",
      animation: "gradientFlow 12s ease infinite",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      fontFamily: "'Inter', sans-serif",
    },
    card: {
      background: "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(12px)",
      borderRadius: "1.5rem",
      padding: "2.5rem",
      boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      maxWidth: "700px",
      width: "100%",
      transition: "transform 0.3s ease",
    },
    header: {
      textAlign: "center",
      marginBottom: "2rem",
    },
    title: {
      fontSize: "2.25rem",
      fontWeight: 800,
      color: "#1e293b",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
    },
    input: {
      padding: "0.85rem 1rem",
      borderRadius: "0.75rem",
      border: "2px solid #e5e7eb",
      fontSize: "1rem",
      transition: "all 0.2s ease",
      outline: "none",
    },
    textarea: {
      padding: "1rem",
      borderRadius: "0.75rem",
      border: "2px solid #e5e7eb",
      resize: "vertical",
      fontSize: "1rem",
      minHeight: "140px",
      outline: "none",
      transition: "all 0.2s ease",
    },
    uploadArea: {
      border: `3px dashed ${dragging ? "#6366f1" : "#d1d5db"}`,
      borderRadius: "1rem",
      padding: "2rem",
      textAlign: "center",
      cursor: "pointer",
      background: dragging ? "#eef2ff" : "#fff",
      transition: "all 0.25s ease",
    },
    preview: {
      marginTop: "1rem",
      position: "relative",
      borderRadius: "1rem",
      overflow: "hidden",
      boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    },
    removeBtn: {
      position: "absolute",
      top: "1rem",
      right: "1rem",
      background: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
      transition: "transform 0.2s ease",
    },
    buttons: {
      display: "flex",
      gap: "1rem",
      marginTop: "1rem",
    },
    btnPrimary: {
      flex: 1,
      padding: "0.9rem 1.5rem",
      background: "linear-gradient(120deg, #6366f1, #8b5cf6)",
      color: "white",
      fontWeight: 600,
      border: "none",
      borderRadius: "0.75rem",
      cursor: "pointer",
      transition: "transform 0.25s ease, box-shadow 0.25s ease",
    },
    btnCancel: {
      flex: 1,
      padding: "0.9rem 1.5rem",
      background: "#f3f4f6",
      color: "#374151",
      fontWeight: 600,
      border: "none",
      borderRadius: "0.75rem",
      cursor: "pointer",
      transition: "background 0.25s ease",
    },
    charCounter: {
      textAlign: "right",
      fontSize: "0.85rem",
      color: "#6b7280",
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Sparkles color="#8b5cf6" /> Create Post on Trendify
          </h1>
          <p style={{ color: "#6b7280" }}>
            Express yourself — share your thoughts, moments, and trends 🌟
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div>
            <label style={{ fontWeight: 600, color: "#374151" }}>Title *</label>
            <input
              type="text"
              placeholder="Enter a catchy post title"
              value={title}
              maxLength={80}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
            <div style={styles.charCounter}>{title.length}/80</div>
          </div>

          <div>
            <label style={{ fontWeight: 600, color: "#374151" }}>
              Content *
            </label>
            <textarea
              placeholder="What's trending in your mind?"
              value={content}
              maxLength={500}
              onChange={(e) => setContent(e.target.value)}
              style={styles.textarea}
              disabled={loading}
            />
            <div style={styles.charCounter}>{content.length}/500</div>
          </div>

          <div>
            <label style={{ fontWeight: 600, color: "#374151" }}>
              Media (optional)
            </label>

            {!mediaPreview ? (
              <div
                style={styles.uploadArea}
                onClick={() => fileInputRef.current.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload size={40} color="#6b7280" />
                <p>Click or drag & drop image/video here</p>
                <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
                  Max 50MB | JPG, PNG, GIF, MP4
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  disabled={loading}
                />
              </div>
            ) : (
              <div style={styles.preview}>
                {mediaFile.type.startsWith("video") ? (
                  <video src={mediaPreview} controls style={{ width: "100%" }} />
                ) : (
                  <img
                    src={mediaPreview}
                    alt="Preview"
                    style={{ width: "100%", display: "block" }}
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  style={styles.removeBtn}
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          <div style={styles.buttons}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={styles.btnCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.btnPrimary}
              disabled={loading}
            >
              {loading ? "Posting..." : "Share Trend ✨"}
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </div>
  );
};

export default CreatePost;
