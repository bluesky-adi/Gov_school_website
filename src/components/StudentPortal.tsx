import React, { useState } from 'react';
import { useAppState } from '../AppContext.tsx';
import { BookOpen, Calendar, ClipboardList, Award, FileText, Download, Landmark, HelpCircle } from 'lucide-react';
import { exportResultPDF, exportTimetablePDF } from '../utils/pdfExport.ts';

export const StudentPortal: React.FC = () => {
  const { language, user, students, timetable, examResults, homework, studyMaterials, attendance, schoolSettings } = useAppState();
  const [studentTab, setStudentTab] = useState<'dash' | 'time' | 'att' | 'res' | 'hw' | 'mat'>('dash');

  if (!user || user.role !== 'STUDENT') {
    return <div className="p-12 text-center text-sm font-bold text-red-500 bg-white rounded">Access Restricted: Student Session Required.</div>;
  }

  // Find detailed profile of this student
  const profile = students.find((s) => s.rollNo === user.rollNo);
  if (!profile) {
    return <div className="p-12 text-center text-xs text-amber-600 bg-white rounded">Student Profile Ledger Not found in system. Please notify Head Desk.</div>;
  }

  // Filter attendance for this student
  const myAttendance = attendance.filter((a) => a.studentId === profile.id);
  const totalDays = myAttendance.length;
  const presentDays = myAttendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

  // Filter Timetable
  const mySchedule = timetable.filter((t) => t.className === profile.className);

  // Filter Results
  const myReportCard = examResults.find((r) => r.studentId === profile.id);

  // Filter Homework
  const myHw = homework.filter((h) => h.className === profile.className);

  // Bilingual strings
  const labels = {
    dash: language === 'en' ? 'My Dashboard' : 'मेरा डैशबोर्ड',
    time: language === 'en' ? 'Class Timetable' : 'वर्ग समय-सारणी',
    att: language === 'en' ? 'My Attendance' : 'मेरी उपस्थिति',
    res: language === 'en' ? 'Exam Results' : 'परीक्षा फल',
    hw: language === 'en' ? 'Homework Assignments' : 'गृहकार्य असाइनमेंट',
    mat: language === 'en' ? 'Study Materials' : 'अध्ययन नोट्स / सामग्री',
    roll: language === 'en' ? 'Class Roll No:' : 'वर्ग अनुक्रमांक (रोल):',
    enrolledClass: language === 'en' ? 'Enrolled Standard:' : 'नामांकित कक्षा:',
    sec: language === 'en' ? 'Section:' : 'वर्ग शाखा (सेक्शन):',
    parentName: language === 'en' ? 'Father/Mother Name:' : 'माता/पिता का नाम:',
    medhaStatus: language === 'en' ? 'Medhasoft Status:' : 'मेधासॉफ्ट स्थिति:',
    paymentStatus: language === 'en' ? 'DBT Scholarship Payment:' : 'डीबीटी भुगतान स्थिति:',
    scNote: language === 'en' 
      ? 'Ensure your attendance rate is above 75% to retain Medhasoft scholarship eligibility.' 
      : 'छात्रवृत्ति की निरंतरता सुनिश्चित करने के लिए वर्ग में ७५% से अधिक उपस्थिति आवश्यक है।'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-[#1C1C1E] grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar Navigation */}
      <div className="bg-[#1A3A5C] text-white p-4 rounded-lg shadow-md space-y-4 font-mono h-fit no-print">
        <div className="border-b border-white/10 pb-3">
          <span className="text-[10px] bg-[#D4522A] px-2 py-0.5 rounded text-white font-bold tracking-wide block w-fit mb-1.5 uppercase">
            {language === 'en' ? 'Pupil Panel' : 'छात्रा पोर्टल'}
          </span>
          <h3 className="text-sm font-bold truncate">{language === 'en' ? profile.nameEn : profile.nameHi}</h3>
          <p className="text-[11px] text-zinc-300 mt-1">{profile.className} • Section {profile.section}</p>
        </div>

        <nav className="flex flex-col gap-1.5 text-xs font-semibold">
          {[
            { tag: 'dash', title: labels.dash, icon: <BookOpen className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'time', title: labels.time, icon: <Calendar className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'att', title: labels.att, icon: <ClipboardList className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'res', title: labels.res, icon: <Award className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'hw', title: labels.hw, icon: <FileText className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'mat', title: labels.mat, icon: <Download className="w-4 h-4 text-[#D4522A]" /> }
          ].map((tab) => (
            <button
              key={tab.tag}
              onClick={() => setStudentTab(tab.tag as any)}
              className={`flex items-center gap-2.5 p-2.5 rounded transition ${studentTab === tab.tag ? 'bg-[#D4522A] text-white shadow-md' : 'hover:bg-white/5'}`}
            >
              {tab.icon}
              <span>{tab.title}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* 1. DASHBOARD TAB */}
        {studentTab === 'dash' && (
          <div className="space-y-6">
            {/* Student metadata info card */}
            <div className="bg-white p-5 rounded shadow-xs space-y-4">
              <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
                {language === 'en' ? 'Academic Registry details' : 'शैक्षणिक रिकॉर्ड प्रविष्टि'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-bold">{labels.enrolledClass}</span> {profile.className}</p>
                  <p><span className="font-bold">{labels.sec}</span> {profile.section}</p>
                  <p><span className="font-bold">{labels.roll}</span> {profile.rollNo}</p>
                  <p><span className="font-bold">{labels.parentName}</span> {language === 'en' ? profile.fatherNameEn : profile.fatherNameHi} / {language === 'en' ? profile.motherNameEn : profile.motherNameHi}</p>
                  <p><span className="font-bold">{language === 'en' ? 'Date of Birth:' : 'जन्मतिथि:'}</span> {profile.dob}</p>
                </div>
                {/* Government Welfare & DBT status */}
                <div className="bg-orange-600/5 p-4 rounded border border-[#D4522A]/10 space-y-2.5">
                  <h4 className="font-mono font-bold text-xs text-[#D4522A] flex items-center gap-1">
                    <Landmark className="w-4 h-4 shrink-0" />
                    <span>{language === 'en' ? 'Bihar Welfare DBT Scheme status' : 'राज्य कल्याणकारी डीबीटी/मेधासॉफ्ट स्थिति'}</span>
                  </h4>
                  <div className="space-y-1.5" style={{ fontSize: '11px' }}>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{labels.medhaStatus}</span>
                      <span className={`font-bold ${profile.medhasoftStatus === 'Verified' ? 'text-[#2E7D32]' : 'text-amber-600'}`}>{profile.medhasoftStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{labels.paymentStatus}</span>
                      <span className={`font-bold ${profile.dbtPaymentStatus === 'Payment Disbursed' ? 'text-[#2E7D32]' : 'text-blue-600'}`}>{profile.dbtPaymentStatus}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{language === 'en' ? 'Bank Account Last 4:' : 'खाता संख्या (अंतिम ४):'}</span>
                      <span className="font-mono font-bold text-gray-950">******{profile.bankAccountLast4}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Alert card */}
            <div className="p-4 bg-yellow-600/5 rounded border border-yellow-500/20 text-xs text-yellow-800 flex items-start gap-2.5">
              <ClipboardList className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">{language === 'en' ? `Monthly Attendance Rate: ${attendanceRate}%` : `मासिक उपस्थिति दर: ${attendanceRate}%`}</p>
                <p className="text-[11px] mt-0.5">{labels.scNote}</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. TIMETABLE TAB */}
        {studentTab === 'time' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C]">
                {labels.time} - {profile.className} {profile.section}
              </h3>
              <button 
                onClick={() => exportTimetablePDF(profile.className, mySchedule.map(s => ({
                  ...s,
                  teacherName: language === 'en' ? s.teacherEn : s.teacherHi
                })))}
                className="text-xs font-mono font-bold text-[#D4522A] hover:underline flex items-center gap-1.5 no-print"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Download PDF Schedule' : 'समय-सारणी पीडीएफ डाउनलोड'}</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#132A43] text-white">
                  <tr>
                    <th className="p-2.5 font-mono uppercase text-[10px]">{language === 'en' ? 'Day' : 'दिन'}</th>
                    <th className="p-2.5 font-mono uppercase text-[10px]">{language === 'en' ? 'Period' : 'घंटी'}</th>
                    <th className="p-2.5 font-mono uppercase text-[10px]">{language === 'en' ? 'Subject' : 'विषय'}</th>
                    <th className="p-2.5 font-mono uppercase text-[10px]">{language === 'en' ? 'Assigned Teacher' : 'शिक्षक'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {mySchedule.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-50">
                      <td className="p-2.5 font-bold font-mono">{language === 'en' ? row.day : row.day}</td>
                      <td className="p-2.5 font-mono text-zinc-400">{row.period} ({row.time})</td>
                      <td className="p-2.5 text-[#D4522A]">{language === 'en' ? row.subjectEn : row.subjectHi}</td>
                      <td className="p-2.5 text-gray-700">{language === 'en' ? row.teacherEn : row.teacherHi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. ATTENDANCE TAB */}
        {studentTab === 'att' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
              {labels.att} - Track Attendance logs
            </h3>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-neutral-50 rounded border border-gray-100">
                <h4 className="text-gray-400 uppercase text-[9px]">{language === 'en' ? 'Total checked' : 'कुल कार्यदिवस'}</h4>
                <p className="text-lg font-bold font-mono">{totalDays}</p>
              </div>
              <div className="p-3 bg-[#2E7D32]/5 rounded border border-[#2E7D32]/20">
                <h4 className="text-[#2E7D32] uppercase text-[9px]">{language === 'en' ? 'Days present' : 'उपस्थित दिन'}</h4>
                <p className="text-lg font-black text-[#2E7D32] font-mono">{presentDays}</p>
              </div>
              <div className="p-3 bg-red-600/5 rounded border border-red-600/20">
                <h4 className="text-red-600 uppercase text-[9px]">{language === 'en' ? 'Days absent' : 'अनुपस्थित दिन'}</h4>
                <p className="text-lg font-black text-red-600 font-mono">{totalDays - presentDays}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-700">{language === 'en' ? 'Recent Class Presence logs:' : 'हालिया उपस्थिति रिकॉर्ड:'}</h4>
              <div className="space-y-1.5 font-mono">
                {myAttendance.map((rec) => (
                  <div key={rec.id} className="p-2.5 bg-neutral-50 border rounded flex items-center justify-between text-xs font-medium">
                    <span>{rec.date}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.status === 'Present' ? 'bg-[#2E7D32]/10 text-[#2E7D32]' : 'bg-red-100 text-red-800'
                    }`}>
                      {rec.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. EXAM RESULTS TAB */}
        {studentTab === 'res' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C]">
                {labels.res} - official report Card
              </h3>
              <button 
                onClick={() => exportResultPDF(profile.nameEn, profile.rollNo, myReportCard)}
                className="text-xs font-mono font-bold text-[#D4522A] hover:underline flex items-center gap-1.5 no-print"
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Download PDF Marksheet' : 'प्रगति-पत्र पीडीएफ डाउनलोड'}</span>
              </button>
            </div>

            {myReportCard ? (
              <div className="space-y-5 print-area">
                {/* Board Certificate layout style */}
                <div className="border-2 border-dashed border-[#1A3A5C] p-4 rounded bg-neutral-50 space-y-3 shadow-inner">
                  <div className="text-center space-y-1">
                    <h2 className="text-xs font-extrabold text-[#1A3A5C] tracking-wide uppercase">
                      {language === 'en' ? schoolSettings.schoolNameEn : schoolSettings.schoolNameHi}
                    </h2>
                    <h1 className="text-[10px] font-mono font-bold text-[#D4522A] tracking-wider uppercase">BSEB Matric Prep Annual Marksheet - Year {myReportCard.academicYear}</h1>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2 bg-white rounded border border-gray-200">
                    <div>
                      <p><span className="text-gray-400 font-mono">Student En:</span> <strong>{profile.nameEn}</strong></p>
                      <p><span className="text-gray-400 font-mono">Student Hi:</span> <strong>{profile.nameHi}</strong></p>
                    </div>
                    <div className="text-right">
                      <p><span className="text-gray-400 font-mono">BSEB Code:</span> {schoolSettings.bsebCode}</p>
                      <p><span className="text-gray-400 font-mono">Roll Number:</span> <strong>{profile.rollNo}</strong></p>
                    </div>
                  </div>

                  {/* Marks block */}
                  <div className="bg-white p-2 border rounded overflow-x-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700">
                          <th className="p-2 font-bold">{language === 'en' ? 'Subject' : 'विषय'}</th>
                          <th className="p-2 font-mono uppercase text-[9px]">Full Marks</th>
                          <th className="p-2 font-mono uppercase text-[9px]">Pass Marks</th>
                          <th className="p-2 font-mono uppercase text-[9px]">Marks Obtained</th>
                          <th className="p-2 font-mono uppercase text-[9px]">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-bold">
                        {myReportCard.subBlockMarks.map((m, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50">
                            <td className="p-2 text-gray-800">{language === 'en' ? m.subjectEn : m.subjectHi}</td>
                            <td className="p-2 font-mono text-zinc-400">{m.fullMarks}</td>
                            <td className="p-2 font-mono text-zinc-400">{m.passMarks}</td>
                            <td className="p-2 font-mono text-[#D4522A]">{m.marksObtained}</td>
                            <td className="p-2 font-mono text-gray-700">{m.grade}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Combined metrics summary */}
                  <div className="flex justify-between items-center bg-[#1A3A5C]/5 p-3 rounded text-xs">
                    <div>
                      <span className="font-bold text-gray-500 mr-2">{language === 'en' ? 'Combined Result:' : 'परीक्षा परिणाम:'}</span>
                      <span className="bg-[#2E7D32] text-white font-black font-mono px-2 py-0.5 rounded text-[10px]">
                        {myReportCard.resultStatus}
                      </span>
                    </div>
                    <div className="font-mono font-black text-right text-gray-950">
                      <span>{language === 'en' ? `Percentage Rate: ${myReportCard.totalPercentage}%` : `कुल प्रतिशत: ${myReportCard.totalPercentage}%`}</span>
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded border text-[11px] text-gray-600 leading-normal italic">
                    <strong className="block text-gray-950 font-bold not-italic">{language === 'en' ? 'Coordinator Remarks:' : 'आधिकारिक टिप्पणी:'}</strong>
                    "{language === 'en' ? myReportCard.remarksEn : myReportCard.remarksHi}"
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400 py-6">{language === 'en' ? 'No exam marks sheets updated. Contact Class Teacher.' : 'कोई मूल्यांकन रिकॉर्ड उपलब्ध नहीं है।'}</p>
            )}
          </div>
        )}

        {/* 5. ACTIVE HOMEWORK TAB */}
        {studentTab === 'hw' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
              {labels.hw} - Daily assigned homework
            </h3>

            <div className="space-y-3">
              {myHw.length > 0 ? (
                myHw.map((hw) => (
                  <div key={hw.id} className="p-4 bg-amber-600/5 hover:bg-amber-600/10 border border-[#D4522A]/10 rounded transition space-y-2">
                    <div className="flex flex-wrap items-center justify-between text-xs font-mono">
                      <span className="font-bold text-[#D4522A]">{language === 'en' ? hw.subjectEn : hw.subjectHi}</span>
                      <span className="text-gray-400">{language === 'en' ? `Due: ${hw.dueDate}` : `अंतिम तिथि: ${hw.dueDate}`}</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900">{language === 'en' ? hw.titleEn : hw.titleHi}</h4>
                    <p className="text-[11px] text-gray-600 leading-normal">{language === 'en' ? hw.descriptionEn : hw.descriptionHi}</p>
                    <div className="border-t border-gray-200/60 pt-1.5 flex justify-between items-center text-[10px] text-gray-400 font-mono">
                      <span>{language === 'en' ? `Assigned Date: ${hw.assignedDate}` : `असाइन की गई तारीख: ${hw.assignedDate}`}</span>
                      <span>{language === 'en' ? `By: ${hw.teacherName}` : `शिक्षक: ${hw.teacherName}`}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-gray-400 py-6">{language === 'en' ? 'Zero assignments pending. Great job!' : 'सभी गृहकार्य पूरे हैं!'}</p>
              )}
            </div>
          </div>
        )}

        {/* 6. STUDY MATERIALS DOWNLOADS */}
        {studentTab === 'mat' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
              {labels.mat} - Downloadable lesson plans
            </h3>

            <div className="space-y-3">
              {studyMaterials.map((mat) => (
                <div key={mat.id} className="p-3.5 bg-neutral-50 rounded border flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono">
                      <span className="text-[#1A3A5C] font-semibold">{language === 'en' ? mat.subjectEn : mat.subjectHi}</span>
                      {mat.isELots && (
                        <span className="bg-teal-600 text-white px-1.5 py-0.2 rounded font-black uppercase text-[8px]">
                          e-LOTS Bihar
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">{language === 'en' ? mat.titleEn : mat.titleHi}</h4>
                    {mat.descriptionEn && (
                      <p className="text-[10px] text-gray-500">{language === 'en' ? mat.descriptionEn : mat.descriptionHi}</p>
                    )}
                  </div>

                  <a 
                    href={mat.downloadUrl || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex flex-col items-center justify-center p-2.5 bg-[#D4522A] hover:bg-[#D4522A]/90 text-white rounded shadow-xs text-[10px] font-mono font-bold min-w-[70px] shrink-0"
                  >
                    <Download className="w-4 h-4 mb-0.5" />
                    <span>{mat.fileSize || 'Link'}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
