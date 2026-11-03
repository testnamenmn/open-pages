export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  following: number;
  joinedDate: string;
  theme: 'dark' | 'light' | 'gradient';
  accentColor: string;
}

export interface StreakData {
  id: string;
  title: string;
  icon: string;
  currentStreak: number;
  longestStreak: number;
  startDate: string;
  unit: string;
  color: string;
}

export interface ProgressData {
  id: string;
  title: string;
  icon: string;
  current: number;
  target: number;
  unit: string;
  color: string;
  timeframe: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface ActivityData {
  id: string;
  title: string;
  icon: string;
  data: ChartDataPoint[];
  color: string;
  unit: string;
}

export interface StatCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: string;
}

export interface HabitTracker {
  id: string;
  title: string;
  habits: { name: string; completed: boolean }[];
  weekDays: string[];
}

export const currentUser: UserProfile = {
  id: '1',
  name: 'Alex Chen',
  username: 'alexchen',
  avatar: '🧑‍💻',
  bio: 'Building better habits, one day at a time. Fitness enthusiast & book lover.',
  followers: 1247,
  following: 89,
  joinedDate: '2024-03-15',
  theme: 'dark',
  accentColor: '#5c7cfa',
};

export const streaks: StreakData[] = [
  {
    id: '1',
    title: 'Sobriety',
    icon: '🌱',
    currentStreak: 142,
    longestStreak: 142,
    startDate: '2024-08-15',
    unit: 'days',
    color: '#51cf66',
  },
  {
    id: '2',
    title: 'Morning Meditation',
    icon: '🧘',
    currentStreak: 67,
    longestStreak: 89,
    startDate: '2024-10-01',
    unit: 'days',
    color: '#845ef7',
  },
  {
    id: '3',
    title: 'No Social Media',
    icon: '📵',
    currentStreak: 23,
    longestStreak: 45,
    startDate: '2024-11-15',
    unit: 'days',
    color: '#ff922b',
  },
  {
    id: '4',
    title: 'Cold Shower',
    icon: '🥶',
    currentStreak: 31,
    longestStreak: 31,
    startDate: '2024-11-07',
    unit: 'days',
    color: '#22b8cf',
  },
];

export const progressGoals: ProgressData[] = [
  {
    id: '1',
    title: 'Read 50 Books',
    icon: '📚',
    current: 34,
    target: 50,
    unit: 'books',
    color: '#748ffc',
    timeframe: '2024',
  },
  {
    id: '2',
    title: 'Run 1000 km',
    icon: '🏃',
    current: 742,
    target: 1000,
    unit: 'km',
    color: '#51cf66',
    timeframe: '2024',
  },
  {
    id: '3',
    title: 'Learn Spanish',
    icon: '🇪🇸',
    current: 72,
    target: 100,
    unit: '%',
    color: '#fcc419',
    timeframe: '2024',
  },
  {
    id: '4',
    title: 'Save $10,000',
    icon: '💰',
    current: 7850,
    target: 10000,
    unit: '$',
    color: '#f06595',
    timeframe: '2024',
  },
];

export const activityCharts: ActivityData[] = [
  {
    id: '1',
    title: 'Weekly Running',
    icon: '🏃',
    data: [
      { label: 'Mon', value: 5.2 },
      { label: 'Tue', value: 0 },
      { label: 'Wed', value: 8.1 },
      { label: 'Thu', value: 3.4 },
      { label: 'Fri', value: 0 },
      { label: 'Sat', value: 12.5 },
      { label: 'Sun', value: 6.8 },
    ],
    color: '#51cf66',
    unit: 'km',
  },
  {
    id: '2',
    title: 'Reading This Month',
    icon: '📖',
    data: [
      { label: 'Week 1', value: 45 },
      { label: 'Week 2', value: 62 },
      { label: 'Week 3', value: 38 },
      { label: 'Week 4', value: 71 },
    ],
    color: '#748ffc',
    unit: 'pages',
  },
  {
    id: '3',
    title: 'Meditation Minutes',
    icon: '🧘',
    data: [
      { label: 'Mon', value: 20 },
      { label: 'Tue', value: 15 },
      { label: 'Wed', value: 25 },
      { label: 'Thu', value: 30 },
      { label: 'Fri', value: 20 },
      { label: 'Sat', value: 35 },
      { label: 'Sun', value: 25 },
    ],
    color: '#845ef7',
    unit: 'min',
  },
];

