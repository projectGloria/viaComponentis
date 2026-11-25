import type { SectionTranslation } from './types';

export const section03Tr: SectionTranslation = {
  title: 'State & Temel Hook’lar',
  subtitle: 'State anlık görüntüleri, batching, state’i yukarı taşıma, reducer’lar, ref’ler ve closure tuzakları.',
  topics: {
    'usestate-and-batching': {
      title: '`useState` & Otomatik Batching',
      summary: 'State’i render snapshot’ı olarak anla; functional updater, lazy initializer ve React 19 batching’i kullan.',
      mentalModel: {
        paragraphs: [
          '`setState(next)` çağırmak o anda çalışan fonksiyonun içindeki state değişkenini anında DEĞİŞTİRMEZ—gelecekte `next` değeriyle yeni bir re-render planlar. Tek bir event handler boyunca state değişkeni o render’daki anlık değerinde (snapshot) sabit kalır.',
          'React her yerde (`onClick`, `setTimeout`, Promise, native event) peş peşe yapılan `setState` çağrılarını tek bir re-render içinde gruplar (**automatic batching**). Yeni state bir öncekine bağlıysa `setCount(c => c + 1)` gibi updater fonksiyonu ver ki kuyruğa alınan güncellemeler birbiri üzerine eklensin.',
        ],
        takeaways: [
          'Tek seferde birden çok güncelleme birikebiliyorsa her zaman `setCount(prev => prev + 1)` kullan.',
          'Ağır başlangıç hesaplarını `useState(() => parseLocalStorage())` şeklinde fonksiyonla ver ki sadece ilk mount’ta çalışsın.',
          'Mevcut prop veya state’ten doğrudan hesaplanabilecek değerleri asla ayrı `useState` içinde saklama.',
        ],
      },
      pitfall: '`setCount(count + 1); setCount(count + 1);` yazmak sayacı 2 değil yalnızca 1 artırır; çünkü `count` o render boyunca hep aynı değerdedir.',
      proTip: '`useState(pahaliFonksiyon())` fonksiyonu her render’da yeniden çalıştırır; `useState(pahaliFonksiyon)` ise sadece ilk mount’ta bir kez çalıştırır.',
      challengePrompt: 'Boş bir `Set<string>`’i tembel (lazy) başlatan ve önceki `Set`’i bozmadan ID ekleyip çıkaran bir `useToggleSet` hook’u yaz.',
      challengeHints: [
        '`useState`’e `() => new Set<string>()` ver.',
        'Functional updater içinde `const next = new Set(prev)` ile kopya oluştur.',
      ],
      quickCheck: {
        'qc-03-1-a': {
          question: 'React 19’da `fetch().then(...)` içinde `setA(1)` ve `setB(2)` çağrıldığında kaç re-render gerçekleşir?',
          options: [
            'İki ayrı render (batching sadece tıklama event’lerinde çalışır).',
            'Tek bir gruplanmış (batched) render.',
          ],
          explanation: 'React 18+ ve 19’da automatic batching; Promise, timeout ve native event’lerde bile güncellemeleri tek render’da toplar.',
        },
      },
    },
    'lifting-state-up': {
      title: 'State Yapısı & State’i Yukarı Taşıma (Lifting State)',
      summary: 'Tek gerçek kaynak (single source of truth) kur, türetilebilen veriyi çoğaltma ve kardeşleri senkronize et.',
      mentalModel: {
        paragraphs: [
          'İki kardeş component’in aynı veriyi paylaşması veya birbirini etkilemesi gerektiğinde, yerel state’i ikisinden de kaldırıp en yakın ortak parent’a taşı (**lifting state up**). State’i prop olarak aşağı, güncelleyici callback’leri yukarı geçir.',
          'Bir o kadar önemli nokta da state’i minimal tutmaktır: Elinde zaten `items` ve `query` varsa `filteredItems` için ekstra state açma; `completionPct` veya `fullName` gibi türetilebilir (derived) verileri doğrudan render sırasında hesapla.',
        ],
        takeaways: [
          'State içinde komple obje kopyası (`selectedTopic`) yerine sadece ID (`selectedTopicId`) tut.',
          'Toplam, yüzde ve filtrelenmiş liste gibi sonuçları doğrudan render sırasında hesapla.',
          'State’i sadece tek bir dal kullanıyorsa aşağıda tut; yalnızca kardeşler paylaşacaksa yukarı taşı.',
        ],
      },
      pitfall: 'Bir prop’u `useState(props.items)` diye state’e kopyalamak, parent’tan gelen sonraki güncellemelerin yoksayılmasına neden olur.',
      proTip: 'Başka bir öğeye geçerken (ör. ders değiştirirken) alt component’in tüm iç state’ini sıfırlamak istersen `<Child key={topic.id} />` vermen yeterlidir.',
      challengePrompt: '`items`, `search` ve `filteredItems` için üç ayrı `useState` kullanan bir yapıyı iki minimal state + türetilmiş filtrelemeye indirge.',
      challengeHints: [
        '`filteredItems` state’ini tamamen sil.',
        'Render gövdesinde `const visible = items.filter(...)` hesapla.',
      ],
      quickCheck: {
        'qc-03-2-a': {
          question: 'Neden state’te `selectedItem: Item | null` yerine `selectedId: string | null` tutmak daha güvenlidir?',
          options: [
            '`items` sunucudan veya parent’tan güncellendiğinde `items.find(x => x.id === selectedId)` her zaman güncel kalır.',
            '`useState` içine obje konulamaz.',
          ],
          explanation: 'ID tutmak `items` dizisini tek gerçek kaynak olarak korur ve bayat obje kopyalarını önler.',
        },
      },
    },
    'usereducer-complex-state': {
      title: 'Karmaşık State İçin `useReducer`',
      summary: 'Birlikte değişen çoklu alanları ve action tiplerini saf, test edilebilir reducer fonksiyonlarında topla.',
      mentalModel: {
        paragraphs: [
          'Birden fazla state alanı her zaman birlikte değişiyorsa (ör. `openTabs`, `activeTab`, `history`) veya sonraki durum karmaşık kurallara bağlıysa, handler’ların içine beş ayrı `set*` dağıtmak tutarsız ara durumlar yaratır.',
          '`useReducer(reducer, initialState)` geçişleri saf bir `(state, action) => nextState` fonksiyonuna toplar. Bileşenler yalnızca `dispatch({ type: "CLOSE_TAB", id })` der—böylece NE olduğunu (`dispatch`) NASIL güncellendiğinden (`reducer`) ayırırsın.',
        ],
        takeaways: [
          'Reducer fonksiyonları saf olmalıdır: içinde `fetch`, `localStorage` veya `state` mutasyonu yapma.',
          'Eksiksiz `switch` kontrolü için action’ları TypeScript discriminated union ile tiple.',
          'Context üzerinden `dispatch` aktarmak harikadır; çünkü React `dispatch` referansının ömür boyu değişmeyeceğini garanti eder.',
        ],
      },
      pitfall: 'Reducer içinde `state.openIds.push(action.id); return state;` yazmak aynı obje referansını döndürür ve React ekranı güncellemez.',
      proTip: 'Bir reducer’ı test etmek için DOM veya React render’ı gerekmez—doğrudan `tabsReducer(prev, action)` çağırıp çıktıyı kontrol edebilirsin!',
      challengePrompt: '`tabsReducer` içine yalnızca `keepId`’yi açık bırakan ve onu aktif yapan `{ type: "CLOSE_OTHERS"; keepId: string }` action’ını ekle.',
      challengeHints: [
        '`TabsAction` union tipini genişlet.',
        '`state.openIds` içinde `keepId` var mı kontrol et ve sadece onu döndür.',
      ],
      quickCheck: {
        'qc-03-3-a': {
          question: '`useReducer`’dan gelen `dispatch` fonksiyonunu dependency array’de güvenle kullanabilmemizin nedeni nedir?',
          options: [
            'React, `dispatch` referansının component ömrü boyunca sabit kaldığını garanti eder.',
            '`dispatch` render planlamadan state’i senkron olarak değiştirir.',
          ],
          explanation: 'Tıpkı `setState` gibi `dispatch` kimliği de re-render’lar arasında asla değişmez.',
        },
      },
    },
    'useref-dom-escape-hatches': {
      title: '`useRef` & DOM Kaçış Kapıları',
      summary: 'Re-render tetiklemeden değişken veri sakla ve DOM elementlerine doğrudan eriş.',
      mentalModel: {
        paragraphs: [
          '`useRef(initialValue)` render’lar boyunca yaşayan `{ current: initialValue }` kutusu döndürür. `useState`’in aksine `ref.current` değerini değiştirmek re-render TETİKLEMEZ.',
          'Ref’lerin iki temel görevi vardır: (1) `requestAnimationFrame` ID’leri, timer referansları veya animasyon lerp koordinatları gibi görsel olmayan verileri tutmak; (2) odaklama, scroll veya 2D/3D çizim için DOM düğümüne (`<canvas ref={canvasRef} />`) erişmek.',
        ],
        takeaways: [
          'Render gövdesinde `ref.current` okuma/yazma yapma—bunu `useEffect` veya event handler’larda yap.',
          'DOM ref’lerini `useRef<HTMLCanvasElement>(null)` ile tiple ve erişmeden önce null kontrolü yap.',
          'React 19’da callback ref’lerden doğrudan temizlik fonksiyonu döndürülebilir (`ref={(node) => { ... return () => cleanup(); }}`).',
        ],
      },
      pitfall: 'JSX içinde `<span>{countRef.current}</span>` göstermek bayat veri gösterir; çünkü `.current` değiştiğinde React yeniden render etmez.',
      proTip: '60fps imleç takibi (`CharacterRig`) için koordinatları `useRef` içinde tutup `requestAnimationFrame` ile `el.style.transform` güncellemek sıfır React re-render’ı demektir!',
      challengePrompt: 'Tıklandığında belirli bir `<section ref={targetRef}>` bölümüne yumuşakça (`smooth`) kaydıran bir `ScrollTarget` bileşeni yaz.',
      challengeHints: [
        '`const sectionRef = useRef<HTMLElement>(null)` tanımla.',
        'Tıklamada `sectionRef.current?.scrollIntoView({ behavior: "smooth" })` çağır.',
      ],
      quickCheck: {
        'qc-03-4-a': {
          question: 'Ne zaman `useState` yerine `useRef` seçilmelidir?',
          options: [
            'Değer JSX çıktısını doğrudan belirlediğinde.',
            'Değer sadece effect’ler, timer’lar veya animasyon döngüleri için gerektiğinde ve değişimi re-render tetiklememeliyse.',
          ],
          explanation: 'JSX o değeri okuyorsa `useState`; sadece yan etkiler/animasyon okuyorsa `useRef` kullan.',
        },
      },
    },
    'rules-of-hooks-closures': {
      title: 'Hook Kuralları & Closure Tuzakları',
      summary: 'Hook’ların neden en üst seviyede koşulsuz çağrılması gerektiğini ve bayat (stale) closure hatasını anla.',
      mentalModel: {
        paragraphs: [
          'React perde arkasında her Fiber düğümü için hook’ları çağrı sırasına göre bağlı liste olarak tutar. Bir hook’u `if`, döngü veya erken `return` sonrasında çağırmak sıralamayı kaydırır ve state yuvalarını bozar.',
          'Her render kendi fonksiyon çağrısı olduğu için, 1. render’da oluşturulan bir `setInterval` veya callback 1. render’daki değişkenleri yakalar (closure). Eğer interval içinde `setCount(c => c + 1)` yerine `setCount(count + 1)` yazarsan, interval sonsuza dek `0` okuyup takılı kalır.',
        ],
        takeaways: [
          'Hook’ları yalnızca React component’lerinin veya özel `use*` hook’ların en üst seviyesinde çağır.',
          'Erken `return` ifadelerini her zaman tüm hook çağrılarından SONRA yaz.',
          'Timer ve listener’lardaki bayat closure’ları functional updater (`c => c + 1`), ref veya tam dependency ile çöz.',
        ],
      },
      pitfall: '`if (!open) return null;` satırını `useState` veya `useEffect`’in ÜSTÜNE koymak Hook Kurallarını ihlal eder ve açılıp kapanmada uygulamanın çökmesine yol açar.',
      proTip: 'Her gerçek projede `eslint-plugin-react-hooks` (`rules-of-hooks` ve `exhaustive-deps`) eklentisini açık tut.',
      challengePrompt: 'Şu koddaki iki hatayı bul ve düzelt: `function Panel({ show }) { if (!show) return null; const [n, setN] = useState(0); useEffect(() => { setInterval(() => setN(n + 1), 1000); }, []); return <div>{n}</div>; }`',
      challengeHints: [
        'Erken `return` satırını tüm hook’ların altına taşı.',
        '`useEffect` içinde functional updater ve `clearInterval` cleanup ekle.',
      ],
      quickCheck: {
        'qc-03-5-a': {
          question: 'React neden bir `if` bloğu içinde `useState` çağrılmasına izin vermez?',
          options: [
            'Hook’lar her render’da aynı çağrı sırasına güvenerek state yuvalarıyla eşleşir.',
            'JavaScript `if` içinde closure oluşturmayı yasaklar.',
          ],
          explanation: 'React hook’ları değişken adına göre değil, render sırasındaki çağrı indeksine göre tanır.',
        },
      },
    },
  },
};
