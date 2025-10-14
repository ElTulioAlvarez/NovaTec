export const site = {
  name: "Novatec Business Solutions",
  url: "https://example.com",
  ogImage: "/og-default.png",
  twitter: "@novatec",
};

export function seo({ title, description, path = "/" }:{title:string; description?:string; path?:string}){
  const url = new URL(path, site.url).toString();
  return {
    title: `${title} · ${site.name}`,
    description: description || "Soluciones tecnológicas B2B para PYMES.",
    openGraph: { type: "website", url, images: [{ url: site.ogImage }] },
    twitter: { card: "summary_large_image" }
  };
}
