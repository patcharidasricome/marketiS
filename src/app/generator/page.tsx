"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/PlatformIcons";
import styles from "./page.module.css";

const fallbackTrendingChips = ["mRNA Vaccines", "CRISPR Gene Therapy", "Personalized Medicine", "FDA Approvals"];

type TrendTopic = {
  id: string;
  title: string;
  category: string;
};

type PlatformKey = "facebook" | "instagram" | "linkedin";

const trendCategories = ["Life Sciences", "Utilities", "Oil & Gas", "SAP"];

function createThumbnail(dataUrl: string, size = 120): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }

      canvas.width = size;
      canvas.height = size;

      const scale = Math.max(size / image.width, size / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      const x = (size - width) / 2;
      const y = (size - height) / 2;

      ctx.drawImage(image, x, y, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => resolve("");
    image.src = dataUrl;
  });
}

const generatedContent = {
  facebook:
    "Check out our latest breakthrough in life science research! Our team is excited to share how innovation is transforming healthcare. Discover the science behind tomorrow's solutions. 🔬💙 #LifeScience #Healthcare",
  instagram:
    "The future of medicine is here. Innovation in life sciences is transforming patient outcomes. #LifeScience #HealthTech #Innovation",
  linkedin:
    "Advanced research in life sciences demonstrates the transformative impact of innovation. Our latest findings showcase how precision medicine and breakthrough therapies are reshaping the industry. #LifeSciences #MedicalInnovation #Research",
};

const outputPlatforms: Array<{
  key: PlatformKey;
  label: string;
  aspectLabel: string;
  previewClass: string;
  icon: React.ReactNode;
}> = [
  { key: "linkedin", label: "LinkedIn", aspectLabel: "LinkedIn (16:9)", previewClass: "preview169", icon: <LinkedInIcon size={16} /> },
  { key: "facebook", label: "Facebook", aspectLabel: "Facebook (16:9)", previewClass: "preview169", icon: <FacebookIcon size={16} /> },
  { key: "instagram", label: "Instagram", aspectLabel: "Instagram (3:4)", previewClass: "preview34", icon: <InstagramIcon size={16} id="output-tab" /> },
];

