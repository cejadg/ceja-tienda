import handler from "../../netlify/functions/admin-link.mjs";

export function onRequest({ request }) {
  return handler(request);
}