export const statCards: StatCard[] = [
  {
    id: '1',
    title: 'Total Steps Today',
    value: '12,847',
    subtitle: 'Goal: 10,000',
    icon: '👟',
    trend: 'up',
    trendValue: '+18%',
    color: '#51cf66',
  },
  {
    id: '2',
    title: 'Water Intake',
    value: '2.4L',
    subtitle: 'Goal: 3L',
    icon: '💧',
    trend: 'up',
    trendValue: '+0.6L',
    color: '#22b8cf',
  },
  {
    id: '3',
    title: 'Sleep Score',
    value: '87',
    subtitle: 'Last night: 7h 42m',
    icon: '😴',
    trend: 'up',
    trendValue: '+5pts',
    color: '#845ef7',
  },
  {
    id: '4',
    title: 'Focus Hours',
    value: '6.2h',
    subtitle: 'Deep work sessions',
    icon: '🎯',
    trend: 'down',
    trendValue: '-0.8h',
    color: '#ff922b',
  },
];

export const habitTracker: HabitTracker = {
  id: '1',
  title: 'This Week',
  weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  habits: [
    { name: 'Exercise', completed: true },
    { name: 'Meditate', completed: true },
    { name: 'Read 30min', completed: true },
    { name: 'Journal', completed: false },
    { name: 'No sugar', completed: true },
    { name: 'Sleep by 11pm', completed: false },
  ],
};

export const weeklyHabitData = [
  { day: 'Mon', exercise: true, meditate: true, read: true, journal: true, nosugar: true, sleep: true },
  { day: 'Tue', exercise: true, meditate: true, read: true, journal: true, nosugar: true, sleep: true },
  { day: 'Wed', exercise: false, meditate: true, read: true, journal: false, nosugar: true, sleep: true },
  { day: 'Thu', exercise: true, meditate: true, read: false, journal: true, nosugar: true, sleep: false },
  { day: 'Fri', exercise: true, meditate: true, read: true, journal: true, nosugar: true, sleep: true },
  { day: 'Sat', exercise: true, meditate: false, read: true, journal: false, nosugar: true, sleep: false },
  { day: 'Sun', exercise: false, meditate: true, read: true, journal: false, nosugar: false, sleep: true },
];

export const otherUsers: UserProfile[] = [
  {
    id: '2',
    name: 'Sarah Kim',
    username: 'sarahkim',
    avatar: '👩‍🎨',
    bio: 'Artist & yoga practitioner. Tracking my creative journey.',
    followers: 892,
    following: 156,
    joinedDate: '2024-01-20',
    theme: 'gradient',
    accentColor: '#f06595',
  },
  {
    id: '3',
    name: 'Marcus Johnson',
    username: 'marcusj',
    avatar: '🏋️',
    bio: 'Fitness coach. 365 days of consistent training.',
    followers: 3421,
    following: 67,
    joinedDate: '2023-11-05',
    theme: 'dark',
    accentColor: '#51cf66',
  },
  {
    id: '4',
    name: 'Luna Park',
    username: 'lunapark',
    avatar: '📚',
    bio: 'Reading 100 books this year. Currently on book #73.',
    followers: 2156,
    following: 234,
    joinedDate: '2024-02-14',
    theme: 'dark',
    accentColor: '#748ffc',
  },
  {
    id: '5',
    name: 'Dev Patel',
    username: 'devpatel',
    avatar: '🎸',
    bio: 'Learning guitar. 200 days of practice and counting.',
    followers: 567,
    following: 112,
    joinedDate: '2024-05-01',
    theme: 'gradient',
    accentColor: '#fcc419',
  },
  {
    id: '6',
    name: 'Emma Wilson',
    username: 'emmawilson',
    avatar: '🌿',
    bio: 'Plant parent. Growing my indoor jungle, one leaf at a time.',
    followers: 1890,
    following: 345,
    joinedDate: '2024-04-10',
    theme: 'dark',
    accentColor: '#51cf66',
  },
];

export const monthlyMilestones = [
  { month: 'Jan', value: 45 },
  { month: 'Feb', value: 52 },
  { month: 'Mar', value: 61 },
  { month: 'Apr', value: 58 },
  { month: 'May', value: 72 },
  { month: 'Jun', value: 68 },
  { month: 'Jul', value: 81 },
  { month: 'Aug', value: 89 },
  { month: 'Sep', value: 95 },
  { month: 'Oct', value: 88 },
  { month: 'Nov', value: 92 },
  { month: 'Dec', value: 78 },
];
