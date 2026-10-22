```tsx
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

const supabase = createClient(
  'https://uquzxwmxiohngonannvf.supabase.co',
  'sb_publishable_mijIGdgu47bUf0d04lmf3g_8aD3yRq6'
);

const KEYS = [
  'lav_digital_cards_v1',
  'lav_digital_clients_v1',
  'lav_digital_templates_v1',
  'lav_digital_settings_v1',
];

function isPublicCardRoute() {
  const { hash, pathname, search } = window.location;
  return hash.includes('card=') || hash.startsWith('#/c/') ||
    pathname.startsWith('/c/') || search.includes('card=');
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError('No se pudo iniciar sesión. Revisa tu correo y contraseña.');
    }

    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
      <form onSubmit={signIn} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4">
        <h1 className="text-xl font-bold">LAV Digital Marketing</h1>
        <p className="text-sm text-slate-400">
          Inicia sesión para acceder a tus tarjetas y sincronizar tus datos entre dispositivos.
        </p>
        <label className="block text-sm">
          Correo electrónico
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 p-3"
          />
        </label>
        <label className="block text-sm">
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 p-3"
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 p-3 font-semibold disabled:opacity-60"
        >
          {busy ? 'Conectando…' : 'Iniciar sesión'}
        </button>
      </form>
    </main>
  );
}

function Root() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isPublicCardRoute()) {
      setLoading(false);
      return;
    }

    let active = true;
    let originalSetItem: typeof Storage.prototype.setItem | null = null;

    async function initialize(nextSession: Session | null) {
      if (!active) return;

      setSession(nextSession);
      if (!nextSession) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const userId = nextSession.user.id;

        const { data: rows, error: readError } = await supabase
          .from('lav_app_data')
          .select('id,data')
          .eq('user_id', userId);

        if (readError) throw readError;

        const cloud = new Map((rows || []).map((row) => [row.id, row.data]));

        for (const key of KEYS) {
          const id = `${userId}:${key}`;

          if (cloud.has(id)) {
            localStorage.setItem(key, JSON.stringify(cloud.get(id)));
          }
        }

        originalSetItem = Storage.prototype.setItem;

        Storage.prototype.setItem = function (key: string, value: string) {
          originalSetItem!.call(this, key, value);

          if (this !== window.localStorage || !KEYS.includes(key)) return;

          void supabase
            .from('lav_app_data')
            .upsert({
              id: `${userId}:${key}`,
              user_id: userId,
              data: JSON.parse(value),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' })
            .then(({ error: saveError }) => {
              if (saveError) console.error('Error al sincronizar:', saveError.message);
            });
        };
      } catch (err) {
        console.error(err);
        if (active) {
          setError('No se pudieron cargar los datos de la nube. Revisa la configuración de Supabase.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) {
        setError('No se pudo verificar la sesión.');
        setLoading(false);
      } else {
        void initialize(data.session);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        void initialize(nextSession);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
      if (originalSetItem) Storage.prototype.setItem = originalSetItem;
    };
  }, []);

  if (isPublicCardRoute()) return <App />;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Conectando con Supabase…
      </div>
    );
  }

  if (!session || error) {
    return (
      <>
        {error && <p className="bg-red-950 text-red-200 p-3 text-center">{error}</p>}
        <Login />
      </>
    );
  }

  return (
    <>
      <App />
      <button
        onClick={() => { void supabase.auth.signOut(); }}
        className="fixed bottom-3 right-3 z-[100] rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
      >
        Cerrar sesión
      </button>
    </>
  );
}

registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<Root />);
```

