import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: number | string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile?: {
    id: number | string;
    subscription_active: boolean;
    link_limit: number;
    is_admin: boolean;
  } | null;
};

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
};

const initialState: AuthState = {
  user: null,
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.isLoading = false;
    },
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;
