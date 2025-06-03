# FreshDeal Business Website

Official administrative dashboard for FreshDeal, a platform connecting customers with nearby restaurants and businesses through flash deals and ticket management.

## Related Projects

- Backend API: [FreshDealBackend](https://github.com/FreshDealApp/FreshDealBackend)
- Web App: [FreshDealWeb](https://github.com/FreshDealApp/FreshDealWeb)
- Mobile App: [FreshDealMobile](https://github.com/FreshDealApp/FreshDealMobile)

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- User authentication and session management
- Responsive dashboard with real-time charts (Chart.js)
- Google Maps for location-based features (`@react-google-maps/api`)
- CRUD operations for restaurants, deals, tickets, and notifications
- Support for flash deals and order tracking
- Role-based access control and route guarding
- Toast notifications and modal dialogs for user feedback

## Tech Stack

- Framework: React 18 (+ Vite)
- Language: TypeScript
- State Management: Redux Toolkit & React Redux
- UI Components: Material UI, Emotion CSS-in-JS
- Routing: React Router v7
- HTTP Client: Axios
- Dates: date-fns
- Mapping: @react-google-maps/api
- Charts: chart.js, react-chartjs-2
- Linting: ESLint
- Bundler: Vite

## Getting Started

### Prerequisites

- Node.js (>=18.x)
- npm (>=9.x) or Yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/FreshDealBusinessWebsite.git
cd FreshDealBusinessWebsite

# Install dependencies
npm install
# or
yarn install
```

### Running the App

```bash
npm run dev
# or
yarn dev
```

The development server will start at `http://localhost:5173` by default.

## Environment Configuration

By default, the app uses the base API URL defined in `src/redux/Api/apiService.ts`:

```ts
export const API_BASE_URL = 'https://freshdealbackend.azurewebsites.net/v1';
```

To point to a local or alternative backend, update that constant or create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/v1
```

And reference it in `vite.config.ts` or your API service.

## Project Structure

```
src/
├── AppWithMaps.tsx          # Root app wrapper
├── main.tsx                # Application entry
├── components/             # Reusable UI components and routing
│   ├── AppRoutes.tsx
│   ├── AuthMiddleware.tsx
│   └── RouteGuards.tsx
├── feature/                # Feature-based directories (Landing, Login, Dashboard, etc.)
├── redux/                  # Redux store, slices, thunks, and RTK Query APIs
│   ├── store.ts
│   ├── Api/                # API service definitions using Axios
│   ├── slices/             # Redux slices
│   └── thunks/             # Asynchronous thunks
├── services/               # Helper services (e.g., notifications)
├── utils/                  # Utility functions (e.g., debounce)
└── assets/                 # Static assets (images, icons)
```

## API Integration

All server communication is handled via Axios. Authentication tokens are stored in `localStorage` and sent in headers automatically. Example API modules are in `src/redux/Api/`:

- `userApi.ts` for login, register, logout
- `restaurantApi.ts` for restaurant CRUD
- `listingsApi.ts` for flash deals
- `NotificationApi.ts` for notifications

## Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Serve the `dist/` folder using a static server or deploy to platforms like Azure Static Web Apps, Netlify, or Vercel.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a pull request

Please follow existing code style and include tests for new functionality.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

