import handler from "../../netlify/functions/checkout.mjs";

export function onRequest({ request }) {
  return handler(request);
}
