import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import addressReducer from "./slices/addressSlice";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/ordersSlice";
import payoutReducer from "./slices/payoutSlice";
import productsReducer from "./slices/productsSlice";
import sellerReducer from "./slices/sellerSlice";
import transporterReducer from "./slices/transporterSlice";
import websocketReducer from "./slices/websocketSlice";
import wishlistReducer from "./slices/wishlistSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "cart", "wishlist", "address"], // Only persist these reducers
};

const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  websocket: websocketReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  orders: ordersReducer,
  address: addressReducer,
  seller: sellerReducer,
  payouts: payoutReducer,
  transporter: transporterReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
