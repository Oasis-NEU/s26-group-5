export function secureImageUrl(url) {
  return url?.replace("http://", "https://") ?? url;
}
