type GetPreferredDeepLinkParams = {
  native?: string;
  universal?: string;
};

/**
 * Gets the preferred deep link based on the platform.
 * For Android: prefers native, falls back to universal.
 * For iOS: prefers native for better redirect support, falls back to universal.
 * For Desktop: prefers universal, falls back to native.
 *
 * @param params.native - The native deep link (e.g., "metamask://")
 * @param params.universal - The universal deep link (e.g., "https://metamask.app.link/")
 * @returns The preferred deep link, or undefined if neither is available
 */
export const getPreferredDeepLink = ({
  native,
  universal,
}: GetPreferredDeepLinkParams): string | undefined => {
  const isAndroid = /Android/.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

  if (isAndroid || isIOS) {
    return native ?? universal;
  }

  // For desktop, prefer universal links
  return universal ?? native;
};
