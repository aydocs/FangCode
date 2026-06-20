---
name: frontend-developer
description: Specialist in React, Vue, Angular, Svelte, component architecture, state management, and modern UI frameworks.
---

# Frontend Developer Agent Skill

## Overview

You are a senior frontend developer specializing in modern JavaScript frameworks. You build reusable, performant, and accessible component libraries. Your code follows clean architecture principles and leverages the latest framework features.

---

## Core Competencies

### React 19
- Server Components and Server Actions
- Hooks: useState, useEffect, useMemo, useCallback, useRef, useReducer
- Custom hooks patterns
- Context API and provider patterns
- Suspense and lazy loading
- Error boundaries
- React.memo and performance optimization

### Vue 3
- Composition API with setup script
- Reactivity system: ref, reactive, computed, watch
- Component lifecycle hooks
- Provide/inject patterns
- Vue Router and Pinia state management
- Script setup with TypeScript

### Angular 17+
- Signals for reactive state
- Standalone components
- Deferred views with @defer
- Control flow syntax (@if, @for)
- Functional guards and pipes
- Zoneless change detection

### Svelte 5
- Runes: $state, $derived, $effect
- Transitions and animations
- Stores: writable, readable, derived
- Actions and events
- SvelteKit for full-stack

---

## Component Architecture

### Compound Components

```jsx
// Select compound component pattern
function Select({ children, value, onChange }) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  );
}

Select.Trigger = function Trigger({ children }) {
  const { value } = useSelectContext();
  return (
    <button className="select-trigger" aria-haspopup="listbox">
      {children || value || 'Select...'}
    </button>
  );
};

Select.Content = function Content({ children }) {
  return <div className="select-content" role="listbox">{children}</div>;
};

Select.Item = function Item({ value, children }) {
  const { onChange } = useSelectContext();
  return (
    <option value={value} onClick={() => onChange(value)} role="option">
      {children}
    </option>
  );
};

// Usage
<Select value={selected} onChange={setSelected}>
  <Select.Trigger />
  <Select.Content>
    <Select.Item value="react">React</Select.Item>
    <Select.Item value="vue">Vue</Select.Item>
    <Select.Item value="angular">Angular</Select.Item>
  </Select.Content>
</Select>
```

### Render Props

```jsx
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return render(position);
}

// Usage
<MouseTracker
  render={({ x, y }) => (
    <div>Mouse at: {x}, {y}</div>
  )}
/>
```

### Custom Hooks

```jsx
// useLocalStorage hook
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}

// useDebounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// useIntersectionObserver hook
function useIntersectionObserver(options) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isIntersecting];
}
```

---

## State Management

### Zustand

```javascript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        count: 0,
        items: [],
        
        increment: () => set((state) => ({ count: state.count + 1 })),
        
        addItem: (item) => set((state) => ({
          items: [...state.items, { ...item, id: Date.now() }]
        })),
        
        removeItem: (id) => set((state) => ({
          items: state.items.filter((item) => item.id !== id)
        })),
        
        reset: () => set({ count: 0, items: [] }),
      }),
      { name: 'app-store' }
    )
  )
);
```

### Jotai

```javascript
import { atom, useAtom, atomFamily } from 'jotai';

// Primitive atoms
const countAtom = atom(0);
const textAtom = atom('');

// Derived atoms
const doubleCountAtom = atom((get) => get(countAtom) * 2);
const filteredItemsAtom = atom((get) => {
  const text = get(textAtom);
  const items = get(itemsAtom);
  return items.filter((item) => 
    item.name.toLowerCase().includes(text.toLowerCase())
  );
});

// Async atoms
const userDataAtom = atom(async (get) => {
  const userId = get(currentUserIdAtom);
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
});

// Atom family for dynamic atoms
const todoAtom = atomFamily((id) =>
  atom(async () => {
    const response = await fetch(`/api/todos/${id}`);
    return response.json();
  })
);
```

### Pinia (Vue)

```javascript
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: 'Counter',
  }),

  getters: {
    doubleCount: (state) => state.count * 2,
    formattedCount: (state) => `Count: ${state.count}`,
  },

  actions: {
    increment() {
      this.count++;
    },
    async fetchCount() {
      const response = await fetch('/api/count');
      const data = await response.json();
      this.count = data.count;
    },
  },
});
```

---

## Performance Optimization

### React.memo and useMemo

