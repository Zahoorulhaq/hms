// store/slices/forYouSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ShowAllActivities {
    showAllActivities: boolean;  // Replace `any` with your lead type if you have it
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ShowAllActivities = {
    showAllActivities: false,
    status: 'idle',
    error: null,
};

const showAllActivitiesSlice = createSlice({
    name: 'showAllActivities',
    initialState,
    reducers: {
        setShowAllActivities: (state, action: PayloadAction<any>) => {
            state.showAllActivities = action.payload;
            state.status = 'succeeded';
        },
    },
    extraReducers: (builder) => {
        // Additional async actions if any
    },
});

export const { setShowAllActivities } = showAllActivitiesSlice.actions;  // Export the action
export default showAllActivitiesSlice.reducer;
