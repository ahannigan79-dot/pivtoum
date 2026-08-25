/**
 * The permitted Pivotum icon set — one line, one weight (1.6px on a 24px grid),
 * one colour (currentColor). No emoji. If a view needs an icon that isn't here,
 * draw it to this grid rather than reaching for a picture.
 */
const PATHS: Record<string, string> = {
  welcome: '<path d="M12 4.5l1.9 4.4 4.8.5-3.6 3.2 1 4.7L12 15.4 7.9 17.3l1-4.7L5.3 9.4l4.8-.5z"/>',
  evolve: '<path d="M5 12a7 7 0 0 1 11.7-5.2L19 8"/><path d="M19 4.5V8h-3.5"/><path d="M19 12a7 7 0 0 1-11.7 5.2L5 16"/><path d="M5 19.5V16h3.5"/>',
  playbook: '<rect x="5" y="5" width="14" height="15" rx="2"/><path d="M9.2 4.5h5.6v2.6H9.2z"/><path d="M8.5 11h7M8.5 14.5h5"/>',
  map: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5 11 11 8.5 15.5 13 13Z"/>',
  learn: '<path d="M12 6.5C10 5.3 7.5 5 5 5.6v11.2c2.5-.6 5-.3 7 .9 2-1.2 4.5-1.5 7-.9V5.6c-2.5-.6-5-.3-7 .9z"/><path d="M12 6.5v11.1"/>',
  build: '<path d="M4 10v4M7 8v8M17 8v8M20 10v4M7 12h10"/>',
  feed: '<path d="M5 6.5h14a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H10l-4 3v-3H5a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"/>',
  pods: '<circle cx="9" cy="9.5" r="2.6"/><path d="M4 18c0-2.7 2.2-4.3 5-4.3s5 1.6 5 4.3"/><path d="M15.8 7.6a2.4 2.4 0 0 1 0 4.6"/><path d="M16.4 13.8c2 .5 3.3 1.9 3.3 3.9"/>',
  events: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 9.5h16M8 3.5v4M16 3.5v4"/>',
  members: '<rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/>',
  library: '<path d="M4 8a1 1 0 0 1 1-1h4l1.8 2H19a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/>',
  messages: '<rect x="4" y="6" width="16" height="12" rx="2"/><path d="M5 8.5l7 5 7-5"/>',
  membership: '<rect x="3.5" y="6.5" width="17" height="11" rx="2"/><path d="M3.5 10h17"/>',
  alerts: '<path d="M8 10a4 4 0 0 1 8 0c0 4 1.4 5 1.4 5H6.6S8 14 8 10z"/><path d="M10.4 18.2a1.8 1.8 0 0 0 3.2 0"/>',
  settings: '<circle cx="12" cy="12" r="3.1"/><path d="M12 3.5V6M12 18v2.5M20.5 12H18M6 12H3.5M18.2 5.8l-1.8 1.8M7.6 16.4l-1.8 1.8M18.2 18.2l-1.8-1.8M7.6 7.6 5.8 5.8"/>',
  exposure: '<path d="M4 15.5a8 8 0 0 1 16 0"/><path d="M12 15.5 16 12"/><circle cx="12" cy="15.5" r="1.1"/>',
  protection: '<path d="M12 3.5l7 2.8v4.7c0 4.3-2.9 7.2-7 8.5-4.1-1.3-7-4.2-7-8.5V6.3z"/>',
  moderation: '<path d="M12 3.5l7 2.8v4.7c0 4.3-2.9 7.2-7 8.5-4.1-1.3-7-4.2-7-8.5V6.3z"/><path d="M9.2 11.8l2 2 3.6-3.8"/>',
  done: '<path d="M5 12.5l4 4L19 7"/>',
  flag: '<path d="M6 21V4M6 5h10l-2 3 2 3H6"/>',
  scout: '<circle cx="12" cy="12" r="8.5"/><path d="M12 12a4.2 4.2 0 0 1 4-3"/><path d="M12 12l6.4-3.4"/><circle cx="18.2" cy="8.7" r="1" fill="currentColor" stroke="none"/>',
  health: '<path d="M3.5 12.5H8l1.8-4 3 8 1.8-4.5 1 .9h5"/>',
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: d }}
    />
  );
}
