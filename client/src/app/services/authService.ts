// import { api } from "./api";

// export interface LoginResponse {
//   token: string;
//   user: {
//     id: number;
//     name: string;
//     email: string;
//     role: "ADMIN" | "AUDITOR";
//   };
// }

// export const authService = {
//   login: async (email: string, password: string): Promise<LoginResponse> => {
//     const res = await api.post<LoginResponse>("/auth/login", {
//       email,
//       password,
//     });
//     return res.data;
//   },

//   register: async (
//     name: string,
//     email: string,
//     password: string,
//     role: "ADMIN" | "AUDITOR",
//   ): Promise<LoginResponse> => {
//     const res = await api.post<LoginResponse>("/auth/register", {
//       name,
//       email,
//       password,
//       role,
//     });
//     return res.data;
//   },
// };
import { api } from './api';

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'AUDITOR';
  };
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return res.data;
  },

  // Public registration always creates an AUDITOR
  register: async (
    name: string,
    email: string,
    password: string,
  ): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/auth/register', {
      name,
      email,
      password,
    });
    return res.data;
  },
};