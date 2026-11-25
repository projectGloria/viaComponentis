const COMMENT_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  [
    '// React computes a fresh UI snapshot whenever props or state change',
    '// React, props veya state her değiştiğinde yeni bir UI anlık görüntüsü üretir',
  ],
  [
    '// Pure declarative snapshot derived directly from props',
    '// Doğrudan props verisinden türetilen saf declarative anlık görüntü',
  ],
  [
    '{/* Guard numeric/falsy conditions explicitly with booleans */}',
    '{/* Sayısal/falsy koşulları her zaman açıkça boolean ile kontrol et */}',
  ],
  [
    '// Toggle a single item without mutating the original array or object',
    '// Orijinal diziyi veya objeyi bozmadan tek bir öğeyi değiştir',
  ],
  [
    '// Sort safely using ES2023 toSorted() (or [...nodes].sort())',
    '// ES2023 toSorted() (veya [...nodes].sort()) ile güvenle sırala',
  ],
  [
    '// Lazy initializer runs once on mount, not on every re-render',
    '// Lazy initializer her re-render\'da değil, sadece ilk mount\'ta bir kez çalışır',
  ],
  [
    '// Both updater functions queue against the latest pending state',
    '// İki updater fonksiyonu da en güncel bekleyen state üzerine sırayla eklenir',
  ],
  [
    '// Derived cleanly during render — zero duplicate state to sync',
    '// Render sırasında doğrudan hesaplanır — senkronize edilecek ekstra state yok',
  ],
  [
    '// Runs after commit when inputRef.current points to the mounted <input>',
    '// Commit sonrası inputRef.current DOM\'daki <input>\'u gösterdiğinde çalışır',
  ],
  [
    '// Functional updater avoids closing over a stale `seconds` snapshot',
    '// Functional updater, eski `seconds` değerine takılı kalmayı (stale closure) önler',
  ],
  [
    '// Cleanup aborts stale in-flight requests if nodeId changes rapidly',
    '// Cleanup, nodeId hızla değişirse eski ve gecikmiş istekleri iptal eder',
  ],
  [
    '// GOOD: zero effects, zero extra render pass',
    '// DOĞRU: sıfır effect, sıfır fazladan render',
  ],
  [
    '// Event logic runs directly in the handler, not via effect flags',
    '// Event mantığı effect bayraklarıyla değil doğrudan handler içinde çalışır',
  ],
  [
    '// Parent resets NotesEditor cleanly whenever topicId changes:',
    '// Parent, topicId her değiştiğinde NotesEditor\'ı temizce sıfırlar:',
  ],
  [
    '// Minimal illustration of the state machine TanStack Query automates with caching',
    '// TanStack Query\'nin cache ile otomatikleştirdiği durum makinesinin basit örneği',
  ],
  [
    '// Recommended feature-colocated structure for medium/large React apps:',
    '// Orta/büyük React projeleri için önerilen feature tabanlı klasör yapısı:',
  ],
  [
    '//   app/          -> App shell, providers, top-level router',
    '//   app/          -> Uygulama kabuğu, provider\'lar, ana router',
  ],
  [
    '//   components/   -> Shared monochrome UI primitives (HudCard, CyberButton)',
    '//   components/   -> Ortak UI yapı taşları (HudCard, CyberButton)',
  ],
  [
    '//   lib/          -> Pure utilities (monochromeHighlight.ts, tauriWindow.ts)',
    '//   lib/          -> Saf yardımcı modüller (monochromeHighlight.ts, tauriWindow.ts)',
  ],
  [
    '// Public contract exposed by the feature:',
    '// Özelliğin dışarıya açtığı temiz prop sözleşmesi:',
  ],
  [
    '// Internal serialization details stay private to the notes module.',
    '// İç kayıt/serileştirme detayları notes modülünün içinde gizli kalır.',
  ],
  [
    '// Moving fast state into this leaf prevents HeavyMatrix from re-rendering!',
    '// Hızlı değişen state\'i bu küçük bileşene indirmek HeavyMatrix\'in re-render olmasını önler!',
  ],
  [
    '// 1) Move fast state down into <Clock /> leaf',
    '// 1) Hızlı değişen state\'i kendi <Clock /> yaprak bileşenine indir',
  ],
  [
    '// 2) Lift <LargeTable /> above the stateful shell and pass it as children',
    '// 2) <LargeTable />\'ı state tutan kabuğun üstüne çıkarıp children olarak geçir',
  ],
  [
    '// Fix: pass primitive prop `active={true}` instead of inline object `meta={{ active: true }}`',
    '// Çözüm: inline obje `meta={{ active: true }}` yerine doğrudan `active={true}` prop\'u geçir',
  ],
  [
    '// or hoist/memoize the constant object outside the component:',
    '// veya sabit objeyi component dışına çıkar / memoize et:',
  ],
  [
    '// Example Vitest + @testing-library/react test pattern:',
    '// Örnek Vitest + @testing-library/react test deseni:',
  ],
  [
    '// Accessible pattern being tested:',
    '// Test edilen erişilebilir bileşen deseni:',
  ],
];

export function translateCodeCommentsToTr(code: string): string {
  let out = code;
  for (const [en, tr] of COMMENT_REPLACEMENTS) {
    if (out.includes(en)) {
      out = out.split(en).join(tr);
    }
  }
  return out;
}
