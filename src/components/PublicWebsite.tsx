import React, { useState } from 'react';
import { useAppState } from '../AppContext.tsx';
import { Notice, ScholarshipScheme, Book, NoticeCategory } from '../types.ts';
import {
  Search,
  Filter,
  FileText,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Utensils,
  Megaphone,
  UserCheck,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  Clock,
  Printer,
  FileDown
} from 'lucide-react';

interface PublicWebsiteProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const PublicWebsite: React.FC<PublicWebsiteProps> = ({ activeView, setActiveView }) => {
  const {
    language,
    notices,
    schemes,
    faqs,
    books,
    searchBooks,
    grievances,
    addGrievance,
    queryGrievanceByTicket,
    certificates,
    applyCertificate,
    queryCertificateByReference,
    students,
    teachers,
    examResults,
    schoolSettings
  } = useAppState();

  // Search/Filter states for Notices
  const [noticeSearch, setNoticeSearch] = useState('');
  const [noticeFilter, setNoticeFilter] = useState<NoticeCategory | 'All'>('All');

  // Library states
  const [libraryQuery, setLibraryQuery] = useState('');
  const searchedBooks = searchBooks(libraryQuery);

  // Grievance states
  const [complainantName, setComplainantName] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [complaintCategory, setComplaintCategory] = useState('Academic Facilities');
  const [complaintText, setComplaintText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [trackingTicket, setTrackingTicket] = useState('');
  const [trackedComplaint, setTrackedComplaint] = useState<any>(null);

  // Certificate Application states
  const [certStudentName, setCertStudentName] = useState('');
  const [certRollNo, setCertRollNo] = useState('');
  const [certClass, setCertClass] = useState('Class X');
  const [certYear, setCertYear] = useState('2025-2026');
  const [certType, setCertType] = useState<'Transfer Certificate' | 'School Leaving Certificate (SLC)' | 'Bonafide Certificate' | 'Character Certificate'>('Character Certificate');
  const [certReason, setCertReason] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [appliedRefNo, setAppliedRefNo] = useState<string | null>(null);
  const [trackingRef, setTrackingRef] = useState('');
  const [trackedCert, setTrackedCert] = useState<any>(null);

  // Bilingual UI Dictionary
  const listT = {
    motto: language === 'en' ? '"Education and Culture: True Empowerment for Girls"' : '"शिक्षा और संस्कृति: बालिकाओं का सच्चा सशक्तिकरण"',
    established: language === 'en' 
      ? `Estd: ${schoolSettings.establishmentYear} • Government Aided High School • ${schoolSettings.addressEn}` 
      : `स्थापना: ${schoolSettings.establishmentYear} • सरकारी सहायता प्राप्त हाई स्कूल • ${schoolSettings.addressHi}`,
    introTitle: language === 'en' ? `Welcome to ${schoolSettings.schoolNameEn}` : `${schoolSettings.schoolNameHi} में आपका स्वागत है`,
    introText: language === 'en' 
      ? `Providing high-quality secondary and higher secondary education for young women in ${schoolSettings.addressEn}. Supported by Bihar Education Project Council (BEPC), our mission is to build digital literacy, academic excellence, and self-reliance.`
      : `${schoolSettings.addressHi} में बालिकाओं के लिए उच्च गुणवत्तापूर्ण माध्यमिक एवं उच्चतर माध्यमिक शिक्षा प्रदान करना। बिहार शिक्षा परियोजना परिषद (BEPC) द्वारा समर्थित, हमारा उद्देश्य डिजिटल साक्षरता, शैक्षणिक उत्कृष्टता और आत्मनिर्भरता का निर्माण करना है।`,
    principalTitle: language === 'en' ? 'Principal\'s Message' : 'प्राचार्य का संदेश',
    principalText: language === 'en' ? schoolSettings.principalMessageEn : schoolSettings.principalMessageHi,
    statsGirls: language === 'en' ? 'Enrolled Girls' : 'नामांकित छात्राएं',
    statsTeachers: language === 'en' ? 'Qualified Teachers' : 'योग्य शिक्षक',
    statsRate: language === 'en' ? 'BSEB Matric Pass Rate' : 'मैट्रिक उत्तीर्ण दर',
    statsDBT: language === 'en' ? 'Medhasoft DBT Transfers' : 'मेधासॉफ्ट डीबीटी संवितरण',
    noticeHeader: language === 'en' ? 'Notice Board & Official Circulars' : 'सूचना पट्ट एवं आधिकारिक परिपत्र',
    searchNoticePlaceholder: language === 'en' ? 'Search notices...' : 'सूचनाएं खोजें...',
    yojanaHeader: language === 'en' ? 'Welfare Schemes & Scholarship Hub' : 'कल्याणकारी योजनाएं एवं छात्रवृत्ति हब',
    admissionsHeader: language === 'en' ? 'Admissions Information (Session 2026-2027)' : 'नामांकन सूचना (सत्र 2026-2027)',
    libraryHeader: language === 'en' ? 'Digital Library & e-LOTS Search Desk' : 'डिजिटल पुस्तकालय एवं ई-लॉट्स खोज केंद्र',
    grievanceHeader: language === 'en' ? 'Grievance Redressal & Support Portal' : 'शिकायत निवारण एवं सहायता पोर्टल',
    certificatesHeader: language === 'en' ? 'Certificate Issuance Center' : 'प्रमाण पत्र निर्गमन केंद्र',
    faqHeader: language === 'en' ? 'Frequently Asked Questions (FAQs)' : 'बार-बार पूछे जाने वाले प्रश्न'
  };

  // Filter Notices
  const filteredNotices = notices.filter((n) => {
    const matchesSearch =
      n.titleEn.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.titleHi.includes(noticeSearch) ||
      n.contentEn.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.contentHi.includes(noticeSearch);
    const matchesFilter = noticeFilter === 'All' || n.category === noticeFilter;
    return matchesSearch && matchesFilter;
  });

  // Complaint Submit handler
  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    const ticket = addGrievance({
      categoryEn: complaintCategory,
      categoryHi: complaintCategory === 'Academic Facilities' ? 'शैक्षणिक सुविधाएं' : complaintCategory === 'Scholarship Correction' ? 'डीबीटी डेटा मिलान' : complaintCategory === 'General Safety' ? 'स्वच्छता एवं सुरक्षा' : 'अन्य मुद्दे',
      content: complaintText,
      isAnonymous,
      complainantName: isAnonymous ? undefined : complainantName,
      complainantPhone: isAnonymous ? undefined : complainantPhone
    });

    setSubmittedTicket(ticket);
    setComplaintText('');
    setComplainantName('');
    setComplainantPhone('');
  };

