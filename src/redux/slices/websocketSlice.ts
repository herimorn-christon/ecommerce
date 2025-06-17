import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WebSocketState {
  isConnected: boolean;
  lastError: string | null;
  reconnectAttempts: number;
}

const initialState: WebSocketState = {
  isConnected: false,
  lastError: null,
  reconnectAttempts: 0,
};

const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload;
      if (action.payload) {
        state.lastError = null;
        state.reconnectAttempts = 0;
      }
    },
    setError(state, action: PayloadAction<string>) {
      state.lastError = action.payload;
    },
    incrementReconnectAttempts(state) {
      state.reconnectAttempts += 1;
    },
    resetState() {
      return initialState;
    },
  },
});

export const {
  setConnected,
  setError,
  incrementReconnectAttempts,
  resetState,
} = websocketSlice.actions;

export default websocketSlice.reducer;
