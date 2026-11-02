/** Page detection for conditional module loading (Webflow paths). */
export function getMotgPageContext() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  const isMobile = window.innerWidth < 650;
  const isWork = path === '/work' || path.startsWith('/work/');
  const hasHomeFeatured = !!document.querySelector('.home-featured');
  const hasVimeoEmbed = !!document.querySelector(
    'iframe[src*="player.vimeo.com"], iframe[data-vimeo-src]'
  );

  return {
    path,
    isMobile,
    isWork,
    isWorkMobile: isWork && isMobile,
    hasHomeFeatured,
    needsVimeo: isWork || hasHomeFeatured || hasVimeoEmbed,
    /** Work mobile: skip heavy GSAP / trail / gallery to reduce crashes. */
    needsMotion: !(isWork && isMobile),
  };
}
