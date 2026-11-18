// ============================================================
// OPEN PAGES — Data Schema v0.1
// Primitive widget types that form the building blocks
// ============================================================

export type WidgetType =
  | 'streak'
  | 'counter'
  | 'progress'
  | 'chart_line'
  | 'chart_bar'
  | 'habit_grid'
  | 'log_feed'
  | 'stat_number'
  | 'text_block'
  | 'badge_row';

export type ConnectorId = 'github' | 'strava' | 'goodreads' | 'manual';

export interface WidgetSchema {
  type: WidgetType;
  label: string;
  description: string;
  icon: string;
  defaultConfig: Record<string, unknown>;
  configFields: ConfigField[];
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'boolean';
  options?: { value: string; label: string }[];
  default: unknown;
}

// ── Primitive Definitions ──────────────────────────────────

export const widgetSchemas: Record<WidgetType, WidgetSchema> = {
  streak: {
    type: 'streak',
    label: 'Streak Counter',
    description: 'Tracks consecutive days of an activity (e.g., sobriety, meditation)',
    icon: '🔥',
    defaultConfig: { title: 'My Streak', currentDays: 0, startDate: '', unit: 'days', color: '#51cf66' },
    configFields: [
      { key: 'title', label: 'Title', type: 'text', default: 'My Streak' },
      { key: 'startDate', label: 'Start Date', type: 'text', default: '' },
      { key: 'unit', label: 'Unit', type: 'select', options: [{ value: 'days', label: 'Days' }, { value: 'weeks', label: 'Weeks' }], default: 'days' },
      { key: 'color', label: 'Color', type: 'color', default: '#51cf66' },
    ],
  },
  counter: {
    type: 'counter',
    label: 'Number Counter',
    description: 'A single large number with context (e.g., books read, km run)',
    icon: '🔢',
    defaultConfig: { title: 'Counter', value: 0, unit: '', color: '#748ffc' },
    configFields: [
      { key: 'title', label: 'Title', type: 'text', default: 'Counter' },
      { key: 'value', label: 'Value', type: 'number', default: 0 },
      { key: 'unit', label: 'Unit', type: 'text', default: '' },
      { key: 'color', label: 'Color', type: 'color', default: '#748ffc' },
    ],
  },
  progress: {
    type: 'progress',
    label: 'Progress Bar',
    description: 'Visual progress toward a target (e.g., 34/50 books)',
    icon: '📊',
    defaultConfig: { title: 'Goal', current: 0, target: 100, unit: '', color: '#845ef7' },
    configFields: [
      { key: 'title', label: 'Title', type: 'text', default: 'Goal' },
      { key: 'current', label: 'Current', type: 'number', default: 0 },
      { key: 'target', label: 'Target', type: 'number', default: 100 },
      { key: 'unit', label: 'Unit', type: 'text', default: '' },
      { key: 'color', label: 'Color', type: 'color', default: '#845ef7' },
    ],
  },
  chart_line: {
    type: 'chart_line',
    label: 'Line Chart',
    description: 'Time-series data visualization (e.g., weekly running distance)',
    icon: '📈',
    defaultConfig: { title: 'Trend', color: '#5c7cfa', unit: '' },
    configFields: [
      { key: 'title', label: 'Title', type: 'text', default: 'Trend' },
      { key: 'unit', label: 'Unit', type: 'text', default: '' },
      { key: 'color', label: 'Color', type: 'color', default: '#5c7cfa' },
    ],
  },
  chart_bar: {
    type: 'chart_bar',
    label: 'Bar Chart',
    description: 'Categorical comparison (e.g., monthly consistency)',
    icon: '📊',
    defaultConfig: { title: 'Comparison', color: '#ff922b', unit: '' },
    configFields: [
      { key: 'title', label: 'Title', type: 'text', default: 'Comparison' },
      { key: 'unit', label: 'Unit', type: 'text', default: '' },
      { key: 'color', label: 'Color', type: 'color', default: '#ff922b' },
    ],
  },
  habit_grid: {
    type: 'habit_grid',
    label: 'Habit Grid',
    description: 'Weekly checklist of habits (GitHub-style contribution grid)',
    icon: '✅',
    defaultConfig: { title: 'Habits', habits: ['Exercise', 'Read', 'Meditate'] },
    configFields: [
      { key: 'title', label: 'Title', type: 'text', default: 'Habits' },
    ],
  },
  log_feed: {
    type: 'log_feed',
    label: 'Activity Log',
    description: 'Chronological feed of events (e.g., commits, runs, check-ins)',
    icon: '📝',
    defaultConfig: { title: 'Recent Activity', maxItems: 5 },
    configFields: [
      { key: 'title', label: 'Title', type: 'text', default: 'Recent Activity' },
      { key: 'maxItems', label: 'Max Items', type: 'number', default: 5 },
    ],
  },
  stat_number: {
    type: 'stat_number',
    label: 'Stat Card',
    description: 'Compact metric with trend indicator',
    icon: '📉',
    defaultConfig: { title: 'Metric', value: '0', subtitle: '', trend: 'neutral', color: '#22b8cf' },
    configFields: [
      { key: 'title', label: 'Title', type: 'text', default: 'Metric' },
      { key: 'value', label: 'Value', type: 'text', default: '0' },
      { key: 'subtitle', label: 'Subtitle', type: 'text', default: '' },
      { key: 'trend', label: 'Trend', type: 'select', options: [{ value: 'up', label: 'Up' }, { value: 'down', label: 'Down' }, { value: 'neutral', label: 'Flat' }], default: 'neutral' },
      { key: 'color', label: 'Color', type: 'color', default: '#22b8cf' },
    ],
  },
  text_block: {
    type: 'text_block',
    label: 'Text Block',
    description: 'Free-form text for bio, notes, or descriptions',
    icon: '✏️',
    defaultConfig: { content: 'Tell your story...', fontSize: 'medium' },
    configFields: [
      { key: 'content', label: 'Content', type: 'text', default: 'Tell your story...' },
      { key: 'fontSize', label: 'Size', type: 'select', options: [{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }], default: 'medium' },
    ],
  },
  badge_row: {
    type: 'badge_row',
    label: 'Badge Row',
    description: 'Row of achievement badges or milestones',
    icon: '🏆',
    defaultConfig: { title: 'Achievements', badges: [] },
    configFields: [
      { key: 'title', label: 'Title', type: 'text', default: 'Achievements' },
    ],
  },
};

// ── Widget Instance (what lives on the canvas) ────────────

export interface WidgetInstance {
  id: string;
  type: WidgetType;
  config: Record<string, unknown>;
  connector?: ConnectorId;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

// ── Page (a user's Open Page) ─────────────────────────────

export interface OpenPage {
  id: string;
  /** Database row id (uuid). Only set for pages that have been published. */
  dbId?: string;
  slug: string; // vanity URL
  ownerName: string;
  ownerAvatar: string;
  bio: string;
  theme: PageTheme;
  widgets: WidgetInstance[];
  connectors: ConnectedAccount[];
  isPublic: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageTheme {
  accentColor: string;
  bgStyle: 'dark' | 'gradient' | 'minimal';
  fontFamily: 'inter' | 'mono' | 'serif';
  layout: 'grid' | 'masonry' | 'list';
  borderRadius: 'sm' | 'md' | 'lg';
}

export interface ConnectedAccount {
  id: ConnectorId;
  username: string;
  connectedAt: string;
  status: 'connected' | 'expired' | 'disconnected';
}
