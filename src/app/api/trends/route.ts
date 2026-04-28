import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

type TrendCategory = "Life Sciences" | "Utilities" | "Oil & Gas" | "SAP";

type TrendTopic = {
  id: string;
  title: string;
  category: TrendCategory;
  source: string;
  link: string;
  publishedAt: string;
  traffic: string;
  context: string;
};

const MAX_TOPICS_PER_CATEGORY = 3;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const RSS_FEEDS: Record<TrendCategory, { source: string; url: string }[]> = {
  "Life Sciences": [
    { source: "Fierce Biotech", url: "https://www.fiercebiotech.com/rss/xml" },
    { source: "BioPharma Dive", url: "https://www.biopharmadive.com/feeds/news/" },
  ],
  Utilities: [
    { source: "Utility Dive", url: "https://www.utilitydive.com/feeds/news/" },
    { source: "Smart Energy International", url: "https://www.smart-energy.com/feed/" },
  ],
  "Oil & Gas": [
    { source: "OilPrice", url: "https://oilprice.com/rss/main" },
    { source: "Offshore Technology", url: "https://www.offshore-technology.com/feeds/site-feed/" },
  ],
  SAP: [
    { source: "SAP News Center", url: "https://news.sap.com/feed/" },
    { source: "SAP Community", url: "https://community.sap.com/khhcw49343/rss/Community?interaction.style=blog" },
  ],
};

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function getText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in value) {
    return getText((value as { "#text": unknown })["#text"]);
  }
  return "";
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getItems(parsed: unknown): Record<string, unknown>[] {
  const root = parsed as {
    rss?: { channel?: { item?: Record<string, unknown> | Record<string, unknown>[] } };
    feed?: { entry?: Record<string, unknown> | Record<string, unknown>[] };
  };

  return [
    ...asArray(root.rss?.channel?.item),
    ...asArray(root.feed?.entry),
  ];
}

function getLink(item: Record<string, unknown>): string {
  const directLink = getText(item.link);
  if (directLink) return directLink;

  const link = item.link;
  if (Array.isArray(link)) {
    const alternate = link.find((entry) => typeof entry === "object" && entry && (entry as { "@_rel"?: string })["@_rel"] === "alternate");
    return getText((alternate as { "@_href"?: unknown } | undefined)?.["@_href"]);
  }
  if (link && typeof link === "object") {
    return getText((link as { "@_href"?: unknown })["@_href"]);
  }

  return "";
}

async function fetchFeed(category: TrendCategory, feed: { source: string; url: string }): Promise<TrendTopic[]> {
  const res = await fetch(feed.url, {
    headers: {
      "User-Agent": "Mozilla/5.0 marketiS Dashboard RSS Reader",
    },
    next: { revalidate: 60 * 60 * 12 },
  });

  if (!res.ok) throw new Error(`${feed.source} responded with ${res.status}`);

  const xml = await res.text();
  const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true,
  });
  const parsed = parser.parse(xml);
  const cutoff = Date.now() - SEVEN_DAYS_MS;

  return getItems(parsed).flatMap((item, index) => {
    const title = stripHtml(getText(item.title));
    const publishedAt = getText(item.pubDate) || getText(item.published) || getText(item.updated);
    const publishedDate = parseDate(publishedAt);

    if (!title || !publishedDate || publishedDate.getTime() < cutoff) return [];

    const description = stripHtml(getText(item.description) || getText(item.summary) || getText(item.content));
    const link = getLink(item);

    return [{
      id: `${category}-${feed.source}-${index}-${publishedDate.getTime()}`,
      title,
      category,
      source: feed.source,
      link,
      publishedAt: publishedDate.toISOString(),
      traffic: "",
      context: description,
    }];
  });
}

export async function GET() {
  const results = await Promise.allSettled(
    Object.entries(RSS_FEEDS).flatMap(([category, feeds]) =>
      feeds.map((feed) => fetchFeed(category as TrendCategory, feed)),
    ),
  );

  const allTopics = results
    .flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const seen = new Set<string>();
  const deduped = allTopics.filter((topic) => {
    const key = topic.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const topics = (Object.keys(RSS_FEEDS) as TrendCategory[]).flatMap((category) =>
    deduped.filter((topic) => topic.category === category).slice(0, MAX_TOPICS_PER_CATEGORY),
  );

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    source: "RSS feeds",
    topics,
  });
}
