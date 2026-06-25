const DATA_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp|gif);base64,/i;
const INTERNAL_IMAGE_PATTERN = /^\/(?:template-assets\/|icon\.(?:png|svg)$)/i;

function isSupabaseStorageImageUrl(url: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;

  try {
    const parsedUrl = new URL(url);
    const parsedSupabaseUrl = new URL(supabaseUrl);

    return (
      parsedUrl.origin === parsedSupabaseUrl.origin &&
      parsedUrl.pathname.startsWith("/storage/v1/object/")
    );
  } catch {
    return false;
  }
}

export function allowResumeLinkUrl(url: string) {
  if (!url) return "";

  if (/^(https?:|mailto:|tel:|\/)/i.test(url)) {
    return url;
  }

  return "";
}

export function allowResumeImageUrl(url: string) {
  if (!url) return "";

  if (DATA_IMAGE_PATTERN.test(url) || INTERNAL_IMAGE_PATTERN.test(url)) {
    return url;
  }

  if (isSupabaseStorageImageUrl(url)) {
    return url;
  }

  return "";
}
