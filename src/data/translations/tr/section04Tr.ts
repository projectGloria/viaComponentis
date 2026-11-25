import type { SectionTranslation } from './types';

export const section04Tr: SectionTranslation = {
  title: 'Effect’ler, Senkronizasyon & Yaşam Döngüsü',
  subtitle: '`useEffect` ile dış sistemleri senkronize etme, gereksiz effect’lerden kaçınma, custom hook’lar ve `useLayoutEffect`.',
  topics: {
    'useeffect-mental-model-cleanup': {
      title: '`useEffect` Mantığı & Cleanup',
      summary: 'Mount/unmount yerine kurulum, temizlik (cleanup) ve reaktif bağımlılık döngüleri şeklinde düşün.',
      mentalModel: {
        paragraphs: [
          '`useEffect` eski `componentDidMount` yaşam döngüsü değildir—React bileşenini dış bir sistemle (timer, WebSocket, DOM dinleyicisi, ağ aboneliği) senkronize etme aracıdır.',
          'Dependency array içindeki reaktif bir değer her değiştiğinde React önce bir önceki effect’in **cleanup** fonksiyonunu çalıştırır, ardından yeni kurulumu çalıştırır. Geliştirmede `<StrictMode>`, cleanup’ının kurulumu gerçekten geri alıp almadığını doğrulamak için bilerek mount → cleanup → re-mount yapar.',
        ],
        takeaways: [
          'Effect içinde okuduğun her reaktif prop, state veya bileşen fonksiyonunu dependency array’e ekle.',
          'Dinleyiciler, interval’ler, abonelikler ve `AbortController.abort()` için mutlaka cleanup fonksiyonu döndür.',
          'Dependency array’e yalan söyleme—bir bağımlılık çok sık tetikleniyorsa reaktif olmayan kısmı dışarı çıkar veya kararlı hale getir.',
        ],
      },
      pitfall: '`useEffect` içinde `AbortController` veya `ignore` bayrağı olmadan `fetch` atmak, eski yavaş isteğin yeni hızlı isteğin üzerine yazmasına (race condition) neden olur.',
      proTip: 'Effect’in geliştirmede StrictMode çift çalıştırmasında bozuluyorsa, production’a çıkmadan gerçek bir cleanup hatası yakalamışsın demektir!',
      challengePrompt: '`keydown` dinleyicisi bağlayan ve unmount/değişimde temizleyen bir `useWindowKey(key: string, handler: () => void)` effect’i yaz.',
      challengeHints: [
        '`useEffect` içinde `window.addEventListener("keydown", onKeyDown)` ekle.',
        '`() => window.removeEventListener("keydown", onKeyDown)` döndür.',
      ],
      quickCheck: {
        'qc-04-1-a': {
          question: '`useEffect` içindeki cleanup fonksiyonu ne zaman çalışır?',
          options: [
            'Yalnızca component DOM’dan kaldırılırken (unmount).',
            'Bağımlılıklar değişip effect yeniden çalışmadan hemen önce VE component unmount olurken.',
          ],
          explanation: 'Cleanup hem yeni bağımlılıklarla yeniden senkronize olmadan önce hem de son çıkışta çalışır.',
        },
      },
    },
    'when-you-dont-need-an-effect': {
      title: 'Ne Zaman Effect’e İhtiyacın Yoktur?',
      summary: 'Türetilen veriler, event yanıtları ve prop değişiminde sıfırlamalar için gereksiz `useEffect` zincirlerini temizle.',
      mentalModel: {
        paragraphs: [
          'İki yaygın `useEffect` kullanımı neredeyse her zaman hata veya boşa ekstra render demektir: (1) Veriyi render için dönüştürmek (`useEffect(() => setFiltered(items.filter(...)), [items])`) ve (2) Kullanıcı aksiyonunu tetiklemek (`useEffect(() => { if (submitted) postForm(); }, [submitted])`).',
          'Prop/state dönüştürme doğrudan render sırasında (gerekirse `useMemo` ile) yapılmalıdır. Kullanıcının tıklamasıyla başlayan işler ise doğrudan `onClick`/`onSubmit` içinde yürütülür. Bir ID değiştiğinde alt component’in state’ini sıfırlamak için ise `<Child key={id} />` yazmak yeterlidir.',
        ],
        takeaways: [
          'Bir React state’inden diğerini güncellemek için asla `useEffect` yazma—render sırasında hesapla.',
          'Boolean bir bayrağı izleyip `POST` isteği atan effect’ler yerine isteği doğrudan `onSubmit` / `onClick` içinde başlat.',
          '5 state’i temizleyen bir `useEffect` yerine bileşene `key={topicId}` vererek ağacı temizce sıfırla.',
        ],
      },
      pitfall: '`useEffect(() => setFullName(first + " " + last), [first, last])` yazmak her güncellemede önce eski değerle fazladan bir render çalıştırır.',
      proTip: 'Ne zaman `useEffect` yazacak olsan kendine sor: "React dışındaki hangi harici sistemle senkronize oluyorum?" Cevap yoksa büyük ihtimalle effect gerekmiyordur.',
      challengePrompt: '`const [draft, setDraft] = useState(initial); useEffect(() => setDraft(initial), [id, initial]);` yapısını `<NotesEditor>` içinde effect olmadan yeniden yaz.',
      challengeHints: [
        '`NotesEditor` içinde sadece `useState(initial)` tut.',
        'Parent’ta `<NotesEditor key={topicId} initial={saved} />` şeklinde `key` geçir.',
      ],
      quickCheck: {
        'qc-04-2-a': {
          question: 'Aşağıdaki senaryolardan hangisi gerçekten `useEffect` gerektirir?',
          options: [
            '`qty` değiştiğinde `totalPrice = price * qty` hesaplamak.',
            'Bileşen ekrandayken bir tarayıcı `ResizeObserver` veya WebSocket akışına abone olmak.',
            'Kullanıcı Kaydet’e bastığında formu sunucuya göndermek.',
          ],
          explanation: 'Harici bir tarayıcı API’sine veya ağ aboneliğine bağlanmak `useEffect`’in asıl kullanım alanıdır.',
        },
      },
    },
    'building-custom-hooks': {
      title: 'Yeniden Kullanılabilir Custom Hook’lar',
      summary: 'State barındıran mantıkları (`useLocalStorage`, `useDebounce`, `useToggle`) temiz `use*` hook’larına çıkar.',
      mentalModel: {
        paragraphs: [
          'Custom hook’lar bileşenler arasında state’in kendisini değil, **stateful mantığı** paylaşmanı sağlar. `useDebounce(query, 250)` çağıran her bileşen kendi bağımsız state’ine ve effect döngüsüne sahip olur.',
          '`use` ön eki yalnızca bir isim alışkanlığı değildir: React linter ve derleyicisi Hook Kurallarını bu ön ek sayesinde denetler. Custom hook’lara ne yaptıklarına göre isim ver (`useDebouncedValue`, `useOnlineStatus`).',
        ],
        takeaways: [
          'Custom hook’lar state *değerini* değil state *mantığını* paylaşır (değer paylaşmak için Context veya store gerekir).',
          'Kolay yeniden adlandırma için tuple `[value, setter] as const`, çok alanlı dönüşler için obje `{ data, isLoading }` döndür.',
          'Arayan tarafın tiplerini korumak için TypeScript generic’leri (`<T>(value: T, delayMs: number): T`) kullan.',
        ],
      },
      pitfall: 'İçinde `useState` çağıran bir yardımcıya `getStorage()` adını vermek Hook Kuralları denetimini bozar.',
      proTip: 'Custom hook’ları tek bir uyumlu dış sorumluluğa odaklı tut; 20 alan döndüren dev hook’lar ilgisiz re-render’ları birbirine bağlar.',
      challengePrompt: 'Sabit referanslı callback’le `[value, toggle, setValue] as const` döndüren tipli bir `useToggle(initial = false)` custom hook’u yaz.',
      challengeHints: [
        '`toggle` için `useCallback(() => setValue(v => !v), [])` kullan.',
        'TypeScript tuple tipini korumak için sonuna `as const` ekle.',
      ],
      quickCheck: {
        'qc-04-3-a': {
          question: 'Hem `<PanelA />` hem `<PanelB />` `useToggle(false)` kullanırsa `<PanelA />` değiştiğinde ne olur?',
          options: [
            'İkisi birden `true` olur.',
            'Yalnızca `<PanelA />` `true` olur; her çağrı noktası kendi bağımsız state’ine sahiptir.',
          ],
          explanation: 'Custom hook’lar aynı state örneğini değil, state oluşturma mantığını paylaşır.',
        },
      },
    },
    'uselayouteffect-useid-external-store': {
      title: '`useLayoutEffect`, `useId` & `useSyncExternalStore`',
      summary: 'Titremesiz DOM ölçümü, erişilebilir ID’ler ve harici store abonelikleri için özelleşmiş hook’ları tanı.',
      mentalModel: {
        paragraphs: [
          '`useEffect` tarayıcı ekranı boyadıktan SONRA asenkron çalışır. `useLayoutEffect` ise tarayıcı boyamadan ÖNCE senkron çalışır—bunu YALNIZCA DOM ölçümleri alıp (`getBoundingClientRect`) kullanıcı sıçrama görmeden bir tooltip’in yerini ayarlaman gerektiğinde kullan.',
          '`useId()` `htmlFor` / `aria-describedby` eşleştirmeleri için benzersiz ve kararlı ID’ler üretir (liste `key`’i olarak kullanma!). `useSyncExternalStore(subscribe, getSnapshot)` ise `matchMedia`, `navigator.onLine` veya harici store’lara güvenli (tearing olmadan) abone olmanı sağlar.',
        ],
        takeaways: [
          'Varsayılan olarak `useEffect` kullan; `useLayoutEffect`’e sadece DOM ölçümü sonrası görsel titremeyi önlemek için başvur.',
          'Çoklu bileşen örneklerinin çakışmaması için form etiketleri ve SVG `<defs>` ID’lerinde `useId()` kullan.',
          '`window.matchMedia` gibi tarayıcı API’lerini React’e temizce bağlamak için `useSyncExternalStore` kullan.',
        ],
      },
      pitfall: '`.map()` içinde `key={useId()}` kullanmak yanlıştır—`useId()` liste anahtarı için değil erişilebilirlik/DOM ID’leri içindir.',
      proTip: '`const id = useId();` ile `<label htmlFor={`${id}-email`}>` birleştirmek sayfada kaç modal açılırsa açılsın sıfır ID çakışması sağlar.',
      challengePrompt: '`useId()` kullanarak `<label htmlFor>` ve `<input id>` bağını kuran erişilebilir bir `<CyberField label="API Key" />` bileşeni yaz.',
      challengeHints: [
        'Bileşen başında `const inputId = useId();` çağır.',
        '`htmlFor={inputId}` ve `id={inputId}` olarak bağla.',
      ],
      quickCheck: {
        'qc-04-4-a': {
          question: 'Ne zaman `useEffect` yerine `useLayoutEffect` tercih edilir?',
          options: [
            'İsteklerin daha erken başlaması için tüm veri çekme işlemlerinde.',
            'Tarayıcı boyamadan önce DOM ölçümü yapıp görsel titremeyi (flicker) önlemek gerektiğinde.',
          ],
          explanation: '`useLayoutEffect` tarayıcı boyamasından önce çalışarak yerleşim düzeltmesini tek karede tamamlar.',
        },
      },
    },
  },
};
