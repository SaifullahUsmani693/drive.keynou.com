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
};

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
