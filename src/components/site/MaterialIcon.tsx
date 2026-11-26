import {
  Award,
  BookOpen,
  Building2,
  Bus,
  CalendarDays,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  Laptop,
  Library,
  Music,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * The dashboard stores some icons as Material icon names ("menu_book", "science"): institution
 * cards and page-builder feature blocks. This maps the common ones to lucide-react icons, which the
 * template already uses. Unknown names fall back to a neutral icon. Extend the map for your design.
 */
const ICONS: Record<string, LucideIcon> = {
  menu_book: BookOpen,
  book: BookOpen,
  local_library: Library,
  science: FlaskConical,
  biotech: FlaskConical,
  school: GraduationCap,
  groups: Users,
  people: Users,
  sports_soccer: Trophy,
  emoji_events: Trophy,
  military_tech: Award,
  workspace_premium: Award,
  computer: Laptop,
  laptop: Laptop,
  palette: Palette,
  music_note: Music,
  directions_bus: Bus,
  health_and_safety: HeartPulse,
  security: ShieldCheck,
  verified_user: ShieldCheck,
  event: CalendarDays,
  apartment: Building2,
  domain: Building2,
  search: Search,
  star: Star,
};

export function MaterialIcon({ name, className }: { name: string | null | undefined; className?: string }) {
  const Icon = (name && ICONS[name]) || Sparkles;
  return <Icon className={className} aria-hidden />;
}
