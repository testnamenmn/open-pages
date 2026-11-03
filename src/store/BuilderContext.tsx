import { createContext, useContext, useReducer, ReactNode } from 'react';
import { OpenPage, WidgetInstance, PageTheme, WidgetType, widgetSchemas } from '../types/schema';

interface BuilderState {
  page: OpenPage;
  selectedWidgetId: string | null;
  isDragging: boolean;
}

type Action =
  | { type: 'ADD_WIDGET'; payload: { widgetType: WidgetType; connector?: string } }
  | { type: 'REMOVE_WIDGET'; payload: string }
  | { type: 'SELECT_WIDGET'; payload: string | null }
  | { type: 'UPDATE_WIDGET_CONFIG'; payload: { id: string; config: Record<string, unknown> } }
  | { type: 'MOVE_WIDGET'; payload: { id: string; position: { x: number; y: number } } }
  | { type: 'UPDATE_THEME'; payload: Partial<PageTheme> }
  | { type: 'UPDATE_PAGE_INFO'; payload: Partial<Pick<OpenPage, 'ownerName' | 'bio' | 'slug' | 'isPublic' | 'seoTitle' | 'seoDescription'>> }
  | { type: 'LOAD_TEMPLATE'; payload: OpenPage }
  | { type: 'SET_DRAGGING'; payload: boolean };

const defaultPage: OpenPage = {
  id: 'page_1',
  slug: 'my-page',
  ownerName: 'Your Name',
  ownerAvatar: '👤',
  bio: 'Welcome to my Open Page',
  theme: {
    accentColor: '#5c7cfa',
    bgStyle: 'dark',
    fontFamily: 'inter',
    layout: 'grid',
    borderRadius: 'md',
  },
  widgets: [],
  connectors: [],
  isPublic: true,
  seoTitle: 'My Open Page',
  seoDescription: 'A personalized data dashboard',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

let idCounter = 0;
const generateId = () => `widget_${Date.now()}_${++idCounter}`;

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case 'ADD_WIDGET': {
      const schema = widgetSchemas[action.payload.widgetType];
      const newWidget: WidgetInstance = {
        id: generateId(),
        type: action.payload.widgetType,
        config: { ...schema.defaultConfig },
        connector: action.payload.connector as WidgetInstance['connector'],
        position: { x: state.page.widgets.length % 3, y: Math.floor(state.page.widgets.length / 3) },
        size: { w: 1, h: 1 },
      };
      return {
        ...state,
        page: {
          ...state.page,
          widgets: [...state.page.widgets, newWidget],
          updatedAt: new Date().toISOString(),
        },
        selectedWidgetId: newWidget.id,
      };
    }
    case 'REMOVE_WIDGET':
      return {
        ...state,
        page: {
          ...state.page,
          widgets: state.page.widgets.filter((w) => w.id !== action.payload),
          updatedAt: new Date().toISOString(),
        },
        selectedWidgetId: state.selectedWidgetId === action.payload ? null : state.selectedWidgetId,
      };
    case 'SELECT_WIDGET':
      return { ...state, selectedWidgetId: action.payload };
    case 'UPDATE_WIDGET_CONFIG':
      return {
        ...state,
        page: {
          ...state.page,
          widgets: state.page.widgets.map((w) =>
            w.id === action.payload.id ? { ...w, config: { ...w.config, ...action.payload.config } } : w
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    case 'MOVE_WIDGET':
      return {
        ...state,
        page: {
          ...state.page,
          widgets: state.page.widgets.map((w) =>
            w.id === action.payload.id ? { ...w, position: action.payload.position } : w
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    case 'UPDATE_THEME':
      return {
        ...state,
        page: {
          ...state.page,
          theme: { ...state.page.theme, ...action.payload },
          updatedAt: new Date().toISOString(),
        },
      };
    case 'UPDATE_PAGE_INFO':
      return {
        ...state,
        page: { ...state.page, ...action.payload, updatedAt: new Date().toISOString() },
      };
    case 'LOAD_TEMPLATE':
      return { ...state, page: action.payload, selectedWidgetId: null };
    case 'SET_DRAGGING':
      return { ...state, isDragging: action.payload };
    default:
      return state;
  }
}

const BuilderContext = createContext<{
  state: BuilderState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    page: defaultPage,
    selectedWidgetId: null,
    isDragging: false,
  });

  return <BuilderContext.Provider value={{ state, dispatch }}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider');
  return ctx;
}
