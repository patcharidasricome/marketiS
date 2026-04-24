"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

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
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Content Generator
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Generate AI-optimized content for your target platforms.
        </p>
      </div>

      {/* Trending chips */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
          Trending topics for inspiration
        </h3>
        <div className={styles.chipRow}>
          {trendingChips.map((chip) => (
            <span key={chip} className="chip" onClick={() => insertTopic(chip)}>
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* Two-column grid */}
      <div className={styles.generatorGrid}>
        {/* ── Left: Input panel ── */}
        <div className="card">
          <h2 className={styles.cardTitle}>
            <i className={`fas fa-pen-fancy ${styles.cardTitleIcon}`} />
            Your Content Idea
          </h2>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.6rem", fontSize: "0.95rem" }}>
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
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.6rem", fontSize: "0.95rem" }}>
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
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.6rem", fontSize: "0.95rem" }}>
              Upload Image (Optional)
            </label>
            <div
              className={`${styles.dropZone}${draggingOver ? ` ${styles.dropZoneDragging}` : ""}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
              onDragLeave={() => setDraggingOver(false)}
              onDrop={handleDrop}
            >
              {imageSrc ? (
                <img src={imageSrc} alt="Preview" className={styles.imageThumb} />
              ) : (
                <>
                  <div className={styles.dropIcon}>
                    <i className="fas fa-cloud-arrow-up" />
                  </div>
                  <div className={styles.dropLabel}>Drag and drop or click to upload</div>
                  <div className={styles.dropHint}>Recommended: 1200×1200px or larger</div>
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

        {/* ── Right: Generated output panel ── */}
        <div className={`card${generated ? "" : ` ${styles.panelDisabled}`}`}>
          <h2 className={styles.cardTitle}>
            <i className={`fas fa-sparkles ${styles.cardTitleIcon}`} />
            AI-Generated Content
          </h2>

          {platforms.facebook && (
            <div style={{ marginBottom: "1rem" }}>
              <div className={styles.platformLabel}>Facebook (16:9)</div>
              {imageSrc && generated && (
                <div className={styles.preview169}>
                  <img src={imageSrc} alt="Facebook preview" />
                </div>
              )}
              <div className={styles.platformLabelTop}>Facebook Version</div>
              <div className={styles.contentPreview}>
                {generated ? generatedContent.facebook : "Content will appear here"}
              </div>
            </div>
          )}

          {platforms.instagram && (
            <div style={{ marginBottom: "1rem" }}>
              <div className={styles.platformLabel}>Instagram (3:4)</div>
              {imageSrc && generated && (
                <div className={styles.preview34}>
                  <img src={imageSrc} alt="Instagram preview" />
                </div>
              )}
              <div className={styles.platformLabelTop}>Instagram Version</div>
              <div className={styles.contentPreview}>
                {generated ? generatedContent.instagram : "Content will appear here"}
              </div>
            </div>
          )}

          {platforms.linkedin && (
            <div style={{ marginBottom: "1.5rem" }}>
              <div className={styles.platformLabel}>LinkedIn (16:9)</div>
              {imageSrc && generated && (
                <div className={styles.preview169}>
                  <img src={imageSrc} alt="LinkedIn preview" />
                </div>
              )}
              <div className={styles.platformLabelTop}>LinkedIn Version</div>
              <div className={styles.contentPreview}>
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
