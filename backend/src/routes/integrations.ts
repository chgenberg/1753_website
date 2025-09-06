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
 * Fortnox OAuth callback
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
      <p>Nästa steg (i terminalen):</p>
      <pre><code>curl -X POST https://apps.fortnox.se/oauth-v1/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "$FORTNOX_CLIENT_ID:$FORTNOX_CLIENT_SECRET" \
  -d "grant_type=authorization_code&code=${code || ''}&redirect_uri=https%3A%2F%2F1753websitebackend-production.up.railway.app%2Fapi%2Fintegrations%2Ffortnox%2Fcallback"</code></pre>
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
})

export default router 