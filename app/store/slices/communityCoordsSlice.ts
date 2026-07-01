import { createSlice } from '@reduxjs/toolkit';

interface CommunityCoordsState {
  id: string | null;
  latitude: number | null;
  longitude: number | null;
}

const initialState: CommunityCoordsState = {
  id: null,
  latitude: null,
  longitude: null,
};

const communityCoordsSlice = createSlice({
  name: 'communityCoords',
  initialState,
  reducers: {
    setCommunityCoords: (state, action) => {
      state.id = action.payload.id;
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
    },
    clearCommunityCoords: (state) => {
      state.id = null;
      state.latitude = null;
      state.longitude = null;
    },
  },
});

export const { setCommunityCoords, clearCommunityCoords } = communityCoordsSlice.actions;
export default communityCoordsSlice.reducer; 