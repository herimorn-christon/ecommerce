# Tanfish Market E-commerce

## Key Features

### Wishlist Functionality

The application includes a local-first wishlist functionality where users can:

- Add/remove products to/from their wishlist
- View all wishlist items on a dedicated page
- Add wishlist items directly to cart
- Data persists across browser sessions using Redux Persist

See [WISHLIST.md](./WISHLIST.md) for detailed documentation.

### Payment Flow

The checkout and payment process follows these steps:

1. Cart → Checkout: Enter shipping information
2. Checkout → Payment: Process mobile money payment
3. Payment → Order Confirmation: Complete order and view details

The payment system integrates with Azampay for mobile money transactions and uses WebSockets for real-time payment notifications.

See [PAYMENT_FLOW.md](./PAYMENT_FLOW.md) for detailed documentation.

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

### SPA Routing on Firebase

The application uses client-side routing with React Router. Special configuration has been added to ensure routes like `/privacy-policy` work properly when accessed directly:

- Configured Firebase routing with proper `rewrites` and `cleanUrls` settings
- Added SPA redirect script in index.html
- Created 404.html page with redirect logic for direct route access
- Added \_redirects file for additional route handling

To deploy with these SPA routing fixes, use the enhanced deployment script: `npm run deploy`