export default function GeneratorPage() {
  const [contentIdea, setContentIdea] = useState("");
  const [author, setAuthor] = useState("");
  const [platforms, setPlatforms] = useState({ facebook: true, instagram: true, linkedin: true });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);
  const [draggingOver, setDraggingOver] = useState(false);
  const [trendingChips, setTrendingChips] = useState<string[]>(fallbackTrendingChips);
  const [activeOutputPlatform, setActiveOutputPlatform] = useState<PlatformKey>("linkedin");
  const [editingPlatform, setEditingPlatform] = useState<PlatformKey | null>(null);
  const [generatedDrafts, setGeneratedDrafts] = useState<Record<PlatformKey, string>>(generatedContent);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic") || sessionStorage.getItem("contentTopic");

    if (topic) {
      sessionStorage.removeItem("contentTopic");
      const timeout = window.setTimeout(() => setContentIdea(topic), 0);
      return () => window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    async function loadTrendingChips() {
      try {
        const res = await fetch("/api/trends");
        const data = await res.json();
        if (!res.ok) throw new Error("Unable to load trends");

        const topics = (data.topics ?? []) as TrendTopic[];
        const topicTitles = trendCategories.flatMap((category) =>
          topics.filter((topic) => topic.category === category).slice(0, 1).map((topic) => topic.title),
        );

        if (topicTitles.length > 0) {
          setTrendingChips([...new Set(topicTitles)]);
        }
      } catch {
        setTrendingChips(fallbackTrendingChips);
      }
    }

    loadTrendingChips();
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

  const handleSaveToContents = useCallback(async () => {
    const title = contentIdea.trim() || "Untitled Content";
    const selectedPlatforms = Object.entries(platforms)
      .filter(([, selected]) => selected)
      .map(([platform]) => platform === "instagram" ? "IG" : platform.charAt(0).toUpperCase() + platform.slice(1));

    setSaving(true);
    setSaveError("");

    try {
      const thumbnailImage = imageSrc ? await createThumbnail(imageSrc, 120) : "";

      const res = await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thumbnailImage,
          title,
          author: author.trim() || "Current User",
          dateCreated: new Date().toISOString(),
          dateScheduled: "",
          platforms: selectedPlatforms,
          linkedinCaption: generatedDrafts.linkedin,
          facebookCaption: generatedDrafts.facebook,
          instagramCaption: generatedDrafts.instagram,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to save content");
      }

      await fetch("/api/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: title,
          action: "has saved to Contents Library",
          author: author.trim() || "Current User",
          date: new Date().toISOString(),
          remarks: "generated from Content Generator",
        }),
      }).catch(() => undefined);

      router.push("/contents");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save content");
    } finally {
      setSaving(false);
    }
  }, [author, contentIdea, generatedDrafts, imageSrc, platforms, router]);

  const selectedOutputPlatforms = outputPlatforms.filter(({ key }) => platforms[key]);
  const activeOutput = selectedOutputPlatforms.find(({ key }) => key === activeOutputPlatform) ?? selectedOutputPlatforms[0];
  const isEditingActiveOutput = activeOutput ? editingPlatform === activeOutput.key : false;

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Content Generator
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Generate AI-optimized content for your target social media platforms.
        </p>
      </div>

      {/* Trending chips */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem", color: "var(--text-secondary)" }}>
          Trending topics:
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
              Author
            </label>
            <input
              className="form-input"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name..."
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.6rem", fontSize: "0.95rem" }}>
              Select Platforms
            </label>
            <div className={styles.platformButtonList}>
              <button
                type="button"
                className={`${styles.platformButton}${platforms.facebook ? ` ${styles.platformButtonActive}` : ""}`}
                onClick={() => setPlatforms((prev) => ({ ...prev, facebook: !prev.facebook }))}
              >
                <FacebookIcon size={22} />
                <span>Facebook</span>
                {platforms.facebook && <i className={`fas fa-check ${styles.platformCheck}`} />}
              </button>

              <button
                type="button"
                className={`${styles.platformButton}${platforms.instagram ? ` ${styles.platformButtonActive}` : ""}`}
                onClick={() => setPlatforms((prev) => ({ ...prev, instagram: !prev.instagram }))}
              >
                <InstagramIcon size={22} id="generator-platform" />
                <span>Instagram</span>
                {platforms.instagram && <i className={`fas fa-check ${styles.platformCheck}`} />}
              </button>

              <button
                type="button"
                className={`${styles.platformButton}${platforms.linkedin ? ` ${styles.platformButtonActive}` : ""}`}
                onClick={() => setPlatforms((prev) => ({ ...prev, linkedin: !prev.linkedin }))}
              >
                <LinkedInIcon size={22} />
                <span>LinkedIn</span>
                {platforms.linkedin && <i className={`fas fa-check ${styles.platformCheck}`} />}
              </button>
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
            Preview
          </h2>

          {selectedOutputPlatforms.length === 0 ? (
            <div className={styles.emptyOutputState}>
              Select at least one platform to preview generated content.
            </div>
          ) : (
            <>
              <div className={styles.outputTabRow}>
                {selectedOutputPlatforms.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={activeOutput?.key === key}
                    className={`${styles.outputTab}${activeOutput?.key === key ? ` ${styles.outputTabActive}` : ""}`}
                    onClick={() => setActiveOutputPlatform(key)}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {activeOutput && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div className={styles.platformLabel}>{activeOutput.aspectLabel}</div>
                  {imageSrc && generated && (
                    <div className={styles[activeOutput.previewClass as "preview169" | "preview34"]}>
                      <img src={imageSrc} alt={`${activeOutput.label} preview`} />
                    </div>
                  )}
                  <div className={styles.previewHeader}>
                    <div className={styles.platformLabelTop}>{activeOutput.label} Version</div>
                    {generated && (
                      <button
                        type="button"
                        className={styles.editPreviewBtn}
                        onClick={() => setEditingPlatform(isEditingActiveOutput ? null : activeOutput.key)}
                        aria-label={isEditingActiveOutput ? "Finish editing generated post" : "Edit generated post"}
                      >
                        <i className={`fas ${isEditingActiveOutput ? "fa-check" : "fa-pen-to-square"}`} />
                        {isEditingActiveOutput ? "Done" : "Edit"}
                      </button>
                    )}
                  </div>
                  {isEditingActiveOutput ? (
                    <textarea
                      className={styles.contentEditor}
                      value={generatedDrafts[activeOutput.key]}
                      onChange={(e) => setGeneratedDrafts((prev) => ({ ...prev, [activeOutput.key]: e.target.value }))}
                      rows={7}
                    />
                  ) : (
                    <div className={styles.contentPreview}>
                      {generated ? generatedDrafts[activeOutput.key] : "Content will appear here"}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
            onClick={handleSaveToContents}
            disabled={saving}
          >
            {saving ? (
              <><i className="fas fa-spinner fa-spin" /> Saving...</>
            ) : (
              <><i className="fas fa-bookmark" /> Save to Contents Library</>
            )}
          </button>
          {saveError && (
            <p style={{ marginTop: "0.75rem", color: "var(--error)", fontSize: "0.82rem" }}>
              <i className="fas fa-circle-exclamation" /> {saveError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
