// store/slices/forYouSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ForYouState {
    feedbackStatus: boolean;  // Replace `any` with your lead type if you have it
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ForYouState = {
    feedbackStatus: false,
    status: 'idle',
    error: null,
};

const feedbackSlice = createSlice({
    name: 'feedbackStatus',
    initialState,
    reducers: {
        setFeedbackStatus: (state, action: PayloadAction<any>) => {
            state.feedbackStatus = action.payload;
            state.status = 'succeeded';
        },
    },
    extraReducers: (builder) => {
        // Additional async actions if any
    },
});

export const { setFeedbackStatus } = feedbackSlice.actions;  // Export the action
export default feedbackSlice.reducer;
