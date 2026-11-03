import { ConnectorId } from '../types/schema';

export interface Connector {
  id: ConnectorId;
  name: string;
  description: string;
  icon: string;
  color: string;
  oauthUrl: string;
  scopes: string[];
  widgets: string[]; // widget types this connector can populate
  status: 'available' | 'coming_soon';
}

export const connectors: Connector[] = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Track commits, contributions, repos, and coding streaks',
    icon: '🐙',
    color: '#6e5494',
    oauthUrl: 'https://github.com/login/oauth/authorize',
    scopes: ['read:user', 'repo'],
    widgets: ['streak', 'chart_bar', 'log_feed', 'counter', 'habit_grid'],
    status: 'available',
  },
  {
    id: 'strava',
    name: 'Strava',
    description: 'Import runs, rides, swims, and fitness streaks',
    icon: '🏃',
    color: '#fc4c02',
    oauthUrl: 'https://www.strava.com/oauth/authorize',
    scopes: ['read', 'activity:read_all'],
    widgets: ['streak', 'chart_line', 'counter', 'progress', 'stat_number'],
    status: 'available',
  },
  {
    id: 'goodreads',
    name: 'Goodreads',
    description: 'Track books read, reading goals, and favorite genres',
    icon: '📚',
    color: '#553b08',
    oauthUrl: 'https://www.goodreads.com/oauth/authorize',
    scopes: ['read'],
    widgets: ['counter', 'progress', 'log_feed', 'chart_bar'],
    status: 'available',
  },
  {
    id: 'manual',
    name: 'Manual Entry',
    description: 'Add data manually — perfect for habits, moods, or custom metrics',
    icon: '✍️',
    color: '#51cf66',
    oauthUrl: '',
    scopes: [],
    widgets: ['streak', 'counter', 'progress', 'habit_grid', 'text_block', 'stat_number'],
    status: 'available',
  },
];

export interface OAuthState {
  connectorId: ConnectorId;
  status: 'idle' | 'connecting' | 'success' | 'error';
  username?: string;
  error?: string;
}
