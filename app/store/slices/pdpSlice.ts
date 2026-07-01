// store/slices/forYouSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PdpState {
    pdpData: any;  // Replace `any` with your lead type if you have it
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: PdpState = {
    pdpData: {},
    status: 'idle',
    error: null,
};

const pdpSlice = createSlice({
    name: 'pdp',
    initialState,
    reducers: {
        setPdp: (state, action: PayloadAction<any>) => {
            state.pdpData = action.payload;
            state.status = 'succeeded';
        },
    },
    extraReducers: (builder) => {
        // Additional async actions if any
    },
});

export const { setPdp } = pdpSlice.actions;
export default pdpSlice.reducer;
