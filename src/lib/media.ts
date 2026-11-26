import { storio, type StorioAlbum, type StorioGalleryItem, type StorioVideoItem } from '@storio/template-sdk';

import { DEFAULT_DEMO_DATA } from '@/data/defaultDemoData';
import { safely, withDemoFallback } from './data';
import type { TenantContext } from './tenant';

/** Single photos (dashboard: Gallery). */
export async function loadGallery(ctx: TenantContext): Promise<StorioGalleryItem[]> {
  const real = await safely(storio.getGallery(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.gallery, ctx.isStandalone);
}

/** Photo albums with their images. */
export async function loadAlbums(ctx: TenantContext): Promise<StorioAlbum[]> {
  const real = await safely(storio.getAlbums(ctx.tenantHost));
  return withDemoFallback(real, DEFAULT_DEMO_DATA.albums, ctx.isStandalone);
}

/** Video reels (YouTube, Vimeo, Facebook links). Featured videos first. */
export async function loadVideos(ctx: TenantContext): Promise<StorioVideoItem[]> {
  const real = await safely(storio.getVideos(ctx.tenantHost));
  const videos = withDemoFallback(real, DEFAULT_DEMO_DATA.videos, ctx.isStandalone);
  return [...videos].sort((a, b) => Number(!!b.is_featured) - Number(!!a.is_featured));
}
