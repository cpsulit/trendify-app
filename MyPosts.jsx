import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { supabase } from "../supabaseClient";
import { formatDate, deleteMedia, showToast } from "../utils/helpers";
import { useNavigate } from "react-router-dom";
import { Search, Edit, Trash2, ChevronDown } from "lucide-react";

const MyPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchMyPosts();
  }, [user, sortOrder]);

  const fetchMyPosts = async () => {
    try {
      setLoading(true);

      if (!user) {
        console.log("No user logged in yet");
        setPosts([]);
        setLoading(false);
        return;
      }

      console.log("Fetching posts for user:", user.id);

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: sortOrder === "asc" });

      if (error) throw error;

      console.log("Fetched posts:", data);
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      showToast("Failed to load your posts", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId, mediaUrl) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;

      if (mediaUrl) await deleteMedia(mediaUrl);
      showToast("Post deleted successfully", "success");
      setPosts(posts.filter((p) => p.id !== postId));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting post:", error.message);
      showToast("Failed to delete post", "error");
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Posts</h1>
          <div style={styles.controls}>
            <div style={styles.searchBox}>
              <Search size={18} color="#555" />
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.sort}>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={styles.dropdown}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
              <ChevronDown size={16} style={{ marginLeft: "-24px" }} />
            </div>
          </div>
        </div>

        {loading ? (
          <div style={styles.grid}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={styles.skeletonCard}></div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <p style={styles.empty}>No posts found.</p>
        ) : (
          <div style={styles.grid}>
            {filteredPosts.map((post) => (
              <div key={post.id} style={styles.card}>
                {post.media_url &&
                  (post.media_type === "image" ? (
                    <img
                      src={post.media_url}
                      alt="Post"
                      style={styles.media}
                      onError={(e) =>
                        (e.target.src = "https://via.placeholder.com/400x250")
                      }
                    />
                  ) : (
                    <video controls src={post.media_url} style={styles.media} />
                  ))}

                <h3 style={styles.cardTitle}>{post.title}</h3>
                <p style={styles.description}>{post.content}</p>
                <p style={styles.date}>{formatDate(post.created_at)}</p>

                <div style={styles.actions}>
                  <button
                    onClick={() => navigate(`/edit/${post.id}`)}
                    style={styles.editBtn}
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => setConfirmDelete(post)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete <b>{confirmDelete.title}</b>?
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={() =>
                  handleDelete(confirmDelete.id, confirmDelete.media_url)
                }
                style={styles.confirmBtn}
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ====== STYLES ====== (unchanged)
const styles = {
  container: { maxWidth: "1100px", margin: "2rem auto", padding: "1rem" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  title: { fontSize: "2rem", fontWeight: "700" },
  controls: { display: "flex", gap: "1rem", alignItems: "center" },
  searchBox: {
    display: "flex",
    alignItems: "center",
    background: "#f3f4f6",
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    marginLeft: "0.5rem",
    fontSize: "0.95rem",
  },
  sort: { position: "relative" },
  dropdown: {
    appearance: "none",
    background: "#f3f4f6",
    border: "none",
    borderRadius: "8px",
    padding: "0.5rem 2rem 0.5rem 0.8rem",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "1.5rem",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.2s, box-shadow 0.2s",
    animation: "fadeIn 0.3s ease-in",
  },
  cardTitle: { margin: "0.5rem 0", fontWeight: "600", fontSize: "1.1rem" },
  media: { width: "100%", borderRadius: "8px", marginBottom: "0.5rem" },
  description: { color: "#555", fontSize: "0.95rem", margin: "0.5rem 0" },
  date: { color: "#888", fontSize: "0.85rem" },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
    gap: "0.5rem",
  },
  editBtn: {
    flex: 1,
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "0.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.4rem",
  },
  deleteBtn: {
    flex: 1,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "0.5rem",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.4rem",
  },
  empty: { textAlign: "center", color: "#666", marginTop: "2rem" },
  skeletonCard: {
    height: "220px",
    borderRadius: "12px",
    background: "linear-gradient(90deg, #eee 25%, #ddd 37%, #eee 63%)",
    backgroundSize: "400% 100%",
    animation: "skeleton 1.4s ease infinite",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    textAlign: "center",
    width: "90%",
    maxWidth: "400px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1.5rem",
    gap: "1rem",
  },
  confirmBtn: {
    flex: 1,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "0.6rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    background: "#e5e7eb",
    color: "#333",
    border: "none",
    padding: "0.6rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

// animations
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    @keyframes skeleton {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `);
  styleSheet.insertRule(`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `);
}

export default MyPosts;
