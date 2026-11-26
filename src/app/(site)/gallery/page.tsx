import type { Metadata } from 'next';

import { GalleryView } from '@/components/views/GalleryView';
import { loadAlbums, loadGallery, loadVideos } from '@/lib/media';
import { pageMetadata } from '@/lib/seo';
import { resolveTenant } from '@/lib/tenant';

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata('template-0-starter-gallery');
}

export default async function GalleryPage() {
  const ctx = await resolveTenant();
  const [photos, albums, videos] = await Promise.all([loadGallery(ctx), loadAlbums(ctx), loadVideos(ctx)]);
  return <GalleryView photos={photos} albums={albums} videos={videos} />;
}
