"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/components/PlatformIcons";
import { externalMarketingInstructions } from "@/lib/marketingPrompt";
import styles from "./page.module.css";

const fallbackTrendingChips = ["mRNA Vaccines", "CRISPR Gene Therapy", "Personalized Medicine", "FDA Approvals"];

type TrendTopic = {
  id: string;
  title: string;
  category: string;
};

type PlatformKey = "facebook" | "instagram" | "linkedin";
type ImageMode = "banana" | "upload";

const trendCategories = ["Life Sciences", "Utilities", "Oil & Gas", "SAP"];
const SELECTED_PROMPT_STORAGE_KEY = "marketiS-selected-content-prompt";

type StoredPrompt = {
  id: string;
  name: string;
  content: string;
};

function readSelectedPrompt(): StoredPrompt {
  if (typeof window === "undefined") {
    return {
      id: "default-issi-content-generation",
      name: "iSSi Default Content Generation Prompt",
      content: externalMarketingInstructions,
    };
  }

  try {
    const raw = localStorage.getItem(SELECTED_PROMPT_STORAGE_KEY);
    if (!raw) throw new Error("No selected prompt");
    const parsed = JSON.parse(raw) as StoredPrompt;
    if (!parsed.content?.trim()) throw new Error("Invalid selected prompt");
    return parsed;
  } catch {
    return {
      id: "default-issi-content-generation",
      name: "iSSi Default Content Generation Prompt",
      content: externalMarketingInstructions,
    };
  }
}

/** True when caption Promotes link previews (http(s) or www.). */
function captionContainsHttpLike(text: string): boolean {
  return /https?:\/\/\S+|www\.\S+/i.test(text);
}

function instagramHandleFromAuthor(name: string): string {
  const raw = name.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9._]/g, "");
  return raw || "issi_official";
}

