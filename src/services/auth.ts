import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../lib/supabase';

// Necessário para o fluxo de autenticação funcionar corretamente
WebBrowser.maybeCompleteAuthSession();

export const authService = {
  /**
   * Inicia o fluxo de autenticação com Google
   */
  async signInWithGoogle() {
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'sprintzone',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === 'success') {
          const { url } = result;

          // Extrair tokens do hash fragment (após #)
          const hashFragment = url.split('#')[1];
          if (!hashFragment) {
            return { data: null, error: new Error('Hash fragment não encontrado') };
          }

          const params = new URLSearchParams(hashFragment);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (sessionError) throw sessionError;
            return { data: sessionData, error: null };
          }

          return { data: null, error: new Error('Tokens não encontrados') };
        }
      }

      return { data: null, error: new Error('Autenticação cancelada') };
    } catch (error) {
      return { data: null, error };
    }
  },

  /**
   * Faz logout do usuário
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      return { error };
    }
  },

  /**
   * Obtém a sessão atual do usuário
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { data: data.session, error: null };
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return { data: null, error };
    }
  },

  /**
   * Obtém o usuário atual
   */
  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { data: data.user, error: null };
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return { data: null, error };
    }
  },
};
