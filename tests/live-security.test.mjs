import assert from 'node:assert/strict';
import test from 'node:test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://izbmqbxskzmzbimckedb.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Pt3rL123KhSAWSOSZaW2_w_ge0Rkh53';

const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

test('LIVE SYSTEM: unauthenticated public requests cannot read jobs table', async () => {
  const { data, error } = await anonClient.from('jobs').select('*');
  assert.ok(error !== null || (data && data.length === 0), 'Unauthenticated read must fail or return empty');
  if (error) {
    assert.match(error.message.toLowerCase(), /permission denied|row-level security|not authorized/);
  }
});

test('LIVE SYSTEM: unauthenticated public requests cannot read candidates table', async () => {
  const { data, error } = await anonClient.from('candidates').select('*');
  assert.ok(error !== null || (data && data.length === 0), 'Unauthenticated read must fail or return empty');
  if (error) {
    assert.match(error.message.toLowerCase(), /permission denied|row-level security|not authorized/);
  }
});

test('LIVE SYSTEM: unauthenticated public requests cannot read customer profiles', async () => {
  const { data, error } = await anonClient.from('profiles').select('*');
  assert.ok(error !== null || (data && data.length === 0), 'Unauthenticated read must fail or return empty');
  if (error) {
    assert.match(error.message.toLowerCase(), /permission denied|row-level security|not authorized/);
  }
});

test('LIVE SYSTEM: unauthenticated public requests cannot insert jobs', async () => {
  const { data, error } = await anonClient.from('jobs').insert({
    title: 'Unauthorized Job Creation Test',
    department: 'PenTest',
    location: 'Remote',
    description: 'Security regression test payload',
    customer_id: 'a0000000-0000-0000-0000-000000000002',
  }).select();

  assert.ok(error !== null, 'Inserting jobs without authentication must be rejected by Postgres');
  assert.equal(data, null);
  assert.match(error.message.toLowerCase(), /permission denied|violates row-level security/);
});

test('LIVE SYSTEM: unauthenticated public requests cannot insert candidates', async () => {
  const { data, error } = await anonClient.from('candidates').insert({
    name: 'Unauthorized Candidate',
    email: 'hacker@example.com',
    stage: 'sourced',
    customer_id: 'a0000000-0000-0000-0000-000000000002',
    job_id: 'b0000000-0000-0000-0000-000000000001',
  }).select();

  assert.ok(error !== null, 'Inserting candidates without authentication must be rejected by Postgres');
  assert.equal(data, null);
  assert.match(error.message.toLowerCase(), /permission denied|violates row-level security/);
});
