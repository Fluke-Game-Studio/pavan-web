# React MVC Architecture Guide

## Overview

This React frontend follows an **MVC-inspired architecture** to separate concerns and improve maintainability. While React doesn't traditionally follow strict MVC patterns, we've adapted the concept to fit React's component-based paradigm.

## Folder Structure

```
react-frontend/src/
├── models/              # Data Layer (API calls, data transformations)
│   ├── careerModel.js
│   └── applicationModel.js
├── views/               # View Layer (Pure UI components)
│   ├── careers/
│   │   ├── JobCard.jsx
│   │   ├── JobDetail.jsx
│   │   ├── TagBadge.jsx
│   │   └── index.js
│   ├── Hero.jsx
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ...
├── controllers/         # Controller Layer (Business logic, hooks)
│   ├── careerController.js
│   └── applicationController.js
├── pages/               # Page Orchestrators (Connect M-V-C)
│   ├── HomePage.jsx
│   ├── CareersPage.jsx
│   ├── ApplyPage.jsx
│   └── ...
└── shared/              # Shared utilities, constants, helpers
    └── utils.js
```

## Architecture Layers

### 1. **Models** (Data Layer)
**Location:** `src/models/`

**Purpose:** Handle all data-related operations, API calls, and data transformations.

**Responsibilities:**
- Fetch data from APIs
- Transform/normalize API responses
- Data validation and formatting
- No UI logic or state management

**Example:**
```javascript
// models/careerModel.js
export async function fetchJobs() {
    const res = await fetch(`${API_BASE}/jobs`);
    const data = await res.json();
    return items.map(normalizeJob);
}
```

### 2. **Views** (Presentation Layer)
**Location:** `src/views/`

**Purpose:** Pure presentational components that render UI based on props.

**Responsibilities:**
- Render UI elements
- Receive data via props
- Emit events via callbacks
- **No business logic or data fetching**
- **No state management** (except UI-only state like hover, focus)

**Example:**
```jsx
// views/careers/JobCard.jsx
export const JobCard = ({ job, isSelected, onClick }) => (
    <div className="job-card" onClick={() => onClick(job)}>
        <h3>{job.title}</h3>
        <span>{job.type}</span>
    </div>
);
```

### 3. **Controllers** (Business Logic Layer)
**Location:** `src/controllers/`

**Purpose:** Custom hooks that manage business logic, state, and orchestrate data flow.

**Responsibilities:**
- Manage component state
- Handle user interactions and events
- Call model functions to fetch/submit data
- Validation and business rules
- Error handling

**Example:**
```javascript
// controllers/careerController.js
export function useCareerController() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchJobs()
            .then(setJobs)
            .catch(handleError);
    }, []);
    
    return { jobs, loading, error };
}
```

### 4. **Pages** (Orchestrators)
**Location:** `src/pages/`

**Purpose:** Route-level components that wire together Models, Views, and Controllers.

**Responsibilities:**
- Import and use controller hooks
- Pass data to view components
- Handle page-level routing
- Compose multiple views together

**Example:**
```jsx
// pages/CareersPage.jsx
import { useCareerController } from '../controllers/careerController';
import { JobCard, JobDetail } from '../views/careers';

const CareersPage = () => {
    const { jobs, loading, selectedJob } = useCareerController();
    
    return (
        <div>
            {jobs.map(job => <JobCard job={job} />)}
            <JobDetail job={selectedJob} />
        </div>
    );
};
```

### 5. **Shared** (Utilities)
**Location:** `src/shared/`

**Purpose:** Reusable utilities, constants, and helper functions.

**Examples:**
- `utils.js` - Common functions (tryJsonParse, safeStr, etc.)
- `constants.js` - App-wide constants
- `types.js` - TypeScript types/interfaces (if using TS)

## Data Flow

```
User Action (View)
    ↓
Controller Hook (handles event)
    ↓
Model Function (API call)
    ↓
Controller Hook (updates state)
    ↓
View (re-renders with new data)
```

## Best Practices

### ✅ DO
- Keep views **pure** and presentational
- Put all business logic in controllers
- Keep API calls and data transformations in models
- Use controllers to connect models and views
- Make views reusable and composable

### ❌ DON'T
- Don't put API calls in views
- Don't put business logic in models
- Don't manage complex state in views
- Don't bypass controllers to call models directly from pages

## Migration Notes

### Old Structure → New Structure
- `services/api.js` → Split into `models/careerModel.js` + `models/applicationModel.js`
- `hooks/useCareers.js` → `controllers/careerController.js`
- `hooks/useCareerApply.js` → `controllers/applicationController.js`
- `components/*` → `views/*` (copied, organized by feature)

### Import Updates
**Before:**
```jsx
import { useCareers } from '../hooks/useCareers';
import Hero from '../components/Hero';
```

**After:**
```jsx
import { useCareerController } from '../controllers/careerController';
import Hero from '../views/Hero';
```

## Benefits

1. **Separation of Concerns** - Each layer has a single, clear responsibility
2. **Testability** - Easy to unit test models, controllers, and views independently
3. **Maintainability** - Changes to one layer don't affect others
4. **Reusability** - Views can be reused across different pages
5. **Scalability** - Clear structure makes it easier to add new features

## Example Complete Flow

```jsx
// 1. MODEL - Data Layer
// models/careerModel.js
export async function fetchJobs() {
    const res = await fetch('/api/jobs');
    return res.json().map(normalizeJob);
}

// 2. CONTROLLER - Business Logic
// controllers/careerController.js
export function useCareerController() {
    const [jobs, setJobs] = useState([]);
    useEffect(() => {
        fetchJobs().then(setJobs);
    }, []);
    return { jobs };
}

// 3. VIEW - Presentation
// views/careers/JobCard.jsx
export const JobCard = ({ job, onClick }) => (
    <div onClick={onClick}>
        <h3>{job.title}</h3>
    </div>
);

// 4. PAGE - Orchestrator
// pages/CareersPage.jsx
import { useCareerController } from '../controllers/careerController';
import { JobCard } from '../views/careers';

const CareersPage = () => {
    const { jobs } = useCareerController();
    return jobs.map(job => <JobCard key={job.id} job={job} />);
};
```

---

**Last Updated:** March 2, 2026
