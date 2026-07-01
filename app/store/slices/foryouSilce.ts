// store/slices/forYouSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ForYouState {
  lead: any;  // Replace `any` with your lead type if you have it
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ForYouState = {
  lead: {},
  status: 'idle',
  error: null,
};

const forYouSlice = createSlice({
  name: 'foryou',
  initialState,
  reducers: {
    setLead: (state, action: PayloadAction<any>) => {
      state.lead = action.payload;
      state.status = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    // Additional async actions if any
  },
});

export const { setLead } = forYouSlice.actions;  // Export the action
export default forYouSlice.reducer;
