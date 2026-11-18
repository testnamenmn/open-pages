import { WidgetInstance, WidgetType } from '../types/schema';
import { SAMPLE_TYPES } from '../utils/sample';

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'fitness' | 'developer' | 'polymath' | 'sobriety' | 'creative';
  accentColor: string;
  widgets: WidgetInstance[];
  popularity: number;
}

let widgetId = 0;
const makeWidget = (type: WidgetType, config: Record<string, unknown>, x: number, y: number, connector?: string): WidgetInstance => ({
  id: `tpl_${++widgetId}`,
  type,
  // Placeholder numbers are flagged so the UI can label them as sample data until replaced or linked.
  config: SAMPLE_TYPES.has(type) ? { ...config, sample: true } : config,
  connector: connector as WidgetInstance['connector'],
  position: { x, y },
  size: { w: 1, h: 1 },
});

export const templates: Template[] = [
  {
    id: 'fitness',
    name: 'Fitness Junkie',
    description: 'Track workouts, runs, and gym streaks. Perfect for athletes.',
    icon: '🏋️',
    category: 'fitness',
    accentColor: '#51cf66',
    popularity: 2847,
    widgets: [
      makeWidget('streak', { title: 'Gym Streak', currentDays: 45, color: '#51cf66' }, 0, 0, 'strava'),
      makeWidget('counter', { title: 'Total KM', value: 342, unit: 'km', color: '#22b8cf' }, 1, 0, 'strava'),
      makeWidget('progress', { title: 'Goal: 1000km', current: 342, target: 1000, unit: 'km', color: '#748ffc' }, 2, 0, 'strava'),
      makeWidget('chart_line', { title: 'Weekly Distance', color: '#51cf66', unit: 'km' }, 0, 1, 'strava'),
      makeWidget('stat_number', { title: 'Avg Pace', value: '5:24', subtitle: 'min/km', trend: 'up', color: '#ff922b' }, 1, 1, 'strava'),
      makeWidget('habit_grid', { title: 'This Week', habits: ['Run', 'Lift', 'Stretch', 'Hydrate'] }, 2, 1),
    ],
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Showcase commits, repos, and coding consistency.',
    icon: '💻',
    category: 'developer',
    accentColor: '#845ef7',
    popularity: 3421,
    widgets: [
      makeWidget('streak', { title: 'Coding Streak', currentDays: 127, color: '#845ef7' }, 0, 0, 'github'),
      makeWidget('counter', { title: 'Contributions', value: 1247, unit: 'this year', color: '#51cf66' }, 1, 0, 'github'),
      makeWidget('chart_bar', { title: 'Monthly Commits', color: '#748ffc', unit: 'commits' }, 2, 0, 'github'),
      makeWidget('log_feed', { title: 'Recent Activity', maxItems: 5 }, 0, 1, 'github'),
      makeWidget('stat_number', { title: 'Repos', value: '34', subtitle: 'public', trend: 'up', color: '#22b8cf' }, 1, 1, 'github'),
      makeWidget('text_block', { content: 'Building in public. Open source enthusiast.', fontSize: 'medium' }, 2, 1),
    ],
  },
  {
    id: 'polymath',
    name: 'Polymath',
    description: 'Books, learning, and intellectual growth tracking.',
    icon: '📚',
    category: 'polymath',
    accentColor: '#748ffc',
    popularity: 1892,
    widgets: [
      makeWidget('progress', { title: 'Books: 34/50', current: 34, target: 50, unit: 'books', color: '#748ffc' }, 0, 0, 'goodreads'),
      makeWidget('streak', { title: 'Reading Streak', currentDays: 89, color: '#fcc419' }, 1, 0, 'goodreads'),
      makeWidget('counter', { title: 'Pages Read', value: 12450, unit: 'pages', color: '#845ef7' }, 2, 0, 'goodreads'),
      makeWidget('log_feed', { title: 'Recently Finished', maxItems: 4 }, 0, 1, 'goodreads'),
      makeWidget('chart_line', { title: 'Pages Per Week', color: '#748ffc', unit: 'pages' }, 1, 1),
      makeWidget('habit_grid', { title: 'Daily Habits', habits: ['Read 30m', 'Journal', 'Learn'] }, 2, 1),
    ],
  },
  {
    id: 'sobriety',
    name: 'Sobriety Journey',
    description: 'Celebrate milestones and track your recovery journey.',
    icon: '🌱',
    category: 'sobriety',
    accentColor: '#51cf66',
    popularity: 956,
    widgets: [
      makeWidget('streak', { title: 'Sober Days', currentDays: 142, color: '#51cf66' }, 0, 0),
      makeWidget('text_block', { content: 'One day at a time. Grateful for every sunrise.', fontSize: 'large' }, 1, 0),
      makeWidget('counter', { title: 'Meditations', value: 89, unit: 'sessions', color: '#845ef7' }, 2, 0),
      makeWidget('progress', { title: 'Savings', current: 3200, target: 5000, unit: '$', color: '#fcc419' }, 0, 1),
      makeWidget('chart_line', { title: 'Mood Trend', color: '#51cf66', unit: 'score' }, 1, 1),
      makeWidget('habit_grid', { title: 'Recovery Habits', habits: ['Meditate', 'Exercise', 'Journal', 'Meeting'] }, 2, 1),
    ],
  },
  {
    id: 'creative',
    name: 'Creative Soul',
    description: 'Track art, music, writing, and creative output.',
    icon: '🎨',
    category: 'creative',
    accentColor: '#f06595',
    popularity: 1234,
    widgets: [
      makeWidget('streak', { title: 'Create Daily', currentDays: 56, color: '#f06595' }, 0, 0),
      makeWidget('counter', { title: 'Pieces Created', value: 127, unit: 'works', color: '#845ef7' }, 1, 0),
      makeWidget('chart_bar', { title: 'Monthly Output', color: '#f06595', unit: 'pieces' }, 2, 0),
      makeWidget('log_feed', { title: 'Latest Works', maxItems: 4 }, 0, 1),
      makeWidget('stat_number', { title: 'Hours/Week', value: '12.5', subtitle: 'avg', trend: 'up', color: '#ff922b' }, 1, 1),
      makeWidget('text_block', { content: 'Creating is my meditation.', fontSize: 'medium' }, 2, 1),
    ],
  },
];

export const categories = [
  { id: 'all', label: 'All Templates', icon: '✨' },
  { id: 'fitness', label: 'Fitness', icon: '🏋️' },
  { id: 'developer', label: 'Developer', icon: '💻' },
  { id: 'polymath', label: 'Polymath', icon: '📚' },
  { id: 'sobriety', label: 'Sobriety', icon: '🌱' },
  { id: 'creative', label: 'Creative', icon: '🎨' },
];
