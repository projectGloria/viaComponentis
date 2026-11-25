import type { SectionTranslation } from './types';

export const section01Tr: SectionTranslation = {
  title: 'Başlangıç',
  subtitle: 'Declarative UI ağaçları, Vite + TypeScript kurulumu, JSX kuralları ve liste reconciliation mantığı.',
  topics: {
    'mental-model-reconciliation': {
      title: 'React ve Reconciliation Nasıl Çalışır?',
      summary: 'DOM’u tek tek elle değiştirmek yerine, state’ten türetilen UI anlık görüntüleri (snapshot) şeklinde düşün.',
      mentalModel: {
        paragraphs: [
          'React component’leri, geriye UI’ın hafif bir tanımını (React element ağacını) döndüren JavaScript fonksiyonlarıdır. "Render" etmek ekrana piksel boyamak değil; React’in eldeki state için bir sonraki sanal UI taslağını üretmek üzere component fonksiyonunu çağırmasıdır.',
          'Reconciliation aşamasında (Fiber ağacı sayesinde) React, önceki element taslağını yenisiyle element tipi ve `key` üzerinden karşılaştırır. Commit aşamasında ise yalnızca gerçekten değişen en küçük DOM güncellemeleri ekrana uygulanır.',
        ],
        takeaways: [
          'UI = f(state): Bir durumdan diğerine nasıl geçileceğini değil, şu an ekranın neye benzemesi gerektiğini tarif et.',
          'Re-render yalnızca yeni bir React element ağacı hesaplar; değişmeyen DOM düğümleri olduğu gibi korunur.',
          'Aynı pozisyonda element tipini değiştirmek (ör. `<div>` yerine `<section>`) tüm alt ağacı unmount eder ve state’ini sıfırlar.',
        ],
      },
      pitfall: '`document.querySelector` ile DOM’u doğrudan değiştirmek React reconciliation ile çakışır ve bir sonraki render’da UI’ın bozulmasına yol açar.',
      proTip: 'Render sırasında yan etki (side effect) bırakmayan saf component’lerde React StrictMode geliştirme ortamında fonksiyonu iki kez çalıştırarak saflığı test edebilir.',
      challengePrompt: '`{ title: string; version: string }` prop’larını alan, hiç state veya koşul (if/ternary) kullanmadan `<section>` içinde `<h2>` başlığı ve `v{version}` bilgisini gösteren saf bir `ModuleCard` component’i yaz.',
      challengeHints: [
        'Parametre listesinde doğrudan `{ title, version }` destructuring yap.',
        'JSX içine `{title}` ve `v{version}` ifadelerini doğrudan yerleştir.',
      ],
      quickCheck: {
        'qc-01-1-a': {
          question: 'React bir component’i re-render ettiğinde ilk olarak ne gerçekleşir?',
          options: [
            'Component içindeki tüm tarayıcı DOM’u silinip baştan oluşturulur.',
            'React component fonksiyonunu çağırarak yeni bir element ağacı üretir ve bir öncekiyle farklarını (diff) alır.',
            'Component içindeki tüm `useState` değerleri başlangıç değerine döner.',
          ],
          explanation: 'Render yeni bir React element taslağı üretir; Fiber farkları hesaplar ve sadece gereken minimum DOM değişikliğini uygular.',
        },
        'qc-01-1-b': {
          question: 'Bir parent aynı ağaç pozisyonunda `<Panel />` yerine `<Modal />` render etmeye geçerse ne olur?',
          options: [
            'React `<Panel />` içindeki state’i koruyup `<Modal />`’a aktarır.',
            'React `<Panel />`’i unmount eder (state silinir) ve `<Modal />`’ı sıfırdan mount eder.',
          ],
          explanation: 'Aynı pozisyonda farklı bir component veya HTML etiketi geldiğinde tüm alt ağaç sıfırlanır.',
        },
      },
    },
    'vite-typescript-setup': {
      title: 'Vite, TypeScript & Proje Kurulumu',
      summary: 'React 19’u strict TypeScript, modern JSX dönüşümü ve hızlı ESM HMR ile kur.',
      mentalModel: {
        paragraphs: [
          'Modern React projeleri ağır eski bundler’lar yerine Vite kullanır: geliştirmede anlık HMR için native ES modülleri, production’da ise tree-shaking yapılmış Rollup çıktısı üretir.',
          '`tsconfig.json` içinde `"jsx": "react-jsx"` varken TypeScript her dosyada `import React` yazmana gerek kalmadan JSX’i doğrudan `react/jsx-runtime` çağrılarına derler. `strict: true`, `noUnusedLocals` ve `<StrictMode>` kullanmak hataları erken yakalar.',
        ],
        takeaways: [
          'React 19’da standart giriş noktası `createRoot(container).render(<StrictMode><App /></StrictMode>)` şeklindedir.',
          '`@types/react` v19, children için `ReactNode` ve ref/event tipleri için açık generic’ler kullanır.',
          'Production build’da `"build": "tsc && vite build"` çalıştır; Vite kendi başına tip kontrolü yapmaz, sadece tipleri sıyırır.',
        ],
      },
      pitfall: 'Sadece `vite build` çalıştırmak TypeScript tip kontrolünü atlar; bozuk prop tipleri sessizce production’a çıkabilir.',
      proTip: 'Sadece tip olan import’larda `import type { ReactNode } from "react"` kullan ki bundler bu satırı çıktıdan temizce silebilsin.',
      challengePrompt: '`#root` elementi bulunamadığında `!` operatörüyle geçiştirmek yerine açıklayıcı bir hata fırlatan güvenli bir giriş dosyası (`main.tsx`) yaz.',
      challengeHints: [
        '`document.getElementById("root")` sonucunu bir sabitte tut.',
        '`createRoot` çağırmadan önce `if (!container)` kontrolü ile daraltma (narrowing) yap.',
      ],
      quickCheck: {
        'qc-01-2-a': {
          question: '`"build": "tsc && vite build"` komutunda neden Vite’tan önce `tsc` çalıştırılır?',
          options: [
            'Vite hız için TypeScript dosyalarını tam tip kontrolü yapmadan derler.',
            'Vite `tsc` olmadan `.tsx` dosyalarını okuyamaz.',
          ],
          explanation: 'Vite esbuild/SWC ile sadece sözdizimini dönüştürür; tip güvenliğini `tsc` sağlar.',
        },
      },
    },
    'jsx-rules-expressions': {
      title: 'JSX Kuralları & İfadeler (Expressions)',
      summary: 'JSX derlenmesini, Fragment yapısını, camelCase DOM prop’larını ve `{}` ifade yuvalarını kavra.',
      mentalModel: {
        paragraphs: [
          'JSX bir HTML şablon dili değil, `jsx(type, props)` fonksiyon çağrılarının okunabilir yazım biçimidir. Her JSX etiketi tek bir değer döndüren bir ifade olduğu için component tek bir kök element döndürmeli veya kardeş elemanları Fragment (`<>...</>`) içine almalıdır.',
          '`{ ... }` süslü parantezlerinin içine değer üreten her JavaScript ifadesi (değişken, ternary `? :`, `.map()`, fonksiyon çağrısı) yazılabilir; ama `if` veya `for` gibi deyimler (statement) yazılamaz. DOM özellikleri camelCase yazılır (`className`, `htmlFor`, `tabIndex`).',
        ],
        takeaways: [
          'Fragment (`<>...</>` veya `<Fragment key={id}>`) ekstra `<div>` eklemeden kardeş elemanları gruplar.',
          '`true`, `false`, `null` ve `undefined` ekrana hiçbir şey çizmez; fakat `0` sayısı ekrana `"0"` olarak basılır!',
          'Satır içi `style` düz string değil, camelCase key’lerden oluşan bir obje alır (`style={{ opacity: 0.8 }}`).',
        ],
      },
      pitfall: '`{items.length && <List />}` yazmak, dizi boşken (`0`) ekrana istenmeyen bir `"0"` karakteri basar.',
      proTip: 'Sayısal kontrolleri her zaman boolean’a çevir (`items.length > 0 && <List />`) veya ternary kullan (`? <List /> : null`).',
      challengePrompt: '`<div class="card"><label for="node">Node</label><input tabindex="0"></div>` HTML parçasını geçerli JSX’e dönüştür.',
      challengeHints: [
        '`<input />` gibi kapanışsız etiketleri kendinden kapat.',
        '`class`, `for` ve `tabindex` özelliklerini React camelCase karşılıklarına çevir.',
      ],
      quickCheck: {
        'qc-01-3-a': {
          question: 'JSX içinde `{0 && <span>Active</span>}` ifadesi ekrana ne çizer?',
          options: [
            'Hiçbir şey çizmez.',
            'DOM içine `0` metnini basar.',
            'Çalışma zamanında TypeError fırlatır.',
          ],
          explanation: 'JavaScript’te `0 && ...` ifadesi `0` döndürür ve React `0` sayısını metin olarak render eder.',
        },
      },
    },
    'conditional-list-rendering': {
      title: 'Koşullu & Liste Render Etme',
      summary: 'Kararlı `key` kimliklerini, `.filter()` / `.map()` zincirlerini ve temiz dallanmayı öğren.',
      mentalModel: {
        paragraphs: [
          'React’te listeler standart dizi metodları (`.filter()` ve `.map()`) ile oluşturulur. `.map()` içinden dönen en üst seviye her element, kardeşleri arasında onu benzersiz ve kararlı biçimde tanıtan bir `key` prop’u almalıdır.',
          '`key` değeri component’ine normal bir prop olarak geçmez—React Fiber reconciliation’ı için dahili bir kimlik bilgisidir. Sıralanabilen, eklenip silinen listelerde dizi indeksini `key` yapmak state, animasyon ve input odaklarının yanlış öğelere kaymasına neden olur.',
        ],
        takeaways: [
          'Her zaman kararlı bir ID (`item.id`) kullan; `Math.random()` her render’da her şeyi sıfırdan yaratır, değişen listelerde `index` ise state’i karıştırır.',
          'Bir liste öğesi birden fazla kardeş element döndürecekse `<Fragment key={item.id}>` kullan.',
          'Karmaşık koşullarda iç içe ternary yazmak yerine erken `return` (early return) ile okunabilirliği artır.',
        ],
      },
      pitfall: 'Render içinde `key={crypto.randomUUID()}` üretmek her render’da tüm DOM düğümlerinin yıkılıp baştan kurulmasına yol açar.',
      proTip: 'Erken dönüşler (`if (items.length === 0) return ...`) JSX girintisini azaltır ve boş/yükleniyor/hata durumlarını tertemiz ayırır.',
      challengePrompt: '`terms: { id: string; term: string; def: string }[]` dizisini ekstra `<div>` sarmalayıcısı olmadan `<dl>` içinde `<dt>` ve `<dd>` çiftleri olarak render et.',
      challengeHints: [
        '`"react"` paketinden `Fragment` import et.',
        '`key={entry.id}` prop’unu doğrudan `<Fragment>` üzerine ver.',
      ],
      quickCheck: {
        'qc-01-4-a': {
          question: 'Düzenlenebilir veya sıralanabilir listelerde dizi indeksini (`index`) `key` olarak kullanmak neden tehlikelidir?',
          options: [
            'TypeScript `.map()` içinde sayısal key’e izin vermez.',
            'Öğe eklenip çıkarıldığında veya sıra değiştiğinde indeksler kayar ve eski DOM/state yanlış veriye yapışır.',
          ],
          explanation: 'React instance’ları `key` ile eşler; index 0 farklı bir öğeye geçerse eski öğenin state’i yeni öğede kalır.',
        },
      },
    },
  },
};
