/**
 * Service API pour l'authentification
 */
import { apiSlice } from '../../store/api/apiSlice';

export interface LoginRequest {
  email: string;
  password: string;
  type_utilisateur: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    type_utilisateur: string;
    entreprise_nom?: string;
    avatar?: string;
    theme_interface: string;
    langue: string;
    mfa_actif: boolean;
    points_experience: number;
    niveau: number;
    badges: any[];
  };
  permissions: string[];
  message: string;
}

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  type_utilisateur: string;
  telephone: string;
  password: string;
  confirm_password: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: 'auth/register/',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation<{ message: string }, { refresh: string }>({
      query: (data) => ({
        url: 'auth/logout/',
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query<LoginResponse['user'], void>({
      query: () => 'auth/profile/',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<LoginResponse['user'], Partial<LoginResponse['user']>>({
      query: (updates) => ({
        url: 'auth/profile/update/',
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['User'],
    }),
    enableMFA: builder.mutation<{ qr_code_url: string; codes_recuperation: string[] }, void>({
      query: () => ({
        url: 'auth/mfa/enable/',
        method: 'POST',
      }),
    }),
    verifyMFA: builder.mutation<{ message: string }, { code: string }>({
      query: (data) => ({
        url: 'auth/mfa/verify/',
        method: 'POST',
        body: data,
      }),
    }),
    getSessions: builder.query<any[], void>({
      query: () => 'auth/sessions/',
      providesTags: ['Session'],
    }),
    terminateSession: builder.mutation<{ message: string }, string>({
      query: (sessionId) => ({
        url: `auth/sessions/${sessionId}/terminate_session/`,
        method: 'POST',
      }),
      invalidatesTags: ['Session'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useEnableMFAMutation,
  useVerifyMFAMutation,
  useGetSessionsQuery,
  useTerminateSessionMutation,
} = authApi;