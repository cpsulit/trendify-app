import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import PostCard from "../components/PostCard";
import {
  Image as ImageIcon,
  Plus,
  ChevronUp,
  Film,
  FileText,
  Grid,
  Sun,
  Moon,
  Users,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const Trendify = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ postCount: 0, userCount: 0 });
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    document.title = "Trendify | Explore What's Trending";
    const favicon = document.querySelector("link[rel='icon']");
    if (favicon) favicon.href = "/trendify-icon.png";

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);

    getCurrentUser();
    fetchPosts();
    fetchStats();

    const unsubscribe = setupRealtime();

    window.addEventListener("scroll", handleScroll);
    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel("realtime-trendify")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        (payload) => {
          fetchPosts();
          if (payload.eventType === "INSERT") {
            showToast("🔥 A new trend just dropped!");
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const handleScroll = () => setShowScrollTop(window.scrollY > 300);

  const fetchPosts = async (following = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (following && user) {
        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", user.id);
        const ids = follows?.map((f) => f.following_id) || [];
        query = query.in("user_id", ids);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
      setTrending(data.slice(0, 3)); // top 3 trending
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const [{ count: postCount }, { count: userCount }] = await Promise.all([
      supabase.from("posts").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);
    setStats({ postCount, userCount });
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const filteredPosts = posts.filter((post) => {
    const matchesFilter =
      filter === "All" || post.type?.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const showToast = (message) => {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style =
      "position:fixed;top:20px;right:20px;background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:9999;font-weight:600;animation:fadeInOut 3s ease;";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const styles = {
    container: {
      minHeight: "100vh",
      background:
        theme === "light"
          ? "linear-gradient(to bottom right, #f9fafb, #eef2ff)"
          : "linear-gradient(to bottom right, #0f172a, #1e293b)",
      color: theme === "light" ? "#111827" : "#f9fafb",
      transition: "all 0.4s ease",
      fontFamily: "'Inter', sans-serif",
      overflowX: "hidden",
    },
    hero: {
      background:
        "linear-gradient(120deg, #3b82f6, #9333ea, #ec4899, #facc15)",
      backgroundSize: "300% 300%",
      animation: "heroGradient 8s ease infinite",
      padding: "5rem 1.5rem 6rem",
      textAlign: "center",
      color: "white",
      borderBottomLeftRadius: "3rem",
      borderBottomRightRadius: "3rem",
      position: "relative",
      boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
    },
    stats: {
      display: "flex",
      justifyContent: "center",
      gap: "2rem",
      marginTop: "1.5rem",
      fontSize: "1.1rem",
      opacity: 0.9,
    },
    fab: {
      position: "fixed",
      bottom: "2rem",
      right: "2rem",
      background:
        "linear-gradient(120deg, rgba(59,130,246,1), rgba(147,51,234,1))",
      color: "white",
      borderRadius: "50%",
      width: "65px",
      height: "65px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 0 25px rgba(147,51,234,0.6)",
      cursor: "pointer",
      zIndex: 10,
      transition: "transform 0.2s ease",
    },
  };

  return (
    <div style={styles.container}>
      {/* 🌗 Theme Button */}
      <div
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          background: theme === "light" ? "#f1f5f9" : "#1e293b",
          color: theme === "light" ? "#111827" : "#f9fafb",
          borderRadius: "50%",
          width: "45px",
          height: "45px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          zIndex: 10,
        }}
        onClick={toggleTheme}
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </div>

      {/* 🌟 Hero */}
      <div style={styles.hero}>
        <h1 style={{ fontSize: "3.5rem", fontWeight: 900, marginBottom: "1rem" }}>
          Welcome to Trendify 🔥
        </h1>
        <p style={{ fontSize: "1.2rem", opacity: 0.9 }}>
          Discover the latest trends, stories, and inspirations.
        </p>
        <div style={styles.stats}>
          <span>📸 {stats.postCount} Posts</span>
          <span>👥 {stats.userCount} Users</span>
        </div>
      </div>

      {/* 🔥 Trending Carousel */}
      {trending.length > 0 && (
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: "1rem",
            padding: "1.5rem",
            scrollSnapType: "x mandatory",
          }}
        >
          {trending.map((post) => (
            <div
              key={post.id}
              style={{
                minWidth: "300px",
                scrollSnapAlign: "center",
                flex: "0 0 auto",
              }}
            >
              <PostCard post={post} showActions={false} />
            </div>
          ))}
        </div>
      )}

      {/* 🔍 Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: theme === "light" ? "#fff" : "#1e293b",
            padding: "0.6rem 1rem",
            borderRadius: "9999px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            width: "80%",
            maxWidth: "400px",
          }}
        >
          <Search size={18} style={{ marginRight: "8px", opacity: 0.6 }} />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              flex: 1,
              background: "transparent",
              color: theme === "light" ? "#111827" : "#f9fafb",
            }}
          />
        </div>
      </div>

      {/* 🧩 Filters */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {[{ name: "All", icon: Grid }, { name: "Images", icon: ImageIcon }, { name: "Videos", icon: Film }, { name: "Articles", icon: FileText }].map(({ name, icon: Icon }) => (
          <div
            key={name}
            onClick={() => setFilter(name)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: filter === name ? "#2563eb20" : "#fff",
              color: filter === name ? "#2563eb" : "#6b7280",
              padding: "0.6rem 1.2rem",
              borderRadius: "9999px",
              border: `2px solid ${filter === name ? "#2563eb" : "#e5e7eb"}`,
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.25s ease",
            }}
          >
            <Icon size={18} /> {name}
          </div>
        ))}

        {user && (
          <div
            onClick={() => fetchPosts(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#fff",
              color: "#16a34a",
              padding: "0.6rem 1.2rem",
              borderRadius: "9999px",
              border: "2px solid #16a34a",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <Users size={18} /> Following
          </div>
        )}
      </div>

      {/* 📰 Posts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "2rem",
          padding: "2rem 1.5rem 6rem",
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                background: theme === "light" ? "#e5e7eb" : "#1e293b",
                borderRadius: "12px",
                height: "250px",
                animation: "pulse 1.5s infinite",
              }}
            ></div>
          ))
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} showActions={true} />
          ))
        ) : (
          <div style={{ textAlign: "center", gridColumn: "1/-1", color: "#6b7280" }}>
            <ImageIcon size={50} style={{ opacity: 0.4 }} />
            <p>No posts found. Be the first to trend!</p>
          </div>
        )}
      </div>

      {/* ➕ Create Button */}
      <Link to="/create">
        <div style={styles.fab}>
          <Plus size={30} />
        </div>
      </Link>

      {/* ⬆ Scroll Top */}
      {showScrollTop && (
        <div
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "5.5rem",
            background: "#111827",
            color: "white",
            borderRadius: "50%",
            width: "55px",
            height: "55px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
            cursor: "pointer",
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp size={25} />
        </div>
      )}

      <style>{`
        @keyframes heroGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; }
          10%, 90% { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Trendify;
