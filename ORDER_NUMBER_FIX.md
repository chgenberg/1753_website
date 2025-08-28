# Fix: Ordernummer som "rullar" på success-sidan

## Problem
På "Tack för din beställning"-sidan rullades ordernumret snabbt med nya nummer som `#1753-172346262635` osv. Detta skapade intryck av att massor av orders lades.

## Orsak
I `frontend/src/app/[locale]/checkout/success/page.tsx` användes `Date.now()` direkt i render-funktionen:

```typescript
// PROBLEM: Date.now() anropas vid varje render
const orderNumber = orderCode || `1753-${Date.now()}`

// Och i JSX:
#{orderCode || `1753-${Date.now()}`}
```

**Varje gång React komponenten renderades om** (vilket händer ofta), genererades ett nytt ordernummer med aktuell timestamp, vilket skapade "rullande" effekten.

## Lösning
Använd `useState` med lazy initializer för att bara generera fallback-ordernumret **en gång**:

```typescript
// ✅ LÖSNING: Generera fallback-ordernummer endast en gång
const [fallbackOrderNumber] = useState(() => `1753-${Date.now()}`)

// Använd sedan:
const orderNumber = orderCode || fallbackOrderNumber
#{orderCode || fallbackOrderNumber}
```

## Ändringar gjorda

### 1. Lagt till fallback state
```typescript
// Generate fallback order number only once
const [fallbackOrderNumber] = useState(() => `1753-${Date.now()}`)
```

### 2. Uppdaterat copyOrderNumber-funktionen
```typescript
const copyOrderNumber = () => {
  const orderNumber = orderCode || fallbackOrderNumber // ✅ Använder state
  navigator.clipboard.writeText(orderNumber)
  setCopied(true)
  toast.success('Ordernummer kopierat!')
  setTimeout(() => setCopied(false), 3000)
}
```

### 3. Uppdaterat JSX-rendering
```typescript
<p className="text-2xl font-semibold text-gray-900">
  #{orderCode || fallbackOrderNumber} {/* ✅ Använder state */}
</p>
```

## Resultat
- ✅ Ordernumret är nu stabilt och ändras inte vid re-renders
- ✅ Ingen "rullande" effekt längre
- ✅ Korrekt ordernummer visas från URL-parametrar när tillgängligt
- ✅ Fallback-ordernummer genereras bara en gång per session

## Teknisk förklaring
`useState(() => value)` med en funktion som argument kallas "lazy initial state". Funktionen körs bara en gång när komponenten mountas, inte vid varje render. Detta är perfekt för dyra beräkningar eller värden som bara behöver genereras en gång.

---

**Fixat:** 2025-01-30
**Status:** ✅ Löst 