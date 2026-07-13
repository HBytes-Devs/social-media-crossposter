export type UiLocale = "en" | "roman-ur" | "ur" | "hi";

export const UI_LOCALES: Array<{ code: UiLocale; label: string }> = [
  { code: "en", label: "English" },
  { code: "roman-ur", label: "Roman Urdu" },
  { code: "ur", label: "اردو" },
  { code: "hi", label: "हिन्दी" },
];

export const UI_LOCALE_STORAGE_KEY = "smc_ui_locale";

export type MessageKey =
  | "auth.email"
  | "auth.password"
  | "auth.nameOptional"
  | "auth.login"
  | "auth.register"
  | "auth.forgotPassword"
  | "auth.sendResetCode"
  | "auth.resetCode"
  | "auth.newPassword"
  | "auth.confirmPassword"
  | "auth.updatePassword"
  | "auth.backToLogin"
  | "auth.enterResetCode"
  | "auth.resendCode"
  | "auth.noAccount"
  | "auth.haveAccount"
  | "auth.codeNotReceived"
  | "auth.language"
  | "auth.login.title"
  | "auth.login.subtitle"
  | "auth.login.subtitlePrefix"
  | "auth.login.subtitleSuffix"
  | "auth.emailPlaceholder"
  | "auth.passwordPlaceholder"
  | "auth.namePlaceholder"
  | "auth.resetCodePlaceholder"
  | "auth.createAccount"
  | "auth.register.subtitlePrefix"
  | "auth.brand.eyebrow"
  | "auth.brand.headlineLine1"
  | "auth.brand.headlineLine2"
  | "auth.brand.subcopy"
  | "auth.brand.statusPrefix"
  | "auth.brand.statusHighlight"
  | "auth.brand.statusSuffix"
  | "auth.brand.quote"
  | "auth.brand.quoteAuthor"
  | "auth.register.title"
  | "auth.register.subtitle"
  | "auth.forgot.title"
  | "auth.forgot.subtitle"
  | "auth.forgot.success"
  | "auth.reset.title"
  | "auth.reset.subtitle"
  | "auth.error.loginFailed"
  | "auth.error.registerFailed"
  | "auth.error.requestFailed"
  | "auth.error.resetFailed"
  | "auth.error.passwordMismatch"
  | "auth.success.passwordUpdated"
  | "auth.recaptcha.loadError"
  | "auth.recaptcha.notice"
  | "auth.rememberMe";

export type Messages = Record<MessageKey, string>;

