// store/slices/uiSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import http from "@/server/http";

interface UiState {
  rentPrices: number[];
  salePrices: number[];
  area: number[];
  showBetterAsk: boolean;
}

const initialState: UiState = {
  rentPrices: [
    20000, 30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000, 110000,
    120000, 130000, 140000, 150000, 160000, 170000, 180000, 190000, 200000,
    225000, 250000, 275000, 300000, 350000, 400000, 500000, 750000, 1000000
  ],
  salePrices: [
    300000, 400000, 500000, 600000, 700000, 800000, 900000, 1100000, 1200000,
    1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000,
    2100000, 2200000, 2300000, 2400000, 2500000, 2600000, 2700000, 2800000,
    2900000, 3000000, 3250000, 3500000, 3750000, 4000000, 4250000, 4500000,
    5000000, 6000000, 7000000, 8000000, 9000000, 10000000, 25000000, 50000000
  ],
  area: [
    500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700,
    1800, 1900, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800,
    4200, 4600, 5000, 5400, 5800, 6200, 6600, 7000, 7800, 8200, 9000
  ],
  showBetterAsk: true
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setShowBetterAsk: (state, action: PayloadAction<boolean>) => {
      state.showBetterAsk = action.payload;
    },
    toggleBetterAsk: (state) => {
      state.showBetterAsk = !state.showBetterAsk;
    }
  },
  extraReducers: (builder) => {}
});

export const { setShowBetterAsk, toggleBetterAsk } = uiSlice.actions;
export default uiSlice.reducer;
