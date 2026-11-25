import type { Difficulty, TopicStatus } from './types';
import type { AppLanguage } from '../hooks/usePreferences';
import type { RankTitle } from '../hooks/useRoadmapStore';

export interface UiStrings {
  titleBar: {
    roadmapContext: string;
    optionsTitle: string;
    replaySplashTitle: string;
    minimizeTitle: string;
    maximizeTitle: string;
    restoreTitle: string;
    closeTitle: string;
    languageLabel: string;
    turkishBtn: string;
    englishBtn: string;
    themeLabel: string;
    claudeThemeBtn: string;
    noirThemeBtn: string;
    codeSyntaxLabel: string;
    coloredBtn: string;
    monoBtn: string;
    densityLabel: string;
    comfortBtn: string;
    compactBtn: string;
  };
  sidebar: {
    modulesHeader: string;
    sectionsCountSuffix: string;
    masteredLabel: string;
    clearanceLabel: string;
    confirmWipe: string;
    cancel: string;
    exportBtn: string;
    exportTitle: string;
    importBtn: string;
    importTitle: string;
    resetBtn: string;
    resetTitle: string;
    ranks: Record<RankTitle, string>;
  };
  tabs: {
    roadmapTab: string;
    tabCloseTooltip: string;
  };
  roadmap: {
    kpiTotal: string;
    kpiTotalSub: (count: number) => string;
    kpiMastered: string;
    kpiMasteredSub: string;
    kpiInProgress: string;
    kpiInProgressSub: string;
    kpiCompletion: string;
    kpiCompletionSub: string;
    searchPlaceholder: string;
    filters: {
      all: string;
      remaining: string;
      in_progress: string;
      mastered: string;
    };
    emptySearch: string;
    sectionMasteredBadge: (done: number, total: number) => string;
    statusLabels: Record<TopicStatus, string>;
    statusToggleTitle: string;
    difficultyLabels: Record<Difficulty, string>;
    minuteSuffix: string;
  };
  lesson: {
    moduleFallback: string;
    nodeLabel: string;
    minLabel: string;
    statusLabels: Record<TopicStatus, string>;
    prevLabel: string;
    startLabel: string;
    nextLabel: string;
    endLabel: string;
    mentalModelHeading: string;
    codeDeckHeading: string;
    pitfallTitle: string;
    proTipTitle: string;
    challengeHeading: string;
    hideHints: string;
    showHints: (count: number) => string;
    hideSolution: string;
    revealSolution: string;
    quickCheckHeading: string;
    verifiedTag: string;
    retryTag: string;
    confirmedPrefix: string;
    correctionPrefix: string;
    notesHeading: string;
    autoSynced: string;
    notesPlaceholder: string;
    docsHeading: string;
    copy: string;
    copied: string;
    copiedFileToast: (filename: string) => string;
    copiedSolutionToast: string;
  };
  splash: {
    sysHeader: string;
    masteryHeader: (mastered: number, total: number) => string;
    title: string;
    bootLogs: Array<{ threshold: number; label: string; status: string }>;
    bootSeqPrefix: string;
    enterBtn: string;
    bypassHint: string;
  };
  toasts: {
    nodeMastered: (index: string, title: string) => string;
    themeClaude: string;
    themeNoir: string;
    langTr: string;
    langEn: string;
    exported: string;
    importedOk: string;
    importedErr: string;
    resetDone: string;
  };
}

