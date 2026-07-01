// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import http from '@/server/https';
import storage from '@/utils/storage';
interface AuthState {
  assetId: string;
  assetSlug: string;
  applicableDate: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  verificationToken: string | '';
  createPasswordToken: string | '';
  verificationEmail: string | '';
  subjectType: string | 'agent';
  pin: string | '';
}

const initialState: any = {
  assetId: storage.getItem('assetId') || '',
  assetSlug: storage.getItem('assetSlug') || '',
  applicableDate: '',
  status: 'idle',
  error: null,
  verificationToken: '',
  verificationEmail: '',
  createPasswordToken: '',
  subjectType: 'agent',
  pin: '',
  user: null,
  isLoading: true,
};

export const fetchUserBySlugAPI = createAsyncThunk(
  'assets/slug',
  async (slug: string, thunkAPI) => {
    try {
      const response = await http.get(`/assets/slug?slug=${slug}`);
      localStorage.setItem('asset', JSON.stringify(response.data.data));
      return response.data.data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Fetching Slug Failed');
    }
  }
);



const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setVerificationData: (state, action: PayloadAction<any>) => {
      state.verificationToken = action.payload.accessToken;
      state.verificationEmail = action.payload.email;
      state.subjectType = action.payload.subjectType;
    },
    setCreatePasswordToken: (state, action: PayloadAction<any>) => {
      state.createPasswordToken = action.payload;
    },
    setPin: (state, action: PayloadAction<any>) => {
      state.pin = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
    },
    fetchUserBySlug: (state) => {
      const assetId = storage.getItem('assetId');
      const assetSlug = storage.getItem('assetSlug');
      state.assetId = `${assetId}`;
      state.assetSlug = `${assetSlug}`;
      state.status = 'succeeded';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserBySlugAPI.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserBySlugAPI.fulfilled, (state, action) => {
        state.assetId = action.payload._id;
        state.applicableDate = action.payload?.settings?.applicableDate;
        state.status = 'succeeded';
      })
      .addCase(fetchUserBySlugAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});
export const { setVerificationData, setCreatePasswordToken, setPin, fetchUserBySlug, setUser } =
  authSlice.actions;
export default authSlice.reducer;
