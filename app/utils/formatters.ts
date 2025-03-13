// Utility functions for formatting data

/**
 * Formats a URL to ensure it has the proper protocol
 * @param url The URL to format
 * @returns The formatted URL with proper protocol
 */
export const formatUrl = (url: string) => {
  // Remove @ symbol if it exists at the beginning
  if (url.startsWith("@")) {
    url = url.substring(1);
  }

  // Fix malformed https:/ (single slash)
  if (url.startsWith("https:/") && !url.startsWith("https://")) {
    url = url.replace("https:/", "https://");
  }

  // Fix malformed http:/ (single slash)
  if (url.startsWith("http:/") && !url.startsWith("http://")) {
    url = url.replace("http:/", "http://");
  }

  // Add https:// if missing
  if (!url.includes("http")) {
    const brazilianDomains = [
      ".com.br",
      ".org.br",
      ".net.br",
      ".gov.br",
      ".edu.br",
      ".shop.br",
    ];
    const startsWithWww = url.startsWith("www.");
    const hasBrazilianDomain = brazilianDomains.some((domain) =>
      url.includes(domain)
    );

    if (startsWithWww) {
      return "https://" + url;
    } else if (hasBrazilianDomain) {
      return "https://www." + url;
    }
  }
  return url;
};

/**
 * Updates the display style of an element by ID
 * @param id The ID of the element to update
 * @param display The display style to set
 */
export const updateElementDisplay = (id: string, display: string) => {
  const element = document.querySelector(`#${id}`) as HTMLElement;
  if (element) {
    element.style.display = display;
  }
};

/**
 * Updates the innerHTML of an element by ID
 * @param id The ID of the element to update
 * @param content The content to set as innerHTML
 */
export const updateElementInnerHTML = (id: string, content: string) => {
  const element = document.querySelector(`#${id}`);
  if (element) {
    element.innerHTML = content;
  }
};
