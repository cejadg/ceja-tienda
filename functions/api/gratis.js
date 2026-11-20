import handler from "../../netlify/functions/gratis.mjs";

export function onRequest({ request }) {
  return handler(request);
}
