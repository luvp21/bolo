// Turns a YouTube link (watch, youtu.be, shorts or embed) into a privacy-friendly embed URL.
export function youtubeEmbedUrl(link: string | undefined): string | null {
  if (!link) return null;
  try {
    const url = new URL(link.trim());
    const host = url.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      else {
        const m = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/);
        id = m ? m[1] : null;
      }
    }
    if (!id || !/^[\w-]{6,20}$/.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
  } catch {
    return null;
  }
}
