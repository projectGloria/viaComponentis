import type { SectionTranslation } from './types';

export const section06Tr: SectionTranslation = {
  title: 'Performans & Modern React',
  subtitle: 'Render maliyeti ölçümü, nokta atışı memoization, concurrent transition’lar, React 19 Action’ları ve test desenleri.',
  topics: {
    'profiling-reconciliation-costs': {
      title: 'Profiling & Reconciliation Maliyetleri',
      summary: 'Erken optimizasyona dalmadan önce gerçek darboğazları React DevTools Profiler ile ölç.',
      mentalModel: {
        paragraphs: [
          'Hafif bir component’i re-render etmek mikrosaniyeler sürer; zaten hızlı bir yeri optimize etmek gereksiz karmaşıklık ekler. Gerçek yavaşlamalar genelde: (1) yüksek frekanslı güncellemelerin (fare hareketi, yazı yazma) dev listeleri yeniden render etmesinden, (2) render içindeki ağır senkron hesaplardan veya (3) DOM ölçüm sıçramalarından gelir.',
          '`memo` sarmalamaya başlamadan önce **yapısal çözümleri** dene: hızlı değişen state’i küçük bir yaprak (leaf) bileşene indir, ağır alt ağaçları `children` olarak geçir veya 60fps animasyonları doğrudan ref ile yönet.',
        ],
        takeaways: [
          'Performansı her zaman production build üzerinden ölç (geliştirme + StrictMode çift render’ları yapay yük ekler).',
          'Hızlı değişen state’i sadece onu kullanan küçük alt bileşene taşımak, sıfır `useMemo` ile re-render’ı izole eder.',
          '200+ karmaşık satırı aşan listelerde tüm DOM düğümlerini aynı anda basmak yerine sanallaştırma (virtualization) kullan.',
        ],
      },
      pitfall: 'Hover, tooltip veya fare koordinatı state’ini en üstteki `<App />` içinde tutmak her fare hareketinde tüm uygulamayı re-render eder.',
      proTip: 'React DevTools’daki "Highlight updates when components render" seçeneği gereksiz yanıp sönen ağaçları anında gösterir.',
      challengePrompt: 'Aynı parent içinde bir saat tiklerken veya arama kutusuna yazılırken `<LargeTable />` bileşeninin re-render olmasını durduracak iki sıfır-`memo` yapısal çözüm yaz.',
      challengeHints: [
        'Saniye sayan state’i kendi `<Clock />` yaprak bileşenine indir.',
        '`<LargeTable />`’ı state tutan sarmalayıcının üstüne çıkarıp `children` olarak ver.',
      ],
      quickCheck: {
        'qc-06-1-a': {
          question: 'Bileşenleri `React.memo` ile sarmadan ÖNCE genelde ne denenmelidir?',
          options: [
            'Hızlı değişen state’i küçük yaprak bileşenlere indirmek veya ağır ağaçları `children` olarak geçirmek.',
            'Her `<div>` elementini `useMemo` içine almak.',
          ],
          explanation: 'Yapısal state izolasyonu, bağımlılık dizisi bakım yükü olmadan gereksiz re-render’ları ortadan kaldırır.',
        },
      },
    },
    'memo-usememo-usecallback': {
      title: 'Memoization: `memo`, `useMemo` & `useCallback`',
      summary: 'Referans kararlılığının veya pahalı hesaplamanın gerçekten fark yarattığı yerlerde cerrahi memoization uygula.',
      mentalModel: {
        paragraphs: [
          '`useMemo(() => compute(a, b), [a, b])` türetilmiş bir değeri render’lar arasında önbelleğe alır; `useCallback(fn, deps)` ise fonksiyonlar için `useMemo(() => fn, deps)` kısayoludur. İkisi tek başına re-render’ı durdurmaz—referans eşitliğini (`Object.is`) korurlar.',
          '`React.memo(Child)` ise tüm prop’ları bir öncekiyle `Object.is` açısından aynıysa `Child`’ı yeniden render etmez. Eğer `memo` ile sarılı bir çocuğa her render’da yeni oluşturulan inline `onClick={() => ...}` veya obje literal `style={{...}}` verirsen önbellek bozulur; işte `useCallback`/`useMemo` burada devreye girer.',
        ],
        takeaways: [
          '`useMemo`’yu yalnızca gerçekten yavaş (>1ms) hesaplamalarda VEYA bir `useEffect`/`memo` çocuğa verilen referansı sabit tutmak için kullan.',
          'Basit işlemleri (`a + b`) `useMemo` ile sarma—hook ve bağımlılık kontrolünün maliyeti işlemin kendisinden fazladır.',
          'Modern React Compiler otomatik memoization yapabildiği için bileşenleri saf ve kurallara uyumlu tutmak en iyi yatırımdır.',
        ],
      },
      pitfall: '`<HeavyNodeList>`’i `memo` ile sarıp içine `nodes={rawNodes.filter(...)}` geçmek `memo`’yu tamamen boşa çıkarır; çünkü `.filter()` her seferinde yeni dizi üretir.',
      proTip: 'Bir `useCallback`’in karşısında gerçekten `memo`’lu bir çocuk veya `useEffect` bağımlılığı yoksa, o `useCallback` muhtemelen gereksizdir.',
      challengePrompt: '`const MemoRow = memo(Row)` bileşeninin parent `<MemoRow item={item} meta={{ active: true }} />` her render’ında neden hâlâ re-render olduğunu tespit et.',
      challengeHints: [
        '`{ active: true }` ifadesinin iki render arasında `Object.is` ile nasıl karşılaştırıldığına bak.',
        'Render içindeki inline obje literalleri her seferinde yeni referans üretir.',
      ],
      quickCheck: {
        'qc-06-2-a': {
          question: '`useCallback(fn, deps)` gerçekte ne zaman performans kazancı sağlar?',
          options: [
            'Bir bileşende `onClick` tanımlanan her seferinde.',
            '`fn` fonksiyonu `React.memo` ile sarılmış bir alt bileşene veya bir `useEffect` dependency array’ine verildiğinde.',
          ],
          explanation: 'Küçük closure’lar oluşturmak çok ucuzdur; `useCallback` sadece referans kimliğini koruyup alt işi atlattığında değerlidir.',
        },
      },
    },
    'transitions-usedeferredvalue': {
      title: 'Transition’lar & `useDeferredValue`',
      summary: 'Ağır liste filtrelemeleri sırasında bile yazma ve tıklamaları 60fps akıcı tut.',
      mentalModel: {
        paragraphs: [
          'Her state güncellemesi aynı aciliyete sahip değildir. Kullanıcı yazarken `<input>` değerinin güncellenmesi ANLIK olmalıdır; fakat aşağıdaki 1.000 düğümün yeniden filtrelenip çizilmesi kullanıcı yeni bir tuşa basarsa yarıda kesilebilir (interruptible).',
          '`startTransition(() => setFilter(next))` bir state güncellemesini acil olmayan önceliğe alır. Setter sende değilse (ör. `query` prop olarak geliyorsa), `const deferredQuery = useDeferredValue(query)` ile transition önceliğinde güncellenen bir gecikmeli kopya elde edersin.',
        ],
        takeaways: [
          '`useTransition()` (`[isPending, startTransition]`) ile acil girdi kontrollerini akıcı tut ve beklerken ince bir gösterge sun.',
          'Controlled `<input>` değerini güncelleyen `setQuery` çağrısını ASLA `startTransition` içine alma—yalnızca ağır alt listeyi sar.',
          'React 19’da transition’lar asenkron action’ları da sarabilir; işlem bitene dek `isPending` otomatik `true` kalır.',
        ],
      },
      pitfall: '`setQuery(e.target.value)` çağrısını `startTransition` içine koymak input yazımını takılır ve yavaş hale getirir.',
      proTip: '`query !== deferredQuery` karşılaştırması yaparak bayat sonuçları sert bir loading spinner’ı patlatmadan hafifçe soluklaştırabilirsin.',
      challengePrompt: 'Ağır bir sekmeye geçerken `isPending` üzerinden `"GEÇİLİYOR..."` gösteren bir `useTransition` sekme değiştiricisi yaz.',
      challengeHints: [
        '`const [isPending, startTransition] = useTransition();` tanımla.',
        '`setActiveTab(nextId)` çağrısını `startTransition` içine al.',
      ],
      quickCheck: {
        'qc-06-3-a': {
          question: 'Bir `startTransition` render’ı devam ederken kullanıcı yeni bir harfe basarsa ne olur?',
          options: [
            'Yavaş render bitene kadar tarayıcı donar.',
            'React düşük öncelikli transition render’ını durdurur, acil tuş vuruşunu işler ve sonra transition’ı en güncel değerle baştan başlatır.',
          ],
          explanation: 'Kesilebilir (interruptible) render sayesinde ağır arayüzlerde bile yazı yazma tepkisi bozulmaz.',
        },
      },
    },
    'react19-actions-optimistic': {
      title: 'React 19 Form Action’ları & `useOptimistic`',
      summary: 'Asenkron form gönderimlerini, pending durumlarını ve anlık iyimser (optimistic) arayüzü React 19 ile yönet.',
      mentalModel: {
        paragraphs: [
          'React 19, `<form action={fn}>` ve `useActionState(action, initialState)` içinde asenkron fonksiyonları doğrudan destekler. Her form için elle `isSubmitting`, `error` ve `try/catch` kodu yazmak yerine `useActionState` sana otomatik `[state, formAction, isPending]` verir.',
          '`useOptimistic(serverState, updateFn)` ise sunucu isteği henüz devam ederken beklenen başarı sonucunu ekranda anında gösterir—istek başarısız olursa veya tamamlandığında otomatik olarak gerçek state’e geri oturur.',
        ],
        takeaways: [
          '`useActionState` `[state, dispatchAction, isPending]` döndürür ve `<form action={dispatchAction}>` ile doğrudan bağlanır.',
          '`useOptimistic` yalnızca aktif Transition/Action süresince yaşar; işlem bitince otomatik olarak gerçek veriye döner.',
          'Optimistic güncelleme hata verirse kullanıcıya her zaman net geri bildirim göster.',
        ],
      },
      pitfall: '`setOptimisticNote` çağrısını Transition veya Form Action dışında yapmak uyarı üretir; çünkü iyimser durumun oturacağı asenkron bir sınır gerekir.',
      proTip: '`<form action={...}>` içindeki yeniden kullanılabilir butonlarda prop geçmeden `pending` okumak için `react-dom` paketinden `useFormStatus()` kullan.',
      challengePrompt: '`react-dom`’dan `useFormStatus()` kullanarak içinde bulunduğu form gönderilirken kendini kilitleyen `<SubmitButton label="KAYDET" />` yaz.',
      challengeHints: [
        '`"react-dom"` paketinden `useFormStatus` import et.',
        '`const { pending } = useFormStatus();` ile durumu oku.',
      ],
      quickCheck: {
        'qc-06-4-a': {
          question: 'İçinde bulunduğu asenkron action bittiğinde `useOptimistic` state’ine ne olur?',
          options: [
            'Elle sıfırlayana kadar kalıcı olarak kilitli kalır.',
            'React geçici iyimser katmanı atar ve ilk argüman olarak verilen gerçek state’i göstermeye devam eder.',
          ],
          explanation: 'Optimistic state sadece asenkron geçiş sırasında aktiftir; işlem sonuçlandığında gerçek kaynak devralır.',
        },
      },
    },
    'testing-production-patterns': {
      title: 'Test & Production Desenleri',
      summary: 'Vitest + Testing Library ile bileşenleri kullanıcı davranışına göre test et ve production kalitesini sağla.',
      mentalModel: {
        paragraphs: [
          'React bileşenlerini iç state’ine veya CSS class’larına göre değil, gerçek bir kullanıcının gördüğü ve kullandığı şekilde test et: erişilebilir rol veya metinle seç (`getByRole("button", { name: /mastered/i })`), gerçek `userEvent` tıklamaları gönder ve ekrandaki sonucu doğrula.',
          'Production’da semantik HTML (`<button>`, `<nav>`, `aria-selected`, klavye desteği), sıkı TypeScript kontrolü (`tsc --noEmit`) ve temiz modül sınırları uygulamanı yeniden düzenlemelere (refactoring) karşı sağlam tutar.',
        ],
        takeaways: [
          'Kırılgan `data-testid` veya CSS seçicileri yerine sırasıyla `getByRole` > `getByLabelText` > `getByText` tercih et.',
          'Saf domain mantıklarını (reducer, tokenizer, doğrulayıcılar) ayrı tut ki DOM olmadan milisaniyeler içinde unit test edilebilsin.',
          'Tüm etkileşimli kontrollerin klavyeyle (`Tab`, `Enter`, `Space`, `Escape`) çalıştığından ve `:focus-visible` gösterdiğinden emin ol.',
        ],
      },
      pitfall: 'Özel iç değişkenleri veya dev HTML snapshot’larını test etmek, zararsız stil değişikliklerinde bile sürekli kırılan testler üretir.',
      proTip: 'Bir bileşeni testte `getByRole` ile seçmekte zorlanıyorsan, bu durum o bileşenin erişilebilirlik semantiğinin iyileşmesi gerektiğine dair net bir sinyaldir!',
      challengePrompt: 'Tıklanabilir bir konu satırını `<button>` içinde geçersiz iç içe `<button>` oluşturmadan klavye erişimine uygun hale getir.',
      challengeHints: [
        'Başlığı kendi `<button>`’ı yap ve durum düğmesini kardeş `<button>` olarak yanına koy.',
        'Veya satır kabuğunda `role="button" tabIndex={0}` kullanıyorsan `Enter` / `Space` için `onKeyDown` ekle.',
      ],
      quickCheck: {
        'qc-06-5-a': {
          question: 'React Testing Library neden `querySelector(".btn-primary")` yerine `getByRole` önerir?',
          options: [
            '`getByRole` hem görünür davranışı hem de erişilebilirlik semantiğini aynı anda doğrular.',
            '`querySelector` tarayıcılarda çalışmaz.',
          ],
          explanation: 'Rol tabanlı sorgular butonların, başlıkların ve sekmelerin ekran okuyucular ve klavye için doğru kurulduğunu garanti eder.',
        },
      },
    },
  },
};
