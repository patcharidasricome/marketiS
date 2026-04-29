"use client";

import { useEffect, useMemo, useState } from "react";
import { externalMarketingInstructions } from "@/lib/marketingPrompt";
import styles from "./page.module.css";

const PLATFORMS = ["Facebook", "Instagram", "LinkedIn"];
const SELECTED_PROMPT_STORAGE_KEY = "marketiS-selected-content-prompt";
const MAX_PROMPT_CONTENT_CHARS = 45000;
const MAX_ATTACHED_LINKS = 5;

type PromptItem = {
  id: string;
  name: string;
  content: string;
  isDefault?: boolean;
  description?: string;
  tags?: string;
  attachedLinks?: string[];
  createdAt?: string;
};

const DEFAULT_PROMPT: PromptItem = {
  id: "default-issi-content-generation",
  name: "iSSi Default Content Generation Prompt",
  content: externalMarketingInstructions,
  isDefault: true,
};

const TEAM_MEMBERS = [
  { name: "Tian", role: "Admin" },
  { name: "Pat", role: "Author" },
  { name: "Michaela", role: "Author" },
  { name: "Hyunjung", role: "Viewer" },
];

function readSelectedPromptId() {
  if (typeof window === "undefined") return DEFAULT_PROMPT.id;
  try {
    const raw = localStorage.getItem(SELECTED_PROMPT_STORAGE_KEY);
    if (!raw) return DEFAULT_PROMPT.id;
    return (JSON.parse(raw) as PromptItem).id || DEFAULT_PROMPT.id;
  } catch {
    return DEFAULT_PROMPT.id;
  }
}

function attachedLinksToRows(links?: string[]): string[] {
  const trimmed = (links ?? []).map((s) => s.trim()).filter(Boolean);
  return trimmed.length ? trimmed : [""];
}

