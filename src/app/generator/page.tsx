"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const trendingChips = ["mRNA Vaccines", "CRISPR Gene Therapy", "Personalized Medicine", "FDA Approvals"];

const generatedContent = {
  facebook:
    "Check out our latest breakthrough in life science research! Our team is excited to share how innovation is transforming healthcare. Discover the science behind tomorrow's solutions. 🔬💙 #LifeScience #Healthcare",
  instagram:
    "The future of medicine is here. Innovation in life sciences is transforming patient outcomes. #LifeScience #HealthTech #Innovation",
  linkedin:
    "Advanced research in life sciences demonstrates the transformative impact of innovation. Our latest findings showcase how precision medicine and breakthrough therapies are reshaping the industry. #LifeSciences #MedicalInnovation #Research",
};

export default function GeneratorPage() {
  const [contentIdea, setContentIdea] = useState("");
  const [platforms, setPlatforms] = useState({ facebook: true, instagram: true, linkedin: true });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const topic = sessionStorage.getItem("contentTopic");
    if (topic) {
      setContentIdea(topic);
      sessionStorage.removeItem("contentTopic");
    }
  }, []);

  function insertTopic(topic: string) {
    setContentIdea((prev) => (prev ? `${prev} ${topic}` : topic).trim());
  }

  function handleImageFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => setImageSrc(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleImageFile(file);
  }

  const handleSaveToContents = useCallback(() => {
    router.push("/contents");
  }, [router]);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="gradient-text"
          style={{
            fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}
        >
          Content Generator
        </h1>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Generate AI-optimized content for your target platforms.
        </div>
      </div>

      {/* Trending chips */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3
          style={{
            fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
            marginBottom: "1rem",
            fontSize: "0.95rem",
            color: "var(--text-secondary)",
          }}
        >
          Trending topics for inspiration
        </h3>
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {trendingChips.map((chip) => (
            <span key={chip} className="chip" onClick={() => insertTopic(chip)}>
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Left: Input Panel */}
        <div className="card">
          <h2
            style={{
              fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <i
              className="fas fa-pen-fancy"
              style={{
                fontSize: "1.3rem",
                background: "linear-gradient(135deg, var(--primary-navy), var(--primary-purple))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            />
            Your Content Idea
          </h2>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                marginBottom: "0.6rem",
                fontSize: "0.95rem",
              }}
            >
              Content Idea or Draft
            </label>
            <textarea
              className="form-textarea"
              value={contentIdea}
              onChange={(e) => setContentIdea(e.target.value)}
              placeholder="Enter your content idea, rough draft, or topic you want to create..."
              rows={5}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                marginBottom: "0.6rem",
                fontSize: "0.95rem",
              }}
            >
              Select Platforms
            </label>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {(["facebook", "instagram", "linkedin"] as const).map((p) => (
                <label key={p} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={platforms[p]}
                    onChange={(e) => setPlatforms((prev) => ({ ...prev, [p]: e.target.checked }))}
                    style={{ width: 18, height: 18, accentColor: "var(--primary-purple)" }}
                  />
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
                marginBottom: "0.6rem",
                fontSize: "0.95rem",
              }}
            >
              Upload Image (Optional)
            </label>
            <div
              className={`drag-drop-area${draggingOver ? " dragging-over" : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
              onDragLeave={() => setDraggingOver(false)}
              onDrop={handleDrop}
            >
              {imageSrc ? (
                <img src={imageSrc} alt="Preview" style={{ maxHeight: 120, borderRadius: 8, objectFit: "cover" }} />
              ) : (
                <>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
                    <i className="fas fa-cloud-arrow-up" style={{ color: "var(--text-secondary)" }} />
                  </div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                    Drag and drop or click to upload
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                    Recommended: 1200x1200px or larger
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
              />
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
            onClick={() => setGenerated(true)}
          >
            <i className="fas fa-wand-magic-sparkles" /> Generate Content with AI
          </button>
        </div>

        {/* Right: Generated Output Panel */}
        <div className={`card${generated ? "" : " right-panel-disabled"}`}>
          <h2
            style={{
              fontFamily: "var(--font-work-sans, 'Work Sans', sans-serif)",
              fontSize: "1.1rem",
              fontWeight: 600,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
            }}
          >
            <i
              className="fas fa-sparkles"
              style={{
                fontSize: "1.3rem",
                background: "linear-gradient(135deg, var(--primary-navy), var(--primary-purple))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            />
            AI-Generated Content
          </h2>

          {platforms.facebook && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem" }}>
                Facebook (16:9)
              </div>
              {imageSrc && generated && (
                <div style={{ aspectRatio: "16/9", background: "#f9fafb", borderRadius: 8, overflow: "hidden", marginBottom: "0.5rem" }}>
                  <img src={imageSrc} alt="Facebook" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem", marginTop: "1rem" }}>
                Facebook Version
              </div>
              <div style={{ background: "#f9fafb", borderRadius: 8, padding: "1.5rem", marginBottom: "1.5rem" }}>
                {generated ? generatedContent.facebook : "Content will appear here"}
              </div>
            </div>
          )}

          {platforms.instagram && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem" }}>
                Instagram (3:4)
              </div>
              {imageSrc && generated && (
                <div style={{ aspectRatio: "3/4", background: "#f9fafb", borderRadius: 8, overflow: "hidden", marginBottom: "0.5rem" }}>
                  <img src={imageSrc} alt="Instagram" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem", marginTop: "1rem" }}>
                Instagram Version
              </div>
              <div style={{ background: "#f9fafb", borderRadius: 8, padding: "1.5rem", marginBottom: "1.5rem" }}>
                {generated ? generatedContent.instagram : "Content will appear here"}
              </div>
            </div>
          )}

          {platforms.linkedin && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem" }}>
                LinkedIn (16:9)
              </div>
              {imageSrc && generated && (
                <div style={{ aspectRatio: "16/9", background: "#f9fafb", borderRadius: 8, overflow: "hidden", marginBottom: "0.5rem" }}>
                  <img src={imageSrc} alt="LinkedIn" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, marginBottom: "0.5rem", marginTop: "1rem" }}>
                LinkedIn Version
              </div>
              <div style={{ background: "#f9fafb", borderRadius: 8, padding: "1.5rem", marginBottom: "1.5rem" }}>
                {generated ? generatedContent.linkedin : "Content will appear here"}
              </div>
            </div>
          )}

          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
            onClick={handleSaveToContents}
          >
            <i className="fas fa-bookmark" /> Save to Contents Library
          </button>
        </div>
      </div>
    </div>
  );
}
