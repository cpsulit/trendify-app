import { useState } from "react";
import { supabase } from "../supabaseClient";
import { showToast } from "../utils/helpers";
import { Image as ImageIcon, Video, UploadCloud } from "lucide-react";

const PostForm = ({ onSubmit, initialData = {} }) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData.media_url || null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let mediaUrl = initialData.media_url || null;
    let mediaType = initialData.media_type || null;

    try {
      if (file) {
        const filePath = `public/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from("posts")
          .upload(filePath, file);

        if (error) throw error;
        const { data: publicUrl } = supabase.storage
          .from("posts")
          .getPublicUrl(filePath);

        mediaUrl = publicUrl.publicUrl;
        mediaType = file.type.startsWith("video") ? "video" : "image";
      }

      await onSubmit({
        title,
        content,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      showToast("Post saved successfully!", "success");
      setTitle("");
      setContent("");
      setFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Error uploading post:", error);
      showToast("Error uploading post", "error");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    form: {
      background: "white",
      borderRadius: "16px",
      padding: "2rem",
      boxShadow: "var(--shadow-md)",
      maxWidth: "600px",
      margin: "2rem auto",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      transition: "var(--transition-base)",
    },
    input: {
      padding: "0.75rem 1rem",
      borderRadius: "var(--radius-md)",
      border: "2px solid var(--gray-200)",
      fontSize: "1rem",
      outline: "none",
      transition: "all 0.25s ease",
    },
    inputFocus: {
      borderColor: "var(--secondary)",
      boxShadow: "0 0 0 3px rgba(139,92,246,0.1)",
    },
    textarea: {
      minHeight: "120px",
      resize: "vertical",
      lineHeight: 1.6,
    },
    fileUpload: {
      border: "2px dashed var(--gray-300)",
      borderRadius: "var(--radius-md)",
      padding: "1.5rem",
      textAlign: "center",
      cursor: "pointer",
      background: "var(--gray-50)",
      transition: "all 0.25s ease",
    },
    preview: {
      width: "100%",
      maxHeight: "300px",
      borderRadius: "12px",
      objectFit: "cover",
      marginTop: "0.5rem",
      boxShadow: "var(--shadow-sm)",
    },
    button: {
      background: "var(--primary)",
      color: "white",
      fontWeight: 600,
      fontSize: "1rem",
      padding: "0.9rem 1.2rem",
      border: "none",
      borderRadius: "var(--radius-md)",
      cursor: "pointer",
      transition: "var(--transition-base)",
    },
  };

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <h2 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "1rem", textAlign: "center" }}>
        {initialData.id ? "Edit Post" : "Create New Post"}
      </h2>

      {/* Title */}
      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={styles.input}
        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--gray-200)";
          e.target.style.boxShadow = "none";
        }}
        required
      />

      {/* Content */}
      <textarea
        placeholder="Share your thoughts..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ ...styles.input, ...styles.textarea }}
        onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--gray-200)";
          e.target.style.boxShadow = "none";
        }}
        required
      />

      {/* File Upload */}
      <label style={styles.fileUpload}>
        <UploadCloud size={24} style={{ marginBottom: "0.5rem" }} />
        <span>{file ? file.name : "Click to upload image or video"}</span>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>

      {/* Media Preview */}
      {previewUrl && (
        file?.type?.startsWith("video") ? (
          <video src={previewUrl} style={styles.preview} controls />
        ) : (
          <img src={previewUrl} alt="Preview" style={styles.preview} />
        )
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={(e) =>
          !loading && (e.currentTarget.style.background = "var(--primary-dark)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "var(--primary)")
        }
      >
        {loading ? "Saving..." : "Save Post"}
      </button>
    </form>
  );
};

export default PostForm;
