import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const localDevelopmentOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];
const allowedOrigins = [...new Set([
  ...localDevelopmentOrigins,
  ...(Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean),
])];

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow all Vercel deployment URLs (*.vercel.app) and Cloudflare Pages (*.pages.dev)
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/[a-z0-9-]+\.pages\.dev$/i.test(origin)) return true;
  return false;
}

function respond(body: Record<string, unknown>, status: number, origin: string | null) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (origin && isOriginAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify(body), { status, headers });
}

Deno.serve(async (request) => {
  const origin = request.headers.get('Origin');

  if (request.method === 'OPTIONS') {
    if (!origin || !isOriginAllowed(origin)) return new Response(null, { status: 403 });
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Vary': 'Origin',
      },
    });
  }

  if (request.method !== 'POST') return respond({ error: 'Method not allowed.' }, 405, origin);
  if (origin && !isOriginAllowed(origin)) return respond({ error: 'Origin not allowed.' }, 403, origin);
  if (!supabaseUrl || !anonKey || !serviceRoleKey || allowedOrigins.length === 0) {
    return respond({ error: 'Account provisioning is not configured.' }, 503, origin);
  }

  const authorization = request.headers.get('Authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return respond({ error: 'Authentication required.' }, 401, origin);

  try {
    const callerClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: authError } = await callerClient.auth.getUser(token);
    if (authError || !userData.user) return respond({ error: 'Authentication required.' }, 401, origin);

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: profile, error: profileError } = await serviceClient
      .from('profiles')
      .select('role, is_active')
      .eq('id', userData.user.id)
      .single();
    if (profileError || profile?.role !== 'admin' || !profile.is_active) {
      return respond({ error: 'Administrator access required.' }, 403, origin);
    }

    const bodyText = await request.text();
    if (bodyText.length > 8192) return respond({ error: 'Request too large.' }, 413, origin);

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return respond({ error: 'Invalid request body.' }, 400, origin);
    }

    const action = body.action ?? 'create';
    const password = typeof body.password === 'string' ? body.password : '';
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const companyName = typeof body.companyName === 'string' ? body.companyName.trim() : '';
    const role = body.role;

    if (action === 'set-active') {
      const userId = typeof body.userId === 'string' ? body.userId : '';
      const isActive = body.isActive;
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) ||
        typeof isActive !== 'boolean'
      ) {
        return respond({ error: 'Invalid customer account status request.' }, 400, origin);
      }

      const { data: targetAuth, error: targetAuthError } = await serviceClient.auth.admin.getUserById(userId);
      if (targetAuthError || !targetAuth.user) return respond({ error: 'Account not found in Supabase Auth.' }, 404, origin);

      const { data: targetProfile, error: targetProfileError } = await serviceClient
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .single();
      if (targetProfileError || !targetProfile) return respond({ error: 'Account profile not found.' }, 404, origin);
      if (targetProfile.role !== 'customer') {
        return respond({ error: 'Only customer accounts can be deactivated from this screen.' }, 409, origin);
      }

      const { data: updatedProfile, error: updateError } = await serviceClient
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select('id, email, role, full_name, company_name, is_active, created_at')
        .single();
      if (updateError || !updatedProfile) return respond({ error: 'Could not update the customer account status.' }, 500, origin);

      return respond({
        profile: {
          id: updatedProfile.id,
          email: updatedProfile.email,
          role: updatedProfile.role,
          isActive: updatedProfile.is_active,
          fullName: updatedProfile.full_name,
          companyName: updatedProfile.company_name,
          createdAt: updatedProfile.created_at,
        },
      }, 200, origin);
    }

    if (action === 'update') {
      const userId = typeof body.userId === 'string' ? body.userId : '';
      if (
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId) ||
        !fullName || fullName.length > 120 || companyName.length > 160 ||
        (role !== 'admin' && role !== 'customer')
      ) {
        return respond({ error: 'Invalid account details.' }, 400, origin);
      }

      const { data: targetAuth, error: targetAuthError } = await serviceClient.auth.admin.getUserById(userId);
      if (targetAuthError || !targetAuth.user) return respond({ error: 'Account not found in Supabase Auth.' }, 404, origin);

      const { data: targetProfile, error: targetProfileError } = await serviceClient
        .from('profiles')
        .select('id, email, role, is_active')
        .eq('id', userId)
        .single();
      if (targetProfileError || !targetProfile) return respond({ error: 'Account profile not found.' }, 404, origin);

      if (targetProfile.role === 'admin' && role === 'customer') {
        if (userId === userData.user.id) {
          return respond({ error: 'You cannot change your own admin role.' }, 409, origin);
        }

        const { count, error: countError } = await serviceClient
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'admin');
        if (countError) return respond({ error: 'Could not verify the remaining admin accounts.' }, 500, origin);
        if ((count ?? 0) <= 1) return respond({ error: 'The last admin account cannot be changed to customer.' }, 409, origin);
      }

      const previousMetadata = targetAuth.user.user_metadata ?? {};
      const { error: metadataError } = await serviceClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...previousMetadata,
          full_name: fullName,
          company_name: companyName || null,
        },
      });
      if (metadataError) {
        return respond({ error: 'Could not update Auth user details; the profile was not changed.' }, 500, origin);
      }

      const { data: updatedProfile, error: updateError } = await serviceClient
        .from('profiles')
        .update({ role, full_name: fullName, company_name: companyName || null })
        .eq('id', userId)
        .select('id, email, role, full_name, company_name, created_at')
        .single();
      if (updateError || !updatedProfile) {
        const { error: rollbackError } = await serviceClient.auth.admin.updateUserById(userId, {
          user_metadata: previousMetadata,
        });
        return respond({
          error: rollbackError
            ? 'Profile update failed; Auth details may not have been restored. Check both records before retrying.'
            : 'Could not update the account profile. Auth user details were restored.',
        }, 500, origin);
      }

      return respond({
        profile: {
          id: updatedProfile.id,
          email: updatedProfile.email,
          role: updatedProfile.role,
          fullName: updatedProfile.full_name,
          companyName: updatedProfile.company_name,
          createdAt: updatedProfile.created_at,
        },
      }, 200, origin);
    }

    if (action !== 'create') return respond({ error: 'Unsupported account action.' }, 400, origin);

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      password.length < 12 || password.length > 128 ||
      !fullName || fullName.length > 120 ||
      companyName.length > 160 ||
      (role !== 'admin' && role !== 'customer')
    ) {
      return respond({ error: 'Invalid account details. Check field lengths and password requirements.' }, 400, origin);
    }

    const { data: created, error: createError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, company_name: companyName || null },
    });
    if (createError || !created.user) {
      return respond({ error: 'The account could not be created. Check whether this email is already registered.' }, 400, origin);
    }

    const { data: createdProfile, error: updateError } = await serviceClient
      .from('profiles')
      .upsert({
        id: created.user.id,
        email: created.user.email,
        role,
        full_name: fullName,
        company_name: companyName || null,
      }, { onConflict: 'id' })
      .select('id, email, role, full_name, company_name, created_at')
      .single();

    if (updateError || !createdProfile) {
      await serviceClient.from('profiles').delete().eq('id', created.user.id);
      await serviceClient.auth.admin.deleteUser(created.user.id);
      return respond({ error: 'Profile synchronization failed. The new account was rolled back; verify the profiles table and service-role access before retrying.' }, 500, origin);
    }

    return respond({
      profile: {
        id: createdProfile.id,
        email: createdProfile.email,
        role: createdProfile.role,
        fullName: createdProfile.full_name,
        companyName: createdProfile.company_name,
        createdAt: createdProfile.created_at,
      },
    }, 201, origin);
  } catch {
    return respond({ error: 'Account provisioning failed.' }, 500, origin);
  }
});