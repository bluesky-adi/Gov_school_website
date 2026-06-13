import React, { useState } from 'react';
import { useAppState } from '../AppContext.tsx';
import { UserRole } from '../types.ts';
import { Globe, LogOut, User, Menu, X, Landmark, GraduationCap, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onNavigatePortal: (role: UserRole | 'PUBLIC') => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigatePortal, activeView, setActiveView }) => {
  const { language, toggleLanguage, user, logout, loginAs, schoolSettings, isAdminCreated, bootstrapFirstAdmin, sendPasswordReset } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [inputIdentifier, setInputIdentifier] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const t = {
    schoolName: language === 'en' ? schoolSettings.schoolNameEn : schoolSettings.schoolNameHi,
    subTitle: language === 'en' ? schoolSettings.addressEn : schoolSettings.addressHi,
    govtText: language === 'en' ? 'Department of Education, Govt. of Bihar' : 'शिक्षा विभाग, बिहार सरकार',
    langToggle: language === 'en' ? 'हिन्दी' : 'English',
    signIn: language === 'en' ? 'Portal Log In' : 'पोर्टल लॉग इन',
    signOut: language === 'en' ? 'Log Out' : 'लॉग आउट',
    home: language === 'en' ? 'Public Website' : 'सार्वजनिक वेबसाइट',
    about: language === 'en' ? 'About School' : 'विद्यालय परिचय',
    faculty: language === 'en' ? 'Faculty Directory' : 'शिक्षक मंडल',
    notices: language === 'en' ? 'Notices' : 'सूचना पट्ट',
    yojana: language === 'en' ? 'Schemes & Yojana' : 'सरकारी योजनाएं',
    grievances: language === 'en' ? 'Grievance' : 'शिकायत निवारण',
    certificates: language === 'en' ? 'Certificates' : 'प्रमाण पत्र केंद्र',
    loginTitle: language === 'en' ? 'Secure Student / Staff Login' : 'सुरक्षित विद्यार्थी / कर्मचारी लॉगिन',
    rollPlaceholder: language === 'en' ? 'Enter Student Email (e.g. student.priya@omarbalika132.edu.in)' : 'छात्रा ईमेल दर्ज करें (जैसे student.priya@omarbalika132.edu.in)',
    teacherPlaceholder: language === 'en' ? 'Enter Teacher Email (e.g. teacher. nodal@omarbalika132.edu.in)' : 'शिक्षक ईमेल दर्ज करें (जैसे teacher.nodal@omarbalika132.edu.in)',
    adminPlaceholder: language === 'en' ? 'Enter Admin Email' : 'प्रशासक ईमेल दर्ज करें',
    loginBtn: language === 'en' ? 'Enter Portal' : 'पोर्टल में प्रवेश करें',
    guestBtn: language === 'en' ? 'Visitor Guest Entrance' : 'आगंतुक प्रवेश',
    adminPrompt: language === 'en' ? 'Default admin: omarbalika132@gmail.com / AdminPass123' : 'प्रशासक: omarbalika132@gmail.com / AdminPass123'
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    // Attempt Login
    try {
      const error = await loginAs(selectedRole, inputIdentifier, inputPassword);
      if (error) {
        setLoginError(error);
      } else {
        setShowLoginModal(false);
        setInputIdentifier('');
        setInputPassword('');
        // Navigate to the correct portal
        onNavigatePortal(selectedRole);
      }
    } catch (err: any) {
      setLoginError(err.message);
    }
  };

  const selectQuickLogin = (role: UserRole, id: string) => {
    setSelectedRole(role);
    setInputIdentifier(id);
    setLoginError(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#1A3A5C] text-white shadow-md no-print w-full">
      {/* Top Govt Status bar */}
      <div className="bg-[#132A43] px-4 py-1 text-xs flex justify-between items-center border-b border-white/5 font-mono">
        <div className="flex items-center gap-2">
          <Landmark className="w-3 h-3 text-[#D4522A]" />
          <span>{t.govtText}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>UDISE ID: {schoolSettings.udise}</span>
          <span className="hidden md:inline">BSEB School Code: {schoolSettings.bsebCode}</span>
        </div>
      </div>

      {/* Main Header navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => {
            onNavigatePortal('PUBLIC');
            setActiveView('home');
          }}
        >
          {/* Bihar Govt Emblem Icon Representation */}
          <div className="w-12 h-12 bg-white text-[#1A3A5C] rounded-full flex items-center justify-center font-bold text-center border-2 border-[#D4522A] shadow-inner shrink-0 leading-tight">
            <span className="text-[10px] block font-mono font-black" style={{ fontSize: '9px' }}>BIHAR<br/>सरकार</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-none">
              {t.schoolName}
            </h1>
            <p className="text-xs text-[#F7F3EE]/80 mt-1 font-medium select-none">
              {t.subTitle} <span className="text-[#D4522A] ml-1 font-bold">• Girls High School</span>
            </p>
          </div>
        </div>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center gap-4">
          <nav className="flex items-center gap-1 mr-2 text-sm font-medium">
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('home'); }} 
              className={`px-3 py-2 rounded-md transition duration-200 ${activeView === 'home' ? 'bg-[#D4522A] text-white' : 'hover:bg-white/10'}`}
            >
              {t.home}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('about'); }} 
              className={`px-3 py-2 rounded-md transition duration-200 ${activeView === 'about' ? 'bg-[#D4522A] text-white' : 'hover:bg-white/10'}`}
            >
              {t.about}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('faculty'); }} 
              className={`px-3 py-2 rounded-md transition duration-200 ${activeView === 'faculty' ? 'bg-[#D4522A] text-white' : 'hover:bg-white/10'}`}
            >
              {t.faculty}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('yojana'); }} 
              className={`px-3 py-2 rounded-md transition duration-200 ${activeView === 'yojana' ? 'bg-[#D4522A] text-white' : 'hover:bg-white/10'}`}
            >
              {t.yojana}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('grievances'); }} 
              className={`px-3 py-2 rounded-md transition duration-200 ${activeView === 'grievances' ? 'bg-[#D4522A] text-white' : 'hover:bg-white/10'}`}
            >
              {t.grievances}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('certificates'); }} 
              className={`px-3 py-2 rounded-md transition duration-200 ${activeView === 'certificates' ? 'bg-[#D4522A] text-white' : 'hover:bg-white/10'}`}
            >
              {t.certificates}
            </button>
          </nav>

          {/* Language and Login Controls */}
          <div className="flex items-center gap-2 border-l border-white/20 pl-4">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#132A43] hover:bg-white/10 text-xs rounded-full transition duration-150 border border-white/10 font-medium"
              title="Change Language / भाषा बदलें"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4522A]" />
              <span>{t.langToggle}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-[#F7F3EE]">
                  <GraduationCap className="w-3.5 h-3.5 text-[#D4522A]" />
                  <span className="font-semibold truncate max-w-[100px]" title={user.nameEn}>
                    {language === 'en' ? user.nameEn : user.nameHi}
                  </span>
                  <span className="text-[9px] bg-[#D4522A] px-1 py-0.5 rounded text-white font-mono font-bold uppercase shrink-0">
                    {user.role}
                  </span>
                </div>
                
                <button 
                  onClick={() => onNavigatePortal(user.role)}
                  className="bg-[#D4522A] hover:bg-[#D4522A]/90 text-white font-bold text-[10px] px-2.5 py-1.5 rounded uppercase cursor-pointer select-none transition-all ml-1"
                  title="Return to Dashboard"
                >
                  {language === 'en' ? 'Dashboard' : 'डैशबोर्ड'}
                </button>

                <button 
                  onClick={() => { logout(); onNavigatePortal('PUBLIC'); setActiveView('home'); }}
                  className="hover:text-[#D4522A] transition duration-100 pl-1.5 ml-1 border-l border-white/20"
                  title={t.signOut}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setLoginError(null); setShowLoginModal(true); }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#D4522A] hover:bg-[#D4522A]/90 text-white font-semibold text-xs rounded-md transition duration-150 shadow-md font-mono"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t.signIn}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#132A43] text-xs rounded-full border border-white/10 font-bold"
          >
            <Globe className="w-3 h-3 text-[#D4522A]" />
            <span>{t.langToggle}</span>
          </button>
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 px-2 hover:bg-white/10 rounded"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#132A43] border-t border-white/10 px-4 py-4 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('home'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-md ${activeView === 'home' ? 'bg-[#D4522A] text-white' : 'bg-white/5'}`}
            >
              {t.home}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('about'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-md ${activeView === 'about' ? 'bg-[#D4522A] text-white' : 'bg-white/5'}`}
            >
              {t.about}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('faculty'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-md ${activeView === 'faculty' ? 'bg-[#D4522A] text-white' : 'bg-white/5'}`}
            >
              {t.faculty}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('yojana'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-md ${activeView === 'yojana' ? 'bg-[#D4522A] text-white' : 'bg-white/5'}`}
            >
              {t.yojana}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('grievances'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-md ${activeView === 'grievances' ? 'bg-[#D4522A] text-white' : 'bg-white/5'}`}
            >
              {t.grievances}
            </button>
            <button 
              onClick={() => { onNavigatePortal('PUBLIC'); setActiveView('certificates'); setMobileMenuOpen(false); }}
              className={`p-2.5 rounded-md ${activeView === 'certificates' ? 'bg-[#D4522A] text-white' : 'bg-white/5'}`}
            >
              {t.certificates}
            </button>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            {user ? (
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 space-y-3 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="text-xs">
                    <span className="text-[#F7F3EE] font-bold block">
                      {language === 'en' ? user.nameEn : user.nameHi}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      Logged in as: {user.role}
                    </span>
                  </div>
                  <button 
                    onClick={() => { logout(); onNavigatePortal('PUBLIC'); setActiveView('home'); setMobileMenuOpen(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#D4522A] text-xs font-bold rounded-md"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.signOut}</span>
                  </button>
                </div>
                <button
                  onClick={() => { onNavigatePortal(user.role); setMobileMenuOpen(false); }}
                  className="w-full py-2 bg-[#D4522A] hover:bg-[#D4522A]/90 text-white font-mono font-bold text-center text-xs rounded uppercase block transition-all"
                >
                  {language === 'en' ? '🔗 Open Staff Dashboard' : '🔗 स्टाफ डैशबोर्ड खोलें'}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => { setLoginError(null); setShowLoginModal(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2 bg-[#D4522A] hover:bg-[#D4522A]/90 text-xs font-bold rounded-md font-mono"
              >
                <User className="w-4 h-4" />
                <span>{t.signIn}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Login Portal Selection Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs transition-opacity overflow-y-auto">
          <div className="bg-[#F7F3EE] rounded-lg max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 my-8 text-[#1C1C1E]">
            {/* Modal Header */}
            <div className="bg-[#1A3A5C] text-white p-4 flex justify-between items-center">
              <h3 className="text-sm font-mono font-bold tracking-wider uppercase text-[#D4522A] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-white" />
                {t.loginTitle}
              </h3>
              <button 
                onClick={() => setShowLoginModal(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Role Select Button tab */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-200/60 rounded-lg">
                {[
                  { r: UserRole.STUDENT, l: language === 'en' ? 'Student' : 'छात्रा' },
                  { r: UserRole.TEACHER, l: language === 'en' ? 'Teacher' : 'शिक्षक' },
                  { r: UserRole.ADMIN, l: language === 'en' ? 'Admin' : 'प्रशासक' }
                ].map((tab) => (
                  <button
                    key={tab.r}
                    type="button"
                    onClick={() => {
                      setSelectedRole(tab.r);
                      setLoginError(null);
                      setInputIdentifier('');
                      setInputPassword('');
                    }}
                    className={`py-1.5 text-[11px] font-bold rounded-md transition-all ${selectedRole === tab.r ? 'bg-[#1A3A5C] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {tab.l}
                  </button>
                ))}
              </div>

              {/* Login instructions */}
              <div className="p-3 bg-white border-l-4 border-[#1A3A5C] text-xs space-y-1 rounded shadow-xs text-gray-700">
                <p className="font-bold">
                  {selectedRole === UserRole.STUDENT && (language === 'en' ? 'Student Portal' : 'छात्रा पोर्टल')}
                  {selectedRole === UserRole.TEACHER && (language === 'en' ? 'Teacher Portal' : 'शिक्षक पोर्टल')}
                  {selectedRole === UserRole.ADMIN && (language === 'en' ? 'Admin / Principal Portal' : 'प्रशासक / प्राचार्या पोर्टल')}
                </p>
                <p>
                  {selectedRole === UserRole.STUDENT && (language === 'en' ? 'Access homework, daily timetables, study notes, classes calendar, and report sheets.' : 'होमवर्क, दैनिक समय-सारणी, अध्ययन नोट्स और रिपोर्ट शीट देखें।')}
                  {selectedRole === UserRole.TEACHER && (language === 'en' ? 'Verify class attendance checklists, upload exam marksheets, and post homework notices.' : 'कक्षा उपस्थिति दर्ज करें, परीक्षा अंकतालिका अपलोड करें, एवं गृहकार्य असाइन करें।')}
                  {selectedRole === UserRole.ADMIN && (language === 'en' ? 'Full operational ledger, notice publisher, certificate issuer, and student databases.' : 'संपूर्ण विद्यालय बजट, नया नोटिस प्रकाशन, प्रमाण पत्र अनुमोदन और छात्रा डेटाबेस का प्रबंधन।')}
                </p>
              </div>

              {!isAdminCreated && (
                <div id="admin-bootstrap-panel" className="p-3.5 bg-amber-500/15 border border-dashed border-amber-600 rounded-lg text-xs space-y-2 text-amber-950 shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <ShieldAlert className="w-5 h-5 animate-bounce text-amber-600 shrink-0" />
                    <span>SYSTEM BOOTSTRAP: No Admin Found</span>
                  </div>
                  <p className="leading-relaxed">
                    No active administrator profile exists in the Firestore database. Run the secure setup bootstrap to instantly register the first admin and assign rules before standard login is available.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      setLoginError(null);
                      const result = await bootstrapFirstAdmin();
                      if (result.success) {
                        setSelectedRole(UserRole.ADMIN);
                        setInputIdentifier(result.email || '');
                        setInputPassword('AdminPass123');
                      } else {
                        setLoginError(result.error || 'Failed to initialize administrative database.');
                      }
                    }}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-md transition font-mono uppercase text-[10px]"
                  >
                    🚀 Run Initial School Setup Bootstrap
                  </button>
                </div>
              )}

              {loginError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-medium flex items-center gap-1.5 animate-pulse">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Quick Login suggestions */}
              <div className="text-[11px] text-gray-500">
                <span className="font-bold">{language === 'en' ? 'Try Demo Credentials:' : 'त्वरित डेमो लॉगिन का प्रयास करें:'}</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedRole === UserRole.STUDENT && (
                    <>
                      <button type="button" onClick={() => { setSelectedRole(UserRole.STUDENT); setInputIdentifier('101'); setInputPassword('StudentPass123'); }} className="px-2 py-1 bg-[#1A3A5C]/5 hover:bg-[#1A3A5C]/10 border border-gray-300 rounded font-bold text-gray-700 font-mono">Priya (Roll 101 / StudentPass123)</button>
                      <button type="button" onClick={() => { setSelectedRole(UserRole.STUDENT); setInputIdentifier('103'); setInputPassword('StudentPass123'); }} className="px-2 py-1 bg-[#1A3A5C]/5 hover:bg-[#1A3A5C]/10 border border-gray-300 rounded font-bold text-gray-700 font-mono">Sabeena (Roll 103 / StudentPass123)</button>
                    </>
                  )}
                  {selectedRole === UserRole.TEACHER && (
                    <>
                      <button type="button" onClick={() => { setSelectedRole(UserRole.TEACHER); setInputIdentifier('t1'); setInputPassword('TeacherPass123'); }} className="px-2 py-1 bg-[#1A3A5C]/5 hover:bg-[#1A3A5C]/10 border border-gray-300 rounded font-bold text-gray-700 font-mono">Nodal Officer (t1 / TeacherPass123)</button>
                      <button type="button" onClick={() => { setSelectedRole(UserRole.TEACHER); setInputIdentifier('t2'); setInputPassword('TeacherPass123'); }} className="px-2 py-1 bg-[#1A3A5C]/5 hover:bg-[#1A3A5C]/10 border border-gray-300 rounded font-bold text-gray-700 font-mono">Senior Teacher (t2 / TeacherPass123)</button>
                    </>
                  )}
                  {selectedRole === UserRole.ADMIN && (
                    <button type="button" onClick={() => { setSelectedRole(UserRole.ADMIN); setInputIdentifier('omarbalika132@gmail.com'); setInputPassword('AdminPass123'); }} className="px-2 py-1 bg-[#1A3A5C]/5 hover:bg-[#1A3A5C]/10 border border-gray-300 rounded font-bold text-gray-700 font-mono">Admin Demo (omarbalika132@gmail.com / AdminPass123)</button>
                  )}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {selectedRole !== UserRole.VISITOR && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {selectedRole === UserRole.STUDENT && (language === 'en' ? 'Student Email' : 'छात्रा ईमेल')}
                        {selectedRole === UserRole.TEACHER && (language === 'en' ? 'Teacher Email' : 'शिक्षक ईमेल')}
                        {selectedRole === UserRole.ADMIN && (language === 'en' ? 'Admin Email' : 'प्रशासक ईमेल')}
                      </label>
                      <input
                        type="email"
                        value={inputIdentifier}
                        onChange={(e) => setInputIdentifier(e.target.value)}
                        placeholder={
                          selectedRole === UserRole.STUDENT ? t.rollPlaceholder :
                          selectedRole === UserRole.TEACHER ? t.teacherPlaceholder :
                          t.adminPlaceholder
                        }
                        className="w-full text-sm p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#1A3A5C] focus:border-[#1A3A5C] outline-hidden font-mono bg-white text-[#1C1C1E]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1 flex justify-between items-center">
                        <span>{language === 'en' ? 'Secure Password' : 'सुरक्षित पासवर्ड'}</span>
                        {selectedRole === UserRole.ADMIN && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!inputIdentifier || !inputIdentifier.includes('@')) {
                                alert(language === 'en' ? 'Please supply a valid admin email first.' : 'कृपया पहले एक मान्य व्यवस्थापक ईमेल दर्ज करें।');
                                return;
                              }
                              try {
                                await sendPasswordReset(inputIdentifier);
                                alert(language === 'en' ? `Verification email reset successfully triggered for ${inputIdentifier}` : `पासवर्ड सुधार संकेत सफलतापूर्वक ${inputIdentifier} पर भेजा गया!`);
                              } catch (resetErr: any) {
                                alert(language === 'en' ? `Failed to trigger reset: ${resetErr.message}` : `संकेत भेजने में त्रुटि: ${resetErr.message}`);
                              }
                            }}
                            className="text-[10px] text-[#D4522A] hover:underline font-bold font-mono"
                          >
                            {language === 'en' ? 'Forgot Password?' : 'पासवर्ड भूल गए?'}
                          </button>
                        )}
                      </label>
                      <input
                        type="password"
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-sm p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#1A3A5C] focus:border-[#1A3A5C] outline-hidden font-mono bg-white text-[#1C1C1E]"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#1A3A5C] hover:bg-[#1A3A5C]/95 text-white font-bold rounded text-xs tracking-wide uppercase shadow-md transition duration-150 font-mono"
                  >
                    {t.loginBtn}
                  </button>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      await loginAs(UserRole.VISITOR);
                      setShowLoginModal(false);
                      onNavigatePortal(UserRole.VISITOR);
                    }}
                    className="w-full py-2 bg-amber-600/10 hover:bg-amber-600/15 text-[#D4522A] text-xs font-bold rounded transition font-mono border border-amber-600/30"
                  >
                    {t.guestBtn}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Modal Footer banner */}
            <div className="bg-[#132A43] text-[10px] text-zinc-300 p-2 text-center font-mono select-none">
              Secured under National e-Governance standards. BSEB, Bihar
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
