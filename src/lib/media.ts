import { storio, type StorioAlbum, type StorioVideoItem } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback } from './data';
import { listOf, mediaUrl, normalizeGallery, type GalleryPhoto } from './normalize';
import type { TenantContext } from './tenant';

/** Single photos (dashboard: Gallery). Each photo may belong to an album. */
export async function loadGallery(ctx: TenantContext): Promise<GalleryPhoto[]> {
  const real = normalizeGallery(await safely(storio.getGallery(ctx.tenantHost)));
  return withDemoFallback<GalleryPhoto>(real, DEFAULT_DEMO_DATA.gallery, ctx.isStandalone);
}

/**
 * Photo albums. The live API lists albums without their photos ({ id, name, total_images });
 * the photos point to their album instead. So the albums are filled from the gallery photos.
 */
export async function loadAlbums(ctx: TenantContext, photos: GalleryPhoto[]): Promise<StorioAlbum[]> {
  const raw = listOf(await safely(storio.getAlbums(ctx.tenantHost)));
  const real: StorioAlbum[] | null =
    raw?.map((r) => {
      const id = typeof r.id === 'number' ? r.id : 0;
      const images = Array.isArray(r.images) ? (r.images as StorioAlbum['images']) : photos.filter((p) => p.album === id);
      return {
        id,
        title: typeof r.title === 'string' ? r.title : typeof r.name === 'string' ? r.name : '',
        cover_image_url: mediaUrl(r.cover_image_url) ?? images?.[0]?.image_url,
        images,
      };
    }).filter((album) => (album.images?.length ?? 0) > 0) ?? null;
  return withDemoFallback(real, DEFAULT_DEMO_DATA.albums, ctx.isStandalone);
}

/** Video reels (YouTube, Vimeo, Facebook links). Featured videos first. */
export async function loadVideos(ctx: TenantContext): Promise<StorioVideoItem[]> {
  const real = await safely(storio.getVideos(ctx.tenantHost));
  const videos = withDemoFallback(real, DEFAULT_DEMO_DATA.videos, ctx.isStandalone);
  return [...videos].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
}
