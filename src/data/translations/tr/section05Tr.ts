import type { SectionTranslation } from './types';

export const section05Tr: SectionTranslation = {
  title: 'Mimari & Veri Akışı',
  subtitle: 'Context bölme, sunucu cache mantığı (TanStack Query), istemci yönlendirme, Error Boundary, Suspense ve feature yerleşimi.',
  topics: {
    'context-api-rerender-traps': {
      title: 'Context API & Re-render Tuzaklarından Kaçınma',
      summary: 'Ağaç boyunca veri paylaşırken hızlı değişen state’i kararlı `dispatch` referansından ayır.',
      mentalModel: {
        paragraphs: [
          'Context, bir parent’ın prop drilling yapmadan alt dallara değer (kullanıcı, tema, `dispatch`) yayınlamasını sağlar. Ancak provider’ın `value` değeri `Object.is` kontrolünden geçemediği her seferde `useContext(Ctx)` kullanan TÜM bileşenler yeniden render olur.',
          'Eğer `<AppContext value={{ state, dispatch }}>` yazarsan, provider’ın her render’ında yepyeni bir obje oluşur ve yalnızca `dispatch` kullanan butonlar bile re-render olur! Çözüm: State ve Dispatch’i iki ayrı Context’e böl veya değeri `useMemo` ile sabitle.',
        ],
        takeaways: [
          'React 19’da `<MyContext value={val}>` doğrudan render edilebilir—`.Provider` zorunlu değildir.',
          '`StateContext` ve `DispatchContext`’i ayır ki sadece aksiyon tetikleyen butonlar state değiştiğinde re-render olmasın.',
          'Context orta/düşük sıklıktaki global veriler için idealdir; 60fps fare/animasyon verileri ref veya harici store’da durmalıdır.',
        ],
      },
      pitfall: '`{ user, filters, toastQueue, openModal }` gibi her şeyi tek dev Context’e koymak her tuş vuruşunda ilgisiz panelleri yeniden render eder.',
      proTip: 'Context eklemeden önce `<Layout sidebar={<Sidebar user={user} />} />` gibi basit kompozisyonun işi daha temiz çözüp çözmediğine bak.',
      challengePrompt: 'Parent ilgisiz bir state yüzünden re-render olduğunda tüketicilere yeni obje gitmemesi için `<PrefsContext value={{ density, setDensity }}>` yapısını düzelt.',
      challengeHints: [
        '`{ density, setDensity }` objesini `useMemo` içine al.',
        '`setDensity` kararlı olduğu için yalnızca `[density]` bağımlılığı ekle.',
      ],
      quickCheck: {
        'qc-05-1-a': {
          question: '`StateContext` ve `DispatchContext`’i ayırmak gereksiz re-render’ları neden önler?',
          options: [
            '`useReducer`’dan gelen `dispatch` ömür boyu aynı referanstır; sadece `DispatchContext` okuyanlar `state` değişince re-render olmaz.',
            '`DispatchContext` React reconciliation’ı kapatır.',
          ],
          explanation: 'Tüketiciler sadece okudukları Context değiştiğinde bildirim alır; sabit `dispatch` bunu tetiklemez.',
        },
      },
    },
    'data-fetching-tanstack-query': {
      title: 'Veri Çekme (Data Fetching) & TanStack Query Mantığı',
      summary: 'Asenkron sunucu önbelleğini yerel UI state’inden ayır; stale-while-revalidate ve invalidation kavramlarını öğren.',
      mentalModel: {
        paragraphs: [
          'Sunucudan gelen API verisi yerel UI state’inden (`modalOpen`, `searchQuery`) tamamen farklıdır: asenkrondur, uzakta yaşar, birden çok bileşence paylaşılır ve her an bayatlayabilir.',
          'TanStack Query gibi kütüphaneler (veya Suspense ile React 19 `use(promise)`) zor köşe durumlarını otomatik çözer: aynı `queryKey` için istek tekilleştirme (deduplication), arka planda tazeleme, retry ve yazma işleminden sonra `invalidateQueries` ile cache yenileme.',
        ],
        takeaways: [
          'Sunucu yanıtlarını elle yönetilen `useState` kopyaları değil, `[kaynak, parametreler]` anahtarlı bir *önbellek* olarak gör.',
          'Yükleniyor, hata ve boş durumları her zaman açıkça ele al; üst üste binen istekleri iptal et veya tekilleştir.',
          'Bir `POST`/`PATCH`/`DELETE` mutasyonundan sonra ilgili query key’leri invalidate et ki ekrandaki tüm görünümler güncellensin.',
        ],
      },
      pitfall: 'Çekilen sunucu verisini Redux veya local `useState`’e kopyalayıp düzenleme sonrası yenilemeyi unutmak kullanıcıya eski kayıtlar gösterir.',
      proTip: 'Cache anahtarına tüm filtre ve sayfa parametrelerini ekle (ör. `["topics", { filter, page }]`) ki filtre değiştirince eski sonuçlar parlamasın.',
      challengePrompt: 'Discriminated union tipindeki `QueryState<Topic[]>` verisini `"loading"` ve `"error"` erken dönüşleriyle temizce render et.',
      challengeHints: [
        'Önce `state.status === "loading"` ve `state.status === "error"` kontrollerini yaz.',
        'İkisini de eledikten sonra TypeScript `state.data` alanını otomatik daraltacaktır.',
      ],
      quickCheck: {
        'qc-05-2-a': {
          question: 'TanStack Query neden `["node", nodeId]` gibi bir dizi `queryKey` ister?',
          options: [
            'O veri dilimini benzersiz tanımlamak, istekleri tekilleştirmek, önbelleğe almak ve seçici olarak invalidate etmek için.',
            'JavaScript `fetch` fonksiyonu dizi header istediği için.',
          ],
          explanation: 'Query key, önbellekte verinin deterministik adresi olarak görev yapar.',
        },
      },
    },
    'client-side-routing-url-state': {
      title: 'Client-Side Routing & URL State',
      summary: 'Rotalar, arama filtreleri ve iç içe görünümler için URL’i paylaşılabilir state olarak kullan.',
      mentalModel: {
        paragraphs: [
          'Tek sayfa (SPA) React uygulamalarında yönlendirme, link tıklamalarını History API (`pushState` / `popstate`) ile yakalayıp tam sayfa yenilemesi olmadan görünümleri değiştirir. React Router ve TanStack Router iç içe `<Outlet />` şablonları ve veri yükleyiciler sunar.',
          'Web uygulamalarında paylaşılabilir gezinme durumunu (aktif filtre, sekme, arama kelimesi, sayfa no) `URLSearchParams` içinde tutmak, Yenile / Geri / İleri ve link paylaşımının sorunsuz çalışmasını sağlar.',
        ],
        takeaways: [
          'Paylaşılabilir görünüm state’ini (filtre, sıralama, seçili kayıt) URL’de; geçici UI state’ini (hover, açık dropdown) `useState`’te tut.',
          'Ağır sayfaları `React.lazy(() => import("./HeavyView"))` ile kod bölme (code-splitting) yaparak açılışı hızlandır.',
          'Tauri gibi adres çubuğu olmayan masaüstü uygulamalarında ise tab/rota state makinesi aynı çok panelli deneyimi verir.',
        ],
      },
      pitfall: 'Router yakalaması veya `preventDefault()` olmadan düz `<a href="/lesson/1">` kullanmak tam sayfa yenilemesi yapar ve bellek içi state’i siler.',
      proTip: 'Link üzerine gelindiğinde (`onMouseEnter` / `onFocus`) rota chunk’ını önceden yüklemek anlık geçiş sağlar.',
      challengePrompt: '`React.lazy` ve `Suspense` kullanarak `"MODÜL YÜKLENİYOR..."` fallback’i gösteren tembel (lazy) bir rota sarmalayıcısı yaz.',
      challengeHints: [
        '`const AnalyticsView = lazy(() => import("./AnalyticsView"));` tanımla.',
        '`<AnalyticsView />`’i `<Suspense fallback={...}>` içine sar.',
      ],
      quickCheck: {
        'qc-05-3-a': {
          question: 'Hangi state component `useState`’i yerine URL query parametrelerinde tutulmalıdır?',
          options: [
            'Bir tooltip’in o an hover edilip edilmediği.',
            'Sayfa yenilemesinde veya link paylaşımında korunması gereken arama metni, filtre sekmesi ve sayfa numarası.',
          ],
          explanation: 'URL parametreleri filtrelenmiş görünümleri paylaşılabilir ve yenilemeye dayanıklı kılar.',
        },
      },
    },
    'error-boundaries-suspense': {
      title: 'Error Boundary & `Suspense`',
      summary: 'Çalışma zamanı çökmelerini Error Boundary ile izole et ve asenkron yüklemeleri `Suspense` ile yönet.',
      mentalModel: {
        paragraphs: [
          'Varsayılan olarak herhangi bir component’te yakalanmayan bir JS hatası tüm React uygulamasını ekrandan siler. **Error Boundary** (`getDerivedStateFromError` ve `componentDidCatch` tanımlayan küçük bir class bileşeni), alt ağacındaki render/yaşam döngüsü hatalarını yakalayıp kurtarılabilir bir yedek arayüz gösterir.',
          '`<Suspense fallback={<Skeleton />}>` ise asenkron yüklemeler için aynı görevi yapar: altındaki bir bileşen beklemeye geçtiğinde (ör. `lazy()` import veya React 19 `use(promise)`), hazır olana dek en yakın `Suspense` yedeğini gösterir.',
        ],
        takeaways: [
          'React 19’da Error Boundary hâlâ bir class bileşeni (veya `react-error-boundary` paketi) gerektirir.',
          'Error Boundary’ler `onClick` içindeki hataları veya `setTimeout`/asenkron callback’leri YAKALAMAZ—onları `try/catch` ile yönet.',
          'Bağımsız çalışma panellerini ayrı Error Boundary’lere sar ki tek bir bozuk sekme tüm uygulamayı çökertmesin.',
        ],
      },
      pitfall: 'Sadece en dıştaki `<App />` etrafına tek bir Error Boundary koymak, ufak bir bileşen hatasında kullanıcının tüm çalışma alanını kaybetmesine neden olur.',
      proTip: '`<PanelErrorBoundary key={activeTabId}>` şeklinde `key` verirsen başka sekmeye geçildiğinde hata durumu otomatik sıfırlanır.',
      challengePrompt: 'React 19’da `use(promise)` kullanan bir bileşeni hem `<PanelErrorBoundary>` hem `<Suspense>` ile nasıl güvenle saracağını yaz.',
      challengeHints: [
        'Reddedilen promise hatasını yakalamak için `<PanelErrorBoundary>`’yi `<Suspense>`’in DIŞINA koy.',
        'İç bileşende `const data = use(topicPromise);` çağır.',
      ],
      quickCheck: {
        'qc-05-4-a': {
          question: 'Aşağıdaki hatalardan hangisi bir React Error Boundary tarafından YAKALANMAZ?',
          options: [
            'Alt bileşenlerden birinin JSX render’ı sırasında fırlattığı hata.',
            'Bir `onClick` asenkron event handler’ı içinde yakalanmadan fırlatılan hata.',
          ],
          explanation: 'Event handler ve asenkron callback’ler React render döngüsü dışında çalışır; `try/catch` ile ele alınmalıdır.',
        },
      },
    },
    'feature-based-colocation': {
      title: 'Feature Tabanlı Mimari & Colocation',
      summary: 'Bileşen, hook, tip ve testleri teknik türe göre değil iş alanına (feature) göre gruplayarak ölçeklen.',
      mentalModel: {
        paragraphs: [
          'Küçük projeler dosyaları teknik türe göre (`components/`, `hooks/`, `utils/`) ayırarak başlar. 30+ bileşeni geçince tek bir özelliğin parçalarını bulmak beş klasör arasında zıplamaya dönüşür.',
          '**Colocation**, kodu kullanıldığı yere olabildiğince yakın tutmaktır: ortak UI yapı taşlarını (`Button`, `HudCard`) `components/` altında tutup, iş alanı modüllerini kendi iç detaylarıyla birlikte `features/<domain>/` altında topla.',
        ],
        takeaways: [
          'State, yardımcı fonksiyon ve stilleri ikinci/üçüncü bir özellik gerçekten ihtiyaç duyana kadar kendi özelliğinin yanında tut.',
          'Döngüsel import’lara ve Vite HMR / tree-shaking’i yavaşlatan dev `index.ts` barrel dosyalarına dikkat et.',
          'Tek yönlü bağımlılık akışı koru: `features/*` -> `components/` ve `lib/`; asla `lib/` -> `features/` değil.',
        ],
      },
      pitfall: '`components/common/helpers/utils/index.ts` zincirleri kurmak döngüsel bağımlılık hatalarına ve yavaşlayan TypeScript servisine yol açar.',
      proTip: 'Üç Kuralı: Bir yardımcıyı veya bileşeni paylaşılan `lib/` ya da `components/` klasörüne taşımadan önce en az 3 farklı yerde ihtiyaç duyulmasını bekle.',
      challengePrompt: '`features/roadmap` modülünün `features/notes/internal/` içindeki özel dosyalara dokunmaması için temiz bir sınır sözleşmesi tasarla.',
      challengeHints: [
        'Yalnızca `features/notes/NotesPad.tsx` üzerinden açık prop arayüzünü dışa aktar.',
        'Storage anahtarı ve serileştirme detaylarını `features/notes/` içinde gizli tut.',
      ],
      quickCheck: {
        'qc-05-5-a': {
          question: 'React projelerinde colocation yaklaşımının temel ilkesi nedir?',
          options: [
            'Bileşenleri, hook’ları, testleri ve tipleri global klasörlere dağıtmak yerine onları kullanan özelliğin hemen yanında tutmak.',
            'Tüm bileşenleri tek bir `App.tsx` dosyasına toplamak.',
          ],
          explanation: 'Colocation dosyalar arası atlama mesafesini azaltır ve bir özelliği silmeyi/yeniden düzenlemeyi izole eder.',
        },
      },
    },
  },
};
