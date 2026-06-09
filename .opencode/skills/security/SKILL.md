---
name: security
description: Use when implementing Supabase RLS policies, auth rules, input sanitization, XSS prevention, or any security hardening. Triggers on: RLS, policy, security, XSS, sanitize, injection, CSP, auth, password, token, CORS, rate limiting.
---

# Security Best Practices — EduGarden

## Supabase RLS Policies

### Current State
RLS is disabled on all tables (prototyping phase). When enabling RLS, follow the patterns below.

### RLS Policy Template
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Public read (everyone can SELECT)
CREATE POLICY "Public can view table_name"
ON table_name FOR SELECT
USING (true);

-- Authenticated write (only logged-in admins can INSERT/UPDATE/DELETE)
CREATE POLICY "Authenticated users can insert table_name"
ON table_name FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update table_name"
ON table_name FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete table_name"
ON table_name FOR DELETE
USING (auth.role() = 'authenticated');
```

### Table-Specific Policies

#### `articles`, `roses`, `staff`, `roles`, `team_photos`
- **Public**: SELECT for everyone
- **Authenticated only**: INSERT, UPDATE, DELETE

#### `contact_messages`
- **Anonymous**: INSERT (anyone can submit the form)
- **Authenticated only**: SELECT, UPDATE (mark read), DELETE

```sql
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a message"
ON contact_messages FOR INSERT
WITH CHECK (true);

CREATE POLICY "Only admins can view messages"
ON contact_messages FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update messages"
ON contact_messages FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete messages"
ON contact_messages FOR DELETE
USING (auth.role() = 'authenticated');
```

#### `site_settings`
- **Public**: SELECT (contact info, mission)
- **Authenticated only**: UPDATE

#### `chatbot_knowledge`
- **Public**: SELECT (RAG context for chatbot)
- **Authenticated only**: INSERT, UPDATE, DELETE

### Storage Bucket Policies
```sql
-- images bucket: public read, authenticated write
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

### Testing RLS
```sql
-- Disable RLS to test (during development)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Check which policies exist
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- Simulate anonymous request (in SQL editor)
SET request.jwt.claims = '{}';
SELECT * FROM table_name; -- should fail if RLS blocks anon reads

-- Simulate authenticated request
SET request.jwt.claims = '{"role": "authenticated"}';
SELECT * FROM table_name; -- should succeed
```

---

## Vanilla JS Security

### XSS Prevention
```javascript
// DANGEROUS — never do this:
element.innerHTML = userInput;

// SAFE alternatives:
// 1. textContent (plain text only — use this for user-generated content)
element.textContent = userInput;

// 2. setAttribute (safe for attributes)
element.setAttribute('src', url);

// 3. createElement (safe DOM construction)
const div = document.createElement('div');
div.textContent = userInput;

// 4. Sanitize if you MUST use innerHTML
function sanitizeHtml(str) {
  const el = document.createElement('div');
  el.textContent = str;
  return el.innerHTML; // escapes < > & etc.
}

// 5. Use DOMPurify for complex HTML (if loaded)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/2.4.0/purify.min.js"></script>
// element.innerHTML = DOMPurify.sanitize(userHtml);
```

### Admin-Specific: Escaping HTML in Template Literals

In `admin/index.html`, strings are built with backtick template literals. Always escape user data inserted into HTML attributes or content:

```javascript
// Helper function (already used in admin)
function escHtmlAttr(val) {
  if (!val) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Usage in template literals:
`<input value="${escHtmlAttr(userValue)}">`
`<div onclick="deleteItem('${escHtmlAttr(id)}')">Delete</div>`
```

### Input Validation
```javascript
// Email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// URL validation (for image URLs)
function isValidUrl(url) {
  try {
    new URL(url);
    return url.startsWith('https://');
  } catch {
    return false;
  }
}

// Strip dangerous protocols
function sanitizeUrl(url) {
  return url.replace(/^(javascript|data|vbscript):/i, '');
}
```

### Supabase Client-Side Safety
```javascript
// Always scope queries — never do SELECT * without filters in production
const { data } = await supabaseClient
  .from('contact_messages')
  .select('id, name, created_at')  // explicit columns, never *
  .eq('read', false)               // always filter
  .limit(50);                      // always limit

// Use .single() when expecting one row
const { data } = await supabaseClient
  .from('articles')
  .select('*')
  .eq('id', id)
  .single();

// Never trust the client for auth decisions — RLS must be the backstop
```

### Auth Token Handling
```javascript
// Storage for auth tokens
// SAFE: Supabase Auth manages tokens in memory/localStorage automatically
// NEVER: store tokens in cookies, sessionStorage, or pass via URLs

// Logout clears tokens:
await supabaseClient.auth.signOut();

// Check session:
const { data: { session } } = await supabaseClient.auth.getSession();

// Protect admin routes:
if (!session) {
  document.getElementById('dashboardRoot').innerHTML = '';
  document.getElementById('loginScreen').style.display = 'flex';
}
```

### Content Security Policy (CSP)
Add to `<head>` of index.html and admin/index.html:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://unpkg.com https://cdnjs.cloudflare.com 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://exoyfpqfgixofsuginxx.supabase.co data:;
  connect-src 'self' https://exoyfpqfgixofsuginxx.supabase.co;
  frame-ancestors 'none';
">
```

### Environment Variables & Secrets
- Never hardcode secrets in client-side code (the anon key is public by design — that's fine)
- Supabase anon key is meant to be public — RLS is what protects data
- Never expose the `service_role` key in client code
- Never commit `.env` files or PATs

### File Upload Validation
```javascript
// Validate before uploading to Supabase Storage
function validateImage(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    showToast('Only JPEG, PNG, WebP, and GIF allowed', 'error');
    return false;
  }

  if (file.size > maxSize) {
    showToast('File must be under 5MB', 'error');
    return false;
  }

  return true;
}
```

---

## SQL Injection (Supabase handles this)

Supabase's JS client uses parameterized queries — raw SQL via `supabaseClient.from('table').select()` is not vulnerable to SQL injection.

**Exception**: If you use `supabaseClient.rpc()` with dynamic user input, sanitize it:

```javascript
// SAFE — Supabase RPC uses parameterized bindings
const { data, error } = await supabaseClient.rpc('my_function', {
  user_id: userId  // parameterized — safe
});

// NEVER build raw SQL strings
// const { data, error } = await supabaseClient.rpc('my_function', { query: `SELECT * FROM users WHERE id = '${userId}'` });
```

---

## EduGarden Security Checklist

When hardening for production:

- [ ] RLS enabled on ALL tables
- [ ] Storage bucket policies set (public read, auth-only write/delete)
- [ ] Admin panel accessible only via Supabase Auth (already done)
- [ ] All user-facing text uses `textContent` not `innerHTML` in admin forms
- [ ] File upload validates type and size before storage upload
- [ ] Contact form has server-side rate limiting (Supabase function or middleware)
- [ ] CSP meta tag added to both index.html and admin/index.html
- [ ] No service_role key in client code
- [ ] Article/rose image URLs sanitized before display
- [ ] Session checked before every admin API call
