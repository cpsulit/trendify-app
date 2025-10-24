import { Edit2, Trash2, Image as ImageIcon, Video, CalendarDays } from "lucide-react";
import { formatDate } from "../utils/helpers";
import { useState } from "react";

const PostCard = ({ post, onEdit, onDelete, showActions = false }) => {
  const [hovered, setHovered] = useState(false);

  const styles = {
    card: {
      background: "linear-gradient(145deg, #ffffff, #f4f4f9)",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: hovered
        ? "0 10px 20px rgba(0,0,0,0.15)"
        : "0 4px 10px rgba(0,0,0,0.08)",
      transform: hovered ? "translateY(-6px)" : "translateY(0)",
      transition: "all 0.3s ease",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      position: "relative",
    },
    mediaContainer: {
      position: "relative",
      width: "100%",
      aspectRatio: "16 / 9",
      background: "var(--gray-100)",
      overflow: "hidden",
    },
    media: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      filter: hovered ? "brightness(0.95)" : "brightness(1)",
      transition: "filter 0.3s ease",
    },
    noMedia: {
      height: "280px",
      background:
        "linear-gradient(135deg, var(--primary-light), var(--secondary))",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
    },
    badge: {
      position: "absolute",
      top: "12px",
      right: "12px",
      background: post.media_type === "video" ? "#2563eb" : "#9333ea",
      color: "white",
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.5px",
      boxShadow: "0 3px 8px rgba(0,0,0,0.2)",
      textTransform: "uppercase",
    },
    content: {
      padding: "1.25rem 1.5rem",
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    title: {
      fontSize: "1.3rem",
      fontWeight: 800,
      color: "var(--gray-900)",
      marginBottom: "0.6rem",
      lineHeight: 1.3,
    },
    description: {
      color: "var(--gray-600)",
      fontSize: "0.95rem",
      lineHeight: 1.6,
      flexGrow: 1,
      marginBottom: "1.2rem",
      maxHeight: "5.5rem",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderTop: "1px solid var(--gray-200)",
      paddingTop: "0.75rem",
    },
    date: {
      fontSize: "0.9rem",
      color: "var(--gray-500)",
      display: "flex",
      alignItems: "center",
      gap: "0.35rem",
    },
    actions: {
      display: "flex",
      gap: "0.6rem",
    },
    button: {
      padding: "0.5rem 0.6rem",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      transition: "all 0.25s ease",
      cursor: "pointer",
      color: "white",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    },
    editButton: {
      background: "linear-gradient(135deg, #7e22ce, #9333ea)",
    },
    deleteButton: {
      background: "linear-gradient(135deg, #ef4444, #b91c1c)",
    },
  };

  return (
    <div
      style={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Media Section */}
      {post.media_url ? (
        <div style={styles.mediaContainer}>
          {post.media_type === "video" ? (
            <video src={post.media_url} style={styles.media} controls playsInline />
          ) : (
            <img src={post.media_url} alt={post.title} style={styles.media} loading="lazy" />
          )}
          <span style={styles.badge}>{post.media_type}</span>
        </div>
      ) : (
        <div style={styles.noMedia}>
          {post.media_type === "video" ? <Video size={64} /> : <ImageIcon size={64} />}
        </div>
      )}

      {/* Content Section */}
      <div style={styles.content}>
        <div>
          <h3 style={styles.title}>{post.title}</h3>
          <p style={styles.description}>{post.content}</p>
        </div>

        <div style={styles.footer}>
          <span style={styles.date}>
            <CalendarDays size={16} /> {formatDate(post.created_at)}
          </span>

          {showActions && (
            <div style={styles.actions}>
              <button
                title="Edit Post"
                onClick={() => onEdit(post)}
                style={{ ...styles.button, ...styles.editButton }}
              >
                <Edit2 size={18} />
              </button>

              <button
                title="Delete Post"
                onClick={() => onDelete(post.id, post.media_url)}
                style={{ ...styles.button, ...styles.deleteButton }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
