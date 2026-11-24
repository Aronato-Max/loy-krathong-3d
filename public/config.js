// Configuration for Hybrid Split Deployment (Cloudflare Pages + Render Backend)
// - On localhost, connects to the local server automatically.
// - On Cloudflare Pages or Render, connects Socket.IO & API to the Render Singapore backend.
window.LOY_KRATHONG_CONFIG = {
  serverUrl:
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? ''
      : '[https://loy-krathong-server-2.onrender.com](https://loy-krathong-server-2.onrender.com)'
};
