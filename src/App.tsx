import React, { useState } from 'react';
import { AppProvider, useAppState } from './AppContext.tsx';
import { Header } from './components/Header.tsx';
import { PublicWebsite } from './components/PublicWebsite.tsx';
import { StudentPortal } from './components/StudentPortal.tsx';
import { TeacherPortal } from './components/TeacherPortal.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { UserRole } from './types.ts';
import { Landmark, ShieldAlert, Heart, PhoneCall, HelpCircle } from 'lucide-react';

function ApplicationLayout() {
  const { language, user, isOnline, schoolSettings, changeUserPassword, setAdminTab } = useAppState();
  const [portalRoute, setPortalRoute] = useState<UserRole | 'PUBLIC'>('PUBLIC');
  const [activeView, setActiveView] = useState('home');

  // Mandatory Password Reset States
  const [newPasswordVal, setNewPasswordVal] = useState('');
  const [confirmPasswordVal, setConfirmPasswordVal] = useState('');
  const [passwordChangeErr, setPasswordChangeErr] = useState<string | null>(null);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // Navigate back/forth portals safely
  const handleNavigatePortal = (route: UserRole | 'PUBLIC') => {
    setPortalRoute(route);
  };

  // Intercept rendering for mandatory first-login password change
  if (user && user.forcePasswordChange) {
    return (
      <div className="min-h-screen bg-[#132A43] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-6 md:p-8 max-w-md w-full border border-[#D4522A]/20 space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-[#D4522A]" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-950">
              {language === 'en' ? 'Mandatory Password Reset' : 'अनिवार्य पासवर्ड परिवर्तन'}
            </h2>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed">
              {language === 'en'
                ? 'As a safety criterion, new account profiles are assigned a temporary password. You must configure your own private security password before proceeding.'
                : 'सुरक्षा मानकों के तहत, नए प्रयोक्ताओं को एक अस्थायी पासवर्ड दिया जाता है। आगे बढ़ने से पहले कृपया अपना नया गुप्त पासवर्ड सेट करें।'}
            </p>
          </div>
          
          <form onSubmit={async (e) => {
            e.preventDefault();
            setPasswordChangeErr(null);
            if (newPasswordVal.length < 6) {
              setPasswordChangeErr(language === 'en' ? 'Password must be at least 6 characters long.' : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
              return;
            }
            if (newPasswordVal !== confirmPasswordVal) {
              setPasswordChangeErr(language === 'en' ? 'Passwords do not match.' : 'पासवर्ड मेल नहीं खा रहे हैं।');
              return;
            }
            const res = await changeUserPassword(newPasswordVal);
            if (res.success) {
              setPasswordChangeSuccess(true);
            } else {
              setPasswordChangeErr(res.error || 'Password update failed.');
            }
          }} className="space-y-4 text-xs font-semibold">
          
            {passwordChangeErr && (
              <div className="p-3 bg-red-50 text-red-700 text-[11px] rounded border border-red-200 font-mono">
                {passwordChangeErr}
              </div>
            )}

            {passwordChangeSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-[11px] rounded border border-emerald-200">
                {language === 'en' ? 'Password updated successfully! Opening portal...' : 'पासवर्ड बदल गया! आगे बढ़ रहे हैं...'}
              </div>
            )}

            <div className="space-y-1">
              <label className="font-mono text-[10px] text-zinc-500 uppercase block">{language === 'en' ? 'New Password' : 'नया पासवर्ड'}</label>
              <input
                type="password"
                required
                value={newPasswordVal}
                onChange={(e) => setNewPasswordVal(e.target.value)}
                placeholder="••••••••"
                className="p-2.5 border rounded w-full bg-neutral-50 font-mono focus:ring-2 focus:ring-[#D4522A] text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="font-mono text-[10px] text-zinc-500 uppercase block">{language === 'en' ? 'Confirm New Password' : 'पासवर्ड की पुष्टि करें'}</label>
              <input
                type="password"
                required
                value={confirmPasswordVal}
                onChange={(e) => setConfirmPasswordVal(e.target.value)}
                placeholder="••••••••"
                className="p-2.5 border rounded w-full bg-neutral-50 font-mono focus:ring-2 focus:ring-[#D4522A] text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#D4522A] hover:bg-[#D4522A]/90 text-white font-mono text-[11px] font-bold rounded uppercase shadow-md transition-colors"
            >
              {language === 'en' ? 'Update & Get Secure Entry' : 'सुरक्षित प्रवेश प्राप्त करें'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col font-sans selection:bg-[#D4522A]/10 selection:text-[#D4522A]">
      {/* Dynamic Header */}
      <Header 
        onNavigatePortal={handleNavigatePortal} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />

      {/* Persistent Admin/Staff Quick Access Bar */}
      {user && portalRoute === 'PUBLIC' && (
        <div className="bg-[#1A3A5C] text-white px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md border-b-2 border-[#D4522A] font-mono z-40 no-print">
          <div className="flex items-center gap-2 text-center md:text-left shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold text-[11px]">
              {language === 'en' 
                ? `STAFF SESSION ACTIVE: ${user.nameEn || user.email} (${user.role})` 
                : `सक्रिय स्टाफ सत्र: ${user.nameHi || user.email} (${user.role})`}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 shrink-0">
            {user.role === UserRole.ADMIN && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 md:mr-2 md:border-r border-white/20 md:pr-3 py-1">
                <button
                  onClick={() => { setAdminTab('dash'); handleNavigatePortal(UserRole.ADMIN); }}
                  className="bg-[#132A43] hover:bg-[#1f426b] text-zinc-100 font-bold px-2 py-1 rounded text-[10px] uppercase transition-all whitespace-nowrap"
                >
                  {language === 'en' ? '📊 Dashboard' : '📊 डैशबोर्ड'}
                </button>
                <button
                  onClick={() => { setAdminTab('users'); handleNavigatePortal(UserRole.ADMIN); }}
                  className="bg-[#132A43] hover:bg-[#1f426b] text-zinc-100 font-bold px-2 py-1 rounded text-[10px] uppercase transition-all whitespace-nowrap"
                >
                  {language === 'en' ? '👥 Users' : '👥 प्रयोक्ता'}
                </button>
                <button
                  onClick={() => { setAdminTab('notices'); handleNavigatePortal(UserRole.ADMIN); }}
                  className="bg-[#132A43] hover:bg-[#1f426b] text-zinc-100 font-bold px-2 py-1 rounded text-[10px] uppercase transition-all whitespace-nowrap"
                >
                  {language === 'en' ? '📢 Notices' : '📢 सूचनाएं'}
                </button>
                <button
                  onClick={() => { setAdminTab('certificates'); handleNavigatePortal(UserRole.ADMIN); }}
                  className="bg-[#132A43] hover:bg-[#1f426b] text-zinc-100 font-bold px-2 py-1 rounded text-[10px] uppercase transition-all whitespace-nowrap"
                >
                  {language === 'en' ? '📜 Certs' : '📜 प्रमाण पत्र'}
                </button>
                <button
                  onClick={() => { setAdminTab('settings'); handleNavigatePortal(UserRole.ADMIN); }}
                  className="bg-[#132A43] hover:bg-[#1f426b] text-zinc-100 font-bold px-2 py-1 rounded text-[10px] uppercase transition-all whitespace-nowrap"
                >
                  {language === 'en' ? '⚙️ Settings' : '⚙️ सेटिंग्स'}
                </button>
              </div>
            )}
            <button
              onClick={() => handleNavigatePortal(user.role)}
              className="bg-[#D4522A] hover:bg-[#b03d1b] text-white font-mono font-bold px-3 py-1.5 rounded text-[11px] uppercase transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              {language === 'en' ? '➡️ Portal Home' : '➡️ पोर्टल होम'}
            </button>
          </div>
        </div>
      )}

      {/* Connection Status Warning Banner */}
      {!isOnline && (
        <div className="bg-red-600 text-white p-2.5 text-center text-xs font-bold animate-pulse z-[60] flex items-center justify-center gap-2 no-print shadow-md">
          <span>
            {language === 'en' 
              ? 'You are currently offline. Some features may be limited.' 
              : 'आप अभी ऑफलाइन हैं। कुछ सुविधाएं सीमित हो सकती हैं।'}
          </span>
        </div>
      )}

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-full overflow-hidden pb-16">
        
        {/* State routing handler */}
        {portalRoute === 'PUBLIC' && (
          <PublicWebsite activeView={activeView} setActiveView={setActiveView} />
        )}

        {portalRoute === UserRole.STUDENT && user?.role === UserRole.STUDENT && (
          <StudentPortal />
        )}

        {portalRoute === UserRole.TEACHER && user?.role === UserRole.TEACHER && (
          <TeacherPortal />
        )}

        {portalRoute === UserRole.ADMIN && user?.role === UserRole.ADMIN && (
          <AdminPortal />
        )}

        {/* Guest Visitor session handler */}
        {portalRoute === UserRole.VISITOR && user?.role === UserRole.VISITOR && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="bg-white p-6 rounded shadow-md text-xs space-y-3">
              <h2 className="text-sm font-bold text-[#1A3A5C] border-b pb-2 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-[#D4522A]" />
                <span>{language === 'en' ? 'Visitor Portal Dashboard (Begusarai Digital Initative)' : 'आगंतुक पोर्टल डैशबोर्ड (डिजिटल पहल)'}</span>
              </h2>
              <div className="space-y-2 text-gray-700 select-none">
                <p>{language === 'en' ? 'Welcome as Guest Visitor. You have restricted viewer privileges across general files database.' : 'आगंतुक के रूप में आपका स्वागत है। आपके पास सामान्य डेटाबेस फाइलों को देखने के सीमित अधिकार हैं।'}</p>
                <p className="bg-yellow-100/50 p-3 border-l-4 border-yellow-500 rounded text-[11px] text-amber-900 font-mono italic">
                  {language === 'en' ? '* Standard authentication check required for marksheets print and certificates collection.' : '* प्रगति-पत्र और प्रमाण पत्र निकासी के लिए संबंधित सुरक्षा पोर्टल से लॉग इन करना आवश्यक है।'}
                </p>
              </div>
              <button 
                onClick={() => handleNavigatePortal('PUBLIC')} 
                className="px-4 py-2 bg-[#D4522A] hover:bg-[#D4522A]/95 text-white font-mono font-bold rounded shadow-xs"
              >
                {language === 'en' ? 'Return to Home Website' : 'होम वेबसाइट पर वापस जाएं'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Beautiful Public Footer */}
      <footer className="bg-[#132A43] text-white/70 text-xs no-print border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm tracking-tight">
              {language === 'en' ? schoolSettings.schoolNameEn : schoolSettings.schoolNameHi}
            </h4>
            <p className="text-[11px] leading-relaxed select-none text-zinc-300">
              {language === 'en' 
                ? `An educational sanctuary for daughters of Teghra and Begusarai. Providing modern scientific learning matching BSEB curriculum standard criteria.` 
                : `${schoolSettings.addressHi} की बेटियों के लिए एक उत्कृष्ट शैक्षणिक स्थल। बिहार विद्यालय परीक्षा समिति (BSEB) के अनुरूप आधुनिक वैज्ञानिक और सामाजिक विकास का केंद्र।`}
            </p>
            <div className="pt-2 font-mono text-[10px] space-y-0.5 text-zinc-400">
              <p>UDISE Code: <span className="text-white font-bold">{schoolSettings.udise}</span></p>
              <p>BSEB Code (Matric): <span className="text-white font-bold">{schoolSettings.bsebCode}</span></p>
              {schoolSettings.bsebInterCode && <p>BSEB Code (Inter): <span className="text-white font-bold">{schoolSettings.bsebInterCode}</span></p>}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[#D4522A] font-bold text-xs uppercase font-mono tracking-wider">
              {language === 'en' ? 'Official Contact Information' : 'आधिकारिक संपर्क सूत्र'}
            </h4>
            <div className="space-y-2 text-[11px] text-zinc-300">
              <p className="font-medium leading-relaxed select-none">
                📍 {language === 'en' ? schoolSettings.addressEn : schoolSettings.addressHi}
              </p>
              <p className="font-mono pt-1">
                📧 Official Email: <span className="text-white font-bold select-all">omarbalika132@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="space-y-2 text-left md:text-right">
            <h4 className="text-white font-bold text-xs">
              {language === 'en' ? 'Government Digital Trust' : 'डिजिटल शासन प्रमाणन'}
            </h4>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              {language === 'en' 
                ? 'Affiliated under Department of Secondary Education, Government of Bihar.' 
                : 'शिक्षा विभाग, माध्यमिक शिक्षा निदेशालय, बिहार सरकार की आधिकारिक प्रविष्टि।'}
            </p>
            <div className="flex justify-start md:justify-end gap-1.5 pt-2">
              <span className="text-[9px] bg-white/5 text-zinc-300 font-mono px-2 py-0.5 rounded border border-white/10 uppercase">
                BSEB Web Compliant
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-6 pt-4 border-t border-white/5 text-center text-[10px] font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} Omar Girls High School Portal. All Rights Reserved.</span>
          <span className="flex items-center gap-1 text-[#D4522A]">
            <span>Crafted for Quality Education in Bihar</span>
            <Heart className="w-3 h-3 fill-current text-red-600 animate-pulse" />
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ApplicationLayout />
    </AppProvider>
  );
}
