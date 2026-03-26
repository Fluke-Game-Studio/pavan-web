# Standalone Careers Page

This folder contains a standalone versions of the Careers page, designed for easy migration to other React websites.

## 📁 What's Inside

- `CareersPage.jsx`: The main entry point component.
- `CareersPage.css`: Original styling for the careers section.
- `JobComponents.jsx`: UI components (`JobCard`, `JobDetail`, `TagBadge`).
- `CareerLogic.js`: Business logic, state management, and API fetching.
- `theme.css`: Essential design tokens (colors, animations) and resets.

## 🚀 Setup Instructions

### 1. Install Dependencies
Ensure you have the following packages installed in your target project:

```bash
npm install framer-motion react-router-dom
```

### 2. Copy the Folder
Copy the entire `careers-standalone` folder into your project's `src/components/` (or equivalent) directory.

### 3. Usage
Import and use the `AppCareers` component. **Note:** It must be rendered within a `react-router-dom` context (e.g., `<BrowserRouter>`).

```jsx
import AppCareers from './components/careers-standalone/CareersPage';

function App() {
  return (
    <AppCareers apiBase="https://your-api.com/v1" />
  );
}
```

## 🛠 Configuration

- **API Base URL**: Pass an `apiBase` prop to the component to point to your backend. The component expects `GET {apiBase}/jobs`.
- **Styling**: All colors are defined in `theme.css` via CSS variables. You can override these in your global CSS to match your brand.
- **Navigation**: The "Apply" button uses `useNavigate()` to send users to `/careers/apply`. You may need to update the `handleApply` function in `CareersPage.jsx` to match your routing.
