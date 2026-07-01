import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ShowReminders {
    showReminders:  boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ShowReminders = {
    showReminders: false,
    status: 'idle',
    error: null,
};

const showRemindersSlice = createSlice({
    name: 'showReminder',
    initialState,
    reducers: {

        setShowReminders: (state, action: PayloadAction<any>) => {
            state.showReminders = action.payload;
            state.status = 'succeeded';
        },
    },
    extraReducers: (builder) => {
        // Additional async actions if any
    },
});

export const { setShowReminders } = showRemindersSlice.actions;  // Export the action
export default showRemindersSlice.reducer;
