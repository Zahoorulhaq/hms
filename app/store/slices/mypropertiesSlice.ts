import { createSlice } from '@reduxjs/toolkit';

const myPropertiesSlice = createSlice({
  name: 'myProperties',
  initialState: {
    isLoading: false,
    statsData: {},
    statsCount: null,
    statsLoading: true,
  },
  reducers: {
    setStatsData: (state, action: any) => {
      state.statsData = action.payload;
      state.statsLoading = false;
      state.statsCount = action.payload?.reduce((sum, item) => sum + (item?.count || 0), 0);
    },
  },
  extraReducers: (builder) => {
    // Additional async actions if any
  },
});

export const { setStatsData } = myPropertiesSlice.actions; // Export the action
export default myPropertiesSlice.reducer;