  // Track Grievance handler
  const handleTrackGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingTicket.trim()) return;
    setTrackedComplaint(null);
    let found = grievances.find(g => g.ticketNo.trim().toUpperCase() === trackingTicket.trim().toUpperCase());
    if (!found) {
      const docData = await queryGrievanceByTicket(trackingTicket.trim());
      if (docData) {
        found = docData;
      }
    }
    setTrackedComplaint(found || 'NOT_FOUND');
  };

  // Certificate Request handler
  const handleCertificateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certStudentName.trim() || !certRollNo.trim() || !agreedToTerms) return;

    const ref = applyCertificate({
      studentNameEn: certStudentName,
      studentNameHi: language === 'en' ? certStudentName : 'गोंडीह लिपि अनुवादित',
      rollNo: certRollNo,
      className: certClass,
      academicYear: certYear,
      type: certType,
      reasonEn: certReason,
      reasonHi: certReason,
      documentsAttached: ['Class Matric Marksheet scanned copy', 'Character verification affidavit']
    });

    setAppliedRefNo(ref);
    setCertStudentName('');
    setCertRollNo('');
    setCertReason('');
    setAgreedToTerms(false);
  };

  // Track Certificate handler
  const handleTrackCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingRef.trim()) return;
    setTrackedCert(null);
    let found = certificates.find(c => c.referenceNo.trim().toUpperCase() === trackingRef.trim().toUpperCase());
    if (!found) {
      const docData = await queryCertificateByReference(trackingRef.trim());
      if (docData) {
        found = docData;
      }
    }
    setTrackedCert(found || 'NOT_FOUND');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-[#1C1C1E]">
      
      {/* 1. PUBLIC HOME VIEW */}
      {activeView === 'home' && (
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="relative bg-[#1A3A5C] text-white rounded-lg p-6 md:p-12 overflow-hidden border-b-4 border-[#D4522A]" id="hero-sec">
            <div className="absolute inset-x-0 bottom-0 top-0 opacity-10 bg-[radial-gradient(#D4522A_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="max-w-3xl space-y-4 relative z-10">
              <span className="bg-[#D4522A] text-white font-mono uppercase text-[10px] tracking-widest px-2.5 py-1 rounded-sm font-semibold">
                {language === 'en' ? 'Government of Bihar Education Initiative' : 'बिहार सरकार शिक्षा पहल'}
              </span>
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-black italic tracking-normal leading-tight text-[#F7F3EE]">
                {language === 'en' ? 'Empowering Daughters through Quality Digital Education' : 'गुणवत्तापूर्ण डिजिटल शिक्षा से बेटियों का सशक्तिकरण'}
              </h2>
              <p className="text-zinc-200 text-xs md:text-sm italic leading-relaxed">
                {listT.motto}
              </p>
              <p className="text-xs text-zinc-300 font-mono">
                {listT.established}
              </p>
              <div className="pt-2 flex flex-wrap gap-2.5 no-print">
                <button 
                  onClick={() => setActiveView('yojana')}
                  className="px-4 py-2 bg-[#D4522A] hover:bg-[#D4522A]/90 font-bold text-xs rounded transition shadow-md"
                >
                  {language === 'en' ? 'Check Scholarships' : 'कल्याणकारी योजनाएं जांचें'}
                </button>
                <button 
                  onClick={() => setActiveView('notices')}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/20 font-bold text-xs rounded transition"
                >
                  {language === 'en' ? 'View Notices' : 'सूचना पट्ट देखें'}
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                label: listT.statsGirls, 
                val: students && students.filter(s => s.status !== 'Disabled' && s.status !== 'Transferred').length > 0 
                  ? `${students.filter(s => s.status !== 'Disabled' && s.status !== 'Transferred').length} Registered` 
                  : (language === 'en' ? '0 Girls Enrolled' : '0 छात्राएं नामांकित'), 
                col: 'border-l-4 border-[#1A3A5C]',
                isPending: false
              },
              { 
                label: listT.statsTeachers, 
                val: teachers && teachers.filter(t => t.status !== 'Disabled').length > 0 
                  ? `${teachers.filter(t => t.status !== 'Disabled').length} Faculty` 
                  : (language === 'en' ? '0 Verified' : '0 सत्यापित'), 
                col: 'border-l-4 border-[#D4522A]',
                isPending: false
              },
              { 
                label: listT.statsRate, 
                val: examResults && examResults.length > 0
                  ? `${Math.round((examResults.filter(r => r.resultStatus === 'PASS' || r.resultStatus === 'PROMOTED').length / examResults.length) * 100)}% Pass`
                  : (language === 'en' ? 'No Exams Record' : 'कोई परीक्षा रिकॉर्ड नहीं'), 
                col: 'border-l-4 border-[#2E7D32]',
                isPending: false
              },
              { 
                label: listT.statsDBT, 
                val: (() => {
                  const activeStuds = students ? students.filter(s => s.status !== 'Disabled') : [];
                  if (activeStuds.length === 0) return language === 'en' ? 'No Accounts' : 'कोई खाता नहीं';
                  const verifiedCount = activeStuds.filter(s => s.medhasoftStatus === 'Verified').length;
                  const pct = Math.round((verifiedCount / activeStuds.length) * 100);
                  return `${pct}% Sync`;
                })(), 
                col: 'border-l-4 border-amber-600',
                isPending: false
              }
            ].map((stat, i) => (
              <div key={i} className={`bg-white p-4 rounded shadow-xs ${stat.col} flex flex-col justify-center`}>
                <span className={`font-black font-mono text-[#1C1C1E] ${stat.isPending ? 'text-xs text-gray-400 italic' : 'text-2xl'}`}>
                  {stat.val}
                </span>
                <span className="text-[11px] text-gray-500 font-medium mt-1 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* School Intro & Principal massage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded shadow-xs md:col-span-2 space-y-4">
              <h3 className="text-base md:text-lg font-serif font-bold text-[#1A3A5C] border-b pb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D4522A]" />
                {listT.introTitle}
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed">
                {listT.introText}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-neutral-50 rounded border border-gray-100 text-xs">
                  <h4 className="font-bold text-[#D4522A]">{language === 'en' ? 'Our Mission' : 'हमारा लक्ष्य'}</h4>
                  <p className="text-gray-600 mt-1" style={{ fontSize: '11px' }}>
                    {language === 'en' 
                      ? `Ensure zero school-drops among secondary-level girls of our regions.` 
                      : `हमारे क्षेत्र की छात्राओं के बीच माध्यमिक स्तर पर विद्यालय छोड़ने की प्रतिशतता को शून्य करना।`}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded border border-gray-100 text-xs">
                  <h4 className="font-bold text-[#1A3A5C]">{language === 'en' ? 'Infrastructure' : 'अवसंरचना'}</h4>
                  <p className="text-gray-600 mt-1" style={{ fontSize: '11px' }}>
                    {language === 'en' ? 'Equipped with digital smart classes, science high-labs, and modern library.' : 'डिजिटल स्मार्ट क्लासेज, आधुनिक कंप्यूटर लैब्स और पुस्तकालय से सुसज्जित।'}
                  </p>
                </div>
              </div>
            </div>

            {/* Principal card */}
            <div className="bg-white p-5 rounded shadow-xs border border-gray-200 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-sm font-serif font-bold tracking-wider text-[#D4522A] uppercase">
                  {listT.principalTitle}
                </h3>
                <div className="flex items-center gap-3">
                  {/* Dynamic Initial Avatar */}
                  <div className="w-12 h-12 bg-gray-200 border border-[#1A3A5C] rounded-full flex items-center justify-center font-bold text-[#1A3A5C] shrink-0 text-xs text-center overflow-hidden">
                    {schoolSettings.logo && schoolSettings.logo.startsWith('data:') || schoolSettings.logo && schoolSettings.logo.startsWith('http') ? (
                      <img src={schoolSettings.logo} alt="Principal" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      schoolSettings.principalNameEn.split('.').pop()?.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'P'
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1C1E]">
                      {language === 'en' ? schoolSettings.principalNameEn : schoolSettings.principalNameHi}
                    </h4>
                    <p className="text-[10px] text-gray-500 font-mono">
                      {language === 'en' ? schoolSettings.principalDesignationEn : schoolSettings.principalDesignationHi}
                    </p>
                    {schoolSettings.principalQualificationsEn && (
                      <p className="text-[10px] text-amber-800 font-serif italic font-semibold">
                        🎓 {language === 'en' ? schoolSettings.principalQualificationsEn : (schoolSettings.principalQualificationsHi || schoolSettings.principalQualificationsEn)}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed italic">
                  "{listT.principalText}"
                </p>
              </div>
              <div className="border-t pt-2 mt-4 flex justify-between items-center text-[10px] text-[#1A3A5C] font-mono">
                <span>Sign: {language === 'en' ? schoolSettings.principalNameEn : schoolSettings.principalNameHi}</span>
                <span>Date: June 2026</span>
              </div>
            </div>
          </div>

          {/* Pinned & Latest Notices Widget */}
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#D4522A]" />
                {language === 'en' ? 'Latest Announcements' : 'ताजा घोषणाएं'}
              </h3>
              <button 
                onClick={() => setActiveView('notices')} 
                className="text-xs font-bold text-[#D4522A] hover:underline flex items-center gap-1 font-mono"
              >
                <span>{language === 'en' ? 'Notice Board' : 'पूरा नोटिस पट्ट'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {notices.slice(0, 3).map((notice) => (
                <div key={notice.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[9px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                      {notice.category}
                    </span>
                    {notice.isUrgent && (
                      <span className="text-[9px] bg-orange-600 text-white font-bold px-1.5 py-0.5 rounded animate-pulse">
                        {language === 'en' ? 'URGENT' : 'अति आवश्यक'}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 font-mono ml-auto">
                      {notice.publishedDate}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold hover:text-[#D4522A] cursor-pointer">
                    {language === 'en' ? notice.titleEn : notice.titleHi}
                  </h4>
                  <p className="text-[11px] text-gray-600 line-clamp-2">
                    {language === 'en' ? notice.contentEn : notice.contentHi}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* External Links Hub */}
          <div className="p-4 bg-orange-600/5 rounded border border-[#D4522A]/10 space-y-3">
            <h4 className="text-xs font-mono font-black text-[#D4522A] tracking-wider uppercase text-center md:text-left">
              {language === 'en' ? 'Important Bihar Government Educational Gateways' : 'बिहार सरकार के महत्वपूर्ण शैक्षिक गेटवे'}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              {[
                { name: 'Medhasof (बिहार डीबीटी)', url: 'http://medhasoft.bih.nic.in' },
                { name: 'e-Shikshakosh (ई-शिक्षकोश)', url: 'https://eshikshakosh.bihar.gov.in' },
                { name: 'e-LOTS (ई-लॉट्स शैक्षणिक)', url: 'http://bepce-lots.bihar.gov.in' },
                { name: 'National Scholarship Portal', url: 'https://scholarships.gov.in' }
              ].map((link, i) => (
                <a 
                  key={i} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white border text-gray-700 hover:text-[#1A3A5C] hover:border-[#1A3A5C] transition p-2.5 rounded shadow-2xs flex items-center justify-between font-medium"
                >
                  <span>{link.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4522A]" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ABOUT SCHOOL VIEW */}
      {activeView === 'about' && (
        <div className="bg-white p-6 rounded shadow-xs space-y-6">
          <h2 className="text-lg md:text-xl font-serif font-bold text-[#1A3A5C] border-b pb-2 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#D4522A]" />
            {language === 'en' ? 'Institutional Profile & Facilities' : 'विद्यालय विवरण एवं सुविधाएं'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#D4522A] font-mono uppercase">{language === 'en' ? 'History & Background' : 'इतिहास और पृष्ठभूमि'}</h3>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {language === 'en'
                    ? 'Established in 1947 in Begusarai district, Bihar, Rajyakrit Omar Girl\'s +2 School was founded with a generous donation of land to facilitate a secure, premium secondary school specifically for girls in Bishnupur, Begusarai, Bihar. Today, the school runs with highly capable faculty managing classes from IX to XII.'
                    : 'बेगूसराय जिला, बिहार में 1947 में स्थापित, राजकीयकृत उमर गर्ल्स +2 स्कूल की स्थापना विष्णुपुर, बेगूसराय, बिहार में विशेष रूप से लड़कियों के लिए एक सुरक्षित, प्रीमियम शिक्षण सुविधा प्रदान करने के उद्देश्य से की गई थी। वर्तमान में यहाँ ९वीं से १२वीं तक की बालिकाओं को कक्षाएं प्रदान की जा रही हैं।'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-50 rounded border border-gray-100 text-xs">
                  <h4 className="font-bold text-[#1A3A5C]">{language === 'en' ? 'Vision' : 'परिकल्पना'}</h4>
                  <p className="text-gray-600 mt-1">
                    {language === 'en'
                      ? 'Creating a high-caliber center of learning where every Bihari girl enjoys the right to scientific expression and economic self-sufficiency.'
                      : 'एक उच्च स्तरीय शिक्षण केंद्र का निर्माण जहाँ प्रत्येक बिहारी बालिका को वैज्ञानिक अभिव्यक्ति और आर्थिक आत्मनिर्भरता का अधिकार प्राप्त हो।'}
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 rounded border border-gray-100 text-xs">
                  <h4 className="font-bold text-[#1A3A5C]">{language === 'en' ? 'Values' : 'मूल्य'}</h4>
                  <p className="text-gray-600 mt-1">
                    {language === 'en'
                      ? 'Discipline, absolute gender empowerment, deep cultural heritage respect, and transparent governance.'
                      : 'अनुशासन, पूर्ण महिला सशक्तिकरण, गहरा सांस्कृतिक सम्मान और पारदर्शी शासन व्यवस्था।'}
                  </p>
                </div>
              </div>
            </div>

            {/* Infrastructure facilities list */}
            <div className="p-4 bg-neutral-50 rounded border border-gray-200 text-xs space-y-3">
              <h3 className="font-bold text-[#1A3A5C] uppercase">{language === 'en' ? 'Key Campus Facilities' : 'परिसर के प्रमुख घटक'}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#D4522A] rounded-full"></span>
                  <span>{language === 'en' ? 'Science Lab: Chemistry/Physics equipment' : 'विज्ञान प्रयोगशाला: रसायन/भौतिकी उपकरण'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#D4522A] rounded-full"></span>
                  <span>{language === 'en' ? 'ICT Computer Chamber: Working Terminals (Inventory pending verification)' : 'आईसीटी कंप्यूटर कक्ष: सक्रिय कंप्यूटर (इन्वेंट्री सत्यापन लंबित)'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#D4522A] rounded-full"></span>
                  <span>{language === 'en' ? 'Robust Library: High-school Text reference books (Inventory pending verification)' : 'पुस्तकालय: संदर्भ पुस्तकें (इन्वेंट्री सत्यापन लंबित)'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#D4522A] rounded-full"></span>
                  <span>{language === 'en' ? 'Sanitary Health Room & Vending Machines' : 'स्वच्छता स्वास्थ्य कक्ष और नैपकिन वेंडिंग मशीन'}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#D4522A] rounded-full"></span>
                  <span>{language === 'en' ? 'Arsenic-free RO drinking water source' : 'आर्सेनिक-मुक्त आरओ पेयजल सुविधा'}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. NOTICES ARCHIVE VIEW */}
      {activeView === 'notices' && (
        <div className="bg-white p-6 rounded shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-3 gap-3">
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1A3A5C] flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#D4522A]" />
              {listT.noticeHeader}
            </h2>
            
            {/* Notice Category filters */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['All', 'Academic', 'Examination', 'Scholarship', 'Admission', 'Holiday', 'Urgent'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNoticeFilter(cat as any)}
                  className={`px-3 py-1.5 rounded transition ${noticeFilter === cat ? 'bg-[#1A3A5C] text-white font-bold' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar inside Notices */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={noticeSearch}
              onChange={(e) => setNoticeSearch(e.target.value)}
              placeholder={listT.searchNoticePlaceholder}
              className="w-full text-xs pl-9 p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#1A3A5C] outline-hidden placeholder-gray-400"
            />
          </div>

          {/* Notices listing */}
          <div className="space-y-4">
            {filteredNotices.length > 0 ? (
              filteredNotices.map((notice) => (
                <div key={notice.id} className="p-4 bg-neutral-50 rounded border border-gray-200 hover:border-gray-300 transition space-y-2 relative">
                  {notice.isPinned && (
                    <span className="absolute top-4 right-4 bg-amber-500 text-white font-mono text-[8px] font-bold px-2 py-0.5 rounded tracking-wide uppercase">
                      Pinned
                    </span>
                  )}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[10px] bg-[#1A3A5C] text-white font-bold px-2.5 py-0.5 rounded uppercase font-mono">
                      {notice.category}
                    </span>
                    {notice.isUrgent && (
                      <span className="text-[10px] bg-[#D4522A] text-white font-bold px-2 py-0.5 rounded animate-pulse font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>URGENT</span>
                      </span>
                    )}
                    <span className="text-[11px] text-gray-400 font-mono ml-auto">
                      {notice.publishedDate}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-[#1C1C1E]">
                    {language === 'en' ? notice.titleEn : notice.titleHi}
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {language === 'en' ? notice.contentEn : notice.contentHi}
                  </p>
                  
                  {notice.expiryDate && (
                    <div className="text-[10px] text-red-600 font-mono flex items-center gap-1.5 pt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? `Action Deadline: ${notice.expiryDate}` : `कार्य अंतिम तिथि: ${notice.expiryDate}`}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200/60 pt-2 flex items-center justify-between text-[10px] text-gray-500">
                    <span>{language === 'en' ? `Circular issued by: ${notice.author}` : `परिपत्र प्रेषित: ${notice.author}`}</span>
                    {notice.pdfUrl ? (
                      <a 
                        href={notice.pdfUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-[#D4522A] hover:underline flex items-center gap-1 font-mono font-bold"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Download Circular (PDF)' : 'परिपत्र डाउनलोड करें'}</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-gray-400 py-6">{language === 'en' ? 'No notices matching criteria.' : 'कोई सूचना वर्तमान में उपलब्ध नहीं है।'}</p>
            )}
          </div>
        </div>
      )}

      {/* 4. YOJANA & SCHOLARSHIPS VIEW */}
      {activeView === 'yojana' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded shadow-xs space-y-4">
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1A3A5C] border-b pb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4522A]" />
              {listT.yojanaHeader}
            </h2>
            <p className="text-xs text-gray-600">
              {language === 'en'
                ? 'Omar Girls High School works in direct alignment with dynamic Bihar State Welfare Schemes and Central DBT directives. Ensure your daughter has registered under the Medhasoft portal for auto disbursals.'
                : 'उमर गर्ल्स हाई स्कूल प्रत्यक्ष रूप से बिहार राज्य कल्याणकारी योजनाओं तथा केंद्रीय डीबीटी निर्देशों के तहत काम करता है। सुनिश्चित करें कि छात्रा का नाम मेधासॉफ्ट पोर्टल पर पंजीकृत है।'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemes.map((scheme) => (
              <div key={scheme.id} className="bg-white p-5 rounded shadow-xs border border-gray-100 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                      {scheme.category}
                    </span>
                    <span className="text-[10px] text-red-600 font-mono font-bold">
                      {language === 'en' ? `Apply by: ${scheme.deadline}` : `आवेदन तिथि: ${scheme.deadline}`}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1C1C1E]">
                    {language === 'en' ? scheme.titleEn : scheme.titleHi}
                  </h3>
                  <p className="text-xs text-gray-700">
                    {language === 'en' ? scheme.descriptionEn : scheme.descriptionHi}
                  </p>

                  <div className="space-y-1 bg-neutral-50 p-2.5 rounded text-[11px] border">
                    <p className="text-gray-900 font-bold">
                      {language === 'en' ? 'Eligibility Standard:' : 'योग्यता मापदंड:'}
                    </p>
                    <p className="text-gray-600">
                      {language === 'en' ? scheme.eligibilityEn : scheme.eligibilityHi}
                    </p>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <p className="text-gray-950 font-bold">
                      {language === 'en' ? 'Scheme Benefits:' : 'योजना के तहत लाभ:'}
                    </p>
                    <p className="text-[#2E7D32] font-semibold">
                      {language === 'en' ? scheme.benefitsEn : scheme.benefitsHi}
                    </p>
                  </div>

                  {/* Required Documents checklist */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] text-gray-900 font-bold">
                      {language === 'en' ? 'Required Documents examples:' : 'आवश्यक दस्तावेज सूची:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {(language === 'en' ? scheme.documentsEn : scheme.documentsHi).map((doc, idx) => (
                        <span key={idx} className="bg-amber-600/10 text-amber-900 text-[10px] font-medium px-2 py-0.5 rounded border border-amber-600/20">
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-2 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                  <span>{language === 'en' ? `Nodal: ${scheme.contactPerson}` : `नोडल अधिकारी: ${scheme.contactPerson}`}</span>
                  <span className="text-[#1A3A5C] font-bold">{scheme.contactDesignation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ADMISSIONS INFORMATION VIEW */}
      {activeView === 'admissions' && (
        <div className="bg-white p-6 rounded shadow-xs space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1A3A5C] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#D4522A]" />
              {listT.admissionsHeader}
            </h2>
          </div>

          {/* Seat details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {[
              { grade: 'Class IX (Secondary)', seats: language === 'en' ? '240 Seats Registered' : '240 सीटें उपलब्ध (BSEB)', status: 'BSEB Board Affiliated' },
              { grade: 'Class XI Science', seats: language === 'en' ? '120 Intake Capacity' : '120 सीटें आवंटित (OFSS)', status: 'OFSS Bihar Portal Option' },
              { grade: 'Class XI Arts', seats: language === 'en' ? '120 Intake Capacity' : '120 सीटें आवंटित (OFSS)', status: 'OFSS Bihar Portal Option' }
            ].map((cls, idx) => (
              <div key={idx} className="p-4 bg-neutral-50 rounded border border-gray-200">
                <h4 className="text-xs font-bold text-[#1C1C1E]">{cls.grade}</h4>
                <p className="text-xs text-gray-400 italic my-2 font-mono">{cls.seats}</p>
                <span className="text-[10px] bg-[#1A3A5C]/10 text-[#1A3A5C] px-2 py-0.5 rounded font-mono font-bold">{cls.status}</span>
              </div>
            ))}
          </div>

          {/* Admission process & timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 font-medium">
              <h3 className="text-sm font-bold text-[#1A3A5C] font-mono uppercase">{language === 'en' ? 'Admission Process Steps' : 'नामांकन प्रक्रिया चरण'}</h3>
              <ul className="text-xs text-gray-700 space-y-2.5">
                <li className="flex items-start gap-2">
                  <span className="bg-[#1A3A5C] text-white w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[11px] shrink-0 mt-0.5">1</span>
                  <span>{language === 'en' ? 'Class 9th admissions are directly taken at the high school office matching criteria.' : 'कक्षा नौवीं के नामांकन सीधे विद्यालय कार्यालय में संपर्क द्वारा पात्रता मापदंडों के आधार पर किया जाता है।'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#1A3A5C] text-white w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[11px] shrink-0 mt-0.5">2</span>
                  <span>{language === 'en' ? 'Class 11th Science/Arts enrollment is governed by online OFSS Bihar system.' : 'कक्षा ग्यारहवीं विज्ञान/कला में प्रवेश ऑनलाइन ओएफएसएस (OFSS) बिहार पोर्टल द्वारा नियंत्रित होता है।'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-[#1A3A5C] text-white w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono text-[11px] shrink-0 mt-0.5">3</span>
                  <span>{language === 'en' ? 'Provide Caste cert, SLC transfer files, and Aadhaar bank joint verification books.' : 'जाति प्रमाण पत्र, स्कूल परित्याग प्रमाण पत्र, और आधार सम्बद्ध बैंक पासबुक प्रस्तुत करें।'}</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-orange-600/5 rounded border border-[#D4522A]/10 space-y-3 text-xs">
              <h4 className="font-bold text-[#D4522A] uppercase flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{language === 'en' ? 'Admissions Fee structure:' : 'नामांकन शुल्क संरचना:'}
              </span></h4>
              <div className="space-y-2 text-gray-700" style={{ fontSize: '11px' }}>
                <div className="flex justify-between border-b pb-1">
                  <span>{language === 'en' ? 'Registration Processing' : 'पंजीकरण प्रसंस्करण शुल्क'}</span>
                  <span className="font-bold font-mono">₹100</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>{language === 'en' ? 'Tuition and Activities (Annual)' : 'शिक्षण और संबंधित शुल्क (वार्षिक)'}</span>
                  <span className="font-bold font-mono">₹250</span>
                </div>
                <div className="flex justify-between font-bold text-gray-950">
                  <span>{language === 'en' ? 'Total Admission Charges' : 'कुल नामांकन शुल्क'}</span>
                  <span>₹350</span>
                </div>
                <p className="text-[10px] text-gray-500 italic mt-2">
                  {language === 'en' ? '* NOTE: All scheduled caste and below poverty line girl students are 100% exempted from tuition fees as per Bihar state regulations.' : '* ध्यान दें: बिहार राज्य सरकार के नियमानुसार अनुसूचित जाति और गरीबी रेखा से नीचे की छात्राओं के लिए शिक्षण शुल्क पूर्णतः निःशुल्क है।'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DIGITAL LIBRARY VIEW */}
      {activeView === 'library' && (
        <div className="bg-white p-6 rounded shadow-xs space-y-6">
          <div className="border-b pb-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1A3A5C] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D4522A]" />
              {listT.libraryHeader}
            </h2>
            <a 
              href="http://bepce-lots.bihar.gov.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs bg-[#D4522A] text-white hover:bg-[#D4522A]/90 font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-sm font-mono"
            >
              <span>{language === 'en' ? 'Launch Bihar e-LOTS Portal' : 'बिहार ई-लॉट्स पोर्टल खोलें'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Library Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={libraryQuery}
              onChange={(e) => setLibraryQuery(e.target.value)}
              placeholder={language === 'en' ? 'Search books by title, author name, or book ID...' : 'शीर्षक, लेखक, या पुस्तक क्रमांक द्वारा खोजें...'}
              className="w-full text-xs pl-9 p-3 border border-gray-300 rounded focus:ring-1 focus:ring-[#1A3A5C] outline-hidden placeholder-gray-400 bg-white"
            />
          </div>

          {/* Book results list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-700 tracking-wide uppercase">{language === 'en' ? 'Physical Library Catalog Books' : 'भौतिक पुस्तकालय पुस्तक सूची'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {searchedBooks.map((book) => (
                <div key={book.id} className="p-3.5 bg-neutral-50 rounded border border-gray-200 flex flex-col justify-between text-xs space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-gray-400">{book.accessionNo}</span>
                      <span className={`font-bold uppercase ${book.isAvailable ? 'text-[#2E7D32]' : 'text-red-600'}`}>
                        {book.isAvailable ? (language === 'en' ? 'Available' : 'उपलब्ध') : (language === 'en' ? 'Issued' : 'निर्गत')}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#1C1C1E]">
                      {language === 'en' ? book.titleEn : book.titleHi}
                    </h4>
                    <p className="text-gray-500" style={{ fontSize: '11px' }}>
                      {language === 'en' ? `Author: ${book.authorEn}` : `लेखक: ${book.authorHi}`}
                    </p>
                  </div>
                  <div className="border-t pt-1.5 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                    <span>{language === 'en' ? book.categoryEn : book.categoryHi}</span>
                    <span className="font-bold text-[#1A3A5C]">{book.shelfLocation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. GRIEVANCE PORTAL VIEW */}
      {activeView === 'grievances' && (
        <div className="bg-white p-6 rounded shadow-xs space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1A3A5C] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#D4522A]" />
              {listT.grievanceHeader}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Submission Form */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-700 tracking-wider uppercase">{language === 'en' ? 'Submit Grievance or Advice anonymous/direct' : 'शिकायत अथवा सुझाव दर्ज करें (गुमनाम / प्रत्यक्ष)'}</h3>
              
              {submittedTicket && (
                <div className="p-4 bg-[#2E7D32]/10 border border-[#2E7D32]/20 text-[#2E7D32] rounded text-xs space-y-2">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{language === 'en' ? 'Grievance Registered Successfully!' : 'शिकायत सफलतापूर्वक दर्ज की गई!'}</span>
                  </p>
                  <p>
                    {language === 'en' ? 'Your track status code is:' : 'आपका ट्रैकिंग स्थिति कोड है:'}
                    <strong className="block text-sm my-1 font-mono">{submittedTicket}</strong>
                    {language === 'en' ? 'Save this parameter to look up resolution updates.' : 'निपटारे की स्थिति की जांच के लिए इस कोड को सुरक्षित रखें।'}
                  </p>
                  <button 
                    onClick={() => {
                      setSubmittedTicket(null);
                      setTrackingTicket(submittedTicket);
                    }} 
                    className="w-full py-1.5 bg-[#2E7D32] text-white font-mono text-[10px] font-bold rounded"
                  >
                    {language === 'en' ? 'Click to track status instantly' : 'तुरंत स्थिति ट्रैक करें'}
                  </button>
                </div>
              )}

              <form onSubmit={handleGrievanceSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Select Grievance Category' : 'शिकायत की श्रेणी चुनें'}</label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#1A3A5C] outline-hidden bg-white"
                  >
                    <option value="Academic Facilities">{language === 'en' ? 'Academic & Smart Classroom Facilities' : 'शैक्षणिक एवं स्मार्ट क्लास सुविधाएं'}</option>
                    <option value="Scholarship Correction">{language === 'en' ? 'Scholarship / Uniform / Bicycle DBG Data' : 'डीबीटी डेटा मिलान'}</option>
                    <option value="General Safety">{language === 'en' ? 'Girls safety & clean toilet infrastructure' : 'स्वच्छता एवं सुरक्षा'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    id="isAnon"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded focus:ring-opacity-40"
                  />
                  <label htmlFor="isAnon" className="font-bold text-gray-700 select-none">
                    {language === 'en' ? 'File as Anonymous (Hide my name)' : 'गुमनाम रूप से दर्ज करें (मेरी पहचान छुपाएं)'}
                  </label>
                </div>

                {!isAnonymous && (
                  <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Your Name' : 'आपका नाम'}</label>
                      <input
                        type="text"
                        value={complainantName}
                        onChange={(e) => setComplainantName(e.target.value)}
                        className="w-full text-xs p-2.5 border border-gray-300 rounded outline-hidden bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Your Mobile' : 'मोबाइल नंबर'}</label>
                      <input
                        type="text"
                        value={complainantPhone}
                        placeholder="94318XXXXX"
                        onChange={(e) => setComplainantPhone(e.target.value)}
                        className="w-full text-xs p-2.5 border border-gray-300 rounded outline-hidden bg-white"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Describe complaint / suggestion' : 'दिक्कत या सुझाव का विवरण लिखें'}</label>
                  <textarea
                    rows={4}
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    placeholder={language === 'en' ? 'Pleases state query in clear English or Hindi sentences...' : 'स्पष्ट शब्दों में अपनी समस्या प्रदान करें...'}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded outline-hidden bg-white resize-none"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1A3A5C] hover:bg-[#1A3A5C]/95 text-white font-bold font-mono uppercase tracking-wide rounded"
                >
                  {language === 'en' ? 'Register Grievance' : 'शिकायत दर्ज करें'}
                </button>
              </form>
            </div>

            {/* Tracking / Status Section */}
            <div className="space-y-4 md:border-l md:pl-6">
              <h3 className="text-xs font-bold text-gray-700 tracking-wider uppercase">{language === 'en' ? 'Track Grievance / Ticket Status' : 'शिकायत स्थिति खोजें / टिकट ट्रैक करें'}</h3>
              
              <form onSubmit={handleTrackGrievance} className="flex gap-2 text-xs">
                <input
                  type="text"
                  value={trackingTicket}
                  onChange={(e) => setTrackingTicket(e.target.value)}
                  placeholder="G-2026-89"
                  className="p-2.5 border border-gray-300 rounded outline-hidden grow font-mono bg-white uppercase"
                  required
                />
                <button type="submit" className="px-4 bg-[#D4522A] text-white font-bold rounded">
                  {language === 'en' ? 'Track' : 'ट्रैक करें'}
                </button>
              </form>

              {trackedComplaint && (
                <div className="p-4 bg-neutral-50 rounded border border-gray-200 text-xs space-y-3.5">
                  {trackedComplaint === 'NOT_FOUND' ? (
                    <p className="text-red-600 font-bold">{language === 'en' ? 'No ticket found matching details. Check code again.' : 'इस कोड के साथ कोई शिकायत दर्ज नहीं है।'}</p>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-500 font-mono">{trackedComplaint.ticketNo}</span>
                        <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[10px] ${
                          trackedComplaint.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {trackedComplaint.status}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-400 font-mono text-[9px]">{language === 'en' ? 'Category:' : 'श्रेणी:'} {trackedComplaint.categoryEn}</p>
                        <p className="text-gray-700 font-medium italic mt-1 font-mono underline" style={{ fontSize: '11px' }}>
                          "{trackedComplaint.content}"
                        </p>
                      </div>

                      {trackedComplaint.resolutionNoteEn && (
                        <div className="bg-white p-3 border-l-4 border-emerald-600 rounded shadow-2xs space-y-1">
                          <p className="font-bold text-[#2E7D32]" style={{ fontSize: '11px' }}>
                            {language === 'en' ? 'Resolution Remarks from Principal:' : 'प्राचार्या की प्रतिक्रिया:'}
                          </p>
                          <p className="text-gray-600">
                            {language === 'en' ? trackedComplaint.resolutionNoteEn : trackedComplaint.resolutionNoteHi}
                          </p>
                          <span className="text-[10px] text-gray-400 block font-mono text-right">{trackedComplaint.resolutionDate}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. CERTIFICATE ISSUANCE CENTER VIEW */}
      {activeView === 'certificates' && (
        <div className="bg-white p-6 rounded shadow-xs space-y-6">
          <div className="border-b pb-2">
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1A3A5C] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4522A]" />
              {listT.certificatesHeader}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Request Certificate Form */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-gray-700 tracking-wider uppercase">{language === 'en' ? 'Apply for School Documents Certificate' : 'प्रमाण पत्र के लिए आवेदन करें'}</h3>
              
              {appliedRefNo && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs space-y-2">
                  <p className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'en' ? 'Application Filed Successfully!' : 'प्रमाण पत्र आवेदन जमा किया गया!'}</span>
                  </p>
                  <p>
                    {language === 'en' ? 'Your certificate Reference ticket is:' : 'आपका आवेदन संदर्भ टिकट है:'}
                    <strong className="block text-sm my-1 font-mono text-[#D4522A]">{appliedRefNo}</strong>
                    {language === 'en' ? 'Usual processing time is 4 to 7 working days. Normal collection must be from Principal Desk.' : 'सामान्य प्रसंस्करण में ४ से ७ कार्यदिवस का समय लगता है। अनुमोदन उपरांत प्रधानाध्यापिका के कार्यालय से प्राप्त करें।'}
                  </p>
                </div>
              )}

              <form onSubmit={handleCertificateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Pupil Full Name (as in BSEB board ledger)' : 'छात्रा का पूरा नाम (बोर्ड अभिलेखानुसार)'}</label>
                  <input
                    type="text"
                    value={certStudentName}
                    onChange={(e) => setCertStudentName(e.target.value)}
                    placeholder="Priya Kumari"
                    className="w-full text-xs p-2.5 border border-gray-300 rounded outline-hidden bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Admission / Roll No' : 'रोल नंबर दर्ज करें'}</label>
                    <input
                      type="text"
                      value={certRollNo}
                      onChange={(e) => setCertRollNo(e.target.value)}
                      placeholder="101"
                      className="w-full text-xs p-2.5 border border-gray-300 rounded outline-hidden bg-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Certificate Type' : 'चयन प्रक्रिया'}</label>
                    <select
                      value={certType}
                      onChange={(e: any) => setCertType(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-[#1A3A5C] outline-hidden bg-white"
                    >
                      <option value="Character Certificate">{language === 'en' ? 'Character Certificate (चरित्र प्र०)' : 'चरित्र प्रमाण पत्र'}</option>
                      <option value="Bonafide Certificate">{language === 'en' ? 'Bonafide Certificate (अध्ययनरत प्र०)' : 'अध्ययनरत प्रमाण पत्र'}</option>
                      <option value="Transfer Certificate">{language === 'en' ? 'Transfer Certificate (स्कूल परित्याग प्र०)' : 'विद्यालय परित्याग प्रमाण पत्र'}</option>
                      <option value="School Leaving Certificate (SLC)">{language === 'en' ? 'School Leaving Certificate (SLC) (विद्यालय परित्याग प्र०)' : 'स्कूल लिविंग सर्टिफिकेट (SLC)'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Current Class' : 'कक्षा चयन'}</label>
                    <select
                      value={certClass}
                      onChange={(e) => setCertClass(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded bg-white"
                    >
                      <option value="Class IX">Class IX</option>
                      <option value="Class X">Class X</option>
                      <option value="Class XI">Class XI</option>
                      <option value="Class XII">Class XII</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Academic Session Year' : 'सत्र शैक्षणिक वर्ष'}</label>
                    <input
                      type="text"
                      value={certYear}
                      onChange={(e) => setCertYear(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-300 rounded bg-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Reason for Certificate Request' : 'प्रमाण पत्र आवेदन का कारण'}</label>
                  <textarea
                    rows={3}
                    value={certReason}
                    onChange={(e) => setCertReason(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded outline-hidden bg-white resize-none"
                    placeholder="Required for admission in college..."
                    required
                  ></textarea>
                </div>

                <div className="flex items-center gap-2 py-1 select-none">
                  <input
                    type="checkbox"
                    id="termsInput"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="termsInput" className="font-bold text-gray-700" style={{ fontSize: '11px' }}>
                    {language === 'en' ? 'I verify my fees and BSEB data match standard logs.' : 'मैं पुष्टि करती हूँ कि मेरी फीस और समस्त बोर्ड दस्तावेज विद्यालय अभिलेख से मेल खाते हैं।'}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!agreedToTerms}
                  className="w-full py-2.5 bg-[#1A3A5C] hover:bg-[#1A3A5C]/95 text-white font-bold font-mono tracking-wide uppercase rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'en' ? 'Apply online' : 'ऑनलाइन आवेदन सबमिट करें'}
                </button>
              </form>
            </div>

            {/* Tracking Certificate status */}
            <div className="space-y-4 md:border-l md:pl-6">
              <h3 className="text-xs font-bold text-gray-700 tracking-wider uppercase">{language === 'en' ? 'Track Certificate Status' : 'आवेदन संदर्भ (रेफ०) ट्रैकर'}</h3>
              
              <form onSubmit={handleTrackCert} className="flex gap-2 text-xs">
                <input
                  type="text"
                  value={trackingRef}
                  onChange={(e) => setTrackingRef(e.target.value)}
                  placeholder="OGHS-26-0045"
                  className="p-2.5 border border-gray-300 rounded outline-hidden grow font-mono uppercase bg-white"
                  required
                />
                <button type="submit" className="px-4 bg-[#D4522A] text-white font-bold rounded">
                  {language === 'en' ? 'Track' : 'ट्रैक करें'}
                </button>
              </form>

              {trackedCert && (
                <div className="p-4 bg-neutral-50 rounded border border-gray-200 text-xs space-y-3">
                  {trackedCert === 'NOT_FOUND' ? (
                    <p className="text-red-600 font-bold">{language === 'en' ? 'Reference Code not found in database. Double check registration slip.' : 'अमान्य संदर्भ संख्या। कृपया पुनः जांच करें।'}</p>
                  ) : (
                    <>
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="font-black text-gray-500 font-mono mb-1">{trackedCert.referenceNo}</span>
                        <span className={`px-2 py-0.5 rounded font-black uppercase text-[9px] ${
                          trackedCert.status === 'Ready for Collection' ? 'bg-green-100 text-[#2E7D32]' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {trackedCert.status}
                        </span>
                      </div>
                      <div className="space-y-1.5" style={{ fontSize: '11px' }}>
                        <p className="font-bold text-gray-800">{trackedCert.studentNameEn} | {trackedCert.className}</p>
                        <p className="text-gray-500 font-mono">{language === 'en' ? 'Document applied:' : 'प्रमाण पत्र का प्रकार:'} <span className="font-bold text-[#1A3A5C]">{trackedCert.type}</span></p>
                        <p className="text-gray-400 font-mono">{language === 'en' ? 'Applied Date:' : 'आवेदन तिथि:'} {trackedCert.appliedDate}</p>
                      </div>

                      {trackedCert.instructionsEn && (
                        <div className="bg-white p-3 border-l-4 border-amber-600 rounded shadow-2xs space-y-1">
                          <p className="font-bold text-amber-700" style={{ fontSize: '11.5px' }}>
                            {language === 'en' ? 'Nodal Desk Instructions:' : 'प्रशासन की टिप्पणी:'}
                          </p>
                          <p className="text-gray-600 font-mono">
                            {language === 'en' ? trackedCert.instructionsEn : trackedCert.instructionsHi}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. FACULTY DIRECTORY VIEW */}
      {activeView === 'faculty' && (
        <div className="space-y-6">
          <div className="text-center md:text-left space-y-1.5 border-b pb-4 border-gray-200">
            <h2 className="text-xl md:text-2xl font-serif font-black text-[#1A3A5C] flex items-center gap-2 justify-center md:justify-start">
              <UserCheck className="w-6 h-6 text-[#D4522A]" />
              <span>{language === 'en' ? 'Verified Faculty Directory' : 'सत्यापित शिक्षक मंडल विवरणिका'}</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {language === 'en' 
                ? 'All appointed teachers are registered under the Bihar Secondary Education Board and verified by the district educational authority.'
                : 'सभी शिक्षक बिहार माध्यमिक शिक्षा बोर्ड के अंतर्गत नियुक्त हैं और बेगूसराय जिला शिक्षा कार्यालय द्वारा सत्यापित हैं।'}
            </p>
          </div>

          {/* Search/Filter Bar */}
          <div className="bg-white p-4 rounded shadow-xs flex flex-col sm:flex-row gap-3 text-xs items-center justify-between no-print border">
            <div className="relative w-full sm:max-w-xs shrink-0">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search teacher by name or subject...' : 'शिक्षक या विषय का नाम खोजें...'}
                value={noticeSearch}
                onChange={(e) => setNoticeSearch(e.target.value)}
                className="pl-8 p-1.5 border rounded w-full bg-neutral-50 font-mono focus:ring-1 focus:ring-[#D4522A]"
              />
            </div>
            
            <div className="text-[11px] font-semibold text-gray-500 italic">
              {language === 'en' 
                ? `${teachers ? teachers.length : 0} registered faculty members found`
                : `कुल ${teachers ? teachers.length : 0} शिक्षक सदस्य मिले`}
            </div>
          </div>

          {/* Principal / Head of Institution Section */}
          <div id="school-principal-directory-card" className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-xl p-5 border border-amber-200/60 shadow-xs flex flex-col md:flex-row gap-5 items-center md:items-start max-w-2xl mx-auto">
            {/* Principal Photo */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white border-2 border-amber-300 rounded-full flex items-center justify-center text-[#D4522A] shrink-0 shadow-sm overflow-hidden">
              {schoolSettings.logo && (schoolSettings.logo.startsWith('data:') || schoolSettings.logo.startsWith('http')) ? (
                <img src={schoolSettings.logo} alt="Principal Portrait" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-orange-100 text-[#D4522A] font-black text-lg font-mono">
                  {schoolSettings.principalNameEn ? schoolSettings.principalNameEn.split('.').pop()?.trim().split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'P'}
                </div>
              )}
            </div>

            {/* Principal Details */}
            <div className="space-y-1.5 text-center md:text-left flex-1 min-w-0">
              <span className="text-[8px] tracking-widest font-black uppercase bg-[#D4522A] text-white px-2 py-0.5 rounded-full inline-block font-mono">
                {language === 'en' ? 'Principal & Head of school' : 'प्राचार्य एवं विद्यालय प्रमुख'}
              </span>
              <h3 className="text-base font-serif font-black text-slate-900 leading-tight">
                {language === 'en' ? schoolSettings.principalNameEn : schoolSettings.principalNameHi}
              </h3>
              <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wide">
                {language === 'en' ? schoolSettings.principalDesignationEn : schoolSettings.principalDesignationHi}
              </p>
              {schoolSettings.principalQualificationsEn && (
                <p className="text-[10px] text-amber-900 font-serif font-semibold italic flex items-center justify-center md:justify-start gap-1 bg-amber-100/40 px-2 py-0.5 rounded border border-amber-200/30 w-fit">
                  🎓 {language === 'en' ? schoolSettings.principalQualificationsEn : (schoolSettings.principalQualificationsHi || schoolSettings.principalQualificationsEn)}
                </p>
              )}
              <p className="text-[10px] text-gray-500 font-mono">
                📧 principal@omarbalika132.edu.in
              </p>
            </div>
          </div>

          {/* Directory Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers && teachers
              .filter(t => t.status !== 'Disabled')
              .filter(t => {
                if (!noticeSearch.trim()) return true;
                const matchEn = t.nameEn?.toLowerCase().includes(noticeSearch.toLowerCase());
                const matchHi = t.nameHi?.toLowerCase().includes(noticeSearch.toLowerCase());
                const matchSub = t.subjectsEn?.some(s => s.toLowerCase().includes(noticeSearch.toLowerCase()));
                return matchEn || matchHi || matchSub;
              })
              .map((teacher, index) => (
                <div key={teacher.id || index} className="bg-white rounded-lg p-5 border border-gray-200/60 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-orange-50 border border-orange-200 rounded-full flex items-center justify-center text-[#D4522A] text-sm font-black shrink-0 shadow-inner overflow-hidden">
                        {teacher.avatarUrl ? (
                          <img src={teacher.avatarUrl} alt={teacher.nameEn} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-orange-100 text-[#D4522A] font-extrabold font-mono">
                            {teacher.nameEn ? teacher.nameEn.split('.').pop()?.trim().split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'T'}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="font-serif font-bold text-slate-900 text-sm truncate">
                          {language === 'en' ? teacher.nameEn : teacher.nameHi}
                        </h4>
                        <p className="text-[10px] bg-sky-50 text-[#1A3A5C] px-1.5 py-0.5 rounded font-mono font-bold uppercase inline-block">
                          {language === 'en' ? teacher.designationEn : teacher.designationHi}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t pt-3" style={{ fontSize: '11px' }}>
                      <p className="text-gray-500 font-mono">
                        <span className="font-bold text-gray-700">{language === 'en' ? 'Subjects:' : 'विषय:'}</span>{' '}
                        {language === 'en' ? teacher.subjectsEn?.join(', ') : teacher.subjectsHi?.join(', ')}
                      </p>
                      <p className="text-gray-500 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
                        <span className="font-bold text-gray-700">📧 Email:</span>{' '}
                        <span className="text-zinc-600 font-bold select-all">{teacher.email || 'N/A'}</span>
                      </p>
                      <p className="text-gray-500 font-mono">
                        <span className="font-bold text-gray-700">{language === 'en' ? 'Education:' : 'योग्यता:'}</span>{' '}
                        {language === 'en' ? (teacher.qualificationEn || 'B.Ed, Qualified') : (teacher.qualificationHi || 'सत्यापित शिक्षक')}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono border-t pt-2.5">
                    <span className="text-emerald-750 font-bold flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'BIHAR GOVT VERIFIED' : 'सरकार द्वारा सत्यापित'}</span>
                    </span>
                    <span className="text-zinc-400 font-bold">ID: {teacher.id?.slice(0, 5) || `T-${index}`}</span>
                  </div>
                </div>
              ))}

            {(!teachers || teachers.length === 0) && (
              <div className="col-span-full bg-white p-12 text-center rounded border border-gray-100 text-xs text-gray-500">
                {language === 'en' ? 'No registered faculty members loaded from database.' : 'डेटाबेसे से कोई भी शिक्षक विवरण प्राप्त नहीं हुआ।'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