/** Drive filename for upload (JPEG — smaller payload for Apps Script). */
function buildDriveImageFileName(authorRaw: string, contentIdeaRaw: string): string {
  const clean = (s: string, max: number) =>
    s
      .replace(/[/\\:*?"<>|\u0000-\u001f]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);

  const authorPart = clean(authorRaw.trim(), 80) || "Author";
  const ideaPart = clean(contentIdeaRaw.trim(), 160) || "Untitled Content";
  const stem = `${authorPart}_${ideaPart}`.trim();
  const capped = stem.slice(0, 220);
  return `${capped}.jpg`;
}

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

function resizeImageForPlatform(
  dataUrl: string,
  platform: PlatformKey,
  output: "jpeg" | "png" = "jpeg",
): Promise<string> {
  const sizeByPlatform: Record<PlatformKey, { width: number; height: number }> = {
    facebook: { width: 1080, height: 1080 },
    linkedin: { width: 1080, height: 1080 },
    instagram: { width: 1080, height: 1350 },
  };
  const { width, height } = sizeByPlatform[platform];

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const scale = Math.max(width / image.width, height / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;

      ctx.drawImage(image, x, y, drawWidth, drawHeight);
      resolve(output === "png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.88));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

/** Platform used for the Drive export (matches aspect of first selected platform in priority order). */
function primaryPlatformForDrive(selection: Record<PlatformKey, boolean>): PlatformKey {
  if (selection.linkedin) return "linkedin";
  if (selection.facebook) return "facebook";
  return "instagram";
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
  { key: "linkedin", label: "LinkedIn", aspectLabel: "LinkedIn (1080×1080, 1:1)", previewClass: "preview11", icon: <LinkedInIcon size={16} /> },
  { key: "facebook", label: "Facebook", aspectLabel: "Facebook (1080×1080, 1:1)", previewClass: "preview11", icon: <FacebookIcon size={16} /> },
  { key: "instagram", label: "Instagram", aspectLabel: "Instagram (1080×1350, 4:5)", previewClass: "preview45", icon: <InstagramIcon size={16} id="output-tab" /> },
];

function LinkedInGlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="currentColor"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.55.55A1.5 1.5 0 015 6.62v1.07a.75.75 0 00.22.53l.56.56a.75.75 0 00.53.22H7v.69a.75.75 0 00.22.53l.56.56a.75.75 0 01.22.53V13a5 5 0 01-5-5zm6.24 4.83l2-2.46a.75.75 0 00.09-.8l-.58-1.16A.76.76 0 0010 8H7v-.19a.51.51 0 01.28-.45l.38-.19a.74.74 0 01.68 0L9 7.5l.38-.7a1 1 0 00.12-.48v-.85a.78.78 0 01.21-.53l1.07-1.09a5 5 0 01-1.54 9z" />
    </svg>
  );
}

function LinkedInVerifiedBadge({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="#0a66c2"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path d="m8 15-.86-.29C3.24 13.41 1 10.62 1 7V2.49L8 0l7 2.49V7c0 3.62-2.23 6.41-6.13 7.71zM3 3.9V7c0 3.53 2.6 5.09 4.78 5.82l.23.08.23-.08C10.01 12.23 13 10.71 13 7V3.9L8 2.11zM9.43 5 7.01 8.02l-1.1-1.1L4.5 8.34l2.67 2.67 4.83-6H9.43z" />
    </svg>
  );
}

/** Company-page style + optional link/article card when URL present in caption */
function LinkedInCompanyLinkPreview({ caption, imageSrc }: { caption: string; imageSrc: string | null }) {
  return (
    <div className={styles.linkedinFeed}>
      <h2 className={styles.linkedinVisuallyHidden}>Feed post preview</h2>

      <div className={styles.linkedinPostTop}>
        <div className={styles.linkedinActorRow}>
          <a
            className={styles.linkedinAvatarLink}
            href="https://www.linkedin.com/company/integration-solution-services-inc-issi-/posts"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="iSSi - Integration Solution Services Inc., graphic."
          >
            <img
              src="/issi.svg"
              alt=""
              width={48}
              height={48}
              className={styles.linkedinAvatar}
            />
          </a>
          <div className={styles.linkedinActorMeta}>
            <a
              className={styles.linkedinMetaLink}
              href="https://www.linkedin.com/company/integration-solution-services-inc-issi-/posts"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View: iSSi - Integration Solution Services Inc. 1,372 followers"
            >
              <span className={styles.linkedinActorTitle}>iSSi - Integration Solution Services Inc.</span>
              <span className={styles.linkedinActorFollowers}>1,372 followers</span>
            </a>
            <div className={styles.linkedinActorSub}>
              <span aria-hidden>Just now</span>
              <span className={styles.linkedinActorSubDot} aria-hidden>
                {" "}
                •{" "}
              </span>
              <LinkedInGlobeIcon className={styles.linkedinGlobe} />
              <span className={styles.linkedinVisuallyHidden}>Visible to anyone on or off LinkedIn</span>
            </div>
          </div>
        </div>

        <button type="button" className={styles.linkedinMenuBtn} aria-label="Open control menu for post by iSSi - Integration Solution Services Inc.">
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path
              d="M3.25 8C3.25 8.69 2.69 9.25 2 9.25C1.31 9.25 0.75 8.69 0.75 8C0.75 7.31 1.31 6.75 2 6.75C2.69 6.75 3.25 7.31 3.25 8ZM14 6.75C13.31 6.75 12.75 7.31 12.75 8C12.75 8.69 13.31 9.25 14 9.25C14.69 9.25 15.25 8.69 15.25 8C15.25 7.31 14.69 6.75 14 6.75ZM8 6.75C7.31 6.75 6.75 7.31 6.75 8C6.75 8.69 7.31 9.25 8 9.25C8.69 9.25 9.25 8.69 9.25 8C9.25 7.31 8.69 6.75 8 6.75Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className={styles.linkedinCommentary}>{caption}</div>

      {imageSrc && (
        <article className={styles.linkedinArticle} aria-label="Link preview">
          <a className={styles.linkedinArticleCard} href="#" aria-label="Open article preview" onClick={(e) => e.preventDefault()}>
            <div className={styles.linkedinArticleThumbWrap}>
              <img src={imageSrc} alt="" className={styles.linkedinArticleThumb} />
            </div>
            <div className={styles.linkedinArticleBody}>
              <div className={styles.linkedinArticleTitle}>Strategies | Integration Solution Services Inc.</div>
              <div className={styles.linkedinArticleDomain}>iss-i.ca</div>
            </div>
          </a>
        </article>
      )}

      <div className={styles.linkedinSocialCounts}>
        <button type="button" className={styles.linkedinReactionSummary} aria-label="4 reactions">
          <img
            className={styles.linkedinReactionThumb}
            src="https://static.licdn.com/aero-v1/sc/h/8ekq8gho1ruaf8i7f86vd1ftt"
            alt=""
          />
          <span>4</span>
        </button>
      </div>

      <div className={styles.linkedinActionBar}>
        <button type="button" className={styles.linkedinActionBtn} aria-label="Like">
          <img
            className={styles.linkedinActionIconImg}
            src="https://static.licdn.com/aero-v1/sc/h/8ekq8gho1ruaf8i7f86vd1ftt"
            alt=""
          />
          Like
        </button>
        <button type="button" className={styles.linkedinActionBtn} aria-label="Comment">
          <svg className={styles.linkedinActionIconSvg} width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          </svg>
          Comment
        </button>
        <button type="button" className={styles.linkedinActionBtn} aria-label="Repost">
          <svg className={styles.linkedinActionIconSvg} width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
          </svg>
          Repost
        </button>
        <button type="button" className={styles.linkedinActionBtn} aria-label="Send in a private message">
          <svg className={styles.linkedinActionIconSvg} width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
          Send
        </button>
      </div>

      <div className={styles.linkedinComposer}>
        <img src="/issi.svg" alt="" width={32} height={32} className={styles.linkedinComposerAvatar} />
        <div className={styles.linkedinComposerPlaceholder}>Add a comment…</div>
      </div>
    </div>
  );
}

/** Personal feed card when caption has no URL (matches LinkedIn feed structure loosely) */
function LinkedInPersonalFeedPreview({
  caption,
  imageSrc,
  authorName,
}: {
  caption: string;
  imageSrc: string | null;
  authorName: string;
}) {
  const name = authorName.trim() || "Author";
  const firstName = name.split(/\s+/)[0] ?? name;

  return (
    <div className={`${styles.linkedinFeed} ${styles.linkedinPersonalOuter}`}>




      <div className={styles.linkedinPersonalBodyWrap}>
        <div className={styles.linkedinPersonalActorCard}>
          <a href="#" className={styles.linkedinPersonalRoundAvatarLink} onClick={(e) => e.preventDefault()} aria-label={`${name} profile`}>
            <img src="/issi.svg" alt="" width={48} height={48} className={styles.linkedinPersonalRoundAvatar} />
          </a>
          <div className={styles.linkedinPersonalActorText}>
            <div className={styles.linkedinPersonalActorTitleRow}>
              <a href="#" className={styles.linkedinPersonalActorNameLink} onClick={(e) => e.preventDefault()}>
                <span className={styles.linkedinPersonalActorName}>{name}</span>
                <LinkedInVerifiedBadge className={styles.linkedinPersonalVerified} />
              </a>
            </div>
            <p className={styles.linkedinPersonalActorMeta}>
              <span>Just now</span>
              <span aria-hidden> • Edited • </span>
              <LinkedInGlobeIcon className={styles.linkedinGlobe} />
              <span className={styles.linkedinVisuallyHidden}>Visibility: Global</span>
            </p>
          </div>
        </div>

        <div className={styles.linkedinPersonalCommentary}>{caption}</div>

        {imageSrc && (
          <div className={styles.linkedinPersonalMediaBlock}>
            <a href="#" className={styles.linkedinPersonalMediaAspect} onClick={(e) => e.preventDefault()} aria-label="View attachment">
              <figure className={styles.linkedinPersonalMediaFigure}>
                <img src={imageSrc} alt="" className={styles.linkedinPersonalMediaImg} />
              </figure>
            </a>
          </div>
        )}

        <div className={styles.linkedinPersonalEngagementRow}>
          <a href="#" className={styles.linkedinPersonalEngagementSummary} onClick={(e) => e.preventDefault()}>
            <ul className={styles.linkedinPersonalReactionStack} aria-hidden>
              <li>
                <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden className={styles.linkedinPersonalReactionRing}>
                  <circle cx="8" cy="8" r="7.5" fill="#378fe9" />
                  <path fill="#fff" d="M8 1a7 7 0 1 1-7 7 7 7 0 0 1 7-7m0-1a8 8 0 1 0 5.66 2.34A8 8 0 0 0 8 0" />
                </svg>
              </li>
              <li>
                <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden className={styles.linkedinPersonalReactionRing}>
                  <circle cx="8" cy="8" r="7.5" fill="#6dae4f" />
                </svg>
              </li>
              <li>
                <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden className={styles.linkedinPersonalReactionRing}>
                  <circle cx="8" cy="8" r="7.5" fill="#df704d" />
                </svg>
              </li>
            </ul>
            <p className={styles.linkedinPersonalEngagementText}>{`${firstName} and 42 others reacted`}</p>
          </a>
          <span role="button" tabIndex={0} className={styles.linkedinPersonalCommentsFake}>
            12 comments
          </span>
        </div>

        <hr className={styles.linkedinHr} />

        <div className={styles.linkedinPersonalBottomBar}>
          <div className={styles.linkedinPersonalLikeSplit}>
            <button type="button" className={styles.linkedinPersonalBottomBtn} aria-label="Like">
              <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden className={styles.linkedinPersonalBottomIcon}>
                <path d="m12.91 7-2.25-2.57a8.2 8.2 0 0 1-1.5-2.55L9 1.37A2.08 2.08 0 0 0 7 0a2.08 2.08 0 0 0-2.06 2.08v1.17a5.8 5.8 0 0 0 .31 1.89l.28.86H2.38A1.47 1.47 0 0 0 1 7.47a1.45 1.45 0 0 0 .64 1.21 1.48 1.48 0 0 0-.37 2.06 1.54 1.54 0 0 0 .62.51h.05a1.6 1.6 0 0 0-.19.71A1.47 1.47 0 0 0 3 13.42v.1A1.46 1.46 0 0 0 4.4 15h4.83a5.6 5.6 0 0 0 2.48-.58l1-.42H14V7zM12 12.11l-1.19.52a3.6 3.6 0 0 1-1.58.37H5.1a.55.55 0 0 1-.53-.4l-.14-.48-.49-.21a.56.56 0 0 1-.34-.6l.09-.56-.42-.42a.56.56 0 0 1-.09-.68L3.55 9l-.4-.61A.28.28 0 0 1 3.3 8h5L7.14 4.51a4.2 4.2 0 0 1-.2-1.26V2.08A.09.09 0 0 1 7 2a.1.1 0 0 1 .08 0l.18.51a10 10 0 0 0 1.9 3.24l2.84 3z" />
              </svg>
              Like
            </button>
            <button type="button" className={styles.linkedinPersonalChevronBtn} aria-label="Open reactions menu">
              <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                <path d="M15 11 8 6.39 1 11V8.61L8 4l7 4.61z" />
              </svg>
            </button>
          </div>
          <button type="button" className={styles.linkedinPersonalBottomBtnWide} aria-label="Comment">
            <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden className={styles.linkedinPersonalBottomIcon}>
              <path d="M5 8h5v1H5zm11-.5v.08a6 6 0 0 1-2.75 5L8 16v-3H5.5A5.51 5.51 0 0 1 0 7.5 5.62 5.62 0 0 1 5.74 2h4.76A5.5 5.5 0 0 1 16 7.5m-2 0A3.5 3.5 0 0 0 10.5 4H5.74A3.62 3.62 0 0 0 2 7.5 3.53 3.53 0 0 0 5.5 11H10v1.33l2.17-1.39A4 4 0 0 0 14 7.58zM5 7h6V6H5z" />
            </svg>
            Comment
          </button>
          <button type="button" className={styles.linkedinPersonalBottomBtnWide} aria-label="Repost">
            <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden className={styles.linkedinPersonalBottomIcon}>
              <path d="M4 10H2V5c0-1.66 1.34-3 3-3h3.85L7.42 0h2.44L12 3 9.86 6H7.42l1.43-2H5c-.55 0-1 .45-1 1zm8-4v5c0 .55-.45 1-1 1H7.15l1.43-2H6.14L4 13l2.14 3h2.44l-1.43-2H11c1.66 0 3-1.34 3-3V6z" />
            </svg>
            Repost
          </button>
          <button type="button" className={styles.linkedinPersonalBottomBtnWide} aria-label="Send">
            <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor" aria-hidden className={styles.linkedinPersonalBottomIcon}>
              <path d="M14 2 0 6.67l5 2.64 5.67-3.98L6.7 11l2.63 5z" />
            </svg>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function LinkedInPostPreview({
  caption,
  imageSrc,
  authorName,
}: {
  caption: string;
  imageSrc: string | null;
  authorName: string;
}) {
  if (captionContainsHttpLike(caption)) {
    return <LinkedInCompanyLinkPreview caption={caption} imageSrc={imageSrc} />;
  }
  return <LinkedInPersonalFeedPreview caption={caption} imageSrc={imageSrc} authorName={authorName} />;
}

function InstagramPostPreview({
  caption,
  imageSrc,
  authorName,
}: {
  caption: string;
  imageSrc: string | null;
  authorName: string;
}) {
  const handle = instagramHandleFromAuthor(authorName);
  const likesBuddy = handle.includes("_") ? `${handle.split("_")[0]}_fan` : `${handle}_fan`;
  const captionPreviewLen = 220;
  const truncatedCaption =
    caption.length > captionPreviewLen ? `${caption.slice(0, captionPreviewLen).trim()}…` : caption;
  const showCaptionMore = caption.length > captionPreviewLen;

  return (
    <div className={styles.igCard}>
      <header className={styles.igHeader}>
        <div className={styles.igHeaderMain}>
          <div className={styles.igStoryRing} aria-hidden>
            <img src="/issi.svg" alt="" width={32} height={32} className={styles.igAvatarImg} />
          </div>
          <div className={styles.igHeaderMeta}>
            <div className={styles.igHeaderTitleRow}>
              <button type="button" className={styles.igHeaderUsername}>
                {handle}
              </button>
            </div>
            <div className={styles.igHeaderSubRow}>
              <button type="button" className={styles.igLocationLink}>
                Location
              </button>
            </div>
          </div>
        </div>
        <button type="button" className={styles.igMoreBtn} aria-label="More options">
          <svg aria-hidden fill="currentColor" height={24} viewBox="0 0 24 24" width={24}>
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="6" cy="12" r="1.5" />
            <circle cx="18" cy="12" r="1.5" />
          </svg>
        </button>
      </header>

      <div className={styles.igMediaWrap}>
        <div className={styles.igMediaInner}>
          {imageSrc ? (
            <img src={imageSrc} alt="" className={styles.igMediaImg} />
          ) : (
            <div className={styles.igMediaPlaceholder}>
              <i className="fas fa-image" aria-hidden />
              <span>No photo</span>
            </div>
          )}
          <button type="button" className={styles.igTagBtn} aria-label="Tags">
            <svg aria-hidden fill="currentColor" height={12} viewBox="0 0 24 24" width={12}>
              <path d="M12 12c3.032 0 5.5-2.468 5.5-5.5S15.032 1 12 1a5.507 5.507 0 0 0-5.5 5.5C6.5 9.532 8.968 12 12 12Zm9.553 6.27C19.396 15.283 15.825 13.5 12 13.5c-3.824 0-7.396 1.782-9.552 4.768a2.317 2.317 0 0 0-.315 2.149 2.45 2.45 0 0 0 1.665 1.537C5.517 22.431 8.335 23 12 23c3.668 0 6.479-.565 8.19-1.04a2.464 2.464 0 0 0 1.678-1.544 2.312 2.312 0 0 0-.315-2.146Z" />
            </svg>
          </button>
        </div>
      </div>

      <section className={styles.igToolbar} aria-label="Post actions">
        <div className={styles.igToolbarLeft}>
          <button type="button" className={styles.igToolbarBtn} aria-label="Like">
            <svg aria-hidden fill="currentColor" height={24} viewBox="0 0 24 24" width={24}>
              <path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938m0-2a6.04 6.04 0 0 0-4.797 2.127 6.052 6.052 0 0 0-4.787-2.127A6.985 6.985 0 0 0 .5 9.122c0 3.61 2.55 5.827 5.015 7.97.283.246.569.494.853.747l1.027.918a44.998 44.998 0 0 0 3.518 3.018 2 2 0 0 0 2.174 0 45.263 45.263 0 0 0 3.626-3.115l.922-.824c.293-.26.59-.519.885-.774 2.334-2.025 4.98-4.32 4.98-7.94a6.985 6.985 0 0 0-6.708-7.218Z" />
            </svg>
          </button>
          <span className={styles.igLikeCount} aria-hidden>
            19
          </span>
          <button type="button" className={styles.igToolbarBtn} aria-label="Comment">
            <svg aria-hidden fill="none" height={24} stroke="currentColor" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={24}>
              <path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" />
            </svg>
          </button>
          <button type="button" className={styles.igToolbarBtn} aria-label="Repost">
            <svg aria-hidden fill="currentColor" height={24} viewBox="0 0 24 24" width={24}>
              <path d="M19.998 9.497a1 1 0 0 0-1 1v4.228a3.274 3.274 0 0 1-3.27 3.27h-5.313l1.791-1.787a1 1 0 0 0-1.412-1.416L7.29 18.287a1.004 1.004 0 0 0-.294.707v.001c0 .023.012.042.013.065a.923.923 0 0 0 .281.643l3.502 3.504a1 1 0 0 0 1.414-1.414l-1.797-1.798h5.318a5.276 5.276 0 0 0 5.27-5.27v-4.228a1 1 0 0 0-1-1Zm-6.41-3.496-1.795 1.795a1 1 0 1 0 1.414 1.414l3.5-3.5a1.003 1.003 0 0 0 0-1.417l-3.5-3.5a1 1 0 0 0-1.414 1.414l1.794 1.794H8.27A5.277 5.277 0 0 0 3 9.271V13.5a1 1 0 0 0 2 0V9.271a3.275 3.275 0 0 1 3.271-3.27Z" />
            </svg>
          </button>
          <button type="button" className={styles.igToolbarBtn} aria-label="Share">
            <svg aria-hidden fill="none" height={24} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={24}>
              <path d="M13.973 20.046 21.77 6.928C22.8 5.195 21.55 3 19.535 3H4.466C2.138 3 .984 5.825 2.646 7.456l4.842 4.752 1.723 7.121c.548 2.266 3.571 2.721 4.762.717Z" />
              <line x1="7.488" y1="12.208" x2="15.515" y2="7.641" />
            </svg>
          </button>
        </div>
        <button type="button" className={styles.igToolbarBtn} aria-label="Save">
          <svg aria-hidden fill="none" height={24} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={24}>
            <polygon points="20 21 12 13.44 4 21 4 3 20 3 20 21" />
          </svg>
        </button>
      </section>

      <section className={styles.igCaptionSection}>
        <div className={styles.igLikedRow}>
          <span className={styles.igLikedMiniAvatar}>
            <img src="/issi.svg" alt="" width={18} height={18} />
          </span>
          <p className={styles.igLikedText}>
            Liked by{" "}
            <button type="button" className={styles.igInlineLink}>
              {likesBuddy}
            </button>{" "}
            and{" "}
            <button type="button" className={styles.igInlineLink}>
              18 others
            </button>
          </p>
        </div>
        <p className={styles.igCaptionBlock}>
          <button type="button" className={styles.igCaptionUser}>
            {handle}
          </button>{" "}
          <span className={styles.igCaptionBody}>{truncatedCaption}</span>
          {showCaptionMore && (
            <button type="button" className={styles.igMoreBtnInline}>
              more
            </button>
          )}
        </p>
      </section>
    </div>
  );
}

function FacebookPostPreview({ caption, imageSrc }: { caption: string; imageSrc: string | null }) {
  return (
    <div className={styles.facebookPostPreviewWrapper}>
      <div className={styles.facebookPostHeader}>
        <div className={styles.facebookPostIdentity}>
          <div className={styles.facebookPostPreviewIcon}>
            <img
              src="/issi.svg"
              alt="ISSi profile"
              className={styles.facebookPostProfileIcon}
            />
          </div>
          <div className={styles.facebookPostAccountWrapper}>
            <div className={styles.facebookPostAccountName}>iSSi - Integration Solution Services Inc.</div>
            <div className={styles.facebookPostTime}>Just now</div>
          </div>
        </div>

      </div>

      <div className={styles.facebookPostDescription}>
        {caption}
      </div>

      {imageSrc && (
        <div className={styles.facebookPostImageWrapper}>
          <img src={imageSrc} alt="Facebook post preview" />
        </div>
      )}

      <div className={styles.facebookPostFooter}>
        <div className={styles.facebookPostFooterItem}>
          <img src="https://cdn.publer.com/facebook-post-like-button.svg" alt="" className={styles.facebookPostFooterIcon} />
          Like
        </div>
        <div className={styles.facebookPostFooterItem}>
          <img src="https://cdn.publer.com/facebook-comment-icon.svg" alt="" className={styles.facebookPostFooterIcon} />
          Comment
        </div>
        <div className={styles.facebookPostFooterItem}>
          <img src="https://cdn.publer.com/facebook-post-share-icon.svg" alt="" className={styles.facebookPostFooterIcon} />
          Share
        </div>
      </div>
    </div>
  );
}

export default function GeneratorPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<StoredPrompt>(() => readSelectedPrompt());
  const [contentIdea, setContentIdea] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [platforms, setPlatforms] = useState({ facebook: true, instagram: true, linkedin: true });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [platformImages, setPlatformImages] = useState<Partial<Record<PlatformKey, string>>>({});
  const [imageMode, setImageMode] = useState<ImageMode>("banana");
  const [uploadExpanded, setUploadExpanded] = useState(false);
  const [bananaPrompt, setBananaPrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState("");
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [draggingOver, setDraggingOver] = useState(false);
  const [trendingChips, setTrendingChips] = useState<string[]>(fallbackTrendingChips);
  const [trendTopicsExpanded, setTrendTopicsExpanded] = useState(false);
  const [activeOutputPlatform, setActiveOutputPlatform] = useState<PlatformKey>("linkedin");
  const [editingPlatform, setEditingPlatform] = useState<PlatformKey | null>(null);
  const [generatedDrafts, setGeneratedDrafts] = useState<Record<PlatformKey, string>>(generatedContent);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const syncSelectedPrompt = () => setSelectedPrompt(readSelectedPrompt());
    window.addEventListener("focus", syncSelectedPrompt);
    window.addEventListener("storage", syncSelectedPrompt);
    return () => {
      window.removeEventListener("focus", syncSelectedPrompt);
      window.removeEventListener("storage", syncSelectedPrompt);
    };
  }, []);

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
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setPlatformImages({});
      setImageError("");
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleImageFile(file);
  }

  async function handleGenerateImage() {
    const selectedPlatforms = Object.entries(platforms)
      .filter(([, selected]) => selected)
      .map(([platform]) => platform as PlatformKey);

    if (selectedPlatforms.length === 0) {
      setImageError("Select at least one platform before generating an image.");
      return;
    }

    if (!bananaPrompt.trim()) {
      setImageError("Enter a Banana AI image prompt first.");
      return;
    }

    setGeneratingImage(true);
    setImageError("");

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: bananaPrompt,
          contentIdea,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to generate image");

      const variants = await Promise.all(
        selectedPlatforms.map(async (platform) => [
          platform,
          await resizeImageForPlatform(json.image, platform),
        ] as const),
      );
      const nextImages = Object.fromEntries(variants) as Partial<Record<PlatformKey, string>>;

      setPlatformImages(nextImages);
      setImageSrc(nextImages[selectedPlatforms[0]] ?? json.image);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Failed to generate image");
    } finally {
      setGeneratingImage(false);
    }
  }

  async function handleGenerateContent() {
    const selectedPlatforms = Object.entries(platforms)
      .filter(([, selected]) => selected)
      .map(([platform]) => platform as PlatformKey);

    if (selectedPlatforms.length === 0) {
      setGenerateError("Select at least one platform.");
      return;
    }

    if (!contentIdea.trim() && !sourceUrl.trim()) {
      setGenerateError("Enter a content idea or source link first.");
      return;
    }

    setGenerating(true);
    setGenerateError("");
    setGenerated(false);

    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentIdea,
          sourceUrl,
          platforms: selectedPlatforms,
          promptInstructions: selectedPrompt.content,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to generate content");

      setGeneratedDrafts((prev) => ({
        ...prev,
        ...json.captions,
      }));
      setActiveOutputPlatform(selectedPlatforms[0] ?? "linkedin");
      setEditingPlatform(null);
      setGenerated(true);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate content");
    } finally {
      setGenerating(false);
    }
  }

  const handleSaveToContents = useCallback(async () => {
    const title = contentIdea.trim() || "Untitled Content";
    const selectedPlatforms = Object.entries(platforms)
      .filter(([, selected]) => selected)
      .map(([platform]) => platform === "instagram" ? "IG" : platform.charAt(0).toUpperCase() + platform.slice(1));

    setSaving(true);
    setSaveError("");

    try {
      const platExport = primaryPlatformForDrive(platforms);
      const contentImage =
        platformImages.linkedin ?? platformImages.facebook ?? platformImages.instagram ?? imageSrc;

      const baseForDrive =
        imageSrc ??
        platformImages[platExport] ??
        platformImages.linkedin ??
        platformImages.facebook ??
        platformImages.instagram ??
        "";

      const thumbnailImage = contentImage ? await createThumbnail(contentImage, 120) : "";
      const driveImageDataUrl = baseForDrive ? await resizeImageForPlatform(baseForDrive, platExport, "jpeg") : "";
      const authorSaved = author.trim() || "Current User";

      const res = await fetch("/api/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          thumbnailImage,
          ...(driveImageDataUrl
            ? {
                driveImageDataUrl,
                driveImageFileName: buildDriveImageFileName(authorSaved, contentIdea.trim() || title),
              }
            : {}),
          title,
          author: authorSaved,
          dateCreated: new Date().toISOString(),
          dateScheduled: "",
          status: "Drafted",
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
          action: "created content in Contents Library",
          author: authorSaved,
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
  }, [author, contentIdea, generatedDrafts, imageSrc, platformImages, platforms, router]);

  const selectedOutputPlatforms = outputPlatforms.filter(({ key }) => platforms[key]);
  const activeOutput = selectedOutputPlatforms.find(({ key }) => key === activeOutputPlatform) ?? selectedOutputPlatforms[0];
  const isEditingActiveOutput = activeOutput ? editingPlatform === activeOutput.key : false;
  const activePreviewImage = activeOutput ? (platformImages[activeOutput.key] ?? imageSrc) : imageSrc;

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

      {/* Two-column grid */}
      <div className={styles.generatorGrid}>
        {/* ── Left: Input panel ── */}
        <div className="card">
          <div className={styles.cardTitleRow}>
            <h2 className={styles.cardTitle}>
              <i className={`fas fa-pen-fancy ${styles.cardTitleIcon}`} />
              Your Content Idea
            </h2>
          </div>

          <div className={styles.currentToolPanel}>
            <div className={styles.currentToolGrid} role="group" aria-label="Selected prompt and AI model">
              <div className={styles.currentToolGridTitle}>Your current tool:</div>

              <div className={styles.currentToolCell}>
                <div className={styles.currentToolCellBody} title={selectedPrompt.name}>
                  <i className={`fas fa-scroll ${styles.currentToolCellBgIcon}`} aria-hidden />
                  <span className={styles.currentToolCellLabel}>Prompt</span>
                  <span className={styles.currentToolCellText}>{selectedPrompt.name}</span>
                </div>
              </div>

              <div className={styles.currentToolCell}>
                <div className={styles.currentToolCellBody}>
                  <i className={`fas fa-bolt ${styles.currentToolCellBgIcon}`} aria-hidden />
                  <span className={styles.currentToolCellLabel}>AI Model</span>
                  <span className={styles.currentToolCellText}>Gemini 2.5 Flash-Lite</span>
                </div>
              </div>
            </div>
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

          <div className={styles.ideaTrendSection}>
            <div className={styles.ideaTrendHeader}>
              <span id="generator-trending-heading" className={styles.ideaTrendLabel}>
                Trending topics
              </span>
              <button
                type="button"
                className={styles.ideaTrendSuggestBtn}
                aria-expanded={trendTopicsExpanded}
                aria-controls="generator-trending-chips"
                id="generator-trending-toggle"
                onClick={() => setTrendTopicsExpanded((open) => !open)}
              >
                {trendTopicsExpanded ? "Hide" : "Suggest"}
              </button>
            </div>
            {trendTopicsExpanded ? (
              <div id="generator-trending-chips" className={styles.ideaTrendChipRow} role="region" aria-labelledby="generator-trending-heading">
                {trendingChips.map((chip, i) => (
                  <button key={`${chip}-${i}`} type="button" className={styles.ideaTrendChip} onClick={() => insertTopic(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

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
              Source Link (Optional)
            </label>
            <input
              className="form-input"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="Paste an article, company page, or reference URL..."
            />
            <p className={styles.inputHint}>
              The AI will read this page as context when available.
            </p>
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
              Visual Asset (Optional)
            </label>
            <div className={styles.visualModeGrid}>
              <button
                type="button"
                className={`${styles.visualModeCard}${imageMode === "banana" ? ` ${styles.visualModeCardActive}` : ""}`}
                onClick={() => setImageMode("banana")}
              >
                <span className={styles.visualModeIcon}>
                  <i className="fas fa-seedling" aria-hidden />
                </span>
                <span className={styles.visualModeText}>
                  <strong>Banana AI</strong>
                  <small>Generate one design, then resize it per platform.</small>
                </span>
              </button>

              <button
                type="button"
                className={`${styles.visualModeCard}${imageMode === "upload" ? ` ${styles.visualModeCardActive}` : ""}`}
                onClick={() => {
                  setImageMode("upload");
                  setUploadExpanded((prev) => !prev);
                }}
              >
                <span className={styles.visualModeIcon}>
                  <i className="fas fa-cloud-arrow-up" aria-hidden />
                </span>
                <span className={styles.visualModeText}>
                  <strong>Upload Image</strong>
                  <small>Use your own image for every selected platform.</small>
                </span>
              </button>
            </div>

            {imageMode === "banana" && (
              <div className={styles.bananaPanel}>
                <div className={styles.bananaPanelHeader}>
                  <span>Banana AI</span>
                  <small>Gemini 2.5 Flash Image</small>
                </div>
                <textarea
                  className={styles.bananaPrompt}
                  value={bananaPrompt}
                  onChange={(e) => setBananaPrompt(e.target.value)}
                  rows={4}
                  placeholder="Describe the visual direction, e.g. enterprise AI workflow for life sciences, clean compliance-focused design, subtle iSSi brand colors..."
                />
                <button
                  type="button"
                  className={styles.bananaGenerateBtn}
                  onClick={handleGenerateImage}
                  disabled={generatingImage}
                >
                  {generatingImage ? (
                    <><i className="fas fa-spinner fa-spin" /> Generating image...</>
                  ) : (
                    <><i className="fas fa-wand-magic-sparkles" /> Generate Platform Images</>
                  )}
                </button>
                <p className={styles.inputHint}>
                  Creates matching 1080×1080 (1:1) images for LinkedIn/Facebook and 1080×1350 (4:5) for Instagram.
                </p>
              </div>
            )}

            {imageMode === "upload" && uploadExpanded && (
              <div
                className={`${styles.dropZone} ${styles.dropZoneExpanded}${draggingOver ? ` ${styles.dropZoneDragging}` : ""}`}
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
                    <div className={styles.dropHint}>Recommended: 1080×1080px or larger</div>
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
            )}

            {imageError && (
              <p style={{ marginTop: "0.75rem", color: "var(--error)", fontSize: "0.82rem" }}>
                <i className="fas fa-circle-exclamation" /> {imageError}
              </p>
            )}
          </div>

          <button
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "1rem" }}
            onClick={handleGenerateContent}
            disabled={generating}
          >
            {generating ? (
              <><i className="fas fa-spinner fa-spin" /> Generating...</>
            ) : (
              <><i className="fas fa-wand-magic-sparkles" /> Generate Content with AI</>
            )}
          </button>
          {generateError && (
            <p style={{ marginTop: "0.75rem", color: "var(--error)", fontSize: "0.82rem" }}>
              <i className="fas fa-circle-exclamation" /> {generateError}
            </p>
          )}
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
                  {activeOutput.key === "instagram" && !generated && (
                    <div className={styles.platformLabel}>{activeOutput.aspectLabel}</div>
                  )}
                  {activeOutput.key === "linkedin" && !generated && (
                    <div className={styles.platformLabel}>{activeOutput.aspectLabel}</div>
                  )}
                  {activeOutput.key === "facebook" && !generated && (
                    <div className={styles.platformLabel}>{activeOutput.aspectLabel}</div>
                  )}
                  <div className={styles.previewHeader}>
      
                    {generated && (
                      <button
                        type="button"
                        className={styles.editPreviewBtn}
                        onClick={() => setEditingPlatform(isEditingActiveOutput ? null : activeOutput.key)}
                        aria-label={isEditingActiveOutput ? "Finish editing generated post" : "Edit generated post"}
                      >
                        <i className={`fas ${isEditingActiveOutput ? "fa-check" : "fa-pen-to-square"}`} />
                        {isEditingActiveOutput ? "Done" : "Edit Caption"}
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
                    activeOutput.key === "facebook" && generated ? (
                      <FacebookPostPreview caption={generatedDrafts.facebook} imageSrc={activePreviewImage} />
                    ) : activeOutput.key === "linkedin" && generated ? (
                      <LinkedInPostPreview
                        caption={generatedDrafts.linkedin}
                        imageSrc={activePreviewImage}
                        authorName="iSSi - Integration Solution Services Inc."
                      />
                    ) : activeOutput.key === "instagram" && generated ? (
                      <InstagramPostPreview
                        caption={generatedDrafts.instagram}
                        imageSrc={activePreviewImage}
                        authorName="iSSi"
                      />
                    ) : (
                      <div className={styles.contentPreview}>
                        {generated ? generatedDrafts[activeOutput.key] : "Content will appear here"}
                      </div>
                    )
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
