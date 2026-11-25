import type { SectionTranslation } from './types';

export const section02Tr: SectionTranslation = {
  title: 'Component’ler & Kompozisyon',
  subtitle: 'Tiplenmiş prop sözleşmeleri, children/slot kompozisyonu, render saflığı, kontrollü formlar ve compound API’ler.',
  topics: {
    'props-typescript-interfaces': {
      title: 'Props & TypeScript Interface’leri',
      summary: 'Discriminated union tipler, varsayılan değerler ve HTML prop aktarımıyla sağlam bileşen kontratları kur.',
      mentalModel: {
        paragraphs: [
          'Props, parent’tan child’a aktarılan salt okunur girdi sözleşmesidir. Bir component içinde prop’ları asla doğrudan değiştirme (mutate etme); yerel düzenleme gerekiyorsa state oluştur.',
          'TypeScript’te bir sürü opsiyonel boolean (`{ isLoading?: boolean; error?: string; data?: T }`) yerine **discriminated union** (`{ status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: T }`) kullan; böylece imkansız durumların derlenmesini daha baştan engellersin.',
        ],
        takeaways: [
          'Varsayılan değerleri doğrudan parametre destructuring sırasında ver: `{ variant = "ghost", ...rest }`.',
          'HTML elementlerini saran bileşenlerde `ComponentPropsWithoutRef<"button">` ile tüm yerel özellikleri devral.',
          'Discriminated union’lar çelişkili opsiyonel prop kombinasyonlarını ortadan kaldırır.',
        ],
      },
      pitfall: 'Özel buton sarmalayıcılarında `type="button"` tanımlamamak, `<form>` içinde kullanıldığında istenmeden form submit etmesine neden olur.',
      proTip: 'React 19’da `ref` artık normal bir prop olarak geçebiliyor; yeni fonksiyon component’lerde `forwardRef` sarmalayıcısına gerek yok.',
      challengePrompt: '`mode: "info"` (yalnızca `message`) veya `mode: "confirm"` (`message` ve `onConfirm: () => void`) destekleyen bir `AlertProps` discriminated union tipi tanımla.',
      challengeHints: [
        '`mode` alanını ayırt edici literal olarak paylaşan iki ayrı obje tipi birleştir.',
        'JSX içinde `props.mode === "confirm"` ile daraltma yap.',
      ],
      quickCheck: {
        'qc-02-1-a': {
          question: 'Özel bir `<Button />` component’inde neden `ComponentPropsWithoutRef<"button">` extend edilir?',
          options: [
            'Butona otomatik CSS stili eklediği için.',
            'Standart `<button>` özelliklerini (`disabled`, `onClick`, `aria-*`) tek tek yazmadan tam tip güvenliğiyle devralmak için.',
          ],
          explanation: 'Yerel HTML element prop’larını tek satırda temizce miras almanı sağlar.',
        },
      },
    },
    'children-composition-patterns': {
      title: 'Children & Kompozisyon Desenleri',
      summary: 'JSX slot’ları ve `children` kullanarak prop drilling’den ve şişmiş boolean bayraklarından kurtul.',
      mentalModel: {
        paragraphs: [
          'React kalıtım yerine kompozisyonu tercih eder. Bir kapsayıcı (`HudCard`, `Modal`, `SplitPane`) içindeki domain verisini bilmek zorunda değildir; yalnızca `children` veya isimli JSX slot prop’larını (`header`, `actions`, `footer`) yerleştirir.',
          'JSX’i `children` üzerinden geçmek performansa da doğrudan katkı sağlar: Kapsayıcı kendi hover veya scroll state’iyle re-render olsa bile parent’tan gelen `children` referansı aynı kaldığı için React o alt ağacı tekrar render etmez.',
        ],
        takeaways: [
          'Tek boşluklu kapsayıcılarda `children: ReactNode`, çok bölgeli düzenlerde isimli `ReactNode` prop’ları kullan.',
          'Kompozisyon, Context veya store eklemeden çoğu prop drilling problemini çözer.',
          'Hızlı değişen state’i sarmalayıcıda tutup ağır içeriği `children` olarak vermek re-render’ları doğal olarak izole eder.',
        ],
      },
      pitfall: '`showHeaderButton`, `buttonLabel`, `onButtonClick` gibi 10 tane yapılandırma prop’u eklemek yeniden kullanılabilir kapsayıcıları katı monolitlere dönüştürür.',
      proTip: '`<HudPanel actions={<button>EXPORT</button>}>...</HudPanel>` şeklinde JSX ver; böylece butonun kontrolü tamamen çağıran tarafta kalır.',
      challengePrompt: '`scrollY` state’ini kendi içinde tutan bir `<ScrollTracker>` bileşeni yaz; öyle ki scroll oldukça içindeki ağır `<ExpensiveGraph />` bileşeni re-render olmasın.',
      challengeHints: [
        '`ScrollTracker` içinde `children: ReactNode` kabul et.',
        'Parent içinde `<ScrollTracker><ExpensiveGraph /></ScrollTracker>` şeklinde kullan.',
      ],
      quickCheck: {
        'qc-02-2-a': {
          question: '`ScrollTracker` kendi `scrollY` state’ini güncellediğinde `children` neden re-render olmaz?',
          options: [
            'React `children` alan her bileşeni otomatik memoize ettiği için.',
            '`children` parent tarafından daha önce üretildiği ve obje referansı değişmediği için.',
          ],
          explanation: 'Parent re-render olmadığı sürece `props.children` aynı referans olarak kalır ve React o alt ağacı atlar.',
        },
      },
    },
    'pure-components-immutability': {
      title: 'Saf (Pure) Component’ler & Immutability',
      summary: 'Render fonksiyonlarını saf tut ve React’in değişiklikleri yakalaması için dizi/objeleri immutable güncelle.',
      mentalModel: {
        paragraphs: [
          'Aynı girdiler (props, state, context) verildiğinde bir React component’i render sırasında her zaman aynı JSX’i döndürmelidir. Dışarıdaki değişkenleri değiştirmemeli, prop dizilerine `.push()` yapmamalı veya render gövdesinde ağ/DOM yan etkisi çalıştırmamalıdır.',
          'React state ve prop değişikliklerini `Object.is` ile referans üzerinden kontrol eder. Bir diziyi veya objeyi yerinde değiştirirsen (`items.push(x)`), referans aynı kalacağı için React hiçbir şey değişmedi sanır ve ekranı güncellemez.',
        ],
        takeaways: [
          'Güncellemelerde kopya üreten yöntemler kullan: `{ ...obj }`, `.map()`, `.filter()`, `.toSorted()`, `[...arr, item]`.',
          'Aynı render içinde yeni yaratılmış yerel bir diziyi doldurmak sorun değildir; ancak var olan prop veya state’i değiştirmek yasaktır.',
          'Yan etkiler render gövdesine değil, event handler’lara veya `useEffect` içine aittir.',
        ],
      },
      pitfall: 'State dizisi üzerinde doğrudan `items.sort()` çağırmak diziyi yerinde değiştirir ve sinsi bayat-UI hatalarına neden olur.',
      proTip: 'Prop ve state dizilerini `readonly T[]` olarak tiple; yanlışlıkla `.push()` veya `.sort()` çağrılırsa TypeScript derleme anında uyarsın.',
      challengePrompt: 'Diziyi bozmayan `removeTag(tags: readonly string[], tagToRemove: string)` ve obje kopyalayan `renameUser(user, name)` yardımcı fonksiyonlarını yaz.',
      challengeHints: [
        'Silme işlemi için `.filter()` kullan.',
        'Obje güncellemesi için `{ ...user, name }` spread söz dizimini kullan.',
      ],
      quickCheck: {
        'qc-02-3-a': {
          question: 'Geliştirme ortamında `<StrictMode>` component gövdesini neden iki kez çalıştırır?',
          options: [
            'JIT derleyiciyi ısıtıp performansı ikiye katlamak için.',
            'Ortak değişkenleri veya prop’ları bozan saf olmayan (impure) render hatalarını hemen yakalamak için.',
          ],
          explanation: 'İki kez çalıştırma, render sırasında kazara yapılan mutasyonları anında ortaya çıkarır.',
        },
      },
    },
    'events-controlled-forms': {
      title: 'Event’ler & Kontrollü Formlar',
      summary: 'SyntheticEvent mantığını, iç içe tıklamalarda bubbling durdurmayı ve controlled vs uncontrolled input seçimini öğren.',
      mentalModel: {
        paragraphs: [
          'React event’leri kök düğümde dinler ve tarayıcılar arası tutarlı bir `SyntheticEvent` ile sarar. Her event, `e.stopPropagation()` çağırılmadıkça component ağacında yukarı doğru kabarcıklanır (bubble).',
          'Formlarda anlık filtreleme, karakter sayacı veya alanlar arası doğrulama gerekiyorsa `value={text}` + `onChange` ile **controlled** input kullan. Sadece gönderimde veri okuyacağın basit formlarda ise `defaultValue` + `FormData` (**uncontrolled**) çok daha sadedir.',
        ],
        takeaways: [
          'Event prop’una fonksiyon çağrısı `onClick={handleClick()}` değil, fonksiyon referansı `onClick={handleClick}` ver.',
          'Tıklanabilir kartların içindeki aksiyon butonlarında `e.stopPropagation()` kullan ki buton tıklandığında kart da açılmasın.',
          'Aynı `<input>` üzerinde `value` ve `defaultValue` prop’larını asla birlikte kullanma.',
        ],
      },
      pitfall: 'Controlled bir input’un `value` değerini başlangıçta `undefined` bırakıp sonradan string vermek React uyarısına yol açar.',
      proTip: 'Controlled metin state’lerini her zaman `useState("")` ile boş string olarak başlat.',
      challengePrompt: 'Tıklanabilir bir kart (`<div onClick={onOpen}>`) içine `onOpen`’ı tetiklemeden durum değiştiren bir `<button>` yerleştir.',
      challengeHints: [
        'Buton handler’ında `React.MouseEvent<HTMLButtonElement>` parametresi al.',
        'Durumu değiştirmeden önce `e.stopPropagation()` çağır.',
      ],
      quickCheck: {
        'qc-02-4-a': {
          question: 'Ne zaman uncontrolled yerine controlled `<input>` tercih edilmelidir?',
          options: [
            'Her tuş vuruşunda anlık arama, canlı doğrulama veya buton kilitleme gerektiğinde.',
            'Hiçbir zaman; React 19 controlled input’ları kaldırdı.',
          ],
          explanation: 'Controlled input’lar her karakterde React state’ini tek gerçek kaynak (single source of truth) olarak tutar.',
        },
      },
    },
    'compound-components-apis': {
      title: 'Compound Component’ler & Esnek API’ler',
      summary: 'Context ile birbirine bağlanan çok parçalı bileşen aileleri (`Tabs.Root`, `Tabs.Trigger`) tasarla.',
      mentalModel: {
        paragraphs: [
          'Tabs, Accordion, Select veya Dialog gibi koordineli çalışan parçalı yapılarda düz prop API’leri hızla karmaşıklaşır. **Compound Components** deseninde kök bileşen state’i Context üzerinden paylaşır; alt bileşenler (`Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`) bu state’i otomatik okur.',
          'Bu yaklaşım, kullanıcıya JSX sırası, ekstra sarmalayıcılar ve stil üzerinde tam esneklik sunarken klavye/ARIA koordinasyonunu içeride gizler.',
        ],
        takeaways: [
          'Alt bileşenleri özellik olarak bağla (`HudTabs.Trigger`) veya anlamlı isimlerle birlikte dışa aktar.',
          'Alt bileşen kök dışında kullanılırsa `useTabsContext()` içinde net bir hata fırlat.',
          'Kütüphane bileşeni yazarken hem controlled (`value`) hem uncontrolled (`defaultValue`) kullanımı destekle.',
        ],
      },
      pitfall: '`createContext`’e sessizce sahte bir varsayılan değer vermek, eksik Provider hatalarını gizleyip production’da sürprizlere yol açar.',
      proTip: 'React 19’da `<TabsContext.Provider value={...}>` yerine doğrudan `<TabsContext value={...}>` yazabilirsin!',
      challengePrompt: '`HudTabs` yapısına yalnızca `active === id` iken `children` çizen bir `Panel` alt bileşeni ekle.',
      challengeHints: [
        '`Panel` içinde `useTabs()` çağır.',
        '`active !== id` ise `null` döndür.',
      ],
      quickCheck: {
        'qc-02-5-a': {
          question: 'Compound Components deseninin temel avantajı nedir?',
          options: [
            'Tüketiciler onlarca konfigürasyon prop’u geçmeden alt elemanları JSX içinde özgürce düzenleyebilir.',
            'Tüm React re-render’larını otomatik olarak engeller.',
          ],
          explanation: 'Yerleşim/markup esnekliğini ortak dahili state yönetiminden ayırır.',
        },
      },
    },
  },
};