export const UI_STRINGS: Record<AppLanguage, UiStrings> = {
  tr: {
    titleBar: {
      roadmapContext: '00 // NÖRAL YOL HARİTASI',
      optionsTitle: 'Görünüm, Dil ve Okuma Seçenekleri',
      replaySplashTitle: 'Açılış Sekansını Tekrar Oynat',
      minimizeTitle: 'Küçült',
      maximizeTitle: 'Büyüt',
      restoreTitle: 'Geri Yükle',
      closeTitle: 'Kapat',
      languageLabel: 'DİL / LANGUAGE',
      turkishBtn: 'TÜRKÇE',
      englishBtn: 'ENGLISH',
      themeLabel: 'TEMA',
      claudeThemeBtn: 'CLAUDE DARK',
      noirThemeBtn: 'NOIR CYBER',
      codeSyntaxLabel: 'KOD RENKLENDİRME',
      coloredBtn: 'RENKLİ',
      monoBtn: 'MONO',
      densityLabel: 'OKUMA YOĞUNLUĞU',
      comfortBtn: 'RAHAT',
      compactBtn: 'KOMPAKT',
    },
    sidebar: {
      modulesHeader: 'MODÜLLER // DİZİN',
      sectionsCountSuffix: 'BÖLÜM',
      masteredLabel: 'TAMAMLANDI',
      clearanceLabel: 'SEVİYE',
      confirmWipe: 'SIFIRLAMAYI ONAYLA',
      cancel: 'İPTAL',
      exportBtn: 'DIŞA AKTAR',
      exportTitle: 'İlerlemeyi JSON olarak indir',
      importBtn: 'İÇE AKTAR',
      importTitle: 'JSON yedeğinden geri yükle',
      resetBtn: 'SIFIRLA',
      resetTitle: 'Tüm ilerlemeyi sıfırla',
      ranks: {
        INITIATE: 'BAŞLANGIÇ',
        OPERATOR: 'OPERATÖR',
        ARCHITECT: 'MİMAR',
        'CORE MASTER': 'ÇEKİRDEK USTA',
      },
    },
    tabs: {
      roadmapTab: '00 // YOL HARİTASI',
      tabCloseTooltip: 'Kapatmak için orta tık veya Ctrl+W',
    },
    roadmap: {
      kpiTotal: 'TOPLAM KONU',
      kpiTotalSub: (count) => `${count} modül boyunca`,
      kpiMastered: 'TAMAMLANAN',
      kpiMasteredSub: 'Kalıcı olarak pekiştirildi',
      kpiInProgress: 'DEVAM EDEN',
      kpiInProgressSub: 'Aktif çalışılan konular',
      kpiCompletion: 'TAMAMLANMA',
      kpiCompletionSub: 'Müfredat senkronu',
      searchPlaceholder: 'Konu, hook, desen veya indeks ara (örn. 03.2, useEffect, Suspense)...',
      filters: {
        all: 'TÜMÜ',
        remaining: 'KALANLAR',
        in_progress: 'DEVAM EDİYOR',
        mastered: 'TAMAMLANDI',
      },
      emptySearch: 'EŞLEŞEN KONU BULUNAMADI. LİSTEYİ GÖRMEK İÇİN ARAMAYI VEYA FİLTREYİ TEMİZLEYİN.',
      sectionMasteredBadge: (done, total) => `${done}/${total} TAMAMLANDI`,
      statusLabels: {
        queued: 'SIRADA',
        in_progress: 'DEVAM EDİYOR',
        mastered: 'TAMAMLANDI',
      },
      statusToggleTitle: 'Durumu değiştir: Sırada -> Devam Ediyor -> Tamamlandı',
      difficultyLabels: {
        Core: 'TEMEL',
        Intermediate: 'ORTA',
        Advanced: 'İLERİ',
      },
      minuteSuffix: 'DK',
    },
    lesson: {
      moduleFallback: 'MODÜL',
      nodeLabel: 'DÜĞÜM',
      minLabel: 'DK',
      statusLabels: {
        queued: 'SIRADA',
        in_progress: 'DEVAM EDİYOR',
        mastered: 'TAMAMLANDI',
      },
      prevLabel: 'ÖNCEKİ',
      startLabel: 'BAŞLANGIÇ',
      nextLabel: 'SONRAKİ',
      endLabel: 'SON',
      mentalModelHeading: '01 // TEMEL MANTIK (MENTAL MODEL)',
      codeDeckHeading: '02 // KOD ÖRNEĞİ & KRİTİK NOTLAR',
      pitfallTitle: 'SIK YAPILAN HATA',
      proTipTitle: 'PRO İPUCU',
      challengeHeading: '03 // 5 DAKİKALIK MİNİ GÖREV',
      hideHints: 'İPUÇLARINI GİZLE',
      showHints: (count) => `İPUÇLARINI GÖSTER (${count})`,
      hideSolution: 'ÖRNEK ÇÖZÜMÜ GİZLE',
      revealSolution: 'ÖRNEK ÇÖZÜMÜ GÖSTER',
      quickCheckHeading: '04 // HIZLI KONTROL',
      verifiedTag: '[DOĞRULANDI]',
      retryTag: '[TEKRAR DENE]',
      confirmedPrefix: 'DOĞRU: ',
      correctionPrefix: 'DÜZELTME: ',
      notesHeading: '05 // KİŞİSEL NOTLARIN',
      autoSynced: 'OTOMATİK KAYIT',
      notesPlaceholder: 'Bu konuyla ilgili önemli çıkarımlarını, dikkat edilecek detayları veya denemelerini buraya yaz...',
      docsHeading: '06 // RESMİ REACT.DEV KAYNAKLARI',
      copy: 'KOPYALA',
      copied: 'KOPYALANDI',
      copiedFileToast: (filename) => `${filename} KOPYALANDI`,
      copiedSolutionToast: 'ÖRNEK ÇÖZÜM KOPYALANDI',
    },
    splash: {
      sysHeader: 'SYS::NODE_01 // NÖRAL ÇEKİRDEK',
      masteryHeader: (mastered, total) => `HAKİMİYET // ${mastered} / ${total}`,
      title: 'REACT // ROADMAP OS',
      bootLogs: [
        { threshold: 12, label: 'ARAYÜZ ÇEKİRDEĞİ YÜKLENİYOR // VOX-01', status: 'TAMAM' },
        { threshold: 38, label: 'ÖĞRENME MATRİSİ KALİBRE EDİLİYOR', status: 'TAMAM' },
        { threshold: 66, label: 'REACT 19 + TS KONULARI İNDEKSLENİYOR', status: 'TAMAM' },
        { threshold: 92, label: 'KARAKTER TELEMETRİ SİSTEMİ BAĞLANIYOR', status: 'HAZIR' },
      ],
      bootSeqPrefix: 'AÇILIŞ',
      enterBtn: 'SİBER UZAYA GİR',
      bypassHint: 'GEÇMEK İÇİN ENTER / SPACE / ESC',
    },
    toasts: {
      nodeMastered: (index, title) => `KONU TAMAMLANDI // ${index} ${title}`,
      themeClaude: 'TEMA // CLAUDE DARK',
      themeNoir: 'TEMA // NOIR CYBER',
      langTr: 'DİL // TÜRKÇE',
      langEn: 'DİL // ENGLISH',
      exported: 'İLERLEME YEDEĞİ DIŞA AKTARILDI',
      importedOk: 'İLERLEME YEDEĞİ GERİ YÜKLENDİ',
      importedErr: 'GEÇERSİZ JSON YEDEK DOSYASI',
      resetDone: 'TÜM İLERLEME SIFIRLANDI',
    },
  },
  en: {
    titleBar: {
      roadmapContext: '00 // NEURAL ROADMAP MATRIX',
      optionsTitle: 'Appearance, Language & Reading Options',
      replaySplashTitle: 'Replay Holographic Boot Sequence',
      minimizeTitle: 'Minimize',
      maximizeTitle: 'Maximize',
      restoreTitle: 'Restore',
      closeTitle: 'Close',
      languageLabel: 'LANGUAGE / DİL',
      turkishBtn: 'TÜRKÇE',
      englishBtn: 'ENGLISH',
      themeLabel: 'THEME',
      claudeThemeBtn: 'CLAUDE DARK',
      noirThemeBtn: 'NOIR CYBER',
      codeSyntaxLabel: 'CODE SYNTAX',
      coloredBtn: 'COLORED',
      monoBtn: 'MONO',
      densityLabel: 'READING DENSITY',
      comfortBtn: 'COMFORT',
      compactBtn: 'COMPACT',
    },
    sidebar: {
      modulesHeader: 'MODULES // INDEX',
      sectionsCountSuffix: 'SECT',
      masteredLabel: 'MASTERED',
      clearanceLabel: 'CLEARANCE',
      confirmWipe: 'CONFIRM WIPE',
      cancel: 'CANCEL',
      exportBtn: 'EXP',
      exportTitle: 'Export Progress JSON',
      importBtn: 'IMP',
      importTitle: 'Import Progress JSON',
      resetBtn: 'RST',
      resetTitle: 'Reset Progress',
      ranks: {
        INITIATE: 'INITIATE',
        OPERATOR: 'OPERATOR',
        ARCHITECT: 'ARCHITECT',
        'CORE MASTER': 'CORE MASTER',
      },
    },
    tabs: {
      roadmapTab: '00 // ROADMAP',
      tabCloseTooltip: 'Middle-click or Ctrl+W to close',
    },
    roadmap: {
      kpiTotal: 'TOTAL TOPICS',
      kpiTotalSub: (count) => `Across ${count} modules`,
      kpiMastered: 'MASTERED',
      kpiMasteredSub: 'Nodes locked in',
      kpiInProgress: 'IN PROGRESS',
      kpiInProgressSub: 'Active neural links',
      kpiCompletion: 'COMPLETION',
      kpiCompletionSub: 'Curriculum sync',
      searchPlaceholder: 'Filter topics, hooks, patterns, or index (e.g. 03.2, useEffect, Suspense)...',
      filters: {
        all: 'ALL',
        remaining: 'REMAINING',
        in_progress: 'IN PROGRESS',
        mastered: 'MASTERED',
      },
      emptySearch: 'NO MATCHING CURRICULUM NODES FOUND. CLEAR SEARCH OR FILTER TO RESTORE MATRIX.',
      sectionMasteredBadge: (done, total) => `${done}/${total} MASTERED`,
      statusLabels: {
        queued: 'QUEUED',
        in_progress: 'IN PROGRESS',
        mastered: 'MASTERED',
      },
      statusToggleTitle: 'Cycle status: Queued -> In Progress -> Mastered',
      difficultyLabels: {
        Core: 'CORE',
        Intermediate: 'INTERMEDIATE',
        Advanced: 'ADVANCED',
      },
      minuteSuffix: 'M',
    },
    lesson: {
      moduleFallback: 'MODULE',
      nodeLabel: 'NODE',
      minLabel: 'MIN',
      statusLabels: {
        queued: 'QUEUED',
        in_progress: 'IN PROGRESS',
        mastered: 'MASTERED',
      },
      prevLabel: 'PREV',
      startLabel: 'START',
      nextLabel: 'NEXT',
      endLabel: 'END',
      mentalModelHeading: '01 // CORE MENTAL MODEL',
      codeDeckHeading: '02 // CODE DECK & GUARDRAILS',
      pitfallTitle: 'COMMON PITFALL',
      proTipTitle: 'PRO TIP',
      challengeHeading: '03 // 5-MINUTE MINI-CHALLENGE',
      hideHints: 'HIDE HINTS',
      showHints: (count) => `SHOW HINTS (${count})`,
      hideSolution: 'HIDE REFERENCE SOLUTION',
      revealSolution: 'REVEAL REFERENCE SOLUTION',
      quickCheckHeading: '04 // QUICK CHECK',
      verifiedTag: '[VERIFIED]',
      retryTag: '[RETRY]',
      confirmedPrefix: 'CONFIRMED: ',
      correctionPrefix: 'CORRECTION: ',
      notesHeading: '05 // PERSONAL NEURAL NOTES',
      autoSynced: 'AUTO-SYNCED',
      notesPlaceholder: 'Record key insights, edge cases, or project experiments for this topic...',
      docsHeading: '06 // OFFICIAL REACT.DEV REFERENCES',
      copy: 'COPY',
      copied: 'COPIED',
      copiedFileToast: (filename) => `COPIED ${filename}`,
      copiedSolutionToast: 'COPIED REFERENCE SOLUTION',
    },
    splash: {
      sysHeader: 'SYS::NODE_01 // NEURAL KERNEL',
      masteryHeader: (mastered, total) => `MASTERY // ${mastered} / ${total}`,
      title: 'REACT // ROADMAP OS',
      bootLogs: [
        { threshold: 12, label: 'MOUNTING MONOCHROME KERNEL // VOX-01', status: 'OK' },
        { threshold: 38, label: 'CALIBRATING NEURAL CONSTELLATION MATRIX', status: 'OK' },
        { threshold: 66, label: 'INDEXING REACT 19 + TS CURRICULUM NODES', status: 'OK' },
        { threshold: 92, label: 'LINKING CHARACTER TELEMETRY RIG', status: 'SYNCED' },
      ],
      bootSeqPrefix: 'BOOT_SEQ',
      enterBtn: 'ENTER CYBERSPACE',
      bypassHint: 'PRESS ENTER / SPACE / ESC TO BYPASS',
    },
    toasts: {
      nodeMastered: (index, title) => `NODE MASTERED // ${index} ${title}`,
      themeClaude: 'THEME // CLAUDE DARK',
      themeNoir: 'THEME // NOIR CYBER',
      langTr: 'LANGUAGE // TÜRKÇE',
      langEn: 'LANGUAGE // ENGLISH',
      exported: 'PROGRESS SNAPSHOT EXPORTED',
      importedOk: 'PROGRESS SNAPSHOT RESTORED',
      importedErr: 'INVALID PROGRESS JSON FILE',
      resetDone: 'ALL PROGRESS DATA WIPED',
    },
  },
};