export default function SettingsPage() {
  const [members, setMembers] = useState(TEAM_MEMBERS);
  const [prompts, setPrompts] = useState<PromptItem[]>([DEFAULT_PROMPT]);
  const [selectedPromptId, setSelectedPromptId] = useState(() => readSelectedPromptId());
  const [viewingPrompt, setViewingPrompt] = useState<PromptItem | null>(null);
  const [promptStatus, setPromptStatus] = useState("");
  const [promptError, setPromptError] = useState("");

  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [promptModalMode, setPromptModalMode] = useState<"create" | "edit">("create");
  const [editPromptId, setEditPromptId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTags, setFormTags] = useState("");
  const [formLinks, setFormLinks] = useState<string[]>([""]);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const selectedPrompt = useMemo(
    () => prompts.find((prompt) => prompt.id === selectedPromptId) ?? prompts[0] ?? DEFAULT_PROMPT,
    [prompts, selectedPromptId],
  );

  useEffect(() => {
    async function loadPrompts() {
      try {
        const res = await fetch("/api/prompts");
        const json = await res.json();
        const rows = Array.isArray(json.data) && json.data.length > 0 ? json.data : [DEFAULT_PROMPT];
        setPrompts(rows);

        const storedId = readSelectedPromptId();
        const nextSelected = rows.find((prompt: PromptItem) => prompt.id === storedId) ?? rows[0] ?? DEFAULT_PROMPT;
        setSelectedPromptId(nextSelected.id);
        localStorage.setItem(SELECTED_PROMPT_STORAGE_KEY, JSON.stringify(nextSelected));
      } catch {
        setPrompts([DEFAULT_PROMPT]);
        setSelectedPromptId(DEFAULT_PROMPT.id);
      }
    }

    loadPrompts();
  }, []);

  useEffect(() => {
    if (!promptModalOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setPromptModalOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [promptModalOpen]);

  function openPromptModalCreate() {
    setPromptModalMode("create");
    setEditPromptId(null);
    setFormName("");
    setFormContent("");
    setFormDescription("");
    setFormTags("");
    setFormLinks([""]);
    setFormError("");
    setPromptModalOpen(true);
  }

  function openPromptModalForPrompt(prompt: PromptItem) {
    setFormError("");
    if (prompt.isDefault) {
      setPromptModalMode("create");
      setEditPromptId(null);
      setFormName(`${prompt.name} Copy`);
      setFormContent(prompt.content);
      setFormDescription("");
      setFormTags("");
      setFormLinks([""]);
    } else {
      setPromptModalMode("edit");
      setEditPromptId(prompt.id);
      setFormName(prompt.name);
      setFormContent(prompt.content);
      setFormDescription(prompt.description ?? "");
      setFormTags(prompt.tags ?? "");
      setFormLinks(attachedLinksToRows(prompt.attachedLinks));
    }
    setPromptModalOpen(true);
  }

  function selectPrompt(promptId: string) {
    const prompt = prompts.find((item) => item.id === promptId) ?? DEFAULT_PROMPT;
    setSelectedPromptId(prompt.id);
    setPromptStatus("Selected prompt updated.");
    setPromptError("");
    localStorage.setItem(SELECTED_PROMPT_STORAGE_KEY, JSON.stringify(prompt));
  }

  function addFormLinkRow() {
    setFormLinks((prev) => (prev.length >= MAX_ATTACHED_LINKS ? prev : [...prev, ""]));
  }

  function removeFormLinkRow(index: number) {
    setFormLinks((prev) => (prev.length <= 1 ? [""] : prev.filter((_, i) => i !== index)));
  }

  async function savePromptModal() {
    const name = formName.trim();
    const content = formContent.trim();
    const description = formDescription.trim();
    const tags = formTags.trim();
    const attachedLinks = formLinks.map((s) => s.trim()).filter(Boolean).slice(0, MAX_ATTACHED_LINKS);

    if (!name || !content) {
      setFormError("Title and content are required.");
      return;
    }
    if (content.length > MAX_PROMPT_CONTENT_CHARS) {
      setFormError(`Content must be ${MAX_PROMPT_CONTENT_CHARS.toLocaleString()} characters or fewer.`);
      return;
    }

    setFormSaving(true);
    setFormError("");

    const scriptDebug = (json: { scriptResult?: { sheetName?: string; lastRow?: number } }) => {
      const scriptResult = json.scriptResult;
      return scriptResult?.sheetName
        ? ` (${scriptResult.sheetName}, row ${scriptResult.lastRow ?? "?"})`
        : "";
    };

    try {
      if (promptModalMode === "edit" && editPromptId) {
        const existing = prompts.find((p) => p.id === editPromptId);
        const res = await fetch("/api/prompts", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editPromptId,
            name,
            content,
            ...(description ? { description } : {}),
            ...(tags ? { tags } : {}),
            ...(attachedLinks.length ? { attachedLinks } : {}),
            ...(existing?.createdAt ? { createdAt: existing.createdAt } : {}),
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Failed to update prompt.");

        const saved = json.prompt as PromptItem;
        setPrompts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        setSelectedPromptId((current) => {
          if (current === saved.id) {
            localStorage.setItem(SELECTED_PROMPT_STORAGE_KEY, JSON.stringify(saved));
          }
          return current;
        });

        setPromptModalOpen(false);
        setPromptStatus(`Prompt updated in Google Sheets${scriptDebug(json)}.`);
        setPromptError("");
      } else {
        const res = await fetch("/api/prompts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            content,
            ...(description ? { description } : {}),
            ...(tags ? { tags } : {}),
            ...(attachedLinks.length ? { attachedLinks } : {}),
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || "Failed to save prompt.");

        const saved = json.prompt as PromptItem;
        setPrompts((prev) => [...prev, saved]);
        setSelectedPromptId(saved.id);
        localStorage.setItem(SELECTED_PROMPT_STORAGE_KEY, JSON.stringify(saved));
        setPromptModalOpen(false);
        setPromptStatus(`Prompt saved to Google Sheets${scriptDebug(json)}.`);
        setPromptError("");
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save prompt.");
    } finally {
      setFormSaving(false);
    }
  }

  const promptModalTitle = promptModalMode === "edit" ? "Modify Prompt" : "Create Prompt";

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="gradient-text" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Settings & Configuration
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Manage system preferences and user roles.
        </p>
      </div>

      <div className={styles.settingsGrid}>
        {/* ── AI Prompt Configuration ── */}
        <div className={styles.section}>
          <div className={styles.sectionTitleRow}>
            <h3 className={styles.sectionTitle}>
              <i className={`fas fa-robot ${styles.sectionTitleIcon}`} />
              AI Prompt Configuration
            </h3>
            <button type="button" className={`btn-primary btn-small ${styles.newPromptTopBtn}`} onClick={openPromptModalCreate}>
              <i className="fas fa-plus" aria-hidden /> New Prompt
            </button>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Selected Content Generation Prompt</label>
            <select className="form-select" value={selectedPrompt.id} onChange={(e) => selectPrompt(e.target.value)}>
              {prompts.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name}
                  {prompt.isDefault ? " (Default)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.promptCard}>
            <div className={styles.promptCardHeader}>
              <div>
                <div className={styles.promptEyebrow}>{selectedPrompt.isDefault ? "Default Prompt" : "Custom Prompt"}</div>
                <h4 className={styles.promptName}>{selectedPrompt.name}</h4>
              </div>
              <button type="button" className={styles.promptTextButton} onClick={() => setViewingPrompt(selectedPrompt)}>
                View full
              </button>
            </div>
            <p className={styles.promptPreview}>{selectedPrompt.content}</p>
            <div className={styles.promptActions}>
              <button type="button" className="btn-secondary btn-small" onClick={() => openPromptModalForPrompt(selectedPrompt)}>
                <i className="fas fa-edit" /> Modify
              </button>
            </div>
          </div>

          {promptStatus && <p className={styles.promptSuccess}>{promptStatus}</p>}
          {promptError && <p className={styles.promptError}>{promptError}</p>}
        </div>

        {/* ── Storage & Integration ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className={`fas fa-link ${styles.sectionTitleIcon}`} />
            Storage & Integration
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Google Sheets Integration</label>
            <div className={styles.integrationRow}>
              <span>Connected</span>
              <span className={styles.statusBadge}>Active</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Platform Integrations</label>
            {PLATFORMS.map((platform) => (
              <div key={platform} className={styles.integrationRow}>
                <span>{platform}</span>
                <span className={styles.statusBadge}>Connected</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Posting Configuration ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className={`fas fa-cog ${styles.sectionTitleIcon}`} />
            Posting Configuration
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Default Timezone</label>
            <select className="form-select" defaultValue="Pacific Time (PT)">
              <option>Eastern Time (ET)</option>
              <option>Central Time (CT)</option>
              <option>Pacific Time (PT)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Trending Topics Frequency</label>
            <select className="form-select">
              <option>Weekly</option>
              <option>Daily</option>
              <option>Bi-weekly</option>
            </select>
          </div>
        </div>

        {/* ── User Roles & Permissions ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <i className={`fas fa-lock ${styles.sectionTitleIcon}`} />
            User Roles & Permissions
          </h3>

          <label className={styles.label}>Team Members</label>
          <div className={styles.memberList}>
            {members.map((member, i) => (
              <div key={member.name} className={styles.memberRow}>
                <span className={styles.memberName}>{member.name}</span>
                <select
                  className={styles.roleSelect}
                  value={member.role}
                  onChange={(e) =>
                    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, role: e.target.value } : m)))
                  }
                >
                  <option>Admin</option>
                  <option>Author</option>
                  <option>Viewer</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>

      {viewingPrompt && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="prompt-modal-title">
          <div className={styles.promptModal}>
            <div className={styles.promptModalHeader}>
              <h3 id="prompt-modal-title">{viewingPrompt.name}</h3>
              <button type="button" className={styles.modalCloseBtn} onClick={() => setViewingPrompt(null)} aria-label="Close prompt preview">
                <i className="fas fa-xmark" />
              </button>
            </div>
            <pre className={styles.promptFullText}>{viewingPrompt.content}</pre>
          </div>
        </div>
      )}

      {promptModalOpen && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onClick={() => !formSaving && setPromptModalOpen(false)}
        >
          <div
            className={styles.createPromptModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-form-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.promptModalHeader}>
              <h3 id="prompt-form-dialog-title">{promptModalTitle}</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => !formSaving && setPromptModalOpen(false)}
                aria-label="Close prompt form"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>

            <div className={styles.createPromptBody}>
              <div className={styles.createPromptField}>
                <label className={styles.label} htmlFor="form-prompt-title-input">
                  Title
                </label>
                <input
                  id="form-prompt-title-input"
                  className="form-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Prompt name"
                  disabled={formSaving}
                />
              </div>

              <div className={styles.createPromptField}>
                <label className={styles.label} htmlFor="form-prompt-content">
                  Content
                </label>
                <p className={styles.fieldHint}>Use square brackets like [Client Name] for dynamic variables.</p>
                <div className={styles.textareaWrap}>
                  <textarea
                    id="form-prompt-content"
                    className={styles.createPromptTextarea}
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="Write your prompt instructions..."
                    rows={12}
                    disabled={formSaving}
                    maxLength={MAX_PROMPT_CONTENT_CHARS}
                  />
                  <span className={styles.charCounter}>
                    {formContent.length.toLocaleString()} / {MAX_PROMPT_CONTENT_CHARS.toLocaleString()} characters
                  </span>
                </div>
              </div>

              <div className={styles.createPromptField}>
                <label className={styles.label} htmlFor="form-prompt-description">
                  Description <span className={styles.optionalMark}>(Optional)</span>
                </label>
                <input
                  id="form-prompt-description"
                  className="form-input"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short summary for your team"
                  disabled={formSaving}
                />
              </div>

              <div className={styles.createPromptField}>
                <label className={styles.label} htmlFor="form-prompt-tags">
                  Tags <span className={styles.optionalMark}>(comma separated, optional)</span>
                </label>
                <input
                  id="form-prompt-tags"
                  className="form-input"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  placeholder="e.g. email, draft, code"
                  disabled={formSaving}
                />
              </div>

              <div className={styles.createPromptField}>
                <label className={styles.label}>Attached Links (up to {MAX_ATTACHED_LINKS})</label>
                <button
                  type="button"
                  className={styles.addLinkBtn}
                  onClick={addFormLinkRow}
                  disabled={formSaving || formLinks.length >= MAX_ATTACHED_LINKS}
                >
                  <i className="fas fa-plus-circle" aria-hidden /> Add Link
                </button>
                <p className={styles.fieldHint}>Attach relevant files, NotebookLM, or Google Gems links</p>
                <div className={styles.attachedLinksList}>
                  {formLinks.map((link, idx) => (
                    <div key={`form-link-${idx}`} className={styles.linkRow}>
                      <input
                        className="form-input"
                        type="text"
                        inputMode="url"
                        value={link}
                        onChange={(e) =>
                          setFormLinks((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                        }
                        placeholder="https://..."
                        disabled={formSaving}
                        aria-label={`Attached link ${idx + 1}`}
                      />
                      <button
                        type="button"
                        className={styles.removeLinkBtn}
                        onClick={() => removeFormLinkRow(idx)}
                        disabled={formSaving}
                        aria-label="Remove link"
                      >
                        <i className="fas fa-trash-can" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {formError && <p className={styles.promptError}>{formError}</p>}
            </div>

            <div className={styles.createPromptFooter}>
              <button type="button" className="btn-secondary" onClick={() => !formSaving && setPromptModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={savePromptModal} disabled={formSaving}>
                {formSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin" aria-hidden /> Saving...
                  </>
                ) : (
                  "Save Prompt"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
