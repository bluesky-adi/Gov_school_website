import React, { useState } from 'react';
import { useAppState } from '../AppContext.tsx';
import { UserRole, ExamResult, StudentProfile } from '../types.ts';
import { ClipboardList, Award, Upload, FileSignature, CheckCircle, HelpCircle, FileText, AlertCircle, Sparkles } from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const {
    language,
    user,
    students,
    submitBulkAttendance,
    submitBulkResults,
    addHomework,
    addStudyMaterial
  } = useAppState();

  if (!user || user.role !== UserRole.TEACHER) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-red-50 border border-red-200 text-red-950 rounded-lg space-y-4 shadow-sm text-xs select-none">
        <h2 className="font-serif font-black text-sm flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Access Denied / अनाधिकृत प्रवेश</span>
        </h2>
        <p className="leading-relaxed">
          You do not have teacher credentials to view this workspace. This attempt has been logged.
        </p>
      </div>
    );
  }

  const [teacherTab, setTeacherTab] = useState<'attendance' | 'marks' | 'homework' | 'material'>('attendance');

  // Attendance state
  const [targetClass, setTargetClass] = useState<'Class IX' | 'Class X' | 'Class XI' | 'Class XII'>('Class X');
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState<{ [studentId: string]: 'Present' | 'Absent' | 'Leave' }>({});
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);

  // Marks / CSV upload states
  const [targetExam, setTargetExam] = useState('Matric Quarterly Assessment');
  const [targetSubject, setTargetSubject] = useState('Mathematics');
  const [csvText, setCsvText] = useState('101,88\n102,74\n103,45\n104,92'); // Pre-filled helper mock CSV
  const [parsedRows, setParsedRows] = useState<{ rollNo: string; marks: number; studentName?: string; valid: boolean; error?: string | null }[]>([]);
  const [marksSuccess, setMarksSuccess] = useState(false);

  // Homework upload states
  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwClass, setHwClass] = useState('Class X');
  const [hwSubject, setHwSubject] = useState('Mathematics');
  const [hwDue, setHwDue] = useState('2026-06-20');
  const [hwSuccess, setHwSuccess] = useState(false);

  // Study notes upload states
  const [matTitle, setMatTitle] = useState('');
  const [matSub, setMatSub] = useState('Mathematics');
  const [matClass, setMatClass] = useState('Class X');
  const [matSize, setMatSize] = useState('1.5 MB');
  const [matUrl, setMatUrl] = useState('https://eshikshakosh.bihar.gov.in');
  const [matIsELots, setMatIsELots] = useState(false);
  const [matSuccess, setMatSuccess] = useState(false);

  if (!user || user.role !== UserRole.TEACHER) {
    return <div className="p-12 text-center text-sm font-bold text-red-500 bg-white rounded">Access Restricted: Teacher Session Required.</div>;
  }

  // Filter students based on selected targetClass
  const filteredStudents = students.filter((s) => s.className === targetClass);

  // Initialize attendance defaults
  const initAttendanceState = () => {
    const fresh: { [studentId: string]: 'Present' | 'Absent' | 'Leave' } = {};
    filteredStudents.forEach((st) => {
      fresh[st.id] = attendanceStatus[st.id] || 'Present';
    });
    return fresh;
  };

  // Set default present state
  React.useEffect(() => {
    const states = initAttendanceState();
    setAttendanceStatus(states);
  }, [targetClass]);

  // Set individual student status
  const handleToggleAttendance = (id: string, status: 'Present' | 'Absent' | 'Leave') => {
    setAttendanceStatus((prev) => ({ ...prev, [id]: status }));
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const records = Object.entries(attendanceStatus).map(([stId, status]) => {
      const pupil = students.find((s) => s.id === stId)!;
      return {
        studentId: stId,
        date: attendanceDate,
        status,
        className: pupil.className,
        section: pupil.section
      };
    });

    submitBulkAttendance(records);
    setAttendanceSuccess(true);
    setTimeout(() => setAttendanceSuccess(false), 3000);
  };

  // CSV Grade Parser
  const handleParseCSV = () => {
    if (!csvText.trim()) return;
    const lines = csvText.trim().split('\n');
    const parsed = lines.map((line) => {
      const parts = line.split(',');
      if (parts.length < 2) {
        return { 
          rollNo: '', 
          marks: 0, 
          studentName: 'Invalid Line Format', 
          valid: false, 
          error: language === 'en' ? 'Missing comma separator' : 'अल्पविराम विभाजक अनुपस्थित है' 
        };
      }
      
      const roll = parts[0].trim();
      const mVal = parseInt(parts[1].trim(), 10);
      
      if (!roll) {
        return { 
          rollNo: '', 
          marks: 0, 
          studentName: 'Missing Roll', 
          valid: false, 
          error: language === 'en' ? 'Empty roll number segment' : 'रोल नंबर वर्ग रिक्त है' 
        };
      }

      const matchingStudent = students.find((s) => s.rollNo === roll);
      
      if (Number.isNaN(mVal) || mVal < 0 || mVal > 100) {
        return { 
          rollNo: roll, 
          marks: Number.isNaN(mVal) ? 0 : mVal, 
          studentName: matchingStudent ? matchingStudent.nameEn : 'Unknown', 
          valid: false, 
          error: language === 'en' ? 'Marks must be an integer between 0 and 100' : 'प्राप्तांक 0 और 100 के बीच होने चाहिए' 
        };
      }
      
      if (!matchingStudent) {
        return { 
          rollNo: roll, 
          marks: mVal, 
          studentName: 'Not Registered', 
          valid: false, 
          error: language === 'en' ? `Roll ${roll} does not exist in active ledger` : `रोल नंबर ${roll} सक्रिय लेजर में उपलब्ध नहीं है` 
        };
      }

      return {
        rollNo: roll,
        marks: mVal,
        studentName: matchingStudent.nameEn,
        valid: true,
        error: null
      };
    });

    setParsedRows(parsed.filter(r => r.rollNo || r.error));
    setMarksSuccess(false);
  };

  // Submit bulk grades to results ledger
  const handleSubmitParsedMarks = () => {
    const validRows = parsedRows.filter((r) => r.valid);
    if (validRows.length === 0) return;

    const examRecords: ExamResult[] = validRows.map((row) => {
      const pupil = students.find((s) => s.rollNo === row.rollNo)!;
      
      // Determine grade based on percent
      const p = row.marks;
      const gr = p >= 85 ? 'A+' : p >= 70 ? 'A' : p >= 50 ? 'B' : p >= 33 ? 'C' : 'F';
      const stat = p >= 33 ? 'PASS' : 'FAIL';

      return {
        id: `res_parsed_${pupil.id}_${Date.now()}`,
        studentId: pupil.id,
        examNameEn: targetExam,
        examNameHi: language === 'en' ? targetExam : 'त्रैमासिक सावधिक मूल्यांकन',
        academicYear: '20 Session 2026',
        subBlockMarks: [
          {
            subjectEn: targetSubject,
            subjectHi: targetSubject === 'Mathematics' ? 'गणित' : 'विज्ञान',
            fullMarks: 100,
            passMarks: 33,
            marksObtained: p,
            grade: gr
          }
        ],
        totalPercentage: p,
        grade: gr,
        resultStatus: stat,
        remarksEn: `Uploaded via CSV parser by Teacher ${user.nameEn}`,
        remarksHi: `शिक्षक ${user.nameHi} द्वारा डिजिटल अपलोड`
      };
    });

    submitBulkResults(examRecords);
    setMarksSuccess(true);
    setParsedRows([]);
    setCsvText('');
    setTimeout(() => setMarksSuccess(false), 3000);
  };

  // Submit Homework
  const handleHwSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim()) return;

    addHomework({
      titleEn: hwTitle,
      titleHi: language === 'en' ? hwTitle : `गृहकार्य: ${hwTitle}`,
      descriptionEn: hwDesc,
      descriptionHi: language === 'en' ? hwDesc : `विवरण: ${hwDesc}`,
      className: hwClass,
      section: 'A',
      subjectEn: hwSubject,
      subjectHi: hwSubject === 'Mathematics' ? 'गणित' : 'विज्ञान',
      dueDate: hwDue,
      teacherName: user.nameEn
    });

    setHwSuccess(true);
    setHwTitle('');
    setHwDesc('');
    setTimeout(() => setHwSuccess(false), 3000);
  };

  // Submit Study notes
  const handleMaterialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;

    addStudyMaterial({
      titleEn: matTitle,
      titleHi: language === 'en' ? matTitle : `अध्ययन नोट्स: ${matTitle}`,
      className: matClass,
      subjectEn: matSub,
      subjectHi: matSub === 'Mathematics' ? 'गणित' : 'विज्ञान',
      descriptionEn: `Lesson Reference files uploaded by Teacher ${user.nameEn}`,
      descriptionHi: `शिक्षक ${user.nameHi} द्वारा अपलोड की गई पाठ्य सामग्री`,
      downloadUrl: matUrl,
      fileSize: matSize,
      isELots: matIsELots
    });

    setMatSuccess(true);
    setMatTitle('');
    setTimeout(() => setMatSuccess(false), 3000);
  };

  const strings = {
    header: language === 'en' ? 'Teacher Information Entry Portal' : 'शिक्षक डेटा प्रविष्टि पोर्टल',
    attTab: language === 'en' ? 'Class Attendance Checksheet' : 'कक्षा दैनिक उपस्थिति',
    marksTab: language === 'en' ? 'Upload Subject Grades (CSV)' : 'विषय अंक अपलोड (CSV)',
    hwTab: language === 'en' ? 'Assign Homework task' : 'नया गृहकार्य आवंटित करें',
    matTab: language === 'en' ? 'Smart Lesson Resources' : 'अध्ययन नोट्स अपलोड करें',
    classSelect: language === 'en' ? 'Select Target Standards Class:' : 'लक्षित वर्ग कक्षा:',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-[#1C1C1E] grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar controls */}
      <div className="bg-[#1A3A5C] text-white p-5 rounded-lg shadow-md space-y-4 font-mono h-fit no-print">
        <div className="border-b border-white/10 pb-3">
          <span className="text-[9px] bg-[#D4522A] px-2 py-0.5 rounded text-white font-bold block w-fit mb-1.5 uppercase">
            {language === 'en' ? 'Educator panel' : 'शिक्षक हब'}
          </span>
          <h3 className="text-sm font-bold truncate">{language === 'en' ? user.nameEn : user.nameHi}</h3>
          <p className="text-[11px] text-[#F7F3EE]/80 mt-0.5">{user.email}</p>
        </div>

        <nav className="flex flex-col gap-1.5 text-xs font-bold">
          {[
            { id: 'attendance', label: strings.attTab, icon: <ClipboardList className="w-4 h-4 text-[#D4522A]" /> },
            { id: 'marks', label: strings.marksTab, icon: <Award className="w-4 h-4 text-[#D4522A]" /> },
            { id: 'homework', label: strings.hwTab, icon: <FileText className="w-4 h-4 text-[#D4522A]" /> },
            { id: 'material', label: strings.matTab, icon: <Upload className="w-4 h-4 text-[#D4522A]" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTeacherTab(tab.id as any)}
              className={`flex items-center gap-2.5 p-2.5 rounded transition ${teacherTab === tab.id ? 'bg-[#D4522A] text-white shadow-md' : 'hover:bg-white/5'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main workspace */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* 1. ATTENDANCE ACTIONS */}
        {teacherTab === 'attendance' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
              {strings.attTab}
            </h3>

            {attendanceSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-[#2E7D32] text-xs font-bold rounded flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'en' ? 'Class attendance registered successfully for today!' : 'आज की उपस्थिति सफलतापूर्वक सहेज ली गई है!'}</span>
              </div>
            )}

            <form onSubmit={handleAttendanceSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{strings.classSelect}</label>
                  <select
                    value={targetClass}
                    onChange={(e: any) => setTargetClass(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Class IX">Class IX (नौवीं)</option>
                    <option value="Class X">Class X (दसवीं)</option>
                    <option value="Class XI">Class XI (ग्यारहवीं)</option>
                    <option value="Class XII">Class XII (बारहवीं)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Target Ledger Date:' : 'अटेंडेंस की तारीख:'}</label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Attendance checklist */}
              <div className="border rounded overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#132A43] text-white">
                    <tr>
                      <th className="p-2.5 font-mono uppercase text-[10px]">{language === 'en' ? 'Roll No' : 'रोल नंबर'}</th>
                      <th className="p-2.5 font-mono uppercase text-[10px]">{language === 'en' ? 'Student Name' : 'छात्रा का नाम'}</th>
                      <th className="p-2.5 col-span-1 text-center font-mono uppercase text-[10px]">{language === 'en' ? 'Mark Presence Status' : 'उपस्थिति दर्ज करें'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-neutral-50/70 font-semibold text-gray-800">
                        <td className="p-2.5 font-mono text-gray-500">{st.rollNo}</td>
                        <td className="p-2.5">{language === 'en' ? st.nameEn : st.nameHi}</td>
                        <td className="p-2.5">
                          <div className="flex justify-center items-center gap-1.5 font-mono text-[10px]">
                            {['Present', 'Absent', 'Leave'].map((stState) => (
                              <button
                                key={stState}
                                type="button"
                                onClick={() => handleToggleAttendance(st.id, stState as any)}
                                className={`px-2 py-1 rounded font-bold uppercase transition ${
                                  attendanceStatus[st.id] === stState
                                    ? stState === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : stState === 'Absent'
                                      ? 'bg-red-600 text-white shadow-xs'
                                      : 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                              >
                                {stState}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1A3A5C] hover:bg-[#1A3A5C]/95 text-white font-bold font-mono tracking-wide uppercase rounded shadow-md"
              >
                {language === 'en' ? 'Save Class Attendance ledger' : 'आज की उपस्थिति सहेजें'}
              </button>
            </form>
          </div>
        )}

        {/* 2. UPLOAD GRADES / CSV LOADER */}
        {teacherTab === 'marks' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4522A]" />
              {strings.marksTab}
            </h3>

            {marksSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#2E7D32] text-xs font-bold rounded flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#2E7D32]" />
                <span>{language === 'en' ? 'Bulk student grades uploaded and registered securely!' : 'साझा अंकतालिका डेटाबेस पर दर्ज कर ली गई है!'}</span>
              </div>
            )}

            <div className="text-xs space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Select Subject Exams:' : 'लक्षित मूल्यांकन परीक्षा:'}</label>
                  <select
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white"
                  >
                    <option value="Matric Prep Quarterly Assessment">Class X Quarterly Assessment</option>
                    <option value="Matric Prep Final Evaluator">Class IX Term End Trial</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Select Subject:' : 'लक्षित विषय:'}</label>
                  <select
                    value={targetSubject}
                    onChange={(e) => setTargetSubject(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded bg-white"
                  >
                    <option value="Mathematics">Mathematics (गणित)</option>
                    <option value="Science">Science (विज्ञान)</option>
                    <option value="Sanskrit">Sanskrit (संस्कृत)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                </div>
              </div>

              {/* Paste box CSV */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-700">{language === 'en' ? 'Paste CSV or Excel Student Marks (RollNo, Marks):' : 'सीएसवी या एक्सील फ़ॉर्मेट में अंक पेस्ट करें (रोल नंबर, प्राप्तांक):'}</label>
                <p className="text-[10px] text-[#D4522A] italic">{language === 'en' ? '* Format: 101,85 (One student per line)' : '* प्रारूप: १०१,८५ (प्रत्येक पंक्ति में एक छात्रा का ही रिकॉर्ड रखें)'}</p>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded font-mono text-xs outline-hidden"
                  placeholder="101,92&#10;102,81"
                ></textarea>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleParseCSV}
                  className="px-4 py-2 bg-[#D4522A] hover:bg-[#D4522A]/90 text-white font-mono font-bold rounded shadow-xs"
                >
                  {language === 'en' ? 'Parse & Preview Data' : 'डेटा पार्स और समीक्षा करें'}
                </button>
              </div>

              {/* Parsed Rows Preview */}
              {parsedRows.length > 0 && (
                <div className="border rounded bg-neutral-50 p-4 space-y-4 shadow-sm">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h4 className="text-xs font-bold text-[#1A3A5C] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>{language === 'en' ? 'CSV Verification & Integrity Report:' : 'सीएसवी सत्यापन और विश्वसनीयता रिपोर्ट:'}</span>
                    </h4>
                  </div>

                  {/* Summary Indicators */}
                  <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                    <div className="bg-blue-50 p-2 rounded border border-blue-100">
                      <p className="text-gray-500 font-mono font-bold text-[10px] uppercase">{language === 'en' ? 'Total' : 'कुल रिकॉर्ड'}</p>
                      <p className="text-base font-extrabold text-blue-700 font-serif">{parsedRows.length}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded border border-green-100">
                      <p className="text-gray-500 font-mono font-bold text-[10px] uppercase">{language === 'en' ? 'Success' : 'सफल सत्यापित'}</p>
                      <p className="text-base font-extrabold text-[#2E7D32] font-serif">{parsedRows.filter(r => r.valid).length}</p>
                    </div>
                    <div className="bg-red-50 p-2 rounded border border-red-100">
                      <p className="text-gray-500 font-mono font-bold text-[10px] uppercase">{language === 'en' ? 'Failed' : 'अस्वीकृत'}</p>
                      <p className="text-base font-extrabold text-red-700 font-serif">{parsedRows.filter(r => !r.valid).length}</p>
                    </div>
                  </div>

                  <div className="divide-y text-xs text-gray-700 max-h-60 overflow-y-auto pr-1">
                    {parsedRows.map((row, idx) => (
                      <div key={idx} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                        <div className="space-y-0.5">
                          <p className="font-bold flex items-center gap-1.5 text-gray-800">
                            <span className="font-mono bg-zinc-200 px-1.5 py-0.5 rounded text-[10px]">Roll: {row.rollNo || 'N/A'}</span>
                            <span>{row.studentName}</span>
                          </p>
                          {row.error && (
                            <p className="text-[10px] text-red-600 flex items-center gap-1 font-mono leading-none">
                              <AlertCircle className="w-3 h-3 text-red-500" />
                              <span>{row.error}</span>
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-[#D4522A] bg-orange-600/5 px-2 py-0.5 rounded border border-[#D4522A]/10 text-[11px]">{row.marks} Marks</span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${row.valid ? 'bg-green-100 text-[#2E7D32]' : 'bg-red-100 text-red-700'}`}>
                            {row.valid ? 'Valid' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {parsedRows.filter(r => r.valid).length > 0 ? (
                    <button
                      type="button"
                      onClick={handleSubmitParsedMarks}
                      className="w-full py-2.5 bg-[#1A3A5C] hover:bg-[#1A3A5C]/95 text-white font-bold font-mono tracking-wide uppercase rounded text-xs shadow-md transition-colors"
                    >
                      {language === 'en' ? `Commit ${parsedRows.filter(r => r.valid).length} Verified Marks to Database` : `डेटाबेस में ${parsedRows.filter(r => r.valid).length} सत्यापित अंकों को सहेजें`}
                    </button>
                  ) : (
                    <div className="p-3 bg-red-100/50 border border-red-200 text-red-800 rounded font-bold text-center text-xs">
                      {language === 'en' ? 'No valid student marks available to commit.' : 'सहेजने के लिए कोई सत्यापित छात्र रिकॉर्ड उपलब्ध नहीं है।'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. ASSIGN HOMEWORK TASK */}
        {teacherTab === 'homework' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
              {strings.hwTab}
            </h3>

            {hwSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-[#2E7D32] text-xs font-bold rounded flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'en' ? 'Homework task allocated successfully!' : 'नया गृहकार्य आवंटित कर दिया गया है!'}</span>
              </div>
            )}

            <form onSubmit={handleHwSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Target Class:' : 'लक्षित वर्ग कक्षा:'}</label>
                  <select
                    value={hwClass}
                    onChange={(e) => setHwClass(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Class IX">Class IX</option>
                    <option value="Class X">Class X</option>
                    <option value="Class XI">Class XI</option>
                    <option value="Class XII">Class XII</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Assigned Subject:' : 'आवंटित विषय:'}</label>
                  <select
                    value={hwSubject}
                    onChange={(e) => setHwSubject(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Sanskrit">Sanskrit</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
                <div className="col-span-1 md:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Homework Title / Chapter Name' : 'शीर्षक / अध्याय का नाम'}</label>
                  <input
                    type="text"
                    value={hwTitle}
                    onChange={(e) => setHwTitle(e.target.value)}
                    placeholder="E.g., Practice sheet of Quadratic Equations"
                    className="w-full p-2.5 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Due Submission Date:' : 'अंतिम तिथि:'}</label>
                  <input
                    type="date"
                    value={hwDue}
                    onChange={(e) => setHwDue(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Describe Tasks questions:' : 'गृहकार्य प्रश्नों का स्पष्ट विवरण:'}</label>
                <textarea
                  rows={4}
                  value={hwDesc}
                  onChange={(e) => setHwDesc(e.target.value)}
                  placeholder="Solve Exercise 2.3 question 1 to 5 from Bihar matric book..."
                  className="w-full p-2.5 border border-gray-300 rounded resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1A3A5C] hover:bg-[#1A3A5C]/95 text-white font-bold font-mono tracking-wide uppercase rounded"
              >
                {language === 'en' ? 'Submit Assignment Notice' : 'गृहकार्य प्रेषित करें'}
              </button>
            </form>
          </div>
        )}

        {/* 4. SMART LESSON RESOURCES */}
        {teacherTab === 'material' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
              {strings.matTab}
            </h3>

            {matSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 text-[#2E7D32] text-xs font-bold rounded flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{language === 'en' ? 'Lesson study notes uploaded successfully!' : 'विषय पाठ्य सामग्री डेटाबेस पर दर्ज कर दी गई है!'}</span>
              </div>
            )}

            <form onSubmit={handleMaterialSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Target Standard Class:' : 'लक्षित वर्ग कक्षा:'}</label>
                  <select
                    value={matClass}
                    onChange={(e) => setMatClass(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Class IX">Class IX</option>
                    <option value="Class X">Class X</option>
                    <option value="Class XI">Class XI</option>
                    <option value="Class XII">Class XII</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Subject Name:' : 'विषय चयन:'}</label>
                  <select
                    value={matSub}
                    onChange={(e) => setMatSub(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Sanskrit">Sanskrit</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Interactive Guide Topic or Notes Name:' : 'अध्ययन नोट्स / पाठ्य विषय नाम विवरण:'}</label>
                <input
                  type="text"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="E.g., Lesson 4: Biology circulatory diagram helper"
                  className="w-full p-2.5 border border-gray-300 text-xs rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Approx File Size (MB):' : 'फाइल आकार:'}</label>
                  <input
                    type="text"
                    value={matSize}
                    onChange={(e) => setMatSize(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 text-xs rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Virtual URL Gateway Link:' : 'वर्चुअल यूआरएल लिंक:'}</label>
                  <input
                    type="text"
                    value={matUrl}
                    onChange={(e) => setMatUrl(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 text-xs rounded"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 select-none py-1.5 border-y my-2">
                <input
                  type="checkbox"
                  id="lotsValue"
                  checked={matIsELots}
                  onChange={(e) => setMatIsELots(e.target.checked)}
                  className="w-4 h-4 border-gray-300 rounded"
                />
                <label htmlFor="lotsValue" className="font-bold text-gray-700">
                  {language === 'en' ? 'This is affiliated with Bihar e-LOTS Educational framework' : 'यह बिहार ई-लॉट्स (e-LOTS) प्राथमिक शैक्षणिक पोर्टल से संबद्ध है'}
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#1A3A5C] hover:bg-[#1A3A5C]/95 text-white font-bold font-mono tracking-wide uppercase rounded"
              >
                {language === 'en' ? 'Upload lesson Resources' : 'रिसोर्स अपलोड करें'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
