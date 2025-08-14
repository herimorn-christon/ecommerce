# Tanfish Market E-commerce - AI Coding Instructions

## Project Architecture

This is a **multi-role marketplace** (users, sellers, transporters) built with React 18 + TypeScript + Vite. The app uses Redux Toolkit with persistence for state management and integrates real-time payment processing via WebSockets.

### Key Design Patterns

- **Role-based layouts**: Users flow through standard pages, while sellers/transporters have dedicated dashboard layouts (`SellerLayout`, `TransporterLayout`)
- **Redux persistence**: Only `auth`, `cart`, `wishlist`, and `address` slices persist across sessions
- **Service layer separation**: All API calls go through dedicated service files in `src/services/`
- **Component organization**: Domain-specific folders (`auth/`, `cart/`, `checkout/`, `payment/`, `products/`)

## Core Business Logic

### Transportation Fees System

The most complex feature is **dynamic transportation fee calculation**:

- Transporters configure routes with starting/destination points, pricing, and delivery types (standard/express)
- Checkout intelligently matches customer delivery preferences with transporter offerings
- Fallback logic: exact match (destination + type) → destination only → first available route
- Key files: `CheckoutForm.tsx`, `TransporterSelect.tsx`, `TransporterProfileEditPage.tsx`

### Payment Flow Architecture

Three-stage process with WebSocket integration:

1. **Checkout** → saves data to localStorage, redirects to payment
2. **Payment** → initiates Azampay via `/v1/azampay/checkout`, listens for WebSocket callbacks
3. **Confirmation** → creates order via `/v1/orders`, clears cart

Critical: Payment status tracking uses both WebSocket events (`azampayCallback`) and polling fallback.

## Development Commands

```bash
# Development with hot reload
npm run dev

# Production build (uses .env.production)
npm run build:prod

# Deploy to Firebase (builds prod + deploys)
npm run deploy
```

## Environment Configuration

- **Development**: `https://fishmarket.juafaida.com` (default)
- **Production**: `https://engine.tanfishmarket.com` (via `.env.production`)
- **WebSocket**: Auto-converts HTTP base URL to WebSocket protocol

## Critical TypeScript Patterns

### Fee Calculation Pattern

```typescript
// Priority matching in transportation fees
let applicableFee = transporter.transportationFees.find(
  (fee) =>
    fee.destination.toLowerCase() === destinationCity.toLowerCase() &&
    fee.transportationType === deliveryOption
);
// Fallback logic follows...
```

### Redux Slice Convention

```typescript
// All slices follow this async thunk pattern
export const fetchData = createAsyncThunk(
  "sliceName/fetchData",
  async (params, { rejectWithValue }) => {
    // Service call with error handling
  }
);
```

## UI/UX Standards

- **Design**: Use Tailwind CSS classes, make interfaces "production-worthy, not cookie cutter"
- **Icons**: Exclusively from `lucide-react` (already installed)
- **Toast notifications**: `react-hot-toast` for user feedback
- **Loading states**: Always implement for async operations
- **Responsive**: Mobile-first approach with `md:` breakpoints

## Integration Points

- **Authentication**: JWT tokens in localStorage, interceptor in `api.ts` adds Bearer headers
- **WebSocket**: Singleton service (`webSocketService.ts`) for real-time payment notifications
- **Firebase**: SPA routing configured with rewrites and 404 redirect handling
- **Redux DevTools**: Configured with serializable check ignoring persist actions

## Common Pitfalls

- **Transportation fees**: Always check for type matching before destination-only fallback
- **Payment flow**: Ensure WebSocket connection before payment initiation
- **Routing**: Use role-specific layouts for seller/transporter pages
- **State persistence**: Only add new slices to whitelist if they need to persist
- **API calls**: Use service layer, don't call axios directly from components

When modifying transportation fees, update both the calculation logic AND the UI display components to maintain consistency.
