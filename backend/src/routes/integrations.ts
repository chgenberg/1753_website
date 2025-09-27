import express from 'express'
import { logger } from '../utils/logger'
import { fortnoxService } from '../services/fortnoxService'

const router = express.Router()

/**
 * Test Fortnox connection
 */
router.get('/test-fortnox', async (req, res) => {
  try {
    const isConnected = await fortnoxService.testConnection()
    res.json({
      success: isConnected,
      message: isConnected ? 'Fortnox connection successful' : 'Fortnox connection failed',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    logger.error('Fortnox test endpoint error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Fortnox test failed',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * Fortnox OAuth callback (main endpoint)
 * Redirect URI to configure in Fortnox Dev Portal:
 *   https://1753websitebackend-production.up.railway.app/oauth/callback
 */
router.get('/oauth/callback', (req, res) => {
  const { code, state, error, error_description } = req.query as Record<string, string | undefined>

  const nonce = require('crypto').randomBytes(16).toString('base64')

  logger.info('Fortnox OAuth callback received (main)', { codePresent: !!code, state, error, error_description })

  const html = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Fortnox OAuth – klart</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 2rem; line-height: 1.5; }
    code { background: #f4f4f5; padding: 0.25rem 0.4rem; border-radius: 6px; }
    .box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; background: #fff; max-width: 720px; }
    .ok { color: #16a34a; }
    .error { color: #dc2626; }
    .mt { margin-top: 1rem; }
    input { width: 100%; padding: 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; }
    pre { background: #1f2937; color: #f9fafb; padding: 1rem; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Fortnox OAuth</h1>
    ${error ? `
    <div class="error">
      <p><strong>Fel:</strong> ${error}</p>
      ${error_description ? `<p><strong>Beskrivning:</strong> ${error_description}</p>` : ''}
    </div>
    ` : `
    <div class="ok">
      <p><strong>✅ Lyckades!</strong> Authorization code mottagen.</p>
    </div>
    <div class="mt">
      <p>Authorization code:</p>
      <input id="code" readonly value="${code || ''}" />
    </div>
    <div class="mt">
      <p>State (om använt):</p>
      <input id="state" readonly value="${state || ''}" />
    </div>
    <div class="mt">
      <p>Nästa steg (i terminalen):</p>
      <pre><code>railway run npx ts-node scripts/exchangeFortnoxCode.ts ${code || '[AUTHORIZATION_CODE]'}</code></pre>
    </div>
    `}
  </div>
  <script nonce="${nonce}">document.getElementById('code')?.select()</script>
</body>
</html>`

  res
    .status(error ? 400 : 200)
    .header('Content-Security-Policy', `script-src 'nonce-${nonce}' 'strict-dynamic'; object-src 'none'; base-uri 'none';`)
    .send(html)
})

/**
 * Fortnox OAuth callback (legacy endpoint)
 * Redirect URI to configure in Fortnox Dev Portal:
 *   https://1753websitebackend-production.up.railway.app/api/integrations/fortnox/callback
 */
router.get('/fortnox/callback', (req, res) => {
  const { code, state, error, error_description } = req.query as Record<string, string | undefined>

  const nonce = require('crypto').randomBytes(16).toString('base64')

  logger.info('Fortnox OAuth callback received', { codePresent: !!code, state, error, error_description })

  const html = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Fortnox OAuth – klart</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; margin: 2rem; line-height: 1.5; }
    code { background: #f4f4f5; padding: 0.25rem 0.4rem; border-radius: 6px; }
    .box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; background: #fff; max-width: 720px; }
    .ok { color: #16a34a; }
    .err { color: #dc2626; }
    .mt { margin-top: 1rem; }
    input { width: 100%; padding: 0.5rem; font-size: 0.95rem; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Fortnox OAuth</h1>
    ${error ? `<p class="err">Fel: ${error}${error_description ? ` – ${error_description}` : ''}</p>` : '<p class="ok">Auktorisering klar.</p>'}
    <div class="mt">
      <p>Kod att använda i token‑steget:</p>
      <input id="code" readonly value="${code || ''}" />
    </div>
    <div class="mt">
      <p>State (om använt):</p>
      <input id="state" readonly value="${state || ''}" />
    </div>
    <div class="mt">
      <p>Byter kod mot token automatiskt...</p>
    </div>
  </div>
  <script nonce="${nonce}">document.getElementById('code')?.select()</script>
</body>
</html>`

  res
    .set('Content-Type', 'text/html; charset=utf-8')
    .set('Content-Security-Policy', `default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'`)
    .status(200)
    .send(html)
  
  // Fire-and-forget: exchange the code and apply tokens in memory
  ;(async () => {
    try {
      if (!code) return
      const axios = (await import('axios')).default
      const clientId = process.env.FORTNOX_CLIENT_ID || ''
      const clientSecret = process.env.FORTNOX_CLIENT_SECRET || ''
      const redirectUri = 'https://1753websitebackend-production.up.railway.app/api/integrations/fortnox/callback'
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
      const tokenResp = await axios.post('https://apps.fortnox.se/oauth-v1/token', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: { username: clientId, password: clientSecret }
      })
      const accessToken = tokenResp.data?.access_token
      const refreshToken = tokenResp.data?.refresh_token
      if (!accessToken || !refreshToken) return
      // Apply in-memory
      try {
        const { fortnoxService } = await import('../services/fortnoxService')
        ;(fortnoxService as any).inMemoryAccessToken = accessToken
        ;(fortnoxService as any).inMemoryRefreshToken = refreshToken
      } catch {}
      // Persist to Railway via GraphQL
      try {
        const railwayToken = process.env.RAILWAY_API_TOKEN
        const projectId = process.env.RAILWAY_PROJECT_ID
        const serviceId = process.env.RAILWAY_SERVICE_ID
        const environmentId = process.env.RAILWAY_ENVIRONMENT_ID
        if (railwayToken && projectId && serviceId && environmentId) {
          const gql = (await import('axios')).default
          const upsert = async (name: string, value: string) => gql.post(
            'https://backboard.railway.app/graphql',
            { query: `mutation VariableUpsert($input: VariableUpsertInput!){ variableUpsert(input:$input){ id } }`, variables: { input: { projectId, environmentId, serviceId, name, value } } },
            { headers: { Authorization: `Bearer ${railwayToken}` } }
          )
          await upsert('FORTNOX_API_TOKEN', accessToken)
          await upsert('FORTNOX_REFRESH_TOKEN', refreshToken)
          await upsert('FORTNOX_USE_OAUTH', 'true')
        }
      } catch {}
    } catch (e) {
      // swallow
    }
  })()
})

export default router 