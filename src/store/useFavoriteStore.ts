import { create } from "zustand";
import type { TemplateKey } from "@/store/demoData";

interface FavoriteState {
  favoriteTemplateKeys: TemplateKey[];
  isLoading: boolean;
  error: string | null;
  loadFavorites: () => Promise<void>;
  addFavorite: (templateKey: TemplateKey) => Promise<void>;
  removeFavorite: (templateKey: TemplateKey) => Promise<void>;
  toggleFavorite: (templateKey: TemplateKey) => Promise<void>;
}

async function readApiError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null);
  return body && typeof body.message === "string" ? body.message : fallback;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favoriteTemplateKeys: [],
  isLoading: false,
  error: null,

  loadFavorites: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/favorites", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(await readApiError(response, "加载收藏失败"));
      }

      const body = (await response.json()) as { favorites?: TemplateKey[] };
      set({ favoriteTemplateKeys: body.favorites ?? [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "加载收藏失败",
        isLoading: false,
      });
    }
  },

  addFavorite: async (templateKey) => {
    const previous = get().favoriteTemplateKeys;
    if (previous.includes(templateKey)) return;

    set({ favoriteTemplateKeys: [templateKey, ...previous], error: null });

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateKey }),
      });

      if (!response.ok) {
        throw new Error(await readApiError(response, "收藏失败"));
      }
    } catch (error) {
      set({
        favoriteTemplateKeys: previous,
        error: error instanceof Error ? error.message : "收藏失败",
      });
      throw error;
    }
  },

  removeFavorite: async (templateKey) => {
    const previous = get().favoriteTemplateKeys;
    if (!previous.includes(templateKey)) return;

    set({
      favoriteTemplateKeys: previous.filter((key) => key !== templateKey),
      error: null,
    });

    try {
      const response = await fetch(`/api/favorites/${templateKey}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error(await readApiError(response, "取消收藏失败"));
      }
    } catch (error) {
      set({
        favoriteTemplateKeys: previous,
        error: error instanceof Error ? error.message : "取消收藏失败",
      });
      throw error;
    }
  },

  toggleFavorite: async (templateKey) => {
    if (get().favoriteTemplateKeys.includes(templateKey)) {
      await get().removeFavorite(templateKey);
      return;
    }

    await get().addFavorite(templateKey);
  },
}));
