// Lee las variables de entorno configuradas en Netlify (Site configuration > Environment variables).
export function env(name, { optional = false } = {}) {
  const v = (globalThis.Netlify?.env?.get?.(name)) ?? process.env[name];
  if (!v && !optional) throw new Error(`Falta la variable de entorno ${name}`);
  return v || '';
}
