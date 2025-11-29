import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    // Update HTML attributes for RTL support
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Save to localStorage
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.tasks': 'Tasks',
    'nav.calendar': 'Calendar',
    'nav.documents': 'Documents',
    'nav.messages': 'Messages',
    'nav.cases': 'Cases',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.signOut': 'Sign out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.createAccount': 'Create Account',
    'auth.haveAccount': 'Already have an account?',
    'auth.noAccount': "Don't have an account?",
    'auth.adminSignIn': 'Admin Sign In',
    'auth.clientSignIn': 'Client Sign In',
    
    // Dashboard
    'dashboard.welcome': 'Welcome to Your Portal',
    'dashboard.caseSetup': "Your case is being set up by our team. You'll be notified once everything is ready and you can start tracking your progress.",
    'dashboard.contactSolicitor': 'If you have any questions, please contact your solicitor.',
    'dashboard.loading': 'Loading...',
    'dashboard.caseProgress': 'Case Progress',
    'dashboard.viewDetails': 'View Details',
    'dashboard.nextMilestone': 'Next Milestone',
    'dashboard.upcomingTasks': 'Upcoming Tasks',
    'dashboard.recentActivity': 'Recent Activity',
    
    // Tasks
    'tasks.title': 'Tasks',
    'tasks.status': 'Status',
    'tasks.dueDate': 'Due Date',
    'tasks.priority': 'Priority',
    'tasks.assignedTo': 'Assigned To',
    'tasks.description': 'Description',
    'tasks.complete': 'Complete',
    'tasks.inProgress': 'In Progress',
    'tasks.notStarted': 'Not Started',
    
    // Documents
    'documents.title': 'Documents',
    'documents.upload': 'Upload Document',
    'documents.download': 'Download',
    'documents.name': 'Name',
    'documents.size': 'Size',
    'documents.uploadedBy': 'Uploaded By',
    'documents.dateUploaded': 'Date Uploaded',
    
    // Messages
    'messages.title': 'Messages',
    'messages.send': 'Send',
    'messages.type': 'Type a message...',
    'messages.you': 'You',
    
    // Calendar
    'calendar.title': 'Calendar',
    'calendar.upcoming': 'Upcoming Events',
    'calendar.today': 'Today',
    'calendar.noEvents': 'No events scheduled',
    
    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.newCase': 'New Case',
    'admin.editCase': 'Edit Case',
    'admin.caseDetails': 'Case Details',
    'admin.clientEmail': 'Client Email',
    'admin.propertyAddress': 'Property Address',
    'admin.caseReference': 'Case Reference',
    'admin.stage': 'Stage',
    'admin.progress': 'Progress',
    'admin.save': 'Save',
    'admin.cancel': 'Cancel',
    'admin.delete': 'Delete',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.client': 'Client',
    'common.admin': 'Admin',
    'common.account': 'Account',
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة التحكم',
    'nav.tasks': 'المهام',
    'nav.calendar': 'التقويم',
    'nav.documents': 'المستندات',
    'nav.messages': 'الرسائل',
    'nav.cases': 'القضايا',
    
    // Auth
    'auth.signIn': 'تسجيل الدخول',
    'auth.signUp': 'إنشاء حساب',
    'auth.signOut': 'تسجيل الخروج',
    'auth.email': 'البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    'auth.fullName': 'الاسم الكامل',
    'auth.phone': 'رقم الهاتف',
    'auth.createAccount': 'إنشاء حساب',
    'auth.haveAccount': 'هل لديك حساب بالفعل؟',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.adminSignIn': 'تسجيل دخول المسؤول',
    'auth.clientSignIn': 'تسجيل دخول العميل',
    
    // Dashboard
    'dashboard.welcome': 'مرحباً بك في بوابتك',
    'dashboard.caseSetup': 'يتم إعداد قضيتك من قبل فريقنا. سيتم إخطارك بمجرد أن يصبح كل شيء جاهزاً ويمكنك البدء في تتبع تقدمك.',
    'dashboard.contactSolicitor': 'إذا كان لديك أي أسئلة، يرجى الاتصال بمحاميك.',
    'dashboard.loading': 'جاري التحميل...',
    'dashboard.caseProgress': 'تقدم القضية',
    'dashboard.viewDetails': 'عرض التفاصيل',
    'dashboard.nextMilestone': 'المعلم التالي',
    'dashboard.upcomingTasks': 'المهام القادمة',
    'dashboard.recentActivity': 'النشاط الأخير',
    
    // Tasks
    'tasks.title': 'المهام',
    'tasks.status': 'الحالة',
    'tasks.dueDate': 'تاريخ الاستحقاق',
    'tasks.priority': 'الأولوية',
    'tasks.assignedTo': 'معين إلى',
    'tasks.description': 'الوصف',
    'tasks.complete': 'مكتملة',
    'tasks.inProgress': 'قيد التنفيذ',
    'tasks.notStarted': 'لم تبدأ',
    
    // Documents
    'documents.title': 'المستندات',
    'documents.upload': 'رفع مستند',
    'documents.download': 'تحميل',
    'documents.name': 'الاسم',
    'documents.size': 'الحجم',
    'documents.uploadedBy': 'تم الرفع بواسطة',
    'documents.dateUploaded': 'تاريخ الرفع',
    
    // Messages
    'messages.title': 'الرسائل',
    'messages.send': 'إرسال',
    'messages.type': 'اكتب رسالة...',
    'messages.you': 'أنت',
    
    // Calendar
    'calendar.title': 'التقويم',
    'calendar.upcoming': 'الأحداث القادمة',
    'calendar.today': 'اليوم',
    'calendar.noEvents': 'لا توجد أحداث مجدولة',
    
    // Admin
    'admin.dashboard': 'لوحة تحكم المسؤول',
    'admin.newCase': 'قضية جديدة',
    'admin.editCase': 'تحرير القضية',
    'admin.caseDetails': 'تفاصيل القضية',
    'admin.clientEmail': 'البريد الإلكتروني للعميل',
    'admin.propertyAddress': 'عنوان الممتلكات',
    'admin.caseReference': 'مرجع القضية',
    'admin.stage': 'المرحلة',
    'admin.progress': 'التقدم',
    'admin.save': 'حفظ',
    'admin.cancel': 'إلغاء',
    'admin.delete': 'حذف',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تحرير',
    'common.view': 'عرض',
    'common.close': 'إغلاق',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.client': 'عميل',
    'common.admin': 'مسؤول',
    'common.account': 'الحساب',
  },
};
