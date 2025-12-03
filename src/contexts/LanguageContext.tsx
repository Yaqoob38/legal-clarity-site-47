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
    // Update HTML lang attribute (keep LTR layout, only translate text)
    document.documentElement.lang = language;
    
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
    'dashboard.clientPortal': 'Client Portal',
    'dashboard.welcomeBack': 'Welcome back',
    'dashboard.uploadDocument': '+ Upload Document',
    'dashboard.property': 'Property',
    'dashboard.caseReference': 'Case Reference',
    'dashboard.currentStage': 'Current Stage',
    'dashboard.firstStage': 'First Stage',
    'dashboard.secondStage': 'Second Stage',
    'dashboard.thirdStage': 'Third Stage',
    'dashboard.nextTask': 'Next Task',
    'dashboard.allTasksComplete': 'All tasks complete!',
    'dashboard.boardView': 'Board View',
    'dashboard.listView': 'List View',
    'dashboard.filterBy': 'Filter by:',
    'dashboard.status': 'Status',
    'dashboard.completed': 'Completed',
    'dashboard.noTasksYet': 'No tasks visible yet',
    
    // Task Statuses
    'status.NOT_STARTED': 'NOT STARTED',
    'status.IN_PROGRESS': 'IN PROGRESS',
    'status.SUBMITTED': 'SUBMITTED',
    'status.PENDING_REVIEW': 'AWAITING APPROVAL',
    'status.APPROVED': 'APPROVED',
    'status.REJECTED': 'REJECTED',
    'status.LOCKED': 'LOCKED',
    'status.COMPLETE': 'COMPLETE',
    
    // Task Titles (from database)
    'task.Client Care Letter & ID': 'Client Care Letter & ID',
    'task.Complete Thirdfort AML Check': 'Complete Thirdfort AML Check',
    'task.Client Information Form': 'Client Information Form',
    'task.Property Information Form': 'Property Information Form',
    'task.Review Draft Contract': 'Review Draft Contract',
    'task.Title Deed Verification': 'Title Deed Verification',
    'task.Search Results Review': 'Search Results Review',
    'task.Sign Final Contract': 'Sign Final Contract',
    'task.Complete Transfer Documents': 'Complete Transfer Documents',
    'task.Completion Statement': 'Completion Statement',
    
    // Task Descriptions (from database)
    'taskDesc.Review and sign the client care letter and upload identification documents.': 'Review and sign the client care letter and upload identification documents.',
    'taskDesc.Complete identity verification through Thirdfort.': 'Complete identity verification through Thirdfort.',
    'taskDesc.Complete the comprehensive client information form.': 'Complete the comprehensive client information form.',
    'taskDesc.Complete detailed property information form.': 'Complete detailed property information form.',
    'taskDesc.Review and approve the draft contract documents.': 'Review and approve the draft contract documents.',
    'taskDesc.Verify property title deeds and ownership.': 'Verify property title deeds and ownership.',
    'taskDesc.Review local authority and environmental search results.': 'Review local authority and environmental search results.',
    'taskDesc.Sign the final contract and exchange documents.': 'Sign the final contract and exchange documents.',
    'taskDesc.Sign and return transfer documentation.': 'Sign and return transfer documentation.',
    'taskDesc.Review and approve the completion statement.': 'Review and approve the completion statement.',
    
    // Task Detail Page
    'taskDetail.taskNotFound': 'Task not found',
    'taskDetail.returnToDashboard': 'Return to Dashboard',
    'taskDetail.description': 'Description',
    'taskDetail.noDescription': 'No description provided.',
    'taskDetail.awaitingApproval': 'Awaiting Approval',
    'taskDetail.awaitingApprovalDesc': 'This task has been submitted and is currently awaiting approval from your case administrator. You will be notified once it has been reviewed.',
    'taskDetail.completeAmlCheck': 'Complete Your AML Check',
    'taskDetail.amlCheckDesc': 'Click the button below to be redirected to Thirdfort where you can complete your Anti-Money Laundering verification check securely.',
    'taskDetail.amlCheckSubmitted': 'AML Check Submitted',
    'taskDetail.startAmlCheck': 'Start AML Check',
    'taskDetail.downloadAndSign': 'Download & Sign',
    'taskDetail.downloadAndSignDesc': 'Download the required documents, complete and sign them, then upload using the form on the right.',
    'taskDetail.pdfDocument': 'PDF Document',
    'taskDetail.download': 'Download',
    'taskDetail.uploadDocuments': 'Upload Documents',
    'taskDetail.requiredDocuments': 'Required documents:',
    'taskDetail.dragAndDrop': 'Drag and drop files here, or click to browse',
    'taskDetail.chooseFiles': 'Choose Files',
    'taskDetail.uploadedDocuments': 'Uploaded Documents',
    'taskDetail.approved': 'Approved',
    'taskDetail.rejected': 'Rejected',
    'taskDetail.view': 'View',
    'taskDetail.notes': 'Notes',
    'taskDetail.notesPlaceholder': 'Add any notes or comments about this task...',
    'taskDetail.saveNotes': 'Save Notes',
    'taskDetail.taskLocked': 'This task is currently locked',
    'taskDetail.completePreviousTasks': 'Complete the previous stage tasks to unlock this task',
    
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
    'tasks.manageCaseTasks': 'Manage Your Case Tasks',
    'tasks.allTasks': 'All Tasks',
    'tasks.loadingTasks': 'Loading tasks...',
    
    // Documents
    'documents.title': 'Documents',
    'documents.upload': 'Upload Document',
    'documents.download': 'Download',
    'documents.name': 'Name',
    'documents.size': 'Size',
    'documents.uploadedBy': 'Uploaded By',
    'documents.dateUploaded': 'Date Uploaded',
    'documents.manageCaseFiles': 'Manage Your Case Files',
    'documents.uploadDocuments': 'Upload Documents',
    'documents.linkToTask': 'Link to Task (Optional)',
    'documents.generalDocuments': 'General Documents',
    'documents.dragAndDrop': 'Drag and drop files here, or click to browse',
    'documents.maxFileSize': 'Maximum file size: 10MB',
    'documents.chooseFiles': 'Choose Files',
    'documents.allDocuments': 'All Documents',
    'documents.noDocuments': 'No documents uploaded yet',
    'documents.loadingDocuments': 'Loading documents...',
    
    // Messages
    'messages.title': 'Messages',
    'messages.send': 'Send',
    'messages.type': 'Type your message...',
    'messages.you': 'You',
    'messages.communicateWithSolicitor': 'Communicate With Your Solicitor',
    'messages.noMessages': 'No messages yet',
    'messages.startConversation': 'Start a conversation with your solicitor',
    'messages.loadingMessages': 'Loading messages...',
    
    // Calendar
    'calendar.title': 'Calendar',
    'calendar.upcoming': 'Upcoming Events',
    'calendar.today': 'Today',
    'calendar.tomorrow': 'Tomorrow',
    'calendar.noEvents': 'No events scheduled',
    'calendar.keyDatesDeadlines': 'Key Dates & Deadlines',
    'calendar.loadingCalendar': 'Loading calendar...',
    'calendar.deadline': 'Deadline',
    'calendar.completion': 'Completion',
    'calendar.meeting': 'Meeting',
    'calendar.summary': 'Summary',
    'calendar.totalEvents': 'Total Events',
    'calendar.deadlines': 'Deadlines',
    'calendar.completions': 'Completions',
    'calendar.noUpcomingEvents': 'No upcoming events',
    'calendar.inDays': 'In {days} days',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.unread': 'unread',
    'notifications.markAllRead': 'Mark all read',
    'notifications.noNotifications': 'No notifications',
    
    // Auth
    'auth.welcomeBack': 'Welcome back',
    'auth.forgotPassword': 'Forgot password?',
    'auth.createAnAccount': 'Create an account',
    'auth.joinPortal': 'Join our secure client portal to manage your legal matters.',
    'auth.repeatPassword': 'Repeat Password',
    'auth.termsAgree': 'I agree to the Terms of Service and Privacy Policy.',
    'auth.creatingAccount': 'Creating Account...',
    'auth.signUpWithGoogle': 'Sign up with Google',
    'auth.home': 'Home',
    'auth.contact': 'Contact',
    
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
    'dashboard.clientPortal': 'بوابة العميل',
    'dashboard.welcomeBack': 'مرحباً بعودتك',
    'dashboard.uploadDocument': '+ رفع مستند',
    'dashboard.property': 'العقار',
    'dashboard.caseReference': 'مرجع القضية',
    'dashboard.currentStage': 'المرحلة الحالية',
    'dashboard.firstStage': 'المرحلة الأولى',
    'dashboard.secondStage': 'المرحلة الثانية',
    'dashboard.thirdStage': 'المرحلة الثالثة',
    'dashboard.nextTask': 'المهمة التالية',
    'dashboard.allTasksComplete': 'جميع المهام مكتملة!',
    'dashboard.boardView': 'عرض اللوحة',
    'dashboard.listView': 'عرض القائمة',
    'dashboard.filterBy': 'تصفية حسب:',
    'dashboard.status': 'الحالة',
    'dashboard.completed': 'مكتمل',
    'dashboard.noTasksYet': 'لا توجد مهام مرئية بعد',
    
    // Task Statuses
    'status.NOT_STARTED': 'لم تبدأ',
    'status.IN_PROGRESS': 'قيد التنفيذ',
    'status.SUBMITTED': 'تم التقديم',
    'status.PENDING_REVIEW': 'بانتظار الموافقة',
    'status.APPROVED': 'موافق عليه',
    'status.REJECTED': 'مرفوض',
    'status.LOCKED': 'مقفل',
    'status.COMPLETE': 'مكتمل',
    
    // Task Titles (from database)
    'task.Client Care Letter & ID': 'خطاب رعاية العميل والهوية',
    'task.Complete Thirdfort AML Check': 'إكمال فحص مكافحة غسيل الأموال',
    'task.Client Information Form': 'نموذج معلومات العميل',
    'task.Property Information Form': 'نموذج معلومات العقار',
    'task.Review Draft Contract': 'مراجعة مسودة العقد',
    'task.Title Deed Verification': 'التحقق من سند الملكية',
    'task.Search Results Review': 'مراجعة نتائج البحث',
    'task.Sign Final Contract': 'توقيع العقد النهائي',
    'task.Complete Transfer Documents': 'إكمال مستندات النقل',
    'task.Completion Statement': 'بيان الإتمام',
    
    // Task Descriptions (from database)
    'taskDesc.Review and sign the client care letter and upload identification documents.': 'مراجعة وتوقيع خطاب رعاية العميل ورفع مستندات الهوية.',
    'taskDesc.Complete identity verification through Thirdfort.': 'إكمال التحقق من الهوية عبر ثيردفورت.',
    'taskDesc.Complete the comprehensive client information form.': 'إكمال نموذج معلومات العميل الشامل.',
    'taskDesc.Complete detailed property information form.': 'إكمال نموذج معلومات العقار المفصل.',
    'taskDesc.Review and approve the draft contract documents.': 'مراجعة والموافقة على مسودة مستندات العقد.',
    'taskDesc.Verify property title deeds and ownership.': 'التحقق من سندات ملكية العقار.',
    'taskDesc.Review local authority and environmental search results.': 'مراجعة نتائج البحث البيئي والسلطات المحلية.',
    'taskDesc.Sign the final contract and exchange documents.': 'توقيع العقد النهائي وتبادل المستندات.',
    'taskDesc.Sign and return transfer documentation.': 'توقيع وإرجاع مستندات النقل.',
    'taskDesc.Review and approve the completion statement.': 'مراجعة والموافقة على بيان الإتمام.',
    
    // Task Detail Page
    'taskDetail.taskNotFound': 'المهمة غير موجودة',
    'taskDetail.returnToDashboard': 'العودة إلى لوحة التحكم',
    'taskDetail.description': 'الوصف',
    'taskDetail.noDescription': 'لا يوجد وصف.',
    'taskDetail.awaitingApproval': 'بانتظار الموافقة',
    'taskDetail.awaitingApprovalDesc': 'تم تقديم هذه المهمة وهي حالياً بانتظار الموافقة من مسؤول قضيتك. سيتم إخطارك بمجرد مراجعتها.',
    'taskDetail.completeAmlCheck': 'أكمل فحص مكافحة غسيل الأموال',
    'taskDetail.amlCheckDesc': 'انقر على الزر أدناه للانتقال إلى ثيردفورت حيث يمكنك إكمال فحص مكافحة غسيل الأموال بشكل آمن.',
    'taskDetail.amlCheckSubmitted': 'تم تقديم فحص مكافحة غسيل الأموال',
    'taskDetail.startAmlCheck': 'بدء فحص مكافحة غسيل الأموال',
    'taskDetail.downloadAndSign': 'تحميل والتوقيع',
    'taskDetail.downloadAndSignDesc': 'قم بتحميل المستندات المطلوبة، أكملها ووقعها، ثم ارفعها باستخدام النموذج على اليمين.',
    'taskDetail.pdfDocument': 'مستند PDF',
    'taskDetail.download': 'تحميل',
    'taskDetail.uploadDocuments': 'رفع المستندات',
    'taskDetail.requiredDocuments': 'المستندات المطلوبة:',
    'taskDetail.dragAndDrop': 'اسحب وأفلت الملفات هنا، أو انقر للتصفح',
    'taskDetail.chooseFiles': 'اختيار الملفات',
    'taskDetail.uploadedDocuments': 'المستندات المرفوعة',
    'taskDetail.approved': 'موافق عليه',
    'taskDetail.rejected': 'مرفوض',
    'taskDetail.view': 'عرض',
    'taskDetail.notes': 'ملاحظات',
    'taskDetail.notesPlaceholder': 'أضف أي ملاحظات أو تعليقات حول هذه المهمة...',
    'taskDetail.saveNotes': 'حفظ الملاحظات',
    'taskDetail.taskLocked': 'هذه المهمة مقفلة حالياً',
    'taskDetail.completePreviousTasks': 'أكمل مهام المرحلة السابقة لفتح هذه المهمة',
    
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
    'tasks.manageCaseTasks': 'إدارة مهام قضيتك',
    'tasks.allTasks': 'جميع المهام',
    'tasks.loadingTasks': 'جاري تحميل المهام...',
    
    // Documents
    'documents.title': 'المستندات',
    'documents.upload': 'رفع مستند',
    'documents.download': 'تحميل',
    'documents.name': 'الاسم',
    'documents.size': 'الحجم',
    'documents.uploadedBy': 'تم الرفع بواسطة',
    'documents.dateUploaded': 'تاريخ الرفع',
    'documents.manageCaseFiles': 'إدارة ملفات قضيتك',
    'documents.uploadDocuments': 'رفع المستندات',
    'documents.linkToTask': 'ربط بمهمة (اختياري)',
    'documents.generalDocuments': 'مستندات عامة',
    'documents.dragAndDrop': 'اسحب وأفلت الملفات هنا، أو انقر للتصفح',
    'documents.maxFileSize': 'الحد الأقصى لحجم الملف: 10 ميجابايت',
    'documents.chooseFiles': 'اختيار الملفات',
    'documents.allDocuments': 'جميع المستندات',
    'documents.noDocuments': 'لم يتم رفع أي مستندات بعد',
    'documents.loadingDocuments': 'جاري تحميل المستندات...',
    
    // Messages
    'messages.title': 'الرسائل',
    'messages.send': 'إرسال',
    'messages.type': 'اكتب رسالتك...',
    'messages.you': 'أنت',
    'messages.communicateWithSolicitor': 'تواصل مع محاميك',
    'messages.noMessages': 'لا توجد رسائل بعد',
    'messages.startConversation': 'ابدأ محادثة مع محاميك',
    'messages.loadingMessages': 'جاري تحميل الرسائل...',
    
    // Calendar
    'calendar.title': 'التقويم',
    'calendar.upcoming': 'الأحداث القادمة',
    'calendar.today': 'اليوم',
    'calendar.tomorrow': 'غداً',
    'calendar.noEvents': 'لا توجد أحداث مجدولة',
    'calendar.keyDatesDeadlines': 'التواريخ والمواعيد النهائية الهامة',
    'calendar.loadingCalendar': 'جاري تحميل التقويم...',
    'calendar.deadline': 'موعد نهائي',
    'calendar.completion': 'إتمام',
    'calendar.meeting': 'اجتماع',
    'calendar.summary': 'ملخص',
    'calendar.totalEvents': 'إجمالي الأحداث',
    'calendar.deadlines': 'المواعيد النهائية',
    'calendar.completions': 'الإتمامات',
    'calendar.noUpcomingEvents': 'لا توجد أحداث قادمة',
    'calendar.inDays': 'خلال {days} أيام',
    
    // Notifications
    'notifications.title': 'الإشعارات',
    'notifications.unread': 'غير مقروءة',
    'notifications.markAllRead': 'تحديد الكل كمقروء',
    'notifications.noNotifications': 'لا توجد إشعارات',
    
    // Auth
    'auth.welcomeBack': 'مرحباً بعودتك',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.createAnAccount': 'إنشاء حساب',
    'auth.joinPortal': 'انضم إلى بوابتنا الآمنة لإدارة شؤونك القانونية.',
    'auth.repeatPassword': 'إعادة كلمة المرور',
    'auth.termsAgree': 'أوافق على شروط الخدمة وسياسة الخصوصية.',
    'auth.creatingAccount': 'جاري إنشاء الحساب...',
    'auth.signUpWithGoogle': 'التسجيل بحساب جوجل',
    'auth.home': 'الرئيسية',
    'auth.contact': 'اتصل بنا',
    
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
