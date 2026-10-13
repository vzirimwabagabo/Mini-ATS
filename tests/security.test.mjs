import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const authSource = await readFile(new URL('../src/context/AuthContext.tsx', import.meta.url), 'utf8');
const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
const lifecycleMigration = await readFile(new URL('../supabase/migrations/20261012000100_customer_account_lifecycle.sql', import.meta.url), 'utf8');
const adminFunction = await readFile(new URL('../supabase/functions/admin-create-account/index.ts', import.meta.url), 'utf8');
const adminModal = await readFile(new URL('../src/components/AdminAccountModal.tsx', import.meta.url), 'utf8');
const footerSource = await readFile(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8');
const loginView = await readFile(new URL('../src/components/LoginView.tsx', import.meta.url), 'utf8');
const appSource = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8');
const jobListSource = await readFile(new URL('../src/components/JobListModal.tsx', import.meta.url), 'utf8');
const jobModalSource = await readFile(new URL('../src/components/JobModal.tsx', import.meta.url), 'utf8');
const candidateDetailSource = await readFile(new URL('../src/components/CandidateDetailDrawer.tsx', import.meta.url), 'utf8');
const candidateModalSource = await readFile(new URL('../src/components/CandidateModal.tsx', import.meta.url), 'utf8');
const storageSource = await readFile(new URL('../src/lib/storage.ts', import.meta.url), 'utf8');
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const parserSource = await readFile(new URL('../src/lib/cvParser.ts', import.meta.url), 'utf8');
const safeUrlSource = await readFile(new URL('../src/lib/safeExternalUrl.ts', import.meta.url), 'utf8');
const functionErrorSource = await readFile(new URL('../src/lib/functionError.ts', import.meta.url), 'utf8');
const themeStyles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8');
const clientAiSources = await Promise.all([
  '../src/components/CandidateModal.tsx',
  '../src/components/CandidateDetailDrawer.tsx',
  '../src/lib/aiAssessment.ts',
  '../src/lib/cvStructure.ts',
  '../src/context/AuthContext.tsx',
  '../src/components/LoginView.tsx',
  '../src/components/AdminAccountModal.tsx',
].map((path) => readFile(new URL(path, import.meta.url), 'utf8')));
const parserJs = ts.transpileModule(parserSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const parserUrl = `data:text/javascript;base64,${Buffer.from(parserJs).toString('base64')}`;
const { extractTextFromFile } = await import(parserUrl);
const safeUrlJs = ts.transpileModule(safeUrlSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const safeUrlUrl = `data:text/javascript;base64,${Buffer.from(safeUrlJs).toString('base64')}`;
const { safeExternalUrl } = await import(safeUrlUrl);
const functionErrorJs = ts.transpileModule(functionErrorSource, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const functionErrorUrl = `data:text/javascript;base64,${Buffer.from(functionErrorJs).toString('base64')}`;
const { getFunctionErrorMessage } = await import(functionErrorUrl);

test('configured cloud login cannot fall through to local profiles', () => {
  const cloudLoginStart = authSource.indexOf('if (getSupabaseConfig().isConfigured)');
  const localLoginStart = authSource.indexOf('// Check stored profiles', cloudLoginStart);
  assert.notEqual(cloudLoginStart, -1);
  assert.notEqual(localLoginStart, -1);
  const cloudLogin = authSource.slice(cloudLoginStart, localLoginStart);
  assert.match(cloudLogin, /return false/);
  assert.doesNotMatch(cloudLogin, /getStoredProfiles|createNewAccount/);
});

test('RLS policies scope cloud data to authenticated owners or admins', () => {
  assert.match(schema, /FOR SELECT TO authenticated[\s\S]*?id = \(SELECT auth\.uid\(\)\) AND is_active\) OR public\.is_admin\(\)/);
  assert.match(schema, /CREATE POLICY "Jobs tenant access"[\s\S]*?customer_id = \(SELECT auth\.uid\(\)\) AND public\.is_active_user\(\)/);
  assert.match(schema, /CREATE POLICY "Candidates tenant access"[\s\S]*?public\.is_active_user\(\)[\s\S]*?jobs\.customer_id = candidates\.customer_id/);
  assert.doesNotMatch(schema, /CREATE POLICY[^;]+USING\s*\(true\)/i);
  assert.match(schema, /'customer'[\s\S]*?ON CONFLICT \(id\) DO NOTHING/);
});

test('CV files over 10 MiB are rejected before extraction', async () => {
  const file = new File(['x'.repeat(10 * 1024 * 1024 + 1)], 'oversized.txt', {
    type: 'text/plain',
  });
  const result = await extractTextFromFile(file);
  assert.equal(result.text, '');
  assert.match(result.error, /10 MB upload limit/);
});

test('browser workflows do not read or bundle third-party API keys or demo passwords', () => {
  const clientSource = clientAiSources.join('\n');
  assert.doesNotMatch(clientSource, /ats_gemini_key|VITE_GEMINI_API_KEY/);
  assert.doesNotMatch(clientSource, /password123/);
});

test('candidate links allow only credential-free HTTPS URLs', () => {
  assert.equal(safeExternalUrl('https://example.com/profile'), 'https://example.com/profile');
  assert.equal(safeExternalUrl('javascript:alert(1)'), undefined);
  assert.equal(safeExternalUrl('data:text/html,<script>alert(1)</script>'), undefined);
  assert.equal(safeExternalUrl('https://user:pass@example.com'), undefined);
  assert.equal(safeExternalUrl('http://example.com'), undefined);
});

test('admin account provisioning verifies JWT and admin role before using Auth Admin API', () => {
  const jwtCheck = adminFunction.indexOf('auth.getUser');
  const roleCheck = adminFunction.indexOf("profile?.role !== 'admin'");
  const createUser = adminFunction.indexOf('auth.admin.createUser');
  assert.ok(jwtCheck >= 0 && jwtCheck < roleCheck && roleCheck < createUser);
  assert.match(adminFunction, /auth\.getUser\(token\)/);
  assert.match(adminFunction, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(clientAiSources.join('\n'), /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(adminFunction, /\.upsert\(/);
  assert.match(adminFunction, /from\('profiles'\)\.delete\(\)\.eq\('id', created\.user\.id\)/);
  assert.match(adminFunction, /new Response\(null, \{\s*status: 204/);
  assert.doesNotMatch(adminFunction, /respond\(\{\}, 204/);
  for (const origin of [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
  ]) {
    assert.ok(adminFunction.includes(origin), `missing local origin ${origin}`);
  }
});

test('account creation surfaces the Edge Function error response safely', async () => {
  const responseError = await getFunctionErrorMessage({
    message: 'Edge Function returned a non-2xx status code',
    context: new Response(JSON.stringify({ error: 'Administrator access required.' }), { status: 403 }),
  });
  assert.equal(responseError, 'Administrator access required.');

  const malformedError = await getFunctionErrorMessage({
    context: new Response('not json', { status: 503 }),
  });
  assert.equal(malformedError, 'Account request failed with HTTP 503.');
});

test('admin account editing validates Auth targets and prevents demoting the signed-in or last admin', () => {
  assert.match(adminFunction, /action === 'update'/);
  assert.match(adminFunction, /auth\.admin\.getUserById\(userId\)/);
  assert.match(adminFunction, /You cannot change your own admin role/);
  assert.match(adminFunction, /The last admin account cannot be changed to customer/);
  assert.match(adminFunction, /auth\.admin\.updateUserById\(userId, \{\s*user_metadata:/);
  assert.match(adminFunction, /full_name: fullName,[\s\S]*company_name: companyName \|\| null/);
  assert.doesNotMatch(adminFunction, /user_metadata:\s*\{\s*role\s*[,}]/);
  assert.match(adminFunction, /\.update\(\{ role, full_name: fullName, company_name: companyName \|\| null \}\)/);
  assert.match(adminModal, /onClick=\{\(\) => handleEdit\(p\)\}/);
  assert.match(adminModal, /Save Changes/);
  assert.match(adminModal, /Login email \(not editable here\)/);
});

test('inactive accounts are blocked by RLS and only admins can change customer status', () => {
  assert.match(schema, /is_active BOOLEAN NOT NULL DEFAULT TRUE/);
  assert.match(schema, /CREATE OR REPLACE FUNCTION public\.is_active_user\(\)/);
  assert.match(schema, /public\.is_active_user\(\)/);
  assert.match(lifecycleMigration, /ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE/);
  assert.match(adminFunction, /profile\?\.role !== 'admin' \|\| !profile\.is_active/);
  assert.match(adminFunction, /action === 'set-active'/);
  assert.match(adminFunction, /targetProfile\.role !== 'customer'/);
  assert.match(adminFunction, /update\(\{ is_active: isActive \}\)/);
  assert.match(adminModal, /Reactivate customer/);
  assert.match(adminModal, /Deactivate customer/);
});

test('jobs and candidates expose create, read, update, and delete paths', () => {
  assert.match(jobListSource, /onEditJob\(job\)/);
  assert.match(jobModalSource, /jobToEdit\?\.id/);
  assert.match(candidateDetailSource, /onEditCandidate\(candidate\)/);
  assert.match(appSource, /setCandidateToEdit\(candidate\)/);
  assert.match(storageSource, /export async function deleteJob/);
  assert.match(storageSource, /export async function deleteCandidate/);
  assert.match(storageSource, /export async function saveJob/);
  assert.match(storageSource, /export async function saveCandidate/);
});

test('candidate job selector identifies the customer and selected job location', () => {
  assert.match(candidateModalSource, /Choose Job Opening/);
  assert.match(candidateModalSource, /\{j\.title\} — \{profiles\.find/);
  assert.match(candidateModalSource, /selectedCustomer\?\.companyName[\s\S]*selectedJob\.location/);
});

test('Supabase write failures do not silently fall back to local demo persistence', () => {
  assert.match(storageSource, /Could not save the job to Supabase/);
  assert.match(storageSource, /Could not save the candidate to Supabase/);
  assert.match(storageSource, /Could not update the candidate stage in Supabase/);
  assert.match(storageSource, /Could not delete the candidate from Supabase/);
  assert.match(storageSource, /Could not delete the job from Supabase/);
});

test('configured Supabase reads fail closed and backend updates have one documented npm command', () => {
  for (const [start, end] of [
    ['export async function fetchAllProfiles', 'export async function fetchJobs'],
    ['export async function fetchJobs', 'export async function fetchCandidates'],
    ['export async function fetchCandidates', 'export async function saveJob'],
  ]) {
    const startIndex = storageSource.indexOf(start);
    const endIndex = storageSource.indexOf(end, startIndex + start.length);
    assert.ok(startIndex >= 0 && endIndex > startIndex);
    const readFunction = storageSource.slice(startIndex, endIndex);
    assert.match(readFunction, /if \(supabase\) \{[\s\S]*?catch \{[\s\S]*?throw new Error\(/);
  }

  assert.match(packageJson.scripts['supabase:update'], /supabase db push --linked --yes/);
  assert.match(packageJson.scripts['supabase:update'], /supabase functions deploy admin-create-account/);
  assert.doesNotMatch(lifecycleMigration, /DROP TABLE|TRUNCATE|DELETE FROM/i);
});

test('login and account creation password fields are masked by default and have accessible visibility toggles', () => {
  for (const source of [loginView, adminModal]) {
    assert.match(source, /type=\{showPassword \? 'text' : 'password'\}/);
    assert.match(source, /aria-pressed=\{showPassword\}/);
    assert.match(source, /setShowPassword\(\(visible\) => !visible\)/);
  }
});

test('light theme is white/blue, dark theme is monochrome, and Midnight remains separate', () => {
  assert.match(themeStyles, /--color-indigo-600:\s*var\(--color-blue-600\)/);
  assert.match(themeStyles, /html\.theme-light, body\.theme-light\s*\{\s*background-color:\s*#ffffff/);
  assert.match(themeStyles, /html\.dark, body\.dark\s*\{\s*background-color:\s*#000000/);
  assert.match(themeStyles, /\.theme-dark \[class\*="text-emerald-"\][\s\S]*?color:\s*#e5e5e5/);
  assert.match(themeStyles, /\.theme-midnight header[\s\S]*?background-color:\s*#061c20/);
  assert.match(loginView, /aria-label="Use light theme"/);
  assert.match(loginView, /aria-label="Use dark theme"/);
  assert.match(loginView, /aria-label="Use colorful midnight theme"/);
});

test('Reset Demo Data is only shown when Supabase is not configured', () => {
  const resetGuard = footerSource.indexOf('!isSupabaseConfigured && (');
  const resetEnd = footerSource.indexOf('</>', resetGuard);
  assert.ok(resetGuard >= 0 && resetEnd > resetGuard);
  const resetBlock = footerSource.slice(resetGuard, resetEnd);
  assert.match(resetBlock, /Reset Demo Data/);
  assert.match(resetBlock, /onResetData\(\);/);
});

test('super admin vzirimwabagabo0@gmail.com is protected from deletion, deactivation, and demotion', () => {
  assert.match(adminFunction, /vzirimwabagabo0@gmail\.com/i);
  assert.match(adminFunction, /action === 'delete'/);
  assert.match(adminFunction, /You cannot delete your own account while signed in/);
  assert.match(adminFunction, /The last admin account cannot be deleted/);
  assert.match(adminFunction, /serviceClient\.auth\.admin\.deleteUser\(userId\)/);
  assert.match(adminModal, /SUPER ADMIN/);
  assert.match(adminModal, /handleDelete/);
  assert.match(storageSource, /export async function deleteAccountAsAdmin/);
});

test('session timeout logs out users after 30 minutes of inactivity', () => {
  assert.match(authSource, /INACTIVITY_TIMEOUT_MS\s*=\s*30\s*\*\s*60\s*\*\s*1000/);
  assert.match(authSource, /sessionTimedOut/);
  assert.match(loginView, /Session Timed Out/);
  assert.match(appSource, /sessionWarningOpen/);
  assert.match(appSource, /Session Expiring Soon/);
});

test('customer company names are enforced unique across schema, edge function, and storage', () => {
  assert.match(schema, /idx_unique_customer_company_name/);
  assert.match(schema, /LOWER\(TRIM\(company_name\)\)/);
  assert.match(adminFunction, /existingCompanyProfile/);
  assert.match(adminFunction, /already registered by another customer account/);
  assert.match(storageSource, /Each organization may only be registered once/);
  assert.match(adminModal, /Each customer company must be unique/);
});