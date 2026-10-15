/** ASCII slug that keeps accented words readable: "Visão geral" → "visao-geral".
 *  Dependency-free so both server and client modules can share it. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
