'use client';

/*
 * SDK data on this page (loaded on the server, passed in as props):
 *   storio.getGallery()  ->  StorioGalleryItem[]
 *     loadGallery() in src/lib/media.ts
 *   storio.getAlbums()   ->  StorioAlbum[]
 *     loadAlbums() in src/lib/media.ts
 *   storio.getVideos()   ->  StorioVideoItem[]
 *     loadVideos() in src/lib/media.ts
 */

import { useState } from 'react';
import { Play, X } from 'lucide-react';
import type { StorioAlbum, StorioGalleryItem, StorioVideoItem } from '@storio/template-sdk';
import { CmsField, CmsSection } from '@/lib/storio-editor/site';

import { EmptyInEditor, useInEditor } from '@/components/cms/EditorOnly';
import { useGalleryText } from '@/components/cms/useGalleryText';

const PAGE = 'template-0-starter-gallery';

export interface GalleryData {
  photos: StorioGalleryItem[];
  albums: StorioAlbum[];
  videos: StorioVideoItem[];
}

/**
 * Gallery: three SDK methods on one page (getGallery, getAlbums, getVideos).
 * Clicking a photo or an album opens a simple lightbox.
 */
export function GalleryView({ photos, albums, videos }: GalleryData) {
  const { intro, albums: albumsText, videos: videosText } = useGalleryText();
  const inEditor = useInEditor();
  const [open, setOpen] = useState<StorioGalleryItem[] | null>(null);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <CmsSection sectionKey="intro" title="Gallery" page={PAGE}>
        <header className="mb-10 space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <CmsField path="title" label="Title">{intro.title}</CmsField>
          </h1>
          <p className="opacity-80">
            <CmsField path="text" label="Text">{intro.text}</CmsField>
          </p>
        </header>
        {photos.length === 0 ? (
          <p className="rounded-xl border border-black/10 p-4 opacity-70">
            <CmsField path="emptyText" label="Empty text">{intro.emptyText}</CmsField>
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {photos.map((photo) => (
              <li key={photo.id}>
                <button type="button" onClick={() => setOpen([photo])} className="block w-full overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.image_url} alt={photo.title || photo.caption || ''} className="aspect-[4/3] w-full object-cover transition hover:scale-105" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CmsSection>

      {(albums.length > 0 || inEditor) && (
        <CmsSection sectionKey="albums" title="Albums" page={PAGE}>
          <section className="mt-16">
            <h2 className="mb-6 text-3xl font-bold">
              <CmsField path="title" label="Title">{albumsText.title}</CmsField>
            </h2>
            {albums.length === 0 && <EmptyInEditor source="Gallery albums" />}
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => (
                <li key={album.id}>
                  <button
                    type="button"
                    onClick={() => album.images?.length && setOpen(album.images)}
                    className="block w-full overflow-hidden rounded-2xl border border-black/10 text-left"
                  >
                    {album.cover_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={album.cover_image_url} alt="" className="aspect-video w-full object-cover" />
                    )}
                    <span className="block p-4">
                      <span className="block font-semibold">{album.title}</span>
                      <span className="text-sm opacity-70">
                        {album.images?.length ?? 0} <CmsField path="photosLabel" label="Photos label">{albumsText.photosLabel}</CmsField>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </CmsSection>
      )}

      {(videos.length > 0 || inEditor) && (
        <CmsSection sectionKey="videos" title="Videos" page={PAGE}>
          <section className="mt-16">
            <h2 className="mb-6 text-3xl font-bold">
              <CmsField path="title" label="Title">{videosText.title}</CmsField>
            </h2>
            {videos.length === 0 && <EmptyInEditor source="Reels" />}
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <li key={video.id} className="overflow-hidden rounded-2xl border border-black/10">
                  <div className="relative aspect-video bg-ink">
                    {video.thumbnail_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover opacity-80" />
                    )}
                    <Play className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 fill-white text-white" aria-hidden />
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="font-semibold">{video.title}</p>
                    {video.description && <p className="text-sm opacity-70">{video.description}</p>}
                    {video.url && (
                      <a href={video.url} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-brand">
                        <CmsField path="watchText" label="Watch link">{videosText.watchText}</CmsField>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </CmsSection>
      )}

      {open && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-6" onClick={() => setOpen(null)}>
          <button type="button" aria-label={intro.closeLabel} className="fixed right-4 top-4 rounded-full bg-white/10 p-2 text-white">
            <X className="h-6 w-6" aria-hidden />
          </button>
          <div className="mx-auto grid max-w-5xl gap-4">
            {open.map((photo) => (
              <figure key={photo.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.image_url} alt={photo.title || ''} className="w-full rounded-xl" />
                {photo.caption && <figcaption className="mt-2 text-center text-sm text-white/80">{photo.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
