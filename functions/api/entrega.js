import handler from "../../netlify/functions/entrega.mjs";

export function onRequest({ request }) {
  return handler(request);
}
