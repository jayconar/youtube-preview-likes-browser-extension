(function() {
  'use strict';

  // Track processed videos
  const processedVideos = new Set();
  
  // Get YouTube API key
  function getAPIKey() {
    const scriptTags = document.querySelectorAll('script');
    for (const tag of scriptTags) {
      const keyMatch = tag.textContent.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
      if (keyMatch) return keyMatch[1];
    }
    return null;
  }

  // Fetch like count for a video
  async function getLikes(videoId, apiKey) {
    try {
      const res = await fetch(
        `https://www.youtube.com/youtubei/v1/player?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: { 
              client: { 
                hl: "en", 
                gl: "US", 
                clientName: "WEB", 
                clientVersion: "2.20240401.00.00" 
              } 
            },
            videoId,
            contentCheckOk: true,
            racyCheckOk: true
          })
        }
      );
      const data = await res.json();
      return data?.microformat?.playerMicroformatRenderer?.likeCount || "N/A";
    } catch (e) {
      return "Err";
    }
  }

  // Format count display
  function formatCount(count) {
    if (!count || count === "N/A") return "N/A";
    
    const num = typeof count === 'string' ?
      parseFloat(count.replace(/[^0-9.]/g, '')) :
      count;
      
    if (isNaN(num)) return count;
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  }

  // Create likes element safely
  function createLikesElement(likes, isSearchResult = false) {
    const formatted = formatCount(likes);
    const container = document.createElement("div");
    container.className = "yt-likes-container";
    
    const contentSpan = document.createElement("span");
    contentSpan.className = "yt-likes-content";
    
    // Add dot separator for search results
    if (isSearchResult) {
        const dotSpan = document.createElement("span");
        dotSpan.className = "dot-separator";
        dotSpan.textContent = "•";
        contentSpan.appendChild(dotSpan);
    }
    
    // Create SVG icon safely
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "var(--yt-spec-text-secondary)");
    svg.classList.add("yt-likes-icon");
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z");
    
    svg.appendChild(path);
    contentSpan.appendChild(svg);
    
    // Create likes count span
    const countSpan = document.createElement("span");
    countSpan.className = "yt-likes-count";
    countSpan.textContent = formatted;
    contentSpan.appendChild(countSpan);
    
    container.appendChild(contentSpan);
    
    return container;
  }

  // Process a single thumbnail
  async function processThumbnail(thumbnail, apiKey) {
    // Get video ID from link
    const link = thumbnail.querySelector("a#thumbnail") || 
                 thumbnail.querySelector("a.ytd-thumbnail");
    if (!link || !link.href) return;
    
    const videoId = new URL(link.href).searchParams.get("v");
    if (!videoId || processedVideos.has(videoId)) return;
    
    processedVideos.add(videoId);
    
    // Find metadata container
    const metadata = thumbnail.querySelector("#metadata-line") || 
                     thumbnail.querySelector(".metadata-line") || 
                     thumbnail.querySelector("#video-meta") || 
                     thumbnail.querySelector(".ytd-video-meta-block");
    if (!metadata) return;
    
    // Remove existing likes element if present
    const existing = metadata.parentNode.querySelector('.yt-likes-container');
    if (existing) existing.remove();
    
    // Check if we're in search results
    const isSearchResult = thumbnail.tagName === 'YTD-VIDEO-RENDERER' && 
                           document.location.pathname === '/results';
    
    // Fetch likes and create element
    const likes = await getLikes(videoId, apiKey);
    const likesElement = createLikesElement(likes, isSearchResult);
    
    // Add to DOM - create a new line for likes
    const newLine = document.createElement("div");
    newLine.className = "yt-likes-line";
    newLine.appendChild(likesElement);
    metadata.insertAdjacentElement('afterend', newLine);
  }

  // Process all thumbnails on page
  function processAllThumbnails() {
    const apiKey = getAPIKey();
    if (!apiKey) return;
    
    const thumbnails = document.querySelectorAll(
      "ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, " +
      "ytd-playlist-video-renderer, ytd-compact-video-renderer, " +
      "ytd-reel-item-renderer, ytd-radio-renderer"
    );
    
    thumbnails.forEach(thumbnail => {
      processThumbnail(thumbnail, apiKey);
    });
  }

  // Initialize extension
  function init() {
    // Add styles
    if (!document.querySelector('style[data-yt-likes]')) {
      const style = document.createElement('style');
      style.dataset.ytLikes = 'true';
      style.textContent = `
        /* Base styles for all video types */
        .yt-likes-line {
          display: block;
          margin-top: 4px;
        }
        
        .yt-likes-container {
          display: flex;
          align-items: center;
          color: var(--yt-spec-text-secondary);
          font-size: 12px;
          line-height: 1.4;
        }
        
        .yt-likes-icon {
          width: 12px;
          height: 12px;
          margin-right: 2px;
        }
        
        /* Dot separator for search results */
        .dot-separator {
          display: inline-block;
          margin: 0 4px;
        }
        
        /* Specific styles for search results */
        ytd-video-renderer .yt-likes-line {
          margin-top: 2px;
        }
        
        /* Styles for homepage/trending */
        ytd-rich-grid-media, ytd-rich-item-renderer .yt-likes-line {
          margin-top: 4px;
        }
        
        /* Styles for sidebar/compact videos */
        ytd-compact-video-renderer .yt-likes-line {
          margin-top: 2px;
        }
        
        /* Special styling for search results */
        ytd-video-renderer .yt-likes-container {
          display: inline;
        }
        
        ytd-video-renderer .yt-likes-content {
          display: inline-flex;
          align-items: center;
        }
        
        /* Adjust search page like icon position */
        ytd-video-renderer .yt-likes-icon {
          position: relative;
          top: -2px;
        }
        
        /* Lift only the likes count in search page */
        ytd-video-renderer .yt-likes-count {
          position: relative;
          top: -1px;
        }
        
        /* Lift likes count in homepage and sidebar */
        ytd-rich-item-renderer .yt-likes-count,
        ytd-compact-video-renderer .yt-likes-count {
          position: relative;
          top: -1px;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Initial processing
    processAllThumbnails();
    
    // Process new thumbnails periodically
    setInterval(processAllThumbnails, 3000);
    
    // Process when page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        processAllThumbnails();
      }
    });
  }

  // Run when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-process when navigating
  window.addEventListener('yt-navigate-finish', processAllThumbnails);
  
  // Handle YouTube logo click
  document.addEventListener('click', (e) => {
    if (e.target.closest('a#logo, a#yt-logo')) {
      setTimeout(processAllThumbnails, 1000);
    }
  });
  
  // Simple observer for new content
  new MutationObserver(() => {
    processAllThumbnails();
  }).observe(document.body, {
    childList: true,
    subtree: true
  });
})();