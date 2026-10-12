import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const authSource = await readFile(new URL('../src/context/AuthContext.tsx', import.meta.url), 'utf8');
const schema = await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
const adminFunction = await readFile(new URL('../supabase/functions/admin-create-account/index.ts', import.meta.url), 'utf8');
const adminModal = await readFile(new URL('../src/components/AdminAccountModal.tsx', import.meta.url), 'utf8');
const parserSource = await readFile(new URL('../src/lib/cvParser.ts', import.meta.url), 'utf8');
const safeUrlSource = await readFile(new URL('../src/lib/safeExternalUrl.ts', import.meta.url), 'utf8');
const functionErrorSource = await readFile(new URL('../src/lib/functionError.ts', import.meta.url), 'utf8');
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
  assert.match(schema, /FOR SELECT TO authenticated[\s\S]*?id = \(SELECT auth\.uid\(\)\) OR public\.is_admin\(\)/);
  assert.match(schema, /CREATE POLICY "Jobs tenant access"[\s\S]*?customer_id = \(SELECT auth\.uid\(\)\) OR public\.is_admin\(\)/);
  assert.match(schema, /CREATE POLICY "Candidates tenant access"[\s\S]*?jobs\.customer_id = candidates\.customer_id/);
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