export const messages: Record<UiLocale, Messages> = {
  en: {
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.nameOptional": "Name (optional)",
    "auth.login": "Sign in",
    "auth.register": "Register",
    "auth.forgotPassword": "Forgot password?",
    "auth.sendResetCode": "Send reset code",
    "auth.resetCode": "Reset code",
    "auth.newPassword": "New password",
    "auth.confirmPassword": "Confirm password",
    "auth.updatePassword": "Update password",
    "auth.backToLogin": "Back to login",
    "auth.enterResetCode": "Enter reset code",
    "auth.resendCode": "Resend code",
    "auth.noAccount": "Don't have an account?",
    "auth.haveAccount": "Already have an account?",
    "auth.codeNotReceived": "Didn't get the code?",
    "auth.language": "Language",
    "auth.login.title": "Welcome back",
    "auth.login.subtitle": "Sign in to SMC",
    "auth.login.subtitlePrefix": "Sign in to",
    "auth.login.subtitleSuffix": "to continue",
    "auth.emailPlaceholder": "you@company.com",
    "auth.passwordPlaceholder": "Enter your password",
    "auth.namePlaceholder": "Your name",
    "auth.resetCodePlaceholder": "123456",
    "auth.createAccount": "Create one",
    "auth.register.subtitlePrefix": "Get started with",
    "auth.brand.eyebrow": "Social Media Crossposter",
    "auth.brand.headlineLine1": "Publish everywhere,",
    "auth.brand.headlineLine2": "from one place.",
    "auth.brand.subcopy":
      "Schedule posts, manage accounts, and track performance across LinkedIn and more — without switching tabs.",
    "auth.brand.statusPrefix": "Platforms",
    "auth.brand.statusHighlight": "ready",
    "auth.brand.statusSuffix": " · Connect & post in minutes",
    "auth.brand.quote":
      "We cut our posting time in half. Scheduling and analytics in one dashboard was exactly what our team needed.",
    "auth.brand.quoteAuthor": "Marketing Lead, B2B SaaS company",
    "auth.register.title": "Create account",
    "auth.register.subtitle": "Register for SMC",
    "auth.forgot.title": "Forgot password",
    "auth.forgot.subtitle": "Enter your email — we'll send a 6-digit code",
    "auth.forgot.success":
      "If an account exists for this email, a reset code has been sent. Check your inbox or spam folder.",
    "auth.reset.title": "Reset password",
    "auth.reset.subtitle": "Enter the 6-digit code from your email and a new password",
    "auth.error.loginFailed": "Login failed",
    "auth.error.registerFailed": "Registration failed",
    "auth.error.requestFailed": "Request failed",
    "auth.error.resetFailed": "Reset failed",
    "auth.error.passwordMismatch": "Passwords do not match",
    "auth.success.passwordUpdated": "Password updated. Please log in.",
    "auth.recaptcha.loadError": "reCAPTCHA failed to load. Check your site key or try again.",
    "auth.recaptcha.notice": "Protected by reCAPTCHA — Google Privacy & Terms",
    "auth.rememberMe": "Remember email & password",
  },
  "roman-ur": {
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.nameOptional": "Naam (optional)",
    "auth.login": "Login",
    "auth.register": "Register",
    "auth.forgotPassword": "Password bhool gaye?",
    "auth.sendResetCode": "Reset code bhejo",
    "auth.resetCode": "Reset code",
    "auth.newPassword": "Naya password",
    "auth.confirmPassword": "Password confirm karo",
    "auth.updatePassword": "Password update karo",
    "auth.backToLogin": "Login par wapas",
    "auth.enterResetCode": "Reset code daalo",
    "auth.resendCode": "Code dubara bhejo",
    "auth.noAccount": "Account nahi?",
    "auth.haveAccount": "Pehle se account hai?",
    "auth.codeNotReceived": "Code nahi mila?",
    "auth.language": "Zubaan",
    "auth.login.title": "Welcome back",
    "auth.login.subtitle": "SMC mein login karo",
    "auth.login.subtitlePrefix": "Sign in to",
    "auth.login.subtitleSuffix": "to continue",
    "auth.emailPlaceholder": "you@company.com",
    "auth.passwordPlaceholder": "Apna password daalo",
    "auth.namePlaceholder": "Apna naam",
    "auth.resetCodePlaceholder": "123456",
    "auth.createAccount": "Account banayein",
    "auth.register.subtitlePrefix": "Shuru karo",
    "auth.brand.eyebrow": "Social Media Crossposter",
    "auth.brand.headlineLine1": "Har jagah publish karo,",
    "auth.brand.headlineLine2": "ek hi jagah se.",
    "auth.brand.subcopy":
      "Posts schedule karo, accounts manage karo, aur LinkedIn waghera par performance track karo — bina tabs badle.",
    "auth.brand.statusPrefix": "Platforms",
    "auth.brand.statusHighlight": "ready",
    "auth.brand.statusSuffix": " · Minutes mein connect karo",
    "auth.brand.quote":
      "Hamara posting time aadha ho gaya. Ek dashboard mein scheduling aur analytics bilkul wahi tha jo team ko chahiye tha.",
    "auth.brand.quoteAuthor": "Marketing Lead, B2B SaaS company",
    "auth.register.title": "Account banayein",
    "auth.register.subtitle": "SMC ke liye register karo",
    "auth.forgot.title": "Password bhool gaye",
    "auth.forgot.subtitle": "Apna email daalo — hum 6-digit code bhejenge",
    "auth.forgot.success":
      "Agar is email par account hai to reset code bhej diya gaya hai. Inbox ya spam check karo.",
    "auth.reset.title": "Password reset",
    "auth.reset.subtitle": "Email par aaya 6-digit code aur naya password daalo",
    "auth.error.loginFailed": "Login fail ho gaya",
    "auth.error.registerFailed": "Registration fail ho gayi",
    "auth.error.requestFailed": "Request fail ho gayi",
    "auth.error.resetFailed": "Reset fail ho gaya",
    "auth.error.passwordMismatch": "Password match nahi kar rahe",
    "auth.success.passwordUpdated": "Password update ho gaya. Ab login karo.",
    "auth.recaptcha.loadError": "reCAPTCHA load nahi hua. Site key check karo ya dubara try karo.",
    "auth.recaptcha.notice": "reCAPTCHA se protected — Google Privacy & Terms",
    "auth.rememberMe": "Email aur password yaad rakho",
  },
  ur: {
    "auth.email": "ای میل",
    "auth.password": "پاس ورڈ",
    "auth.nameOptional": "نام (اختیاری)",
    "auth.login": "لاگ اِن",
    "auth.register": "رجسٹر",
    "auth.forgotPassword": "پاس ورڈ بھول گئے؟",
    "auth.sendResetCode": "ری سیٹ کوڈ بھیجیں",
    "auth.resetCode": "ری سیٹ کوڈ",
    "auth.newPassword": "نیا پاس ورڈ",
    "auth.confirmPassword": "پاس ورڈ کی تصدیق",
    "auth.updatePassword": "پاس ورڈ اپ ڈیٹ کریں",
    "auth.backToLogin": "لاگ اِن پر واپس",
    "auth.enterResetCode": "ری سیٹ کوڈ درج کریں",
    "auth.resendCode": "کوڈ دوبارہ بھیجیں",
    "auth.noAccount": "اکاؤنٹ نہیں؟",
    "auth.haveAccount": "پہلے سے اکاؤنٹ ہے؟",
    "auth.codeNotReceived": "کوڈ نہیں ملا؟",
    "auth.language": "زبان",
    "auth.login.title": "خوش آمدید",
    "auth.login.subtitle": "SMC میں لاگ اِن کریں",
    "auth.login.subtitlePrefix": "سائن اِن کریں",
    "auth.login.subtitleSuffix": "جاری رکھنے کے لیے",
    "auth.emailPlaceholder": "you@company.com",
    "auth.passwordPlaceholder": "اپنا پاس ورڈ درج کریں",
    "auth.namePlaceholder": "آپ کا نام",
    "auth.resetCodePlaceholder": "123456",
    "auth.createAccount": "اکاؤنٹ بنائیں",
    "auth.register.subtitlePrefix": "شروع کریں",
    "auth.brand.eyebrow": "سوشل میڈیا کراس پوسٹر",
    "auth.brand.headlineLine1": "ہر جگہ شائع کریں،",
    "auth.brand.headlineLine2": "ایک ہی جگہ سے۔",
    "auth.brand.subcopy":
      "پوسٹس شیڈول کریں، اکاؤنٹس منظم کریں، اور LinkedIn وغیرہ پر کارکردگی ٹریک کریں — ٹیبز بدلے بغیر۔",
    "auth.brand.statusPrefix": "پلیٹ فارمز",
    "auth.brand.statusHighlight": "تیار",
    "auth.brand.statusSuffix": " · منٹوں میں کنیکٹ کریں",
    "auth.brand.quote":
      "ہمارا پوسٹنگ وقت آدھا ہو گیا۔ ایک ڈیش بورڈ میں شیڈولنگ اور تجزیات بالکل وہی تھی جو ٹیم کو چاہیے تھی۔",
    "auth.brand.quoteAuthor": "مارکیٹنگ لیڈ، B2B SaaS کمپنی",
    "auth.register.title": "اکاؤنٹ بنائیں",
    "auth.register.subtitle": "SMC کے لیے رجسٹر کریں",
    "auth.forgot.title": "پاس ورڈ بھول گئے",
    "auth.forgot.subtitle": "اپنا ای میل درج کریں — ہم 6 ہندسوں کا کوڈ بھیجیں گے",
    "auth.forgot.success":
      "اگر اس ای میل پر اکاؤنٹ ہے تو ری سیٹ کوڈ بھیج دیا گیا ہے۔ ان باکس یا سپیم چیک کریں۔",
    "auth.reset.title": "پاس ورڈ ری سیٹ",
    "auth.reset.subtitle": "ای میل پر آیا 6 ہندسوں کا کوڈ اور نیا پاس ورڈ درج کریں",
    "auth.error.loginFailed": "لاگ اِن ناکام",
    "auth.error.registerFailed": "رجسٹریشن ناکام",
    "auth.error.requestFailed": "درخواست ناکام",
    "auth.error.resetFailed": "ری سیٹ ناکام",
    "auth.error.passwordMismatch": "پاس ورڈ مماثل نہیں",
    "auth.success.passwordUpdated": "پاس ورڈ اپ ڈیٹ ہو گیا۔ اب لاگ اِن کریں۔",
    "auth.recaptcha.loadError": "reCAPTCHA لوڈ نہیں ہوا۔ سائٹ کی چیک کریں یا دوبارہ کوشش کریں۔",
    "auth.recaptcha.notice": "reCAPTCHA سے محفوظ — Google Privacy & Terms",
    "auth.rememberMe": "ای میل اور پاس ورڈ یاد رکھیں",
  },
  hi: {
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.nameOptional": "नाम (वैकल्पिक)",
    "auth.login": "लॉगिन",
    "auth.register": "रजिस्टर",
    "auth.forgotPassword": "पासवर्ड भूल गए?",
    "auth.sendResetCode": "रीसेट कोड भेजें",
    "auth.resetCode": "रीसेट कोड",
    "auth.newPassword": "नया पासवर्ड",
    "auth.confirmPassword": "पासवर्ड की पुष्टि",
    "auth.updatePassword": "पासवर्ड अपडेट करें",
    "auth.backToLogin": "लॉगिन पर वापस",
    "auth.enterResetCode": "रीसेट कोड दर्ज करें",
    "auth.resendCode": "कोड फिर भेजें",
    "auth.noAccount": "खाता नहीं है?",
    "auth.haveAccount": "पहले से खाता है?",
    "auth.codeNotReceived": "कोड नहीं मिला?",
    "auth.language": "भाषा",
    "auth.login.title": "वापसी पर स्वागत है",
    "auth.login.subtitle": "SMC में लॉगिन करें",
    "auth.login.subtitlePrefix": "साइन इन करें",
    "auth.login.subtitleSuffix": "जारी रखने के लिए",
    "auth.emailPlaceholder": "you@company.com",
    "auth.passwordPlaceholder": "अपना पासवर्ड दर्ज करें",
    "auth.namePlaceholder": "आपका नाम",
    "auth.resetCodePlaceholder": "123456",
    "auth.createAccount": "खाता बनाएं",
    "auth.register.subtitlePrefix": "शुरू करें",
    "auth.brand.eyebrow": "सोशल मीडिया क्रॉसपोस्टर",
    "auth.brand.headlineLine1": "हर जगह प्रकाशित करें,",
    "auth.brand.headlineLine2": "एक ही जगह से।",
    "auth.brand.subcopy":
      "पोस्ट शेड्यूल करें, अकाउंट प्रबंधित करें, और LinkedIn आदि पर प्रदर्शन ट्रैक करें — टैब बदले बिना।",
    "auth.brand.statusPrefix": "प्लेटफ़ॉर्म",
    "auth.brand.statusHighlight": "तैयार",
    "auth.brand.statusSuffix": " · मिनटों में कनेक्ट करें",
    "auth.brand.quote":
      "हमारा पोस्टिंग समय आधा हो गया। एक डैशबोर्ड में शेड्यूलिंग और एनालिटिक्स वही था जो टीम को चाहिए था।",
    "auth.brand.quoteAuthor": "मार्केटिंग लीड, B2B SaaS कंपनी",
    "auth.register.title": "खाता बनाएं",
    "auth.register.subtitle": "SMC के लिए रजिस्टर करें",
    "auth.forgot.title": "पासवर्ड भूल गए",
    "auth.forgot.subtitle": "अपना ईमेल दर्ज करें — हम 6 अंकों का कोड भेजेंगे",
    "auth.forgot.success":
      "यदि इस ईमेल पर खाता है तो रीसेट कोड भेज दिया गया है। इनबॉक्स या स्पैम जांचें।",
    "auth.reset.title": "पासवर्ड रीसेट",
    "auth.reset.subtitle": "ईमेल पर आया 6 अंकों का कोड और नया पासवर्ड दर्ज करें",
    "auth.error.loginFailed": "लॉगिन विफल",
    "auth.error.registerFailed": "रजिस्ट्रेशन विफल",
    "auth.error.requestFailed": "अनुरोध विफल",
    "auth.error.resetFailed": "रीसेट विफल",
    "auth.error.passwordMismatch": "पासवर्ड मेल नहीं खाते",
    "auth.success.passwordUpdated": "पासवर्ड अपडेट हो गया। कृपया लॉगिन करें।",
    "auth.recaptcha.loadError": "reCAPTCHA लोड नहीं हुआ। साइट की जांच करें या फिर कोशिश करें।",
    "auth.recaptcha.notice": "reCAPTCHA द्वारा सुरक्षित — Google Privacy & Terms",
    "auth.rememberMe": "ईमेल और पासवर्ड याद रखें",
  },
};

export function isUiLocale(value: string): value is UiLocale {
  return value === "en" || value === "roman-ur" || value === "ur" || value === "hi";
}
