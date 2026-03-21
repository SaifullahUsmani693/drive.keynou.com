import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: number | string;
  email?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  is_superuser?: boolean;
  profile?: {
    id: number | string;
    subscription_active: boolean;
    subscription_tier?: "free" | "limited" | "custom" | "unlimited";
    link_limit: number;
    subscription_expires_at?: string | null;
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
