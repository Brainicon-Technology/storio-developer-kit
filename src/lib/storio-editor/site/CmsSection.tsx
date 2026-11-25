'use client';

import React, { useState, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { PencilIcon } from './PencilIcon';
import { CMS_MESSAGE, listenForCmsMessages, postCmsMessage } from '../core/messages';
import { useCmsEditMode } from './preview';
import { useCmsContext } from './CmsProvider';
import { CmsSectionContext, EDIT_BUTTON_Z_INDEX, isFieldHoverActive, subscribeToFieldHover } from './sectionContext';

export interface CmsSectionProps {
  sectionKey: string;
  title: string;
  /**
   * Page this section's content belongs to. Set it to the key of your global page for
   * site-wide parts such as the navbar or footer, so they can be edited from every page.
   * Default: the page open in the studio (a global section is still found without it).
   */
  page?: string;
  /**
   * Optional pathname (for example "/") that this section belongs to.
   * Shared components such as a navbar render on every page, so without this
   * guard their edit button would appear on pages that do not own the section.
   */
  activeOnPath?: string;
  /**
   * Where the floating edit button sits. Use "fixed" for sticky headers and
   * banners whose own box is too small to hold the button.
   */
  buttonPlacement?: 'inside' | 'inside-low' | 'fixed';
  children: React.ReactNode;
}

/** Distance of the edit button from the top of the section (or of the window for "fixed"). */
const BUTTON_TOP: Record<NonNullable<CmsSectionProps['buttonPlacement']>, number> = {
  inside: 24,
  'inside-low': 112,
  fixed: 96,
};
const BUTTON_RIGHT = 32;
const WINDOW_MARGIN = 8;
const BUTTON_HEIGHT = 56;

/**
 * CmsSection
 *
 * In normal visitor mode: renders children directly with zero overhead.
 * In CMS edit mode (?cms_edit_mode=1 inside the studio preview):
 *  - Adds an outline and a floating edit button on hover.
 *  - Listens for SCROLL_TO_SECTION from the studio to centre and pulse the section.
 *  - Clicking anywhere on the section tells the studio to open this section's form.
 *
 * The button is rendered on document.body and only while its section is the innermost one
 * under the mouse, so sticky headers, nested sections and overlapping page content can
 * neither cover it nor catch its clicks.
 */
export const CmsSection: React.FC<CmsSectionProps> = ({
  sectionKey,
  title,
  page,
  activeOnPath,
  buttonPlacement = 'inside',
  children,
}) => {
  const { origins } = useCmsContext();
  const isEditMode = useCmsEditMode(origins);
  const [pathname, setPathname] = useState<string | null>(null);
  const [isTargeted, setIsTargeted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; right: number } | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const originsKey = origins.join('|');

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  // A field's pencil takes priority, so only one pencil shows at a time.
  const isFieldActive = useSyncExternalStore(subscribeToFieldHover, isFieldHoverActive, () => false);
  const isSectionHovered = isHovered && !isFieldActive;

  const isValidPath = !activeOnPath || pathname === activeOnPath;
  const showButton = isEditMode && isValidPath && (isSectionHovered || isTargeted);
  const sectionContext = useMemo(
    () => ({ sectionKey, page, isEditMode: isEditMode && isValidPath, origins }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sectionKey, page, isEditMode, isValidPath, originsKey]
  );

  // Listen for scroll commands from the studio
  useEffect(() => {
    if (!isEditMode) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = listenForCmsMessages(
      (message) => {
        if (message.type === CMS_MESSAGE.SCROLL_TO_SECTION && message.sectionKey === sectionKey) {
          if (sectionRef.current) {
            sectionRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
            setIsTargeted(true);
            clearTimeout(timer);
            timer = setTimeout(() => setIsTargeted(false), 2400);
          }
        }
      },
      { origins, source: () => window.parent }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, sectionKey, originsKey]);

  // Keep the button next to its section, and always inside the window
  useEffect(() => {
    if (!showButton) {
      setButtonPosition(null);
      return;
    }
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const isFixed = buttonPlacement === 'fixed' || rect.width === 0;
      const right = isFixed
        ? BUTTON_RIGHT
        : Math.max(WINDOW_MARGIN, document.documentElement.clientWidth - rect.right + BUTTON_RIGHT);
      const wanted = isFixed ? BUTTON_TOP[buttonPlacement] : rect.top + BUTTON_TOP[buttonPlacement];
      const lowest = Math.max(WINDOW_MARGIN, window.innerHeight - BUTTON_HEIGHT - WINDOW_MARGIN);
      const top = Math.min(Math.max(WINDOW_MARGIN, wanted), lowest);
      setButtonPosition((prev) => (prev && prev.top === top && prev.right === right ? prev : { top, right }));
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [showButton, buttonPlacement]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      postCmsMessage(
        window.parent,
        {
          type: CMS_MESSAGE.EDIT_SECTION,
          sectionKey,
          ...(page ? { page } : {}),
          title,
        },
        origins
      );
    }
  };

  // Only the innermost section under the mouse is active, and a field's own pencil takes priority.
  const handleMouseOver = (e: React.MouseEvent) => {
    const target = e.target as Element;
    if (buttonRef.current?.contains(target)) return;
    setIsHovered(!target.closest('[data-cms-field]') && target.closest('[data-cms-section]') === sectionRef.current);
  };

  // Zero wrapper overhead for normal visitors
  if (!isEditMode || !isValidPath) {
    return <CmsSectionContext.Provider value={sectionContext}>{children}</CmsSectionContext.Provider>;
  }

  return (
    <div
      ref={sectionRef}
      data-cms-section={sectionKey}
      onClick={handleEditClick}
      onMouseOver={handleMouseOver}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // Inline styles, so the outline works in any template (no CSS framework needed).
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 16,
        transition: 'box-shadow 0.3s',
        boxShadow: isTargeted
          ? '0 0 0 4px #020617, 0 0 0 8px #a855f7, 0 0 60px rgba(168, 85, 247, 0.5)'
          : isSectionHovered
          ? '0 0 0 2px #0f172a, 0 0 0 4px #a855f7'
          : undefined,
      }}
    >
      <CmsSectionContext.Provider value={sectionContext}>{children}</CmsSectionContext.Provider>

      {/* Floating edit button, rendered above the whole page */}
      {showButton &&
        buttonPosition &&
        createPortal(
          <div
            ref={buttonRef}
            data-cms-edit-button={sectionKey}
            style={{ position: 'fixed', top: buttonPosition.top, right: buttonPosition.right, zIndex: EDIT_BUTTON_Z_INDEX }}
          >
            <button
              type="button"
              onClick={handleEditClick}
              title={`Edit ${title} in the editor panel`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 20px',
                borderRadius: 16,
                background: '#9333ea',
                color: '#ffffff',
                fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
                fontWeight: 800,
                fontSize: 14,
                lineHeight: '20px',
                letterSpacing: '0.025em',
                whiteSpace: 'nowrap',
                border: '2px solid rgba(216, 180, 254, 0.8)',
                boxShadow: '0 25px 50px -12px rgba(59, 7, 100, 0.8)',
                cursor: 'pointer',
              }}
            >
              <PencilIcon size={16} color="#f3e8ff" />
              <span>Edit {title}</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};
