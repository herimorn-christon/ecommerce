# Tanfish Market E-commerce

## Environment Variables

The application uses different API endpoints depending on the environment:

- Development: Uses `https://fishmarket.juafaida.com` (default)
- Production: Uses `https://engine.tanfishmarket.com`

### Available Environment Variables

- `VITE_API_BASE_URL`: Single base URL for all API services

### Building for Different Environments

- Development build: `npm run dev` or `npm run build`
- Production build: `npm run build:prod`

When running `npm run build:prod`, the application will automatically use the production URLs defined in `.env.production`.

### Deployment

The application is configured to deploy to Firebase Hosting. Here's how to deploy:

- Run `npm run deploy` - This will build the production version and deploy to Firebase
- Firebase will use the production environment variables defined in `.env.production`

This ensures that the production version with the correct API endpoint (`https://engine.tanfishmarket.com`) is deployed to Firebase.
