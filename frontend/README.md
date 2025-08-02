
# ReachInbox Email Aggregator

A modern React + TypeScript Vite frontend for ReachInbox Email Aggregator.

## Features
- Responsive dashboard with Material UI
- Dark/light theme toggle
- Email list, detail, and reply modal
- AI-powered categorization
- Filter persistence via URL
- Accessibility: aria-labels, tab order, focus indicators
- Tooltips and keyboard shortcuts (e.g., "R" for reply)
- Error/loading/empty states with feedback
- Modular feature folders: auth, dashboard, emails, accounts, settings, components, hooks, utils

## Getting Started
1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the dev server:**
   ```sh
   npm run dev
   ```
3. **Demo credentials:**
   - Email: `demo@reachinbox.com`
   - Password: `demo123`

## Project Structure
- `src/components/` — Shared UI components
- `src/dashboard/` — Dashboard shell, stats, filters
- `src/emails/` — Email list, detail, reply modal
- `src/hooks/` — Custom hooks (e.g., useEmails)
- `src/utils/` — API helpers

## Accessibility & UX
- All interactive elements have aria-labels and logical tab order
- Custom focus indicators for keyboard navigation
- Tooltips for actions and categories
- Keyboard shortcuts for quick actions

## Customization
- Edit theme colors in `App.tsx`
- Add new features in modular folders

## Demo Video
- 📹 **Demo Video Walkthrough**
  - Record a video showing:
    - Login with demo credentials
    - Dashboard overview
    - Email list, detail, reply modal
    - Dark mode toggle
    - Accessibility features (tab order, tooltips, keyboard shortcuts)
  - Upload to YouTube/Drive and paste the link below:
  - [Demo Video Link Here]

## License
MIT

## Submission

1. **Push your code to GitHub:**
   - Create a public repository and push all project files.
   - Example:
     ```sh
     git init
     git remote add origin <your-repo-url>
     git add .
     git commit -m "Initial commit"
     git push -u origin main
     ```
2. **Add your GitHub repo link below:**
   - [GitHub Repo Link Here]
3. **Submit per assignment instructions.**

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
