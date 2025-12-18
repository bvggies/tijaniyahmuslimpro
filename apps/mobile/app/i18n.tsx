import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

export type LanguageCode = 'en' | 'ar' | 'fr' | 'ha';

const LANGUAGE_KEY = 'appLanguage';

const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    home_greeting: 'Assalāmu ʿalaykum',
    home_title: 'Your Tijaniyah day',
    home_next_prayer: 'Next prayer',
    home_notifications_on: 'Notifications enabled • Based on your location',
    home_wird_title: "Today's Wird",
    home_wird_subtitle: 'Lazim Tracker',
    home_wird_body: 'Track your daily Tijaniyah litanies and donations together.',
    home_jumma_title: 'Zikr Jumma',
    home_jumma_body: 'Special content every blessed Friday.',
    home_ai_title: 'AI Noor',
    home_ai_subtitle: 'Ask with adab',
    home_ai_body:
      'AI Noor is an assistive tool and does not replace qualified scholarship. Always verify with trusted scholars.',
    home_ai_cta: 'Open AI Noor',
    prayer_title: 'Prayer times',
    prayer_subtitle: 'Location-based Salah schedule with gentle notifications.',
    prayer_settings_header: 'Settings',
    prayer_notifications: 'Notifications',
    quran_title: "Qur'an",
    quran_subtitle: 'Read by Surah or Juz, add bookmarks, and follow your tilāwah journey.',
    community_title: 'Community',
    community_subtitle: 'A gentle feed for reflections, duas, and reminders — moderated to keep adab.',
    community_placeholder: 'Share a reflection or dua…',
    community_post: 'Post',
    profile_title: 'Profile & settings',
    profile_privacy:
      'Islamic journal entries are private and can be protected with a PIN in future releases.',
    profile_sign_out: 'Sign out',
    tasbih_title: 'Digital Tasbih',
    tasbih_subtitle: 'Tap to count in silence. Your last session is saved to your account.',
    donate_title: 'Donate',
    donate_subtitle: 'Support Tijaniyah projects and campaigns with full transparency.',
    donate_cta: 'View details',
    journal_lock_title: 'Journal lock',
    journal_lock_body:
      'Your Islamic reflections are private to this device. Protect them with a PIN.',
    journal_unlock: 'Unlock',
    journal_title: 'Islamic Journal',
    journal_subtitle:
      "Capture reflections, lessons, and duʿā moments. Entries are synced to your account but PIN-locked on this device.",
    journal_save_entry: 'Save entry',
    mosques_title: 'Mosque locator',
    mosques_subtitle: 'Find nearby masājid using your current location.',
    mosques_refresh: 'Refresh list',
    chat_rooms_title: 'Chat rooms',
    chat_rooms_subtitle: 'Join Tijaniyah community rooms or create a new group chat.',
    chat_rooms_new_placeholder: 'New room name',
    chat_rooms_create: 'Create room',
    chat_room_header: 'Chat room',
    chat_send: 'Send',
    ai_noor_title: 'AI Noor',
    ai_noor_body:
      'An assistive tool for general Islamic questions. It does not replace qualified scholarship.',
    ai_noor_placeholder: 'Ask with adab, and verify with scholars…',
    ai_noor_cta: 'Ask AI Noor',
    auth_onboarding_title: 'Tijaniyah Muslim Pro',
    auth_onboarding_body:
      'Your companion for Salah, Quran, Zikr, and the Tijaniyah path — in one serene experience.',
    auth_create_account: 'Create account',
    auth_sign_in: 'Sign in',
    auth_guest: 'Continue as guest (limited access)',
    auth_email: 'Email',
    auth_password: 'Password',
    auth_name: 'Full name',
    auth_forgot_password: 'Forgot password?',
    auth_no_account: 'New here? Create an account',
    auth_have_account: 'Already have an account? Sign in',
    auth_sign_in_title: 'Welcome back',
    auth_sign_up_title: 'Create your Tijaniyah space',
    auth_forgot_title: 'Forgot password',
    auth_forgot_body: "Enter your email and we'll send you a secure reset link.",
    auth_send_reset: 'Send reset link',
    language_label: 'Language',
  },
  ar: {
    home_greeting: 'السلام عليكم',
    home_title: 'يومك التيجاني',
    home_next_prayer: 'الصلاة القادمة',
    home_notifications_on: 'الإشعارات مفعّلة • حسب موقعك',
    home_wird_title: 'الورد اليومي',
    home_wird_subtitle: 'متابعة اللزوم',
    home_wird_body: 'تتبّع أذكارك اليومية وتبرعاتك معًا.',
    home_jumma_title: 'ذكر الجمعة',
    home_jumma_body: 'محتوى خاص لكل جمعة مباركة.',
    home_ai_title: 'نور الذكاء',
    home_ai_subtitle: 'اسأل بأدب',
    home_ai_body:
      'نور الذكاء أداة مساعدة ولا يُغني عن أهل العلم الموثوقين، فاستفِتِ العلماء دائمًا.',
    home_ai_cta: 'افتح نور الذكاء',
    prayer_title: 'أوقات الصلاة',
    prayer_subtitle: 'جدول الصلاة بحسب موقعك مع تنبيهات لطيفة.',
    prayer_settings_header: 'الإعدادات',
    prayer_notifications: 'الإشعارات',
    quran_title: 'القرآن الكريم',
    quran_subtitle: 'اقرأ بالسورة أو الجزء، وأضف العلامات لمسار تلاوتك.',
    community_title: 'المجتمع',
    community_subtitle: 'ساحة هادئة للتذكير والدعاء مع مراعاة الأدب الشرعي.',
    community_placeholder: 'شارك تأمّلًا أو دعاء…',
    community_post: 'نشر',
    profile_title: 'الملف والإعدادات',
    profile_privacy: 'كتاباتك في اليوميات خاصة ويمكن حمايتها برمز سري.',
    profile_sign_out: 'تسجيل الخروج',
    tasbih_title: 'مسبحة رقمية',
    tasbih_subtitle: 'اضغط بهدوء للعد، مع حفظ آخر جلسة على حسابك.',
    donate_title: 'التبرّع',
    donate_subtitle: 'ادعم المشاريع التيجانية مع شفافية كاملة.',
    donate_cta: 'عرض التفاصيل',
    journal_lock_title: 'قفل اليوميات',
    journal_lock_body: 'تأملاتك الخاصة على هذا الجهاز فقط. احمها برمز سري.',
    journal_unlock: 'فتح القفل',
    journal_title: 'اليوميات الإسلامية',
    journal_subtitle: 'دوّن تأملاتك ودعاءك، مع حفظها على حسابك وقفلها برمز على هذا الجهاز.',
    journal_save_entry: 'حفظ الملاحظة',
    mosques_title: 'البحث عن المساجد',
    mosques_subtitle: 'اعثر على المساجد القريبة من موقعك الحالي.',
    mosques_refresh: 'تحديث القائمة',
    chat_rooms_title: 'غرف المحادثة',
    chat_rooms_subtitle: 'انضم إلى غرف المجتمع التيجاني أو أنشئ غرفة جديدة.',
    chat_rooms_new_placeholder: 'اسم الغرفة الجديدة',
    chat_rooms_create: 'إنشاء الغرفة',
    chat_room_header: 'غرفة المحادثة',
    chat_send: 'إرسال',
    ai_noor_title: 'نور الذكاء',
    ai_noor_body:
      'أداة مساعدة للأسئلة العامة ولا تغني عن أهل العلم. ارجع دومًا للعلماء في الفتوى.',
    ai_noor_placeholder: 'اسأل بأدب، وتحقّق من العلماء…',
    ai_noor_cta: 'اسأل نور الذكاء',
    auth_onboarding_title: 'تطبيق تيجانية مسلم برو',
    auth_onboarding_body:
      'رفيقك في الصلاة والقرآن والذكر والطريق التيجاني — في تجربة هادئة واحدة.',
    auth_create_account: 'إنشاء حساب',
    auth_sign_in: 'تسجيل الدخول',
    auth_guest: 'الدخول كضيف (وصول محدود)',
    auth_email: 'البريد الإلكتروني',
    auth_password: 'كلمة المرور',
    auth_name: 'الاسم الكامل',
    auth_forgot_password: 'نسيت كلمة المرور؟',
    auth_no_account: 'جديد هنا؟ أنشئ حسابًا',
    auth_have_account: 'لديك حساب؟ سجّل الدخول',
    auth_sign_in_title: 'مرحبًا بعودتك',
    auth_sign_up_title: 'أنشئ مساحتك التيجانية',
    auth_forgot_title: 'استرجاع كلمة المرور',
    auth_forgot_body: 'أدخل بريدك الإلكتروني وسنرسل رابط إعادة التعيين.',
    auth_send_reset: 'إرسال رابط الاسترجاع',
    language_label: 'اللغة',
  },
  fr: {
    home_greeting: 'As-salām ʿalaykum',
    home_title: 'Votre journée tijānie',
    home_next_prayer: 'Prochaine prière',
    home_notifications_on: 'Notifications activées • Selon votre position',
    home_wird_title: 'Wird du jour',
    home_wird_subtitle: 'Suivi du Lazim',
    home_wird_body: 'Suivez vos litanies tijānies quotidiennes et vos dons.',
    home_jumma_title: 'Dhikr du vendredi',
    home_jumma_body: 'Contenu spécial pour chaque vendredi béni.',
    home_ai_title: 'AI Noor',
    home_ai_subtitle: 'Poser avec adab',
    home_ai_body:
      "AI Noor est un outil d'aide et ne remplace pas les savants qualifiés. Vérifiez toujours auprès de vos shuyūkh.",
    home_ai_cta: "Ouvrir AI Noor",
    prayer_title: 'Heures de prière',
    prayer_subtitle: 'Horaires de ṣalāt basés sur votre position, avec notifications douces.',
    prayer_settings_header: 'Paramètres',
    prayer_notifications: 'Notifications',
    quran_title: 'Coran',
    quran_subtitle: 'Lire par sourate ou juz, ajouter des signets et suivre votre tilāwa.',
    community_title: 'Communauté',
    community_subtitle:
      'Fil apaisé pour rappels et invocations, modéré pour préserver les bonnes manières.',
    community_placeholder: 'Partagez un rappel ou une duʿā…',
    community_post: 'Publier',
    profile_title: 'Profil & paramètres',
    profile_privacy:
      'Les entrées du journal sont privées et peuvent être protégées par un code PIN.',
    profile_sign_out: 'Se déconnecter',
    tasbih_title: 'Tasbih numérique',
    tasbih_subtitle: 'Touchez pour compter en silence; la dernière session est sauvegardée.',
    donate_title: 'Dons',
    donate_subtitle: 'Soutenez les projets tijānies avec transparence.',
    donate_cta: 'Voir les détails',
    journal_lock_title: 'Verrou du journal',
    journal_lock_body: 'Vos réflexions restent sur cet appareil. Protégez-les avec un code PIN.',
    journal_unlock: 'Déverrouiller',
    journal_title: 'Journal islamique',
    journal_subtitle:
      'Notez réflexions, leçons et duʿā. Synchronisé avec votre compte, verrouillé localement.',
    journal_save_entry: "Enregistrer l'entrée",
    mosques_title: 'Trouver une mosquée',
    mosques_subtitle: 'Trouvez les mosquées proches de votre position.',
    mosques_refresh: 'Actualiser la liste',
    chat_rooms_title: 'Salons de discussion',
    chat_rooms_subtitle:
      'Rejoignez les salons de la communauté tijānie ou créez un nouveau groupe.',
    chat_rooms_new_placeholder: 'Nom du nouveau salon',
    chat_rooms_create: 'Créer le salon',
    chat_room_header: 'Salon',
    chat_send: 'Envoyer',
    ai_noor_title: 'AI Noor',
    ai_noor_body:
      "Outil d'aide pour les questions générales; ne remplace pas les avis de savants qualifiés.",
    ai_noor_placeholder: 'Posez votre question avec adab…',
    ai_noor_cta: 'Interroger AI Noor',
    auth_onboarding_title: 'Tijaniyah Muslim Pro',
    auth_onboarding_body:
      'Votre compagnon pour la ṣalāt, le Coran, le dhikr et la voie tijānie — dans une expérience fluide.',
    auth_create_account: 'Créer un compte',
    auth_sign_in: "S'identifier",
    auth_guest: 'Continuer en invité (accès limité)',
    auth_email: 'Email',
    auth_password: 'Mot de passe',
    auth_name: 'Nom complet',
    auth_forgot_password: 'Mot de passe oublié ?',
    auth_no_account: 'Nouveau ? Créez un compte',
    auth_have_account: 'Vous avez déjà un compte ? Connectez‑vous',
    auth_sign_in_title: 'Heureux de vous revoir',
    auth_sign_up_title: 'Créez votre espace tijānie',
    auth_forgot_title: 'Mot de passe oublié',
    auth_forgot_body:
      'Entrez votre email et nous vous enverrons un lien sécurisé pour le réinitialiser.',
    auth_send_reset: 'Envoyer le lien',
    language_label: 'Langue',
  },
  ha: {
    home_greeting: 'Assalāmu alaikum',
    home_title: 'Ranar ka ta Tijaniyya',
    home_next_prayer: 'Sallah ta gaba',
    home_notifications_on: 'An kunna sanarwa • Bisa matsayinka',
    home_wird_title: 'Wird na yau',
    home_wird_subtitle: 'Lazim tracker',
    home_wird_body: 'Bi diddigin lazim dīn Tijaniyya da gudummawarka a lokaci guda.',
    home_jumma_title: "Zikr Juma'a",
    home_jumma_body: "Abubuwa na musamman na kowace Juma'a mai albarka.",
    home_ai_title: 'AI Noor',
    home_ai_subtitle: 'Tambaya da ladabi',
    home_ai_body:
      'AI Noor kayan taimako ne kawai, ba ya maye gurbin malamai na hakika ba. Ka tambayi malamai koyaushe.',
    home_ai_cta: 'Buɗe AI Noor',
    prayer_title: "Lokutan sallah",
    prayer_subtitle: 'Lokutan sallah bisa matsayinka tare da sanarwa masu laushi.',
    prayer_settings_header: 'Saituna',
    prayer_notifications: 'Sanarwa',
    quran_title: 'Al‑Kur’ani',
    quran_subtitle: 'Karanta ta sura ko juz, ka adana alamar aya, ka bi tafiyar tilāwarka.',
    community_title: 'Al’umma',
    community_subtitle:
      'Wurin rarraba tunatarwa da addu’o’i cikin natsuwa, ana lura da adabi.',
    community_placeholder: 'Raba tunani ko addu’a…',
    community_post: 'Aika',
    profile_title: 'Bayanan mai amfani & saituna',
    profile_privacy: 'Shigarwar ajandar ka sirri ne kuma za a iya kulle su da lamba PIN.',
    profile_sign_out: 'Fita',
    tasbih_title: 'Tasbihi na dijital',
    tasbih_subtitle: 'Danna cikin nutsuwa; za a ajiye zamanin tasbihin ka.',
    donate_title: 'Ba da gudummawa',
    donate_subtitle: 'Tallafa wa ayyukan Tijaniyya cikin gaskiya da bayyana.',
    donate_cta: 'Duba cikakkun bayanai',
    journal_lock_title: 'Kulle ajandar ka',
    journal_lock_body: 'Rubuce‑rubucenka na sirri suna wannan na’ura. Kulle su da lamba PIN.',
    journal_unlock: 'Buɗe',
    journal_title: 'Ajandar Musulunci',
    journal_subtitle:
      'Rubuta tunani, darussa, da addu’o’i. Ana haɗa su da asusunka, ana kulle su a wannan na’urar.',
    journal_save_entry: 'Ajiye rubutu',
    mosques_title: "Neman masallatai",
    mosques_subtitle: 'Nemo masallatai mafi kusa da kai.',
    mosques_refresh: 'Sabunta jerin',
    chat_rooms_title: 'Dakunan hira',
    chat_rooms_subtitle:
      'Shiga dakunan tattaunawar al’ummar Tijaniyya ko ka ƙirƙiri sabo.',
    chat_rooms_new_placeholder: 'Sunan sabon daki',
    chat_rooms_create: 'Ƙirƙiri daki',
    chat_room_header: 'Dakin hira',
    chat_send: 'Aika',
    ai_noor_title: 'AI Noor',
    ai_noor_body:
      'Kayan taimako ne don tambayoyi na gama‑gari; ba ya maye gurbin fatawar malamai.',
    ai_noor_placeholder: 'Tambaya da ladabi…',
    ai_noor_cta: 'Tambayi AI Noor',
    auth_onboarding_title: 'Tijaniyah Muslim Pro',
    auth_onboarding_body:
      'Abokin tafiyarka na sallah, Kur’ani, zikiri, da tafarkin Tijaniyya — a wuri guda.',
    auth_create_account: 'Ƙirƙiri asusu',
    auth_sign_in: 'Shiga',
    auth_guest: 'Ci gaba a matsayin baƙo (iyakataccen amfani)',
    auth_email: 'Imel',
    auth_password: 'Kalmar sirri',
    auth_name: 'Cikakken suna',
    auth_forgot_password: 'Ka manta kalmar sirri?',
    auth_no_account: 'Ka fara ne yanzu? Ƙirƙiri asusu',
    auth_have_account: 'Kana da asusu? Shiga',
    auth_sign_in_title: 'Barka da dawowa',
    auth_sign_up_title: 'Ƙirƙiri mazaunin ka na Tijaniyya',
    auth_forgot_title: 'Manta kalmar sirri',
    auth_forgot_body:
      'Shigar da imel ɗinka, za mu turo maka da hanyar sauya kalmar sirri.',
    auth_send_reset: 'Aika hanyar sauyawa',
    language_label: 'Harshe',
  },
};

type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  language: LanguageCode;
  t: (key: TranslationKey) => string;
  setLanguage: (lang: LanguageCode) => Promise<void>;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const load = async () => {
      const stored = await SecureStore.getItemAsync(LANGUAGE_KEY);
      if (stored === 'en' || stored === 'ar' || stored === 'fr' || stored === 'ha') {
        setLanguageState(stored);
      }
    };
    void load();
  }, []);

  const t = (key: TranslationKey) => {
    const table = translations[language] ?? translations.en;
    return table[key] ?? translations.en[key] ?? key;
  };

  const setLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
  };

  return (
    <I18nContext.Provider value={{ language, t, setLanguage }}>{children}</I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}