```jsx
// Memoize expensive computations
const expensiveResult = useMemo(() => {
  return items.reduce((acc, item) => acc + item.value, 0);
}, [items]);

// Memoize callback functions
const handleClick = useCallback((id) => {
  setSelectedItems((prev) => [...prev, id]);
}, []);

// Memoize components
const MemoizedChild = React.memo(Child, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id && prevProps.data === nextProps.data;
});
```

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';

// Route-based splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

// Component-based splitting
const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Analytics() {
  const [showChart, setShowChart] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowChart(true)}>Show Chart</button>
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

### Virtual Lists

```jsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {items[virtualRow.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Testing

### React Testing Library

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

describe('Counter', () => {
  it('increments count on button click', async () => {
    render(<Counter initialCount={0} />);
    
    const button = screen.getByRole('button', { name: /increment/i });
    await userEvent.click(button);
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('displays initial count', () => {
    render(<Counter initialCount={5} />);
    expect(screen.getByText('Count: 5')).toBeInTheDocument();
  });

  it('disables button at max count', async () => {
    render(<Counter initialCount={10} max={10} />);
    
    const button = screen.getByRole('button', { name: /increment/i });
    await userEvent.click(button);
    
    expect(button).toBeDisabled();
  });
});
```

### Component Testing Patterns

```jsx
// Test async operations
it('loads user data', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ name: 'John Doe' }),
    })
  );

  render(<UserProfile userId="123" />);
  
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});

// Test form submission
it('submits form with validation', async () => {
  const onSubmit = jest.fn();
  render(<ContactForm onSubmit={onSubmit} />);
  
  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/message/i), 'Hello');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    message: 'Hello',
  });
});
```

---

## 10. Performance Optimization

### 10.1 Bundle Analysis & Tree Shaking

```typescript
// vite.config.ts — bundle analysis
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'react-vendor';
          if (id.includes('node_modules/@radix-ui')) return 'radix-ui';
          if (id.includes('node_modules/date-fns')) return 'date-fns';
          if (id.includes('node_modules/lodash')) return 'lodash';
        },
      },
    },
  },
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

### 10.2 Virtualization for Long Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ItemRow item={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 10.3 Memoization Strategy

```tsx
// React.memo with custom comparison
const ExpensiveComponent = memo(
  function ExpensiveComponent({ data, onSelect }: Props) {
    return (
      <div>
        {data.map((item) => (
          <div key={item.id} onClick={() => onSelect(item.id)}>
            {item.name}
          </div>
        ))}
      </div>
    );
  },
  (prev, next) =>
    prev.data === next.data && prev.onSelect === next.onSelect
);

// useMemo for expensive computations
function Dashboard({ transactions }: { transactions: Transaction[] }) {
  const stats = useMemo(() => {
    return {
      total: transactions.reduce((sum, t) => sum + t.amount, 0),
      average: transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length,
      max: Math.max(...transactions.map((t) => t.amount)),
      min: Math.min(...transactions.map((t) => t.amount)),
    };
  }, [transactions]);

  return <StatsDisplay stats={stats} />;
}
```

---

## 11. Anti-Patterns to Avoid

1. **Prop drilling beyond 3 levels** — Use context or state management
2. **Missing key prop** — Always provide unique keys for lists
3. **Stale closures** — Use functional updates or refs
4. **Unnecessary re-renders** — Memoize expensive computations
5. **Memory leaks** — Clean up subscriptions and timers
6. **Missing error boundaries** — Wrap risky components
7. **Hardcoded values** — Use environment variables
8. **No loading states** — Always show loading indicators
9. **Missing accessibility** — Test with screen readers
10. **Ignoring TypeScript** — Use strict mode

---

## 12. Quality Checklist

| Category | Check |
|----------|-------|
| Architecture | Components are reusable and composable |
| State | State management is appropriate for complexity level |
| Performance | Memoization applied where it matters |
| Accessibility | Tested with screen readers and keyboard navigation |
| Testing | Unit and integration tests written and passing |
| Resilience | Error boundaries wrap risky component trees |
| UX | Loading, empty, and error states handled |
| Types | TypeScript strict mode enabled |
| Bundle | Bundle analyzed and tree-shaking effective |
| Compatibility | Tested across target browsers and devices |
| Security | No XSS vectors, input sanitized, CSP enforced |
| Documentation | Component props documented with JSDoc/TSDoc |
