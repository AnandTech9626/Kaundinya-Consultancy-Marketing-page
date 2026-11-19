export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname.endsWith(".pages.dev")) {
      return Response.redirect("https://kaundinya.co.in" + url.pathname + url.search, 301);
    }
    return env.ASSETS.fetch(request);
  },
};