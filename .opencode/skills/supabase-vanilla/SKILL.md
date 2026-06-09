---
name: supabase-vanilla
description: Use when writing or debugging Supabase queries in plain JavaScript (no framework). Covers CRUD, storage upload/delete, auth, realtime. Triggers on: Supabase, supabaseClient, createClient, .from(), .storage, signIn, RLS.
---

# Supabase in Vanilla JS

## Client Init Pattern
```javascript
// Already in window.supabaseClient via js/supabase.js
// In admin, use local variable:
const { createClient } = supabase;
const supabaseClient = createClient(URL, ANON_KEY);
```

## CRUD Patterns
```javascript
// SELECT
const { data, error } = await supabaseClient.from('table').select('*').order('created_at', { ascending: false });

// INSERT
const { data, error } = await supabaseClient.from('table').insert([{ col: val }]).select();

// UPDATE
const { data, error } = await supabaseClient.from('table').update({ col: val }).eq('id', id);

// DELETE
const { error } = await supabaseClient.from('table').delete().eq('id', id);

// UPSERT (for site_settings key-value)
const { error } = await supabaseClient.from('site_settings').upsert({ key: 'email', value: 'x@y.com' }, { onConflict: 'key' });
```

## Storage Upload Pattern
```javascript
async function uploadImage(file) {
  const ext = file.name.split('.').pop();
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseClient.storage.from('images').upload(filename, file);
  if (error) throw error;
  return `https://exoyfpqfgixofsuginxx.supabase.co/storage/v1/object/public/images/${filename}`;
}
```

## Storage Delete Pattern
```javascript
async function deleteImage(url) {
  if (!url) return;
  const filename = url.split('/').pop();
  await supabaseClient.storage.from('images').remove([filename]);
}
// Articles can have comma-separated URLs:
async function deleteArticleImages(image_url) {
  if (!image_url) return;
  const urls = image_url.split(',').map(s => s.trim()).filter(Boolean);
  for (const url of urls) await deleteImage(url);
}
```

## Always Check Errors
```javascript
const { data, error } = await supabaseClient.from('roses').select('*');
if (error) { console.error(error); showToast(error.message, 'error'); return; }
```
