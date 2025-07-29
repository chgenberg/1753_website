# Drip.com Workflows Setup Guide

## Översikt
Denna guide beskriver hur man ställer in Drip.com workflows för 1753 Skincare:

1. **Nyhetsbrev** - För alla newsletter-registreringar
2. **Övergiven varukorg** - Efter 1 timme utan köp
3. **Quiz-resultat** - För quiz-användare
4. **E-bok nedladdning** - För e-bok leads

## Steg 1: Skapa Workflows i Drip

### 1.1 Nyhetsbrev Workflow
1. Gå till **Workflows** i Drip dashboard
2. Klicka **Create Workflow**
3. Namnge: "Nyhetsbrev"
4. Välj trigger: **Subscriber is added to workflow**
5. Lägg till:
   - Välkomstmail
   - Produktrekommendationer
   - Hudvårdstips
6. Notera **Workflow ID** (finns i URL:en)

### 1.2 Övergiven Varukorg Workflow
1. Skapa ny workflow: "Övergiven varukorg"
2. Trigger: **Subscriber is added to workflow**
3. Lägg till sekvens:
   - **15 minuter**: Påminnelse om glömd varukorg
   - **2 timmar**: Begränsad rabatt (10%)
   - **24 timmar**: Gratis frakt erbjudande
   - **3 dagar**: Sista chansen mail
4. Använd custom fields:
   - `cart_total`
   - `cart_items_count`
   - `cart_recovery_url`

### 1.3 Quiz Workflow
1. Skapa workflow: "Quiz-resultat"
2. Personaliserade hudvårdstips baserat på quiz
3. Produktrekommendationer

### 1.4 E-bok Workflow
1. Skapa workflow: "E-bok nedladdning"
2. Leverera e-boken direkt
3. Följ upp med relaterat innehåll

## Steg 2: Konfigurera Environment Variables

### Railway Environment Variables
Lägg till följande i Railway dashboard:

```env
DRIP_ACCOUNT_ID=din_drip_account_id
DRIP_API_TOKEN=din_drip_api_token
DRIP_NEWSLETTER_WORKFLOW_ID=workflow_id_för_nyhetsbrev
DRIP_ABANDONED_CART_WORKFLOW_ID=workflow_id_för_övergiven_varukorg
DRIP_QUIZ_WORKFLOW_ID=workflow_id_för_quiz
DRIP_EBOOK_WORKFLOW_ID=workflow_id_för_ebook
NEXT_PUBLIC_BASE_URL=https://1753website-production.up.railway.app
```

### Hitta Workflow IDs
1. Gå till din workflow i Drip
2. Kolla URL:en: `https://www.getdrip.com/workflows/YOUR_WORKFLOW_ID/edit`
3. `YOUR_WORKFLOW_ID` är det ID du behöver

## Steg 3: Audience Management

### Automatisk Taggning
Systemet taggar automatiskt subscribers:
- `nyhetsbrev` - Newsletter signups
- `övergiven-varukorg` - Abandoned cart users
- `quiz-användare` - Quiz takers
- `ebook-download` - E-book downloaders

### Custom Fields som sätts
```javascript
// Newsletter signup
{
  source: 'newsletter-section',
  subscription_date: '2025-01-01T12:00:00Z',
  workflow_triggered: 'nyhetsbrev',
  signup_page: 'Newsletter Signup'
}

// Abandoned cart
{
  cart_total: 1098,
  cart_items_count: 2,
  cart_items: [...],
  cart_abandoned_at: '2025-01-01T12:00:00Z',
  cart_recovery_url: 'https://1753website.com/cart?recover=true'
}

// Quiz results
{
  quiz_score: 70,
  skin_type: 'combination',
  main_concerns: 'aging,acne'
}
```

## Steg 4: Testing

### Testa Newsletter
```bash
curl -X POST https://1753website-production.up.railway.app/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","workflow":"nyhetsbrev"}'
```

### Testa Övergiven Varukorg
1. Lägg produkter i varukorgen
2. Registrera email via quiz eller newsletter
3. Vänta 1 timme (eller ändra timer för test)
4. Kontrollera Drip för triggered workflow

## Steg 5: Monitoring

### Drip Dashboard
- Kontrollera **Workflows** → **Performance**
- Se delivery rates och engagement
- Övervaka subscriber growth

### Logs
Kontrollera Railway logs för:
```
Successfully subscribed to Drip: email@example.com workflow: nyhetsbrev
Successfully triggered nyhetsbrev workflow for: email@example.com
Abandoned cart workflow triggered for: email@example.com
```

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Kontrollera DRIP_API_TOKEN
2. **Workflow not triggering**: Verifiera WORKFLOW_ID
3. **Subscriber not found**: Email kanske inte finns i Drip än

### Debug Commands
```bash
# Test Drip API connection
curl -u "YOUR_API_TOKEN:" https://api.getdrip.com/v2/YOUR_ACCOUNT_ID/subscribers

# Check specific subscriber
curl -u "YOUR_API_TOKEN:" https://api.getdrip.com/v2/YOUR_ACCOUNT_ID/subscribers/email@example.com
```

## Best Practices

1. **Testa workflows** innan lansering
2. **Segmentera audiences** baserat på beteende
3. **A/B testa** email subject lines
4. **Övervaka metrics** regelbundet
5. **Respektera GDPR** - endast opt-in subscribers

## Integration Points

### Frontend Components
- `NewsletterSection.tsx` → Newsletter workflow
- `QuizResults.tsx` → Quiz workflow  
- `e-bok/page.tsx` → E-book workflow
- `CartContext.tsx` → Abandoned cart workflow

### API Endpoints
- `/api/newsletter` → Subscribe + trigger workflow
- `/api/abandoned-cart` → Abandoned cart tracking
- `/api/quiz/results` → Quiz completion (if email provided)

## Next Steps

1. Skapa workflows i Drip dashboard
2. Konfigurera environment variables
3. Testa varje workflow
4. Övervaka performance
5. Optimera baserat på metrics 