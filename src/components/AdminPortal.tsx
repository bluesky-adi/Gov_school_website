import React, { useState } from 'react';
import { useAppState } from '../AppContext.tsx';
import { UserRole, NoticeCategory, Notice, TeacherProfile, TimetableEntry, Book, ScholarshipScheme, StudyMaterial, StudentProfile, ExamResult } from '../types.ts';
import { ClipboardList, Megaphone, ShieldCheck, MessageSquare, Award, CheckSquare, PlusCircle, HelpCircle, Download, Users, FolderOpen, Database, Trash2, Edit3, Save, XCircle, AlertCircle } from 'lucide-react';
import { exportCertificatePDF } from '../utils/pdfExport.ts';
import { storage } from '../firebase.ts';

export const AdminPortal: React.FC = () => {
  const {
    language,
    user,
    students,
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    grievances,
    resolveGrievance,
    certificates,
    updateCertificateStatus,
    setMedhasoftVerifiedState,
    adminTab,
    setAdminTab,
    
    // User Management
    usersList,
    manageUserCreate,
    manageUserUpdate,
    manageUserDelete,
    sendPasswordReset,

    // Teachers CMS
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,

    // Timetable CMS
    timetable,
    addTimetableEntry,
    updateTimetableEntry,
    deleteTimetableEntry,

    // Books Library CMS
    books,
    addBook,
    updateBook,
    deleteBook,

    // Schemes CMS
    schemes,
    addScheme,
    updateScheme,
    deleteScheme,

    // Study Materials
    studyMaterials,
    addStudyMaterial,
    updateStudyMaterial,
    deleteStudyMaterial,

    // Import utilities
    submitBulkResults,
    submitBulkAttendance,
    addStudent,
    updateStudent,
    deleteStudent,

    // School Settings
    schoolSettings,
    updateSchoolSettings
  } = useAppState();

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-red-50 border border-red-200 text-red-950 rounded-lg space-y-4 shadow-sm text-xs select-none">
        <h2 className="font-serif font-black text-sm flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Access Denied / अनाधिकृत प्रवेश</span>
        </h2>
        <p className="leading-relaxed">
          You do not have administrative credentials to view this portal ledger. This attempt has been logged.
        </p>
      </div>
    );
  }

  // School Settings form state
  const [setsNameEn, setSetsNameEn] = useState(schoolSettings.schoolNameEn);
  const [setsNameHi, setSetsNameHi] = useState(schoolSettings.schoolNameHi);
  const [setsPrincEn, setSetsPrincEn] = useState(schoolSettings.principalNameEn);
  const [setsPrincHi, setSetsPrincHi] = useState(schoolSettings.principalNameHi);
  const [setsDesigEn, setSetsDesigEn] = useState(schoolSettings.principalDesignationEn);
  const [setsDesigHi, setSetsDesigHi] = useState(schoolSettings.principalDesignationHi);
  const [setsMsgEn, setSetsMsgEn] = useState(schoolSettings.principalMessageEn);
  const [setsMsgHi, setSetsMsgHi] = useState(schoolSettings.principalMessageHi);
  const [setsPrincQualEn, setSetsPrincQualEn] = useState(schoolSettings.principalQualificationsEn || '');
  const [setsPrincQualHi, setSetsPrincQualHi] = useState(schoolSettings.principalQualificationsHi || '');
  const [setsPhone, setSetsPhone] = useState(schoolSettings.phone);
  const [setsEmail, setSetsEmail] = useState(schoolSettings.email);
  const [setsAddrEn, setSetsAddrEn] = useState(schoolSettings.addressEn);
  const [setsAddrHi, setSetsAddrHi] = useState(schoolSettings.addressHi);
  const [setsUdise, setSetsUdise] = useState(schoolSettings.udise);
  const [setsBseb, setSetsBseb] = useState(schoolSettings.bsebCode);
  const [setsTeachCount, setSetsTeachCount] = useState(schoolSettings.teacherCount);
  const [setsStudCount, setSetsStudCount] = useState(schoolSettings.studentCount);
  const [setsPassRate, setSetsPassRate] = useState(schoolSettings.passRate);
  const [setsEstYear, setSetsEstYear] = useState(schoolSettings.establishmentYear);
  const [setsLogo, setSetsLogo] = useState(schoolSettings.logo || '/logo.png');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Keep form state in sync with loaded firebase settings
  React.useEffect(() => {
    setSetsNameEn(schoolSettings.schoolNameEn);
    setSetsNameHi(schoolSettings.schoolNameHi);
    setSetsPrincEn(schoolSettings.principalNameEn);
    setSetsPrincHi(schoolSettings.principalNameHi);
    setSetsDesigEn(schoolSettings.principalDesignationEn);
    setSetsDesigHi(schoolSettings.principalDesignationHi);
    setSetsMsgEn(schoolSettings.principalMessageEn);
    setSetsMsgHi(schoolSettings.principalMessageHi);
    setSetsPrincQualEn(schoolSettings.principalQualificationsEn || '');
    setSetsPrincQualHi(schoolSettings.principalQualificationsHi || '');
    setSetsPhone(schoolSettings.phone);
    setSetsEmail(schoolSettings.email);
    setSetsAddrEn(schoolSettings.addressEn);
    setSetsAddrHi(schoolSettings.addressHi);
    setSetsUdise(schoolSettings.udise);
    setSetsBseb(schoolSettings.bsebCode);
    setSetsTeachCount(schoolSettings.teacherCount);
    setSetsStudCount(schoolSettings.studentCount);
    setSetsPassRate(schoolSettings.passRate);
    setSetsEstYear(schoolSettings.establishmentYear);
    setSetsLogo(schoolSettings.logo || '/logo.png');
  }, [schoolSettings]);

  // Stats Counters
  const totalPupils = students.length;
  const medhaVerified = students.filter((s) => s.medhasoftStatus === 'Verified').length;
  const dbtDisbursed = students.filter((s) => s.dbtPaymentStatus === 'Payment Disbursed').length;

  // New Notice form state
  const [noticeTitleEn, setNoticeTitleEn] = useState('');
  const [noticeTitleHi, setNoticeTitleHi] = useState('');
  const [noticeContentEn, setNoticeContentEn] = useState('');
  const [noticeContentHi, setNoticeContentHi] = useState('');
  const [noticeCat, setNoticeCat] = useState<NoticeCategory>('Academic');
  const [noticeUrgent, setNoticeUrgent] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<string | null>(null);
  const [noticePdfUrl, setNoticePdfUrl] = useState('');

  // Resolution text states
  const [resNoteEn, setResNoteEn] = useState('');
  const [resNoteHi, setResNoteHi] = useState('');
  const [activeHandlingGrievanceId, setActiveHandlingGrievanceId] = useState<string | null>(null);

  // --- USER CREATION FORM STATE ---
  const [newUserNameEn, setNewUserNameEn] = useState('');
  const [newUserNameHi, setNewUserNameHi] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.STUDENT);
  const [newUserStatus, setNewUserStatus] = useState<'Active' | 'Disabled'>('Active');
  const [newUserSuccess, setNewUserSuccess] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');

  // --- CMS ACTIVE SECTION STATE ---
  const [cmsSection, setCmsSection] = useState<'teachers' | 'students' | 'timetable' | 'schemes' | 'books' | 'studyMaterials'>('teachers');
  
  // Teachers FormState / EditState
  const [newTeacherNameEn, setNewTeacherNameEn] = useState('');
  const [newTeacherNameHi, setNewTeacherNameHi] = useState('');
  const [newTeacherDesEn, setNewTeacherDesEn] = useState('');
  const [newTeacherDesHi, setNewTeacherDesHi] = useState('');
  const [newTeacherFormOpen, setNewTeacherFormOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [newTeacherSubjectEn, setNewTeacherSubjectEn] = useState('');
  const [newTeacherSubjectHi, setNewTeacherSubjectHi] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherDob, setNewTeacherDob] = useState('1990-01-01');
  const [newTeacherQualEn, setNewTeacherQualEn] = useState('B.Ed, Qualified Teacher');
  const [newTeacherQualHi, setNewTeacherQualHi] = useState('बी.एड, योग्य शिक्षक');
  const [newTeacherAvatarUrl, setNewTeacherAvatarUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Students FormState / EditState
  const [studentFormOpen, setStudentFormOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studRollNo, setStudRollNo] = useState('');
  const [studEmail, setStudEmail] = useState('');
  const [studNameEn, setStudNameEn] = useState('');
  const [studNameHi, setStudNameHi] = useState('');
  const [studClassName, setStudClassName] = useState<'Class IX' | 'Class X' | 'Class XI' | 'Class XII'>('Class IX');
  const [studSection, setStudSection] = useState<'A' | 'B' | 'C'>('A');
  const [studFatherEn, setStudFatherEn] = useState('');
  const [studFatherHi, setStudFatherHi] = useState('');
  const [studMotherEn, setStudMotherEn] = useState('');
  const [studMotherHi, setStudMotherHi] = useState('');
  const [studDOB, setStudDOB] = useState('2011-01-01');
  const [studCategory, setStudCategory] = useState<'General' | 'OBC' | 'EBC' | 'SC' | 'ST'>('General');
  const [studBank, setStudBank] = useState('');
  const [studIFSC, setStudIFSC] = useState('');
  const [studMedhasoft, setStudMedhasoft] = useState<'Verified' | 'Pending Verification' | 'Rejected' | 'Not Registered'>('Pending Verification');
  const [studDBT, setStudDBT] = useState<'Payment Disbursed' | 'In Process' | 'Aadhaar Account Link Pending' | 'Details Required'>('In Process');
  const [studStatus, setStudStatus] = useState<'Active' | 'Transferred' | 'Disabled'>('Active');
  const [studSearch, setStudSearch] = useState('');
  const [studClassFilter, setStudClassFilter] = useState('All');

  // Timetable FormState
  const [newTtClass, setNewTtClass] = useState('Class X');
  const [newTtSection, setNewTtSection] = useState('A');
  const [newTtDay, setNewTtDay] = useState('Monday');
  const [newTtPeriod, setNewTtPeriod] = useState(1);
  const [newTtTime, setNewTtTime] = useState('09:00 AM - 09:45 AM');
  const [newTtSubEn, setNewTtSubEn] = useState('');
  const [newTtSubHi, setNewTtSubHi] = useState('');
  const [newTtTeacherEn, setNewTtTeacherEn] = useState('');
  const [newTtTeacherHi, setNewTtTeacherHi] = useState('');
  const [newTtFormOpen, setNewTtFormOpen] = useState(false);
  const [editingTtId, setEditingTtId] = useState<string | null>(null);

  // Books FormState
  const [newBookTitleEn, setNewBookTitleEn] = useState('');
  const [newBookTitleHi, setNewBookTitleHi] = useState('');
  const [newBookAuthorEn, setNewBookAuthorEn] = useState('');
  const [newBookAuthorHi, setNewBookAuthorHi] = useState('');
  const [newBookAccessionNo, setNewBookAccessionNo] = useState('');
  const [newBookShelf, setNewBookShelf] = useState('');
  const [newBookFormOpen, setNewBookFormOpen] = useState(false);

  // Schemes FormState
  const [newSchemeTitleEn, setNewSchemeTitleEn] = useState('');
  const [newSchemeTitleHi, setNewSchemeTitleHi] = useState('');
  const [newSchemeCat, setNewSchemeCat] = useState('Bicycle');
  const [newSchemeDescEn, setNewSchemeDescEn] = useState('');
  const [newSchemeDescHi, setNewSchemeDescHi] = useState('');
  const [newSchemeFormOpen, setNewSchemeFormOpen] = useState(false);

  // --- BATCH IMPORTS WORKFLOW STATES ---
  const [importDataset, setImportDataset] = useState<'students' | 'teachers' | 'timetable' | 'results'>('students');
  const [importCsvText, setImportCsvText] = useState('');
  const [importValidationErrors, setImportValidationErrors] = useState<string[]>([]);
  const [importSuccessRows, setImportSuccessRows] = useState<number | null>(null);

  // CSV Import Core Handlers
  const handleStudentsCSVImport = (text: string) => {
    const errors: string[] = [];
    const rows = text.split('\n').map(r => r.trim()).filter(Boolean);
    if (rows.length === 0) {
      setImportValidationErrors(["Empty import data."]);
      return;
    }
    const importedRows: Omit<StudentProfile, 'id'>[] = [];
    rows.forEach((row, idx) => {
      const cols = row.split(',').map(c => c.trim());
      if (cols.length < 5) {
        errors.push(`Row ${idx + 1}: Expected at least 5 cols (NameEn, NameHi, Class, Section, RollNo). Got ${cols.length}`);
        return;
      }
      const [nameEn, nameHi, className, section, rollNoStr] = cols;
      if (!nameEn) errors.push(`Row ${idx + 1}: English name is required.`);
      if (!nameHi) errors.push(`Row ${idx + 1}: Hindi name is required.`);
      if (className !== "Class IX" && className !== "Class X" && className !== "Class XI" && className !== "Class XII") {
        errors.push(`Row ${idx + 1}: Class name must be Class IX, Class X, Class XI, or Class XII. Got "${className}".`);
      }
      if (section !== "A" && section !== "B" && section !== "C") {
        errors.push(`Row ${idx + 1}: Section must be A, B, or C. Got "${section}".`);
      }
      
      const rollNo = parseInt(rollNoStr, 10);
      if (isNaN(rollNo) || rollNo <= 0) {
        errors.push(`Row ${idx + 1}: Roll number "${rollNoStr}" must be a positive integer.`);
      }
      
      if (errors.length === 0) {
        importedRows.push({
          nameEn,
          nameHi,
          className: className as any,
          section: section as any,
          rollNo: rollNoStr,
          fatherNameEn: "Not Provided",
          fatherNameHi: "दर्ज नहीं",
          motherNameEn: "Not Provided",
          motherNameHi: "दर्ज नहीं",
          dob: "2011-01-01",
          category: "General",
          bankAccountLast4: "1234",
          ifscCode: "SBIN0001234",
          medhasoftStatus: 'Pending Verification',
          dbtPaymentStatus: 'In Process'
        });
      }
    });

    if (errors.length > 0) {
      setImportValidationErrors(errors);
      setImportSuccessRows(null);
    } else {
      setImportValidationErrors([]);
      importedRows.forEach(row => addStudent(row));
      setImportSuccessRows(importedRows.length);
      setImportCsvText('');
    }
  };

  const handleTeachersCSVImport = (text: string) => {
    const errors: string[] = [];
    const rows = text.split('\n').map(r => r.trim()).filter(Boolean);
    const imported: Omit<TeacherProfile, 'id'>[] = [];
    rows.forEach((row, idx) => {
      const cols = row.split(',').map(c => c.trim());
      if (cols.length < 5) {
        errors.push(`Row ${idx + 1}: Expected NameEn, NameHi, Designation, Subject, Email.`);
        return;
      }
      const [nameEn, nameHi, designation, subject, email] = cols;
      if (!nameEn || !nameHi || !designation || !subject || !email) {
        errors.push(`Row ${idx + 1}: All fields are required.`);
      }
      if (email && !email.includes('@')) {
        errors.push(`Row ${idx + 1}: Invalid email address "${email}".`);
      }
      if (errors.length === 0) {
        imported.push({
          nameEn,
          nameHi,
          designationEn: designation,
          designationHi: designation,
          qualificationEn: "Graduate, B.Ed",
          qualificationHi: "स्नातक, बी.एड",
          subjectsEn: [subject],
          subjectsHi: [subject],
          email
        });
      }
    });

    if (errors.length > 0) {
      setImportValidationErrors(errors);
      setImportSuccessRows(null);
    } else {
      setImportValidationErrors([]);
      imported.forEach(row => addTeacher(row));
      setImportSuccessRows(imported.length);
      setImportCsvText('');
    }
  };

  const handleTimetableCSVImport = (text: string) => {
    const errors: string[] = [];
    const rows = text.split('\n').map(r => r.trim()).filter(Boolean);
    const imported: Omit<TimetableEntry, 'id'>[] = [];
    rows.forEach((row, idx) => {
      const cols = row.split(',').map(c => c.trim());
      if (cols.length < 7) {
        errors.push(`Row ${idx + 1}: Expected Class, Section, Day, Period, TimeSlot, Subject, Teacher.`);
        return;
      }
      const [cls, sec, day, periodStr, time, sub, teach] = cols;
      const period = parseInt(periodStr, 10);
      if (isNaN(period) || period < 1 || period > 8) {
        errors.push(`Row ${idx + 1}: Period must be between 1 and 8.`);
      }
      if (errors.length === 0) {
        imported.push({
          className: cls,
          section: sec,
          day: day as any,
          period,
          time,
          subjectEn: sub,
          subjectHi: sub,
          teacherEn: teach,
          teacherHi: teach
        });
      }
    });

    if (errors.length > 0) {
      setImportValidationErrors(errors);
      setImportSuccessRows(null);
    } else {
      setImportValidationErrors([]);
      imported.forEach(row => addTimetableEntry(row));
      setImportSuccessRows(imported.length);
      setImportCsvText('');
    }
  };

  const handleResultsCSVImport = (text: string) => {
    const errors: string[] = [];
    const rows = text.split('\n').map(r => r.trim()).filter(Boolean);
    const imported: ExamResult[] = [];
    rows.forEach((row, idx) => {
      const cols = row.split(',').map(c => c.trim());
      if (cols.length < 5) {
        errors.push(`Row ${idx + 1}: Expected StudentId, Subject, Marks, Grade, Term.`);
        return;
      }
      const [studentId, subject, marksStr, grade, term] = cols;
      const marks = parseInt(marksStr, 10);
      if (isNaN(marks) || marks < 0 || marks > 100) {
        errors.push(`Row ${idx + 1}: Marks must be between 0 and 100. Got "${marksStr}".`);
      }
      if (errors.length === 0) {
        imported.push({
          id: `res_csv_${Date.now()}_${idx}`,
          studentId,
          examNameEn: term || 'Terminal Examination',
          examNameHi: 'सत्र परीक्षा',
          academicYear: '2026-27',
          subBlockMarks: [
            {
              subjectEn: subject,
              subjectHi: subject,
              fullMarks: 100,
              passMarks: 33,
              marksObtained: marks,
              grade
            }
          ],
          totalPercentage: marks,
          grade,
          resultStatus: marks >= 33 ? 'PASS' : 'FAIL',
          remarksEn: 'Imported via bulk CSV ledger.',
          remarksHi: 'थोक डेटा आयात के माध्यम से दर्ज।'
        });
      }
    });

    if (errors.length > 0) {
      setImportValidationErrors(errors);
      setImportSuccessRows(null);
    } else {
      setImportValidationErrors([]);
      submitBulkResults(imported);
      setImportSuccessRows(imported.length);
      setImportCsvText('');
    }
  };

  const handleRunBatchImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importCsvText.trim()) return;
    if (importDataset === 'students') handleStudentsCSVImport(importCsvText);
    else if (importDataset === 'teachers') handleTeachersCSVImport(importCsvText);
    else if (importDataset === 'timetable') handleTimetableCSVImport(importCsvText);
    else if (importDataset === 'results') handleResultsCSVImport(importCsvText);
  };

  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSchoolSettings({
        schoolNameEn: setsNameEn,
        schoolNameHi: setsNameHi,
        principalNameEn: setsPrincEn,
        principalNameHi: setsPrincHi,
        principalDesignationEn: setsDesigEn,
        principalDesignationHi: setsDesigHi,
        principalMessageEn: setsMsgEn,
        principalMessageHi: setsMsgHi,
        principalQualificationsEn: setsPrincQualEn,
        principalQualificationsHi: setsPrincQualHi,
        phone: setsPhone,
        email: setsEmail,
        addressEn: setsAddrEn,
        addressHi: setsAddrHi,
        udise: setsUdise,
        bsebCode: setsBseb,
        teacherCount: Number(setsTeachCount),
        studentCount: Number(setsStudCount),
        passRate: setsPassRate,
        establishmentYear: Number(setsEstYear),
        logo: setsLogo
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update school settings:", err);
    }
  };

  if (!user || user.role !== UserRole.ADMIN) {
    return <div className="p-12 text-center text-sm font-bold text-red-500 bg-white rounded">Access Restricted: Principal Authentication Required.</div>;
  }

  // Handle new notice publish
  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitleEn.trim() || !noticeContentEn.trim()) return;

    const noticeFields = {
      titleEn: noticeTitleEn,
      titleHi: noticeTitleHi || noticeTitleEn,
      contentEn: noticeContentEn,
      contentHi: noticeContentHi || noticeContentEn,
      category: noticeCat,
      isUrgent: noticeUrgent,
      isPinned: noticeUrgent,
      author: 'Principal Desk',
      pdfUrl: noticePdfUrl || undefined
    };

    if (editingNoticeId) {
      await updateNotice(editingNoticeId, noticeFields);
    } else {
      await addNotice(noticeFields);
    }

    setNoticeSuccess(true);
    setNoticeTitleEn('');
    setNoticeTitleHi('');
    setNoticeContentEn('');
    setNoticeContentHi('');
    setNoticeUrgent(false);
    setNoticePdfUrl('');
    setEditingNoticeId(null);
    setTimeout(() => setNoticeSuccess(false), 3000);
  };

  // Resolve complaint action
  const handleResolveGrievanceSubmit = (id: string) => {
    if (!resNoteEn.trim()) return;
    resolveGrievance(id, resNoteEn, resNoteHi || resNoteEn);
    setResNoteEn('');
    setResNoteHi('');
    setActiveHandlingGrievanceId(null);
  };

  // Toggle medhasoft verification state
  const handleToggleMedhasoft = (sId: string, current: string) => {
    const nextState = current === 'Verified' ? 'Pending Verification' : 'Verified';
    setMedhasoftVerifiedState(sId, nextState);
  };

  // Approve Certificate status
  const handleApproveCertStatus = (id: string) => {
    updateCertificateStatus(id, 'Ready for Collection', 'Certificate approved. Collected copy must be physically signed at Head Desk.', 'प्रमाण पत्र स्वीकृत। प्रधानाध्यापिका कार्यालय से मूल प्रति प्राप्त करें।');
  };

  const labels = {
    dash: language === 'en' ? 'Administration Dashboard' : 'प्रशासन अवलोकन (डैशबोर्ड)',
    notices: language === 'en' ? 'Announce New Notices' : 'नया नोटिस प्रकाशित करें',
    yojanas: language === 'en' ? 'Medhasoft DBT Verification' : 'मेधासॉफ्ट डीबीटी सत्यापन',
    grievances: language === 'en' ? 'Grievance Resolution Desk' : 'शिकायत निवारण प्रबंधन',
    certificates: language === 'en' ? 'Approve Scanned Certificates' : 'प्रमाण पत्र अनुमोदन',
    users: language === 'en' ? 'User Accounts & Roles' : 'प्रयोक्ता खाते एवं भूमिकाएँ',
    cms: language === 'en' ? 'Unified CMS Editor' : 'एकीकृत स्कूल सीएमएस संपादक',
    imports: language === 'en' ? 'CSV Import Center' : 'सीएसवी आयात केंद्र',
    settings: language === 'en' ? 'School settings' : 'स्कूल सेटिंग्स / विन्यास'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-[#1C1C1E] grid grid-cols-1 lg:grid-cols-4 gap-6">
      
      {/* Sidebar layout */}
      <div className="bg-[#1A3A5C] text-white p-5 rounded-lg shadow-md space-y-4 font-mono h-fit no-print">
        <div className="border-b border-white/10 pb-3">
          <span className="text-[9px] bg-[#D4522A] px-2 py-0.5 rounded text-white font-bold block w-fit mb-1.5 uppercase">
            {language === 'en' ? 'Principal Head' : 'प्रधानाचार्या प्रशासन'}
          </span>
          <h3 className="text-sm font-bold truncate">{language === 'en' ? user.nameEn : user.nameHi}</h3>
          <p className="text-[11px] text-[#F7F3EE]/80 mt-0.5">Office of Education, Begusarai</p>
        </div>

        <nav className="flex flex-col gap-1.5 text-xs font-bold">
          {[
            { tag: 'dash', label: labels.dash, icon: <CheckSquare className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'notices', label: labels.notices, icon: <Megaphone className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'yojanas', label: labels.yojanas, icon: <ShieldCheck className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'grievances', label: labels.grievances, icon: <MessageSquare className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'certificates', label: labels.certificates, icon: <ClipboardList className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'users', label: labels.users, icon: <Users className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'cms', label: labels.cms, icon: <FolderOpen className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'imports', label: labels.imports, icon: <Database className="w-4 h-4 text-[#D4522A]" /> },
            { tag: 'settings', label: labels.settings, icon: <Save className="w-4 h-4 text-[#D4522A]" /> }
          ].map((tab) => (
            <button
              key={tab.tag}
              onClick={() => setAdminTab(tab.tag as any)}
              className={`flex items-center gap-2.5 p-2.5 rounded transition ${adminTab === tab.tag ? 'bg-[#D4522A] text-white shadow-md' : 'hover:bg-white/5'}`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Panel workspace */}
      <div className="lg:col-span-3 space-y-5">
        
        {/* 1. ADMIN OVERVIEW HOME */}
        {adminTab === 'dash' && (
          <div className="space-y-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-4 rounded shadow-xs border-l-4 border-[#1A3A5C]">
                <span className="text-gray-400 font-mono uppercase text-[10px]">Total Enrolled Girls:</span>
                <p className="text-2xl font-black text-gray-900 font-mono mt-1">{totalPupils}</p>
              </div>
              <div className="bg-white p-4 rounded shadow-xs border-l-4 border-amber-600">
                <span className="text-gray-400 font-mono uppercase text-[10px]">Medhasoft Verified Rate:</span>
                <p className="text-2xl font-black text-amber-600 font-mono mt-1">{medhaVerified} / {totalPupils}</p>
              </div>
              <div className="bg-white p-4 rounded shadow-xs border-l-4 border-emerald-600">
                <span className="text-gray-400 font-mono uppercase text-[10px]">Scholarships Disbursed:</span>
                <p className="text-2xl font-black text-emerald-600 font-mono mt-1">{dbtDisbursed} Pupils</p>
              </div>
            </div>

            {/* School Ledger Table */}
            <div className="bg-white p-5 rounded shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-700 tracking-wider uppercase">{language === 'en' ? 'BSEB Registered Student Database Registry' : 'पंजीकृत विद्यालय छात्रा डेटाबेस'}</h3>
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-100 text-gray-500 font-bold border-b">
                      <th className="p-2 font-mono uppercase">Roll No</th>
                      <th className="p-2">{language === 'en' ? 'Name En' : 'नाम'}</th>
                      <th className="p-2">{language === 'en' ? 'Standards' : 'कक्षा'}</th>
                      <th className="p-2">{language === 'en' ? 'Father Name' : 'अभिभावक पिता'}</th>
                      <th className="p-2 font-mono uppercase">Medhasoft</th>
                      <th className="p-2 font-mono uppercase">DBT Cash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-neutral-50 text-gray-800">
                        <td className="p-2 font-mono text-[#D4522A]">{st.rollNo}</td>
                        <td className="p-2 font-bold">{st.nameEn}</td>
                        <td className="p-2 text-gray-500">{st.className}</td>
                        <td className="p-2">{st.fatherNameEn}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                            st.medhasoftStatus === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {st.medhasoftStatus}
                          </span>
                        </td>
                        <td className="p-2 text-gray-400">{st.dbtPaymentStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 2. NOTICE PUBLISH DASHBOARD */}
        {adminTab === 'notices' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded shadow-xs space-y-4">
              <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2 flex justify-between items-center">
                <span>{editingNoticeId ? (language === 'en' ? 'Edit Notice/Circular' : 'सूचना विवरण संपादित करें') : labels.notices}</span>
                {editingNoticeId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNoticeId(null);
                      setNoticeTitleEn('');
                      setNoticeTitleHi('');
                      setNoticeContentEn('');
                      setNoticeContentHi('');
                      setNoticeUrgent(false);
                      setNoticePdfUrl('');
                    }}
                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-mono font-bold text-[10px] rounded"
                  >
                    {language === 'en' ? 'Cancel Edit' : 'संपादित रद्द करें'}
                  </button>
                )}
              </h3>

              {noticeSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 text-[#2E7D32] text-xs font-bold rounded flex items-center gap-1.5 animate-pulse">
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'en' ? 'Notice saved successfully to public website board!' : 'नया सूचना विवरण पट्ट पर सहेज दिया गया है!'}</span>
                </div>
              )}

              <form onSubmit={handlePublishNotice} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Notice Header Title (English)' : 'सूचना शीर्षक विवरण (अंग्रेजी)'}</label>
                    <input
                      type="text"
                      value={noticeTitleEn}
                      onChange={(e) => setNoticeTitleEn(e.target.value)}
                      placeholder="E.g., Scholarship correction dates extend"
                      className="w-full p-2.5 border border-gray-300 rounded bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Notice Header Title (Hindi)' : 'सूचना शीर्षक विवरण (हिन्दी)'}</label>
                    <input
                      type="text"
                      value={noticeTitleHi}
                      onChange={(e) => setNoticeTitleHi(e.target.value)}
                      placeholder="जैसे, मेधासॉफ्ट सुधार तिथि बढ़ाई गई"
                      className="w-full p-2.5 border border-gray-300 rounded bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Category Tag:' : 'परिपत्र श्रेणी:'}</label>
                    <select
                      value={noticeCat}
                      onChange={(e: any) => setNoticeCat(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded bg-white font-bold"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Examination">Examination</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Admission">Admission</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 select-none py-2 px-1">
                    <input
                      type="checkbox"
                      id="urgentTask"
                      checked={noticeUrgent}
                      onChange={(e) => setNoticeUrgent(e.target.checked)}
                      className="w-4 h-4 border-gray-300 rounded"
                    />
                    <label htmlFor="urgentTask" className="font-bold text-red-600">
                      {language === 'en' ? 'Flag as URGENT (Flashing text alerts)' : 'अति आवश्यक मार्क करें'}
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Complete Announcement text (English)' : 'सूचना विषय विवरण (अंग्रेजी)'}</label>
                    <textarea
                      rows={4}
                      value={noticeContentEn}
                      onChange={(e) => setNoticeContentEn(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded bg-white resize-none"
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">{language === 'en' ? 'Complete Announcement text (Hindi)' : 'सूचना विषय विवरण (हिन्दी)'}</label>
                    <textarea
                      rows={4}
                      value={noticeContentHi}
                      onChange={(e) => setNoticeContentHi(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded bg-white resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Circular Upload Section */}
                <div className="p-3 border rounded bg-neutral-50/50 space-y-2">
                  <label className="block font-bold text-gray-700">
                    {language === 'en' ? 'Attach Circular (PDF Form File Upload)' : 'परिपत्र संलग्‍न करें (PDF अपलोड)'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noticePdfUrl}
                      onChange={(e) => setNoticePdfUrl(e.target.value)}
                      placeholder="Enter PDF URL or use file upload button ->"
                      className="flex-1 p-2 border border-gray-300 rounded bg-white font-mono text-xs"
                    />
                    <label className="p-2 border bg-white hover:bg-neutral-50 cursor-pointer text-xs font-bold rounded flex items-center justify-center gap-1 select-none text-gray-700">
                      <Download className="w-3.5 h-3.5 text-[#D4522A]" />
                      <span>{language === 'en' ? 'Choose Circular Document' : 'दस्तावेज़ चुनें'}</span>
                      <input
                        type="file"
                        accept="application/pdf, image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                setNoticePdfUrl(reader.result);
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {noticePdfUrl ? (
                    <div className="flex items-center justify-between p-2 bg-[#2E7D32]/5 border border-[#2E7D32]/20 text-[#2E7D32] rounded text-[11px] font-semibold">
                      <span className="truncate">📎 Verified Circular: {noticePdfUrl.substring(0, 45)}...</span>
                      <div className="flex gap-2">
                        <a href={noticePdfUrl} target="_blank" rel="noreferrer" className="underline text-[#D4522A] font-bold">
                          {language === 'en' ? 'Preview Attached Client Circular' : 'अवलोकन'}
                        </a>
                        <button type="button" onClick={() => setNoticePdfUrl('')} className="text-red-600 hover:underline font-bold">
                          {language === 'en' ? 'Remove' : 'हटाएं'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 italic">
                      {language === 'en' ? 'Optional: PDF circular file is hidden from preview when no file exists.' : 'वैकल्पिक: कोई फाइल संलग्‍न न होने पर छात्रों के अवलोकन से हटा दी जाती है।'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1C1C1E] hover:bg-neutral-900 text-white font-mono font-bold tracking-wide uppercase rounded"
                >
                  {editingNoticeId ? (language === 'en' ? 'Save Editorial Changes' : 'संपादित सूचना सुरक्षित करें') : (language === 'en' ? 'Publish Circular Circulars' : 'सर्कुलर जारी करें')}
                </button>
              </form>
            </div>

            {/* Active Circulars directory */}
            <div className="bg-white p-5 rounded shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-[#1A3A5C] font-mono border-b pb-1.5 uppercase">
                {language === 'en' ? 'Published Bulletins & Archives' : 'जारी किए गए परिपत्र एवं सूचना पट्ट'}
              </h4>

              <div className="border rounded overflow-x-auto text-[11px] font-semibold text-gray-600">
                <table className="w-full text-left">
                  <thead className="bg-[#112335] text-white select-none">
                    <tr>
                      <th className="p-2 font-mono text-[10px] uppercase">Category</th>
                      <th className="p-2">{language === 'en' ? 'Title' : 'शीर्षक'}</th>
                      <th className="p-2 text-center">Urgent?</th>
                      <th className="p-2 text-center">Attachment</th>
                      <th className="p-2 text-right">{language === 'en' ? 'Control Handlers' : 'नियंत्रण'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold">
                    {notices.map((nt) => (
                      <tr key={nt.id} className="hover:bg-neutral-50">
                        <td className="p-2 font-mono">
                          <span className="px-1.5 py-0.5 bg-neutral-100 border text-neutral-800 rounded text-[9px] font-bold uppercase">
                            {nt.category}
                          </span>
                        </td>
                        <td className="p-2">
                          <p className="text-[#1A3A5C]">{language === 'en' ? nt.titleEn : nt.titleHi}</p>
                          <p className="text-[9px] text-zinc-400 font-normal font-mono">{nt.publishedDate}</p>
                        </td>
                        <td className="p-2 text-center">
                          {nt.isUrgent ? (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[9px] font-bold rounded animate-pulse">URGENT</span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">No</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {nt.pdfUrl ? (
                            <a href={nt.pdfUrl} target="_blank" rel="noreferrer" className="text-[#D4522A] hover:underline text-[10px] inline-flex items-center gap-0.5">
                              📎 {language === 'en' ? 'Active File' : 'दस्तावेज़'}
                            </a>
                          ) : (
                            <span className="text-zinc-400 italic text-[10px]">{language === 'en' ? 'No PDF' : 'संलग्न नहीं'}</span>
                          )}
                        </td>
                        <td className="p-2 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoticeId(nt.id);
                              setNoticeTitleEn(nt.titleEn);
                              setNoticeTitleHi(nt.titleHi || '');
                              setNoticeContentEn(nt.contentEn);
                              setNoticeContentHi(nt.contentHi || '');
                              setNoticeCat(nt.category);
                              setNoticeUrgent(nt.isUrgent);
                              setNoticePdfUrl(nt.pdfUrl || '');
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-gray-700 border rounded text-[10px]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Irreversible Action: Confirmed deletion of circular "${nt.titleEn}"?`)) {
                                await deleteNotice(nt.id);
                              }
                            }}
                            className="px-2 py-0.5 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 rounded text-[10px]"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. YOJANA APPLICATION APPROVAL checklist */}
        {adminTab === 'yojanas' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
              {labels.yojanas}
            </h3>

            <div className="space-y-3 text-xs">
              <p className="text-gray-500 italic">
                {language === 'en' ? 'Toggle verification status directly. Correct verified status flows instantly to respective parent portals.' : 'अभिभावक पोर्टल पर सीधे अपडेट भेजने के लिए निम्न सत्यापित बटन का उपयोग करें।'}
              </p>
              
              <div className="border rounded overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#132A43] text-white">
                    <tr>
                      <th className="p-2.5 font-mono text-[10px] uppercase">Roll No</th>
                      <th className="p-2.5 text-[10px] uppercase">{language === 'en' ? 'Name En' : 'नाम'}</th>
                      <th className="p-2.5 text-[10px] uppercase">{language === 'en' ? 'A savings account' : 'बचत खाता संख्या'}</th>
                      <th className="p-2.5 text-center text-[10px] uppercase">{language === 'en' ? 'Toggle Verification Status' : 'मेधासॉफ्ट सत्यापन स्थिति'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-bold text-gray-700">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-neutral-50">
                        <td className="p-2.5 font-mono text-gray-400">{st.rollNo}</td>
                        <td className="p-2.5 ">{st.nameEn}</td>
                        <td className="p-2.5 font-mono text-gray-950">******{st.bankAccountLast4}</td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleMedhasoft(st.id, st.medhasoftStatus)}
                            className={`px-3 py-1 text-[10px] w-40 font-bold font-mono uppercase tracking-wider rounded border transition ${
                              st.medhasoftStatus === 'Verified'
                                ? 'bg-green-100 text-[#2E7D32] border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-200/50'
                            }`}
                          >
                            {st.medhasoftStatus === 'Verified' ? 'Verified (सत्यापित)' : 'Click to Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. COMPLAINTS RESOLUTION MANAGEMENT */}
        {adminTab === 'grievances' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
              {labels.grievances}
            </h3>

            <div className="space-y-4">
              {grievances.map((c) => (
                <div key={c.id} className="p-4 bg-neutral-50 rounded border border-gray-200 space-y-3.5 text-xs">
                  <div className="flex justify-between items-center bg-gray-200/40 p-2 rounded">
                    <div>
                      <span className="font-mono text-gray-400">Ref: {c.ticketNo}</span>
                      <p className="text-[10px] font-mono font-bold text-[#D4522A]">{c.categoryEn}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-black uppercase text-[9px] ${
                      c.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800 animate-pulse'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-gray-500 font-bold">{language === 'en' ? 'Query content:' : 'शिकायत विवरण:'}</p>
                    <p className="text-gray-800 bg-white p-2.5 rounded border leading-relaxed select-none font-medium italic">
                      "{c.content}"
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono text-right mt-1">
                      {language === 'en' ? 'By:' : 'अभिभावक/छात्रा:'} {c.isAnonymous ? 'Anonymous' : c.complainantName}
                    </p>
                  </div>

                  {c.status !== 'Resolved' && (
                    <div className="space-y-2">
                      {activeHandlingGrievanceId === c.id ? (
                        <div className="bg-white p-3 rounded border border-amber-600/30 space-y-2.5 animate-fadeIn">
                          <textarea
                            rows={3}
                            value={resNoteEn}
                            onChange={(e) => setResNoteEn(e.target.value)}
                            placeholder={language === 'en' ? 'Type official resolution remarks here...' : 'आधिकारिक निपटारा टिप्पणी लिखें...'}
                            className="w-full text-xs p-2.5 border border-gray-300 rounded outline-hidden bg-neutral-50/20"
                            required
                          ></textarea>
                          <div className="flex justify-end gap-2 text-[10px]">
                            <button
                              onClick={() => {
                                setActiveHandlingGrievanceId(null);
                                setResNoteEn('');
                              }}
                              className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded font-mono font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleResolveGrievanceSubmit(c.id)}
                              className="px-4 py-1.5 bg-[#D4522A] text-white rounded font-mono font-bold"
                            >
                              Submit Resolution
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveHandlingGrievanceId(c.id);
                            setResNoteEn('');
                          }}
                          className="px-4 py-2 bg-[#1A3A5C] text-white font-mono text-[10px] font-bold rounded shadow-xs"
                        >
                          Resolve complaint
                        </button>
                      )}
                    </div>
                  )}

                  {c.status === 'Resolved' && (
                    <div className="bg-[#2E7D32]/5 p-3 rounded border border-emerald-600/20 space-y-1 text-gray-600 leading-normal font-medium">
                      <p className="font-bold text-[#2E7D32]">{language === 'en' ? 'Remarks submitted:' : 'निपटारे की टिप्पणी:'}</p>
                      <p>"{language === 'en' ? c.resolutionNoteEn : c.resolutionNoteHi}"</p>
                      <span className="text-[9px] text-gray-400 font-mono block text-right mt-1">date: {c.resolutionDate}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CERTIFICATES APPLICATIONS ISSUANCE */}
        {adminTab === 'certificates' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-4">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2">
              {labels.certificates}
            </h3>

            <div className="space-y-4">
              {certificates.map((cert) => (
                <div key={cert.id} className="p-4 bg-neutral-50 rounded border border-gray-200 space-y-3 text-xs font-semibold">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <div>
                      <span className="font-mono text-zinc-400">Ref Ticket: {cert.referenceNo}</span>
                      <h4 className="font-bold text-[#1A3A5C] text-xs leading-none mt-1">{cert.type}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      cert.status === 'Ready for Collection' ? 'bg-[#2E7D32]/10 text-[#2E7D32]' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {cert.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-gray-700" style={{ fontSize: '11px' }}>
                    <p><span className="text-gray-400 font-mono">Daughter:</span> {cert.studentNameEn}</p>
                    <p><span className="text-gray-400 font-mono">Roll:</span> {cert.rollNo} • {cert.className}</p>
                    <p className="col-span-2 text-gray-500 font-mono leading-normal italic">
                      "{cert.reasonEn}"
                    </p>
                  </div>

                  {cert.status !== 'Ready for Collection' && (
                    <button
                      onClick={() => handleApproveCertStatus(cert.id)}
                      className="px-4 py-2 bg-[#D4522A] text-white font-mono text-[10px] font-bold rounded shadow-xs w-full sm:w-auto"
                    >
                      Approve and Mark: "Ready for Collection"
                    </button>
                  )}

                  {cert.status === 'Ready for Collection' && (
                    <div className="space-y-2">
                       <div className="bg-emerald-600/5 p-3 rounded border border-emerald-600/10 text-gray-600 leading-normal font-medium">
                        <p className="font-bold text-[#2E7D32]" style={{ fontSize: '11px' }}>{language === 'en' ? 'Principal Remarks appended:' : 'कार्यालय की टिप्पणी:'}</p>
                        <p className="font-mono">"{language === 'en' ? cert.instructionsEn : cert.instructionsHi}"</p>
                      </div>
                      <button
                        onClick={() => exportCertificatePDF(cert)}
                        className="px-4 py-1.5 bg-[#1A3A5C] text-white hover:bg-[#1A3A5C]/90 text-[10px] font-bold font-mono rounded flex items-center justify-center gap-1.5 no-print"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{language === 'en' ? 'Download Certificate PDF' : 'प्रमाण पत्र डाउनलोड (PDF)'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. USER ACCOUNTS & ROLES ADMINISTRATION */}
        {adminTab === 'users' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-6">
            <div className="border-b pb-3 flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C]">
                {labels.users}
              </h3>
              <p className="text-[10px] font-mono text-zinc-500 italic bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Authorized Personnel: {language === 'en' ? schoolSettings.principalNameEn : schoolSettings.principalNameHi}
              </p>
            </div>

            {/* User Addition Sub-Form */}
            <form onSubmit={async (e) => {
              e.preventDefault();
              if(!newUserNameEn || !newUserEmail) return;
              await manageUserCreate({
                nameEn: newUserNameEn,
                nameHi: newUserNameHi || newUserNameEn,
                email: newUserEmail,
                role: newUserRole,
                status: newUserStatus,
                createdBy: user?.email || "Principal",
                createdAt: new Date().toISOString(),
                password: newUserPassword || 'WelcomeOGHS123',
                forcePasswordChange: true
              } as any);
              setNewUserNameEn('');
              setNewUserNameHi('');
              setNewUserEmail('');
              setNewUserPassword('');
              setNewUserSuccess(true);
              setTimeout(() => setNewUserSuccess(false), 3000);
            }} className="p-4 bg-orange-600/[0.03] border border-orange-600/10 rounded space-y-3">
              <h4 className="text-xs font-bold text-[#D4522A] flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'en' ? 'Provision Secondary User Profile' : 'नया प्रयोक्ता खाता बनाएं'}</span>
              </h4>

              {newUserSuccess && (
                <div className="flex items-center gap-2 p-2.5 text-[11px] font-bold text-[#2E7D32] bg-emerald-50 rounded border border-emerald-300">
                  <CheckSquare className="w-4 h-4" />
                  <span>{language === 'en' ? 'Secure Account Profile created successfully.' : 'नया खाता सफलतापूर्वक तैयार किया गया।'}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">Name (English)</label>
                  <input
                    type="text"
                    required
                    value={newUserNameEn}
                    onChange={(e) => setNewUserNameEn(e.target.value)}
                    placeholder="e.g. Dr. Kavita Sharma"
                    className="p-2 border rounded w-full bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">Name (Hindi)</label>
                  <input
                    type="text"
                    value={newUserNameHi}
                    onChange={(e) => setNewUserNameHi(e.target.value)}
                    placeholder="उदा. डॉ. कविता शर्मा"
                    className="p-2 border rounded w-full bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. kavita.teacher@omarbalika132.edu.in"
                    className="p-2 border rounded w-full bg-white font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">Preset Password (Default: WelcomeOGHS123)</label>
                  <input
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Enter password or leave empty"
                    className="p-2 border rounded w-full bg-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 col-span-1 sm:col-span-2">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">Authoritative Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="p-2 border rounded w-full bg-white font-bold"
                    >
                      <option value={UserRole.STUDENT}>STUDENT</option>
                      <option value={UserRole.TEACHER}>TEACHER</option>
                      <option value={UserRole.ADMIN}>ADMINISTRATOR (PRINCIPAL)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">Default Status</label>
                    <select
                      value={newUserStatus}
                      onChange={(e) => setNewUserStatus(e.target.value as any)}
                      className="p-2 border rounded w-full bg-white font-bold"
                    >
                      <option value="Active">Active</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2 bg-[#D4522A] hover:bg-[#D4522A]/90 text-white font-mono font-bold text-[11px] rounded"
              >
                {language === 'en' ? 'Secure Add System User' : 'प्रयोक्ता सुरक्षित रूप से जोड़ें'}
              </button>
            </form>

            {/* List and actions of system users */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#1A3A5C] font-mono border-b pb-1">
                {language === 'en' ? 'Active School Directory Accounts' : 'प्रयोक्ता निर्देशिका एवं नियंत्रण पैनल'}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 font-mono text-[10px] text-zinc-500 uppercase">
                      <th className="p-2">{language === 'en' ? 'User Details' : 'विवरण'}</th>
                      <th className="p-2">Role</th>
                      <th className="p-2">Status</th>
                      <th className="p-2 text-right">{language === 'en' ? 'Secure Control Panel' : 'नियंत्रण'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-[11px] font-semibold">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-neutral-50/50">
                        <td className="p-2">
                          <p className="font-bold text-[#1A3A5C]">{language === 'en' ? usr.nameEn : usr.nameHi}</p>
                          <p className="text-[10px] font-mono text-zinc-400 font-normal">{usr.email}</p>
                        </td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 bg-sky-50 text-sky-800 rounded text-[9px] font-mono font-bold">
                            {usr.role}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            usr.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {usr.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-2 text-right space-x-1.5">
                          <button
                            onClick={async () => {
                              const nextStatus = usr.status === 'Disabled' ? 'Active' : 'Disabled';
                              await manageUserUpdate(usr.id, { status: nextStatus });
                            }}
                            className={`px-2 py-1 text-[10px] font-mono font-bold rounded ${
                              usr.status === 'Disabled' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                            }`}
                          >
                            {usr.status === 'Disabled' ? 'Activate' : 'Disable'}
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                if (usr.email) {
                                  await sendPasswordReset(usr.email);
                                  await manageUserUpdate(usr.id, { password: 'PassResetDefault123' });
                                  alert(`Successfully triggered real Firebase reset via sendPasswordResetEmail() for ${usr.email}! Instructions sent.`);
                                } else {
                                  alert("Cannot reset password: User profile has no email address.");
                                }
                              } catch (err: any) {
                                alert(`Failed to send password reset: ${err.message}`);
                              }
                            }}
                            className="px-2 py-1 bg-[#1A3A5C] text-white text-[10px] font-mono font-bold rounded"
                          >
                            Reset Pass
                          </button>
                          {/* Physical deletion removed per soft-disable security policy */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. UNIFIED SCHOOL CMS CONTENT MANAGEMENT EDITOR */}
        {adminTab === 'cms' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-6">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2 flex justify-between items-center">
              <span>{labels.cms}</span>
              <span className="text-[10px] tracking-wide bg-[#D4522A]/10 text-[#D4522A] px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                Enterprise Content Hub
              </span>
            </h3>

            {/* CMS Category Section Selection Tabs */}
            <div className="flex border-b text-xs font-bold no-print overflow-x-auto gap-1">
              {[
                { sec: 'teachers', label: language === 'en' ? 'Teachers Profiles' : 'शिक्षक प्रोफाइल' },
                { sec: 'students', label: language === 'en' ? 'Students Directory' : 'छात्र रजिस्टर' },
                { sec: 'timetable', label: language === 'en' ? 'School Timetable' : 'समय-सारणी' },
                { sec: 'schemes', label: language === 'en' ? 'Scholarship Schemes' : 'विशेष योजनाएं' },
                { sec: 'books', label: language === 'en' ? 'Library Register' : 'पुस्तकालय पुस्तकें' },
                { sec: 'studyMaterials', label: language === 'en' ? 'Study Materials' : 'शिक्षण सामग्री' },
              ].map((item) => (
                <button
                  key={item.sec}
                  onClick={() => setCmsSection(item.sec as any)}
                  className={`px-3 py-2 rounded-t transition ${cmsSection === item.sec ? 'bg-[#1A3A5C] text-white border-b-2 border-[#D4522A]' : 'text-gray-600 hover:bg-neutral-50'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* --- CASE A: TEACHERS PROFILES EDITOR --- */}
            {cmsSection === 'teachers' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="text-xs font-bold text-[#1A3A5C] font-mono uppercase tracking-wider">
                    {editingTeacherId ? (language === 'en' ? 'Edit Teacher Record' : 'शिक्षक विवरण सुधार') : (language === 'en' ? 'Faculty CMS List' : 'शिक्षण संकाय व्यवस्थापन')}
                  </h4>
                  <div className="flex gap-2">
                    {editingTeacherId && (
                      <button
                        onClick={() => {
                          setEditingTeacherId(null);
                          setNewTeacherNameEn('');
                          setNewTeacherNameHi('');
                          setNewTeacherDesEn('');
                          setNewTeacherDesHi('');
                          setNewTeacherSubjectEn('');
                          setNewTeacherSubjectHi('');
                          setNewTeacherEmail('');
                          setNewTeacherQualEn('B.Ed, Qualified Teacher');
                          setNewTeacherQualHi('बी.एड, योग्य शिक्षक');
                          setNewTeacherAvatarUrl('');
                          setNewTeacherFormOpen(false);
                        }}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-mono font-bold text-[10px] rounded"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setNewTeacherFormOpen(!newTeacherFormOpen);
                        if (editingTeacherId) {
                          setEditingTeacherId(null);
                          setNewTeacherNameEn('');
                          setNewTeacherNameHi('');
                          setNewTeacherDesEn('');
                          setNewTeacherDesHi('');
                          setNewTeacherSubjectEn('');
                          setNewTeacherSubjectHi('');
                          setNewTeacherEmail('');
                          setNewTeacherQualEn('B.Ed, Qualified Teacher');
                          setNewTeacherQualHi('बी.एड, योग्य शिक्षक');
                          setNewTeacherAvatarUrl('');
                        }
                      }}
                      className="p-1 px-3 bg-neutral-100 hover:bg-neutral-200 border rounded font-mono text-[10px] font-bold text-gray-700"
                    >
                      {newTeacherFormOpen ? 'Close Editor' : '+ Add Teacher'}
                    </button>
                  </div>
                </div>

                {newTeacherFormOpen && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if(!newTeacherNameEn) return;
                    
                    const teacherData = {
                      nameEn: newTeacherNameEn,
                      nameHi: newTeacherNameHi || newTeacherNameEn,
                      designationEn: newTeacherDesEn || 'Teacher',
                      designationHi: newTeacherDesHi || newTeacherDesEn || 'शिक्षक',
                      subjectsEn: newTeacherSubjectEn ? newTeacherSubjectEn.split(',').map(s => s.trim()) : ['Academic Science'],
                      subjectsHi: newTeacherSubjectHi ? newTeacherSubjectHi.split(',').map(s => s.trim()) : ['विज्ञान'],
                      email: newTeacherEmail || 'teacher@omarbalika132.edu.in',
                      dob: newTeacherDob,
                      qualificationEn: newTeacherQualEn || 'B.Ed, Qualified Teacher',
                      qualificationHi: newTeacherQualHi || 'बी.एड, योग्य शिक्षक',
                      avatarUrl: newTeacherAvatarUrl || ''
                    };

                    if (editingTeacherId) {
                      await updateTeacher(editingTeacherId, teacherData);
                    } else {
                      await addTeacher(teacherData);
                    }

                    // Reset states
                    setNewTeacherNameEn('');
                    setNewTeacherNameHi('');
                    setNewTeacherDesEn('');
                    setNewTeacherDesHi('');
                    setNewTeacherSubjectEn('');
                    setNewTeacherSubjectHi('');
                    setNewTeacherEmail('');
                    setNewTeacherDob('1990-01-01');
                    setNewTeacherQualEn('B.Ed, Qualified Teacher');
                    setNewTeacherQualHi('बी.एड, योग्य शिक्षक');
                    setNewTeacherAvatarUrl('');
                    setEditingTeacherId(null);
                    setNewTeacherFormOpen(false);
                  }} className="p-4 bg-slate-50 border rounded text-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Teacher Name En</label>
                        <input
                          type="text"
                          required
                          value={newTeacherNameEn}
                          onChange={(e) => setNewTeacherNameEn(e.target.value)}
                          placeholder="Teacher Name (English)"
                          className="w-full p-2 border rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">शिक्षक का नाम (हिन्दी)</label>
                        <input
                          type="text"
                          value={newTeacherNameHi}
                          onChange={(e) => setNewTeacherNameHi(e.target.value)}
                          placeholder="शिक्षक का नाम (हिन्दी)"
                          className="w-full p-2 border rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Designation En</label>
                        <input
                          type="text"
                          value={newTeacherDesEn}
                          onChange={(e) => setNewTeacherDesEn(e.target.value)}
                          placeholder="Designation (English)"
                          className="w-full p-2 border rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">पद का नाम (हिन्दी)</label>
                        <input
                          type="text"
                          value={newTeacherDesHi}
                          onChange={(e) => setNewTeacherDesHi(e.target.value)}
                          placeholder="पद का नाम (हिन्दी)"
                          className="w-full p-2 border rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Subjects (English, comma-separated)</label>
                        <input
                          type="text"
                          value={newTeacherSubjectEn}
                          onChange={(e) => setNewTeacherSubjectEn(e.target.value)}
                          placeholder="E.g., Physics, Mathematics"
                          className="w-full p-2 border rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">विषय (हिन्दी, अल्पविराम द्वारा विभाजित)</label>
                        <input
                          type="text"
                          value={newTeacherSubjectHi}
                          onChange={(e) => setNewTeacherSubjectHi(e.target.value)}
                          placeholder="जैसे, भौतिकी, गणित"
                          className="w-full p-2 border rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Teacher Email Address</label>
                        <input
                          type="email"
                          value={newTeacherEmail}
                          onChange={(e) => setNewTeacherEmail(e.target.value)}
                          placeholder="teacher@omarbalika132.edu.in"
                          className="w-full p-2 border rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Date of Birth (Default password is DOB)</label>
                        <input
                          type="date"
                          required
                          value={newTeacherDob}
                          onChange={(e) => setNewTeacherDob(e.target.value)}
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Qualification (English)</label>
                        <input
                          type="text"
                          value={newTeacherQualEn}
                          onChange={(e) => setNewTeacherQualEn(e.target.value)}
                          placeholder="E.g. B.Ed, M.Sc Physics"
                          className="w-full p-2 border rounded font-mono bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">योग्यता (हिन्दी)</label>
                        <input
                          type="text"
                          value={newTeacherQualHi}
                          onChange={(e) => setNewTeacherQualHi(e.target.value)}
                          placeholder="जैसे बी.एड, एम.एससी भौतिकी"
                          className="w-full p-2 border rounded font-mono bg-white"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-600 font-medium mb-1">Profile Photo (JPG / PNG)</label>
                        <div className="flex items-center gap-4 bg-white p-3 border rounded">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setUploadingPhoto(true);
                                const fileId = `avatar_${Date.now()}`;
                                try {
                                  const { ref: sRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
                                  const storageRef = sRef(storage, `teachers/${fileId}`);
                                  const snap = await uploadBytes(storageRef, f);
                                  const url = await getDownloadURL(snap.ref);
                                  setNewTeacherAvatarUrl(url);
                                } catch (storageErr) {
                                  console.warn("Storage failed or rules blocked. Falling back to Base64:", storageErr);
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setNewTeacherAvatarUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(f);
                                } finally {
                                  setUploadingPhoto(false);
                                }
                              }
                            }}
                            className="text-xs text-slate-500 font-mono file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#D4522A] hover:file:bg-orange-100"
                          />
                          {uploadingPhoto ? (
                            <span className="text-xs text-[#D4522A] animate-pulse font-mono">Uploading to Storage...</span>
                          ) : newTeacherAvatarUrl ? (
                            <div className="relative w-11 h-11 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                              <img src={newTeacherAvatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setNewTeacherAvatarUrl('')}
                                className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-[8px] font-bold text-white transition-opacity"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono italic">No image uploaded (initials fallback)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-[#D4522A] hover:bg-orange-600 text-white font-mono font-bold text-[10px] tracking-wider uppercase rounded">
                      {editingTeacherId ? 'Save Teacher Changes' : 'Publish Teacher Profile'}
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {teachers.map((t) => (
                    <div key={t.id} className="p-3.5 bg-neutral-50 rounded border flex flex-col justify-between text-xs space-y-2.5">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-[#1A3A5C] text-sm">{language === 'en' ? t.nameEn : t.nameHi}</p>
                          <div className="flex gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              t.status === 'Disabled' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-[#2E7D32]'
                            }`}>
                              {t.status || 'Active'}
                            </span>
                            <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-800 text-[9px] font-mono rounded font-bold uppercase">
                              Teacher
                            </span>
                          </div>
                        </div>
                        <p className="font-mono text-[10px] text-zinc-500 font-bold">
                          💼 {language === 'en' ? t.designationEn : t.designationHi}
                        </p>
                        <div className="text-[10px] text-gray-600">
                          <span className="font-bold">📚 {language === 'en' ? 'Subjects:' : 'विषय:'}</span>{' '}
                          {language === 'en' ? t.subjectsEn?.join(', ') : t.subjectsHi?.join(', ')}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate select-all">
                          📧 {t.email}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end border-t pt-2 scroll-neutral">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTeacherId(t.id);
                            setNewTeacherNameEn(t.nameEn);
                            setNewTeacherNameHi(t.nameHi || '');
                            setNewTeacherDesEn(t.designationEn || '');
                            setNewTeacherDesHi(t.designationHi || '');
                            setNewTeacherSubjectEn(t.subjectsEn?.join(', ') || '');
                            setNewTeacherSubjectHi(t.subjectsHi?.join(', ') || '');
                            setNewTeacherEmail(t.email || '');
                            setNewTeacherQualEn(t.qualificationEn || 'B.Ed, Qualified Teacher');
                            setNewTeacherQualHi(t.qualificationHi || 'बी.एड, योग्य शिक्षक');
                            setNewTeacherAvatarUrl(t.avatarUrl || '');
                            setNewTeacherFormOpen(true);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-neutral-100 border text-gray-700 font-bold font-mono text-[10px] rounded"
                        >
                          Edit
                        </button>
                        {t.status === 'Disabled' ? (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Enable faculty member ${t.nameEn}?`)) {
                                await updateTeacher(t.id, { status: 'Active' });
                              }
                            }}
                            className="px-2.5 py-1 bg-green-150 font-bold font-mono text-[10px] text-green-700 hover:bg-green-200 rounded"
                          >
                            Enable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`Disable faculty member ${t.nameEn}?`)) {
                                await updateTeacher(t.id, { status: 'Disabled' });
                              }
                            }}
                            className="px-2.5 py-1 bg-red-100 font-bold font-mono text-[10px] text-red-700 hover:bg-red-200 rounded"
                          >
                            Disable
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- CASE AB: STUDENTS DIRECTORY EDITOR --- */}
            {cmsSection === 'students' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="text-xs font-bold text-[#1A3A5C] font-mono uppercase tracking-wider">
                    {editingStudentId ? (language === 'en' ? 'Edit Student Profile' : 'छात्र विवरण संपादित करें') : (language === 'en' ? 'Students Ledger Directory' : 'छात्र रजिस्टर पंजी')}
                  </h4>
                  <div className="flex gap-2">
                    {editingStudentId && (
                      <button
                        onClick={() => {
                          setEditingStudentId(null);
                          setStudRollNo('');
                          setStudEmail('');
                          setStudNameEn('');
                          setStudNameHi('');
                          setStudClassName('Class IX');
                          setStudSection('A');
                          setStudFatherEn('');
                          setStudFatherHi('');
                          setStudMotherEn('');
                          setStudMotherHi('');
                          setStudDOB('2011-01-01');
                          setStudCategory('General');
                          setStudBank('');
                          setStudIFSC('');
                          setStudMedhasoft('Pending Verification');
                          setStudDBT('In Process');
                          setStudStatus('Active');
                          setStudentFormOpen(false);
                        }}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-mono font-bold text-[10px] rounded"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setStudentFormOpen(!studentFormOpen);
                        if (editingStudentId) {
                          setEditingStudentId(null);
                          setStudRollNo('');
                          setStudEmail('');
                          setStudNameEn('');
                          setStudNameHi('');
                          setStudClassName('Class IX');
                          setStudSection('A');
                          setStudFatherEn('');
                          setStudFatherHi('');
                          setStudMotherEn('');
                          setStudMotherHi('');
                          setStudDOB('2011-01-01');
                          setStudCategory('General');
                          setStudBank('');
                          setStudIFSC('');
                          setStudMedhasoft('Pending Verification');
                          setStudDBT('In Process');
                          setStudStatus('Active');
                        }
                      }}
                      className="p-1 px-3 bg-[#1A3A5C] hover:bg-[#112335] text-white border rounded font-mono text-[10px] font-bold"
                    >
                      {studentFormOpen ? 'Close Editor' : '+ Add Student'}
                    </button>
                  </div>
                </div>

                {studentFormOpen && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if(!studRollNo || !studNameEn) return;

                    const studentData = {
                      rollNo: studRollNo,
                      email: studEmail,
                      nameEn: studNameEn,
                      nameHi: studNameHi || studNameEn,
                      className: studClassName,
                      section: studSection,
                      fatherNameEn: studFatherEn,
                      fatherNameHi: studFatherHi || studFatherEn,
                      motherNameEn: studMotherEn,
                      motherNameHi: studMotherHi || studMotherEn,
                      dob: studDOB,
                      category: studCategory,
                      bankAccountLast4: studBank || '0000',
                      ifscCode: studIFSC || 'BKID0004655',
                      medhasoftStatus: studMedhasoft,
                      dbtPaymentStatus: studDBT,
                      status: studStatus
                    };

                    if (editingStudentId) {
                      await updateStudent(editingStudentId, studentData);
                    } else {
                      await addStudent(studentData);
                    }

                    // Reset form
                    setStudRollNo('');
                    setStudEmail('');
                    setStudNameEn('');
                    setStudNameHi('');
                    setStudClassName('Class IX');
                    setStudSection('A');
                    setStudFatherEn('');
                    setStudFatherHi('');
                    setStudMotherEn('');
                    setStudMotherHi('');
                    setStudDOB('2011-01-01');
                    setStudCategory('General');
                    setStudBank('');
                    setStudIFSC('');
                    setStudMedhasoft('Pending Verification');
                    setStudDBT('In Process');
                    setStudStatus('Active');
                    setEditingStudentId(null);
                    setStudentFormOpen(false);
                  }} className="p-4 bg-[#F8FAFC] border rounded text-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Roll Number</label>
                        <input
                          type="text"
                          required
                          value={studRollNo}
                          onChange={(e) => setStudRollNo(e.target.value)}
                          placeholder="e.g. 102"
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Student Email (Login ID)</label>
                        <input
                          type="email"
                          value={studEmail}
                          onChange={(e) => setStudEmail(e.target.value)}
                          placeholder="e.g. student.name@omarbalika132.edu.in"
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Student Name English</label>
                        <input
                          type="text"
                          required
                          value={studNameEn}
                          onChange={(e) => setStudNameEn(e.target.value)}
                          placeholder="e.g. Kumari Priya"
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">नाम (हिन्दी)</label>
                        <input
                          type="text"
                          value={studNameHi}
                          onChange={(e) => setStudNameHi(e.target.value)}
                          placeholder="उदा. कुमारी प्रिया"
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Class</label>
                        <select
                          value={studClassName}
                          onChange={(e: any) => setStudClassName(e.target.value)}
                          className="w-full p-2 border rounded font-bold font-mono bg-white text-xs"
                        >
                          <option value="Class IX">Class IX</option>
                          <option value="Class X">Class X</option>
                          <option value="Class XI">Class XI</option>
                          <option value="Class XII">Class XII</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Section</label>
                        <select
                          value={studSection}
                          onChange={(e: any) => setStudSection(e.target.value)}
                          className="w-full p-2 border rounded font-bold font-mono bg-white text-xs"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Date of Birth</label>
                        <input
                          type="date"
                          value={studDOB}
                          onChange={(e) => setStudDOB(e.target.value)}
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Father Name En</label>
                        <input
                          type="text"
                          value={studFatherEn}
                          onChange={(e) => setStudFatherEn(e.target.value)}
                          placeholder="Father Name"
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">पिता का नाम (हिन्दी)</label>
                        <input
                          type="text"
                          value={studFatherHi}
                          onChange={(e) => setStudFatherHi(e.target.value)}
                          placeholder="पिता का नाम"
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Category</label>
                        <select
                          value={studCategory}
                          onChange={(e: any) => setStudCategory(e.target.value)}
                          className="w-full p-2 border rounded font-bold font-mono bg-white text-xs"
                        >
                          <option value="General">General</option>
                          <option value="OBC">OBC</option>
                          <option value="EBC">EBC</option>
                          <option value="SC">SC</option>
                          <option value="ST">ST</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Bank Account Last 4 Digits</label>
                        <input
                          type="text"
                          value={studBank}
                          maxLength={4}
                          onChange={(e) => setStudBank(e.target.value)}
                          placeholder="e.g. 5241"
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Bank IFSC Code</label>
                        <input
                          type="text"
                          value={studIFSC}
                          onChange={(e) => setStudIFSC(e.target.value)}
                          placeholder="SBIN0001021"
                          className="w-full p-2 border rounded font-mono bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Medhasoft Status</label>
                        <select
                          value={studMedhasoft}
                          onChange={(e: any) => setStudMedhasoft(e.target.value)}
                          className="w-full p-2 border rounded font-bold font-mono bg-white text-xs"
                        >
                          <option value="Verified">Verified</option>
                          <option value="Pending Verification">Pending Verification</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Not Registered">Not Registered</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">DBT Payment Status</label>
                        <select
                          value={studDBT}
                          onChange={(e: any) => setStudDBT(e.target.value)}
                          className="w-full p-2 border rounded font-bold font-mono bg-white text-xs"
                        >
                          <option value="Payment Disbursed">Payment Disbursed</option>
                          <option value="In Process">In Process</option>
                          <option value="Aadhaar Account Link Pending">Aadhaar Account Link Pending</option>
                          <option value="Details Required">Details Required</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-600 font-bold mb-1">Enrollment Status</label>
                        <select
                          value={studStatus}
                          onChange={(e: any) => setStudStatus(e.target.value)}
                          className="w-full p-2 border rounded font-bold font-mono bg-white text-xs"
                        >
                          <option value="Active">Active</option>
                          <option value="Transferred">Transferred</option>
                          <option value="Disabled">Disabled</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="px-4 py-2 bg-[#D4522A] text-white font-mono font-bold text-[10px] tracking-wider uppercase rounded hover:bg-orange-600">
                      {editingStudentId ? 'Save Student Changes' : 'Register New Student Profile'}
                    </button>
                  </form>
                )}

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-neutral-50 rounded border text-xs">
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">Filter Class</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {['All', 'Class IX', 'Class X', 'Class XI', 'Class XII'].map(cls => (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => setStudClassFilter(cls)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold ${studClassFilter === cls ? 'bg-[#1A3A5C] text-white' : 'bg-white border hover:bg-neutral-100 text-zinc-700'}`}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1">Search Student Name or Roll Number</label>
                    <input
                      type="text"
                      value={studSearch}
                      onChange={(e) => setStudSearch(e.target.value)}
                      placeholder="Search roll number or name..."
                      className="w-full p-2 border rounded font-mono bg-white text-xs"
                    />
                  </div>
                </div>

                {/* Directory Table Grid */}
                <div className="border rounded overflow-x-auto text-[11px] font-semibold text-gray-600">
                  <table className="w-full text-left">
                    <thead className="bg-[#112335] text-white select-none">
                      <tr>
                        <th className="p-2.5 text-center font-mono">Class Section</th>
                        <th className="p-2.5 text-center font-mono">Roll No</th>
                        <th className="p-2.5">{language === 'en' ? 'Student Pupil' : 'छात्रा का नाम'}</th>
                        <th className="p-2.5">{language === 'en' ? 'Guardian Details En/Hi' : 'अभिभावक विवरण'}</th>
                        <th className="p-2.5 text-center">Enrollment Status</th>
                        <th className="p-2.5 text-right font-mono text-[10px] uppercase">Ledger Admin Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-bold">
                      {students
                        .filter(s => studClassFilter === 'All' || s.className === studClassFilter)
                        .filter(s => {
                          const query = studSearch.toLowerCase().trim();
                          if (!query) return true;
                          return s.nameEn.toLowerCase().includes(query) || 
                                 s.nameHi.toLowerCase().includes(query) || 
                                 s.rollNo.includes(query);
                        })
                        .map(s => (
                          <tr key={s.id} className="hover:bg-neutral-50/50">
                            <td className="p-2.5 text-center font-mono text-zinc-700">
                              {s.className} - {s.section}
                            </td>
                            <td className="p-2.5 text-center font-mono text-indigo-900 bg-neutral-100/30">
                              #{s.rollNo}
                            </td>
                            <td className="p-2.5">
                              <p className="text-[#1A3A5C] text-xs font-serif">{language === 'en' ? s.nameEn : s.nameHi}</p>
                              <p className="text-[9px] text-zinc-400 font-normal font-mono">UID: {s.id}</p>
                            </td>
                            <td className="p-2.5">
                              <p className="text-zinc-700">{language === 'en' ? s.fatherNameEn : s.fatherNameHi} (F)</p>
                              <p className="text-[9px] text-[#D4522A]">{s.category}</p>
                            </td>
                            <td className="p-2.5 text-center">
                              {s.status === 'Transferred' ? (
                                <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-[9px] rounded font-mono">TRANSFERRED</span>
                              ) : s.status === 'Disabled' ? (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-800 text-[9px] rounded font-mono">DISABLED</span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-green-100 text-[#2E7D32] text-[9px] rounded font-mono">ACTIVE</span>
                              )}
                            </td>
                            <td className="p-2.5 text-right space-y-1 sm:space-y-0 sm:space-x-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingStudentId(s.id);
                                  setStudRollNo(s.rollNo);
                                  setStudEmail(s.email || '');
                                  setStudNameEn(s.nameEn);
                                  setStudNameHi(s.nameHi || '');
                                  setStudClassName(s.className);
                                  setStudSection(s.section);
                                  setStudFatherEn(s.fatherNameEn || '');
                                  setStudFatherHi(s.fatherNameHi || '');
                                  setStudMotherEn(s.motherNameEn || '');
                                  setStudMotherHi(s.motherNameHi || '');
                                  setStudDOB(s.dob || '2011-01-01');
                                  setStudCategory(s.category);
                                  setStudBank(s.bankAccountLast4 || '');
                                  setStudIFSC(s.ifscCode || '');
                                  setStudMedhasoft(s.medhasoftStatus);
                                  setStudDBT(s.dbtPaymentStatus);
                                  setStudStatus(s.status || 'Active');
                                  setStudentFormOpen(true);
                                  window.scrollTo({ top: 300, behavior: 'smooth' });
                                }}
                                className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 border text-gray-700 rounded text-[10px]"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Set enrollment status of ${s.nameEn} to "Transferred"?`)) {
                                    await updateStudent(s.id, { status: 'Transferred' });
                                  }
                                }}
                                className="px-2 py-0.5 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 rounded text-[10px]"
                              >
                                Transfer
                              </button>
                              {s.status === 'Disabled' ? (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm(`Enable student record profile for ${s.nameEn}?`)) {
                                      await updateStudent(s.id, { status: 'Active' });
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded text-[10px]"
                                >
                                  Enable
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (confirm(`Disable record profile of student ${s.nameEn}?`)) {
                                      await updateStudent(s.id, { status: 'Disabled' });
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-[10px]"
                                >
                                  Disable
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- CASE B: TIMETABLE EDITOR --- */}
            {cmsSection === 'timetable' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="text-xs font-bold text-[#1A3A5C] font-mono uppercase tracking-wider">
                    {editingTtId ? (language === 'en' ? 'Edit Timetable Slot' : 'समय-सारणी प्रविष्टि सुधार') : (language === 'en' ? 'Class Timetable Grid Master' : 'समय-सारणी प्रविष्टियाँ')}
                  </h4>
                  <div className="flex gap-2">
                    {editingTtId && (
                      <button
                        onClick={() => {
                          setEditingTtId(null);
                          setNewTtClass('Class X');
                          setNewTtSection('A');
                          setNewTtDay('Monday');
                          setNewTtPeriod(1);
                          setNewTtTime('09:00 AM - 09:45 AM');
                          setNewTtSubEn('');
                          setNewTtSubHi('');
                          setNewTtTeacherEn('');
                          setNewTtTeacherHi('');
                          setNewTtFormOpen(false);
                        }}
                        className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 font-mono font-bold text-[10px] rounded"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setNewTtFormOpen(!newTtFormOpen);
                        if (editingTtId) {
                          setEditingTtId(null);
                          setNewTtClass('Class X');
                          setNewTtSection('A');
                          setNewTtDay('Monday');
                          setNewTtPeriod(1);
                          setNewTtTime('09:00 AM - 09:45 AM');
                          setNewTtSubEn('');
                          setNewTtSubHi('');
                          setNewTtTeacherEn('');
                          setNewTtTeacherHi('');
                        }
                      }}
                      className="p-1 px-3 bg-neutral-100 hover:bg-neutral-200 border rounded font-mono text-[10px] font-bold text-gray-700"
                    >
                      {newTtFormOpen ? 'Close Grid Editor' : '+ Add Lesson Entry'}
                    </button>
                  </div>
                </div>

                {newTtFormOpen && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if(!newTtSubEn || !newTtTeacherEn) return;

                    const lessonData = {
                      className: newTtClass,
                      section: newTtSection,
                      day: newTtDay as any,
                      period: newTtPeriod,
                      time: newTtTime,
                      subjectEn: newTtSubEn,
                      subjectHi: newTtSubHi || newTtSubEn,
                      teacherEn: newTtTeacherEn,
                      teacherHi: newTtTeacherHi || newTtTeacherEn
                    };

                    if (editingTtId) {
                      await updateTimetableEntry(editingTtId, lessonData);
                    } else {
                      await addTimetableEntry(lessonData);
                    }

                    // Reset state
                    setNewTtSubEn('');
                    setNewTtSubHi('');
                    setNewTtTeacherEn('');
                    setNewTtTeacherHi('');
                    setEditingTtId(null);
                    setNewTtFormOpen(false);
                  }} className="p-4 bg-slate-50 border rounded text-xs space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1">Class</label>
                        <select value={newTtClass} onChange={(e) => setNewTtClass(e.target.value)} className="w-full p-2 border rounded bg-white font-bold font-mono">
                          <option value="Class IX">Class IX</option>
                          <option value="Class X">Class X</option>
                          <option value="Class XI">Class XI</option>
                          <option value="Class XII">Class XII</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1">Section</label>
                        <select value={newTtSection} onChange={(e) => setNewTtSection(e.target.value)} className="w-full p-2 border rounded bg-white font-bold font-mono">
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1">Weekday</label>
                        <select value={newTtDay} onChange={(e) => setNewTtDay(e.target.value)} className="w-full p-2 border rounded bg-white font-bold font-mono">
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1">Period Slot</label>
                        <select value={newTtPeriod} onChange={(e) => setNewTtPeriod(parseInt(e.target.value, 10))} className="w-full p-2 border rounded bg-white font-bold font-mono">
                          {[1,2,3,4,5,6,7,8].map(p => <option key={p} value={p}>Period {p}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-zinc-600 font-bold mb-1">Time Frame</label>
                        <input type="text" placeholder="e.g. 09:00 AM - 09:45 AM" value={newTtTime} onChange={(e) => setNewTtTime(e.target.value)} className="w-full p-2 border rounded font-mono bg-white" />
                      </div>
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1">Subject (En)</label>
                        <input type="text" placeholder="Subject English" required value={newTtSubEn} onChange={(e) => setNewTtSubEn(e.target.value)} className="w-full p-2 border rounded font-mono bg-white" />
                      </div>
                      <div>
                        <label className="block text-zinc-600 font-bold mb-1">विषय (हिन्दी)</label>
                        <input type="text" placeholder="Subject (हिन्दी)" value={newTtSubHi} onChange={(e) => setNewTtSubHi(e.target.value)} className="w-full p-2 border rounded font-mono bg-white" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-zinc-600 font-bold mb-1">Teacher Identity (En)</label>
                        <input type="text" placeholder="Teacher English" required value={newTtTeacherEn} onChange={(e) => setNewTtTeacherEn(e.target.value)} className="w-full p-2 border rounded font-mono bg-white" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-zinc-600 font-bold mb-1 font-mono">शिक्षक (हिन्दी)</label>
                        <input type="text" placeholder="शिक्षक (हिन्दी)" value={newTtTeacherHi} onChange={(e) => setNewTtTeacherHi(e.target.value)} className="w-full p-2 border rounded font-mono bg-white" />
                      </div>
                    </div>
                    <button type="submit" className="px-5 py-2 bg-[#D4522A] hover:bg-orange-600 text-white font-mono font-bold text-[10px] tracking-wider uppercase rounded">
                      {editingTtId ? 'Update Timetable Lesson Slot' : 'Save New Lesson Slot'}
                    </button>
                  </form>
                )}

                <div className="overflow-x-auto border rounded text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#112335] text-white font-mono text-[9px] uppercase select-none">
                        <th className="p-2.5">Class Section</th>
                        <th className="p-2.5">Weekday</th>
                        <th className="p-2.5">Period ID</th>
                        <th className="p-2.5 font-mono">Time Frame</th>
                        <th className="p-2.5">Subject / Faculty</th>
                        <th className="p-2.5 text-right font-mono">Actions Ledger</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[11px] font-semibold text-gray-700">
                      {timetable.map((tt) => (
                        <tr key={tt.id} className="hover:bg-neutral-50/50">
                          <td className="p-2.5 font-mono text-[#D4522A]" id={`tt-class-${tt.id}`}>{tt.className} - {tt.section}</td>
                          <td className="p-2.5 text-[#1A3A5C]">{tt.day}</td>
                          <td className="p-2.5 font-mono">Period {tt.period}</td>
                          <td className="p-2.5 font-mono text-zinc-500">{tt.time}</td>
                          <td className="p-2.5">
                            <p className="font-bold text-[#1A3A5C]">{language === 'en' ? tt.subjectEn : tt.subjectHi}</p>
                            <p className="text-[10px] text-zinc-500 font-normal">{language === 'en' ? tt.teacherEn : tt.teacherHi}</p>
                          </td>
                          <td className="p-2.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTtId(tt.id);
                                setNewTtClass(tt.className);
                                setNewTtSection(tt.section);
                                setNewTtDay(tt.day);
                                setNewTtPeriod(tt.period);
                                setNewTtTime(tt.time || '09:00 AM - 09:45 AM');
                                setNewTtSubEn(tt.subjectEn);
                                setNewTtSubHi(tt.subjectHi || '');
                                setNewTtTeacherEn(tt.teacherEn);
                                setNewTtTeacherHi(tt.teacherHi || '');
                                setNewTtFormOpen(true);
                                window.scrollTo({ top: 300, behavior: 'smooth' });
                              }}
                              className="px-2 py-0.5 bg-neutral-100 border text-gray-700 font-mono text-[10px] rounded hover:bg-neutral-200"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm('Wipe out lesson slot from directory permanently?')) {
                                  await deleteTimetableEntry(tt.id);
                                }
                              }}
                              className="px-2 py-0.5 bg-red-100 text-red-700 font-mono text-[10px] rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- CASE C: SCHOLARSHIP SCHEMES EDITOR --- */}
            {cmsSection === 'schemes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1A3A5C] font-mono">{language === 'en' ? 'Scholarship Schemes list' : 'कल्याणकारी छात्रवृत्ति एवं योजनाएं'}</h4>
                  <button
                    onClick={() => setNewSchemeFormOpen(!newSchemeFormOpen)}
                    className="p-1 px-3 bg-neutral-100 hover:bg-neutral-200 border rounded font-mono text-[10px] font-bold"
                  >
                    {newSchemeFormOpen ? 'Close Editor' : '+ Add Yojana'}
                  </button>
                </div>

                {newSchemeFormOpen && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if(!newSchemeTitleEn) return;
                    await addScheme({
                      nameEn: newSchemeTitleEn,
                      nameHi: newSchemeTitleHi || newSchemeTitleEn,
                      category: newSchemeCat as any,
                      benefitsEn: newSchemeDescEn,
                      benefitsHi: newSchemeDescHi || newSchemeDescEn,
                      eligibilityEn: 'Must be enrolled in classes IX-X with 75% attendance.',
                      eligibilityHi: 'कक्षा नौवीं-दसवीं और ७५% उपस्थिति अनिवार्य।',
                      portalEn: 'Medhasoft, Govt. of Bihar',
                      portalHi: 'मेधासॉफ्ट, बिहार सरकार'
                    });
                    setNewSchemeTitleEn('');
                    setNewSchemeTitleHi('');
                    setNewSchemeDescEn('');
                    setNewSchemeDescHi('');
                    setNewSchemeFormOpen(false);
                  }} className="p-4 bg-slate-50 border rounded text-xs space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Yojana Title English" required value={newSchemeTitleEn} onChange={(e) => setNewSchemeTitleEn(e.target.value)} className="p-2 border rounded font-mono bg-white col-span-2" />
                      <input type="text" placeholder="योजना का नाम (हिन्दी)" value={newSchemeTitleHi} onChange={(e) => setNewSchemeTitleHi(e.target.value)} className="p-2 border rounded font-mono bg-white col-span-2" />
                      <select value={newSchemeCat} onChange={(e) => setNewSchemeCat(e.target.value)} className="p-2 border rounded bg-white font-bold col-span-2">
                        <option value="Bicycle">Bicycle Division</option>
                        <option value="Uniform">Uniform Grant</option>
                        <option value="KanyaUtthan">Kanya Utthan Initiative</option>
                        <option value="Scholarship">General Merit Scholarship</option>
                      </select>
                      <textarea placeholder="Benefits details (English)" value={newSchemeDescEn} onChange={(e) => setNewSchemeDescEn(e.target.value)} className="p-2 border rounded font-mono bg-white col-span-2" />
                      <textarea placeholder="लाभ और सहायता राशि (हिन्दी)" value={newSchemeDescHi} onChange={(e) => setNewSchemeDescHi(e.target.value)} className="p-2 border rounded font-mono bg-white col-span-2" />
                    </div>
                    <button type="submit" className="px-4 py-1.5 bg-[#D4522A] text-white font-mono font-bold text-[10px] rounded hover:bg-orange-600">
                      Publish Yojana Details
                    </button>
                  </form>
                )}

                <div className="space-y-2">
                  {schemes.map((sc) => (
                    <div key={sc.id} className="p-3 bg-neutral-50 rounded border flex justify-between items-start text-xs font-semibold">
                      <div className="space-y-1">
                        <p className="font-bold text-[#1A3A5C] text-sm leading-tight">{language === 'en' ? sc.nameEn : sc.nameHi}</p>
                        <p className="font-mono text-[9px] text-[#D4522A] uppercase tracking-wider">{sc.category}</p>
                        <p className="text-[11px] text-zinc-600 leading-normal font-medium">{language === 'en' ? sc.benefitsEn : sc.benefitsHi}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await deleteScheme(sc.id);
                        }}
                        className="p-1 px-2.5 bg-red-100 text-red-700 font-mono text-[10px] rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- CASE D: LIBRARY BOOK CATALOGS EDITOR --- */}
            {cmsSection === 'books' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-[#1A3A5C] font-mono">{language === 'en' ? 'School Library catalogs' : 'पुस्तकालय सूची व्यवस्थापन'}</h4>
                  <button
                    onClick={() => setNewBookFormOpen(!newBookFormOpen)}
                    className="p-1 px-3 bg-neutral-100 hover:bg-neutral-200 border rounded font-mono text-[10px] font-bold"
                  >
                    {newBookFormOpen ? 'Close Register' : '+ Add Book'}
                  </button>
                </div>

                {newBookFormOpen && (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if(!newBookTitleEn || !newBookAccessionNo) return;
                    await addBook({
                      accessionNo: newBookAccessionNo,
                      titleEn: newBookTitleEn,
                      titleHi: newBookTitleHi || newBookTitleEn,
                      authorEn: newBookAuthorEn,
                      authorHi: newBookAuthorHi || newBookAuthorEn,
                      subjectClass: 'Class X',
                      shelfLocation: newBookShelf || 'A-1',
                      isAvailable: true
                    });
                    setNewBookTitleEn('');
                    setNewBookTitleHi('');
                    setNewBookAuthorEn('');
                    setNewBookAuthorHi('');
                    setNewBookAccessionNo('');
                    setNewBookShelf('');
                    setNewBookFormOpen(false);
                  }} className="p-4 bg-slate-50 border rounded text-xs space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <input type="text" placeholder="Accession No" required value={newBookAccessionNo} onChange={(e) => setNewBookAccessionNo(e.target.value)} className="p-2 border rounded font-mono bg-white" />
                      <input type="text" placeholder="Shelf Location" value={newBookShelf} onChange={(e) => setNewBookShelf(e.target.value)} className="p-2 border rounded font-mono bg-white" />
                      <input type="text" placeholder="Book Title English" required value={newBookTitleEn} onChange={(e) => setNewBookTitleEn(e.target.value)} className="p-2 border rounded font-mono bg-white" />
                      <input type="text" placeholder="पुस्तक का नाम (हिन्दी)" value={newBookTitleHi} onChange={(e) => setNewBookTitleHi(e.target.value)} className="p-2 border rounded font-mono bg-white" />
                      <input type="text" placeholder="Author Name En" value={newBookAuthorEn} onChange={(e) => setNewBookAuthorEn(e.target.value)} className="p-2 border rounded font-mono bg-white" />
                      <input type="text" placeholder="लेखक का नाम (हिन्दी)" value={newBookAuthorHi} onChange={(e) => setNewBookAuthorHi(e.target.value)} className="p-2 border rounded font-mono bg-white" />
                    </div>
                    <button type="submit" className="px-4 py-1.5 bg-[#D4522A] text-white font-mono font-bold text-[10px] rounded hover:bg-orange-600">
                      Register Book Catalog Entry
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {books.map((b) => (
                    <div key={b.id} className="p-3 bg-neutral-50 rounded border flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-[#1A3A5C]">{language === 'en' ? b.titleEn : b.titleHi}</p>
                        <p className="font-mono text-[9px] text-zinc-400">Acc No: {b.accessionNo} • Location: {b.shelfLocation}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await deleteBook(b.id);
                        }}
                        className="p-1 px-2.5 bg-red-100 text-red-700 font-mono text-[10px] rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- CASE E: STUDY MATERIALS EDITOR --- */}
            {cmsSection === 'studyMaterials' && (
              <div className="space-y-4">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  // For simplicity, let them add simple study material directly using standard custom context function
                  await addStudyMaterial({
                    className: 'Class X',
                    subjectEn: 'Social Science',
                    subjectHi: 'सामाजिक विज्ञान',
                    titleEn: 'History Chapter 1 - Rise of Nationalism',
                    titleHi: 'इतिहास अध्याय १ - राष्ट्रवाद का उदय',
                    fileType: 'PDF',
                    fileSize: '1.8 MB',
                    downloadUrl: 'https://omarhighschool.in/materials/history-1.pdf'
                  });
                  alert("Sample study curriculum package published successfully!");
                }} className="p-4 bg-[#1A3A5C]/5 border rounded text-xs space-y-2">
                  <h4 className="font-bold text-[#1A3A5C]">{language === 'en' ? 'Fast Curriculum Publisher' : 'नवीनतम शिक्षण सामग्री प्रकटीकरण'}</h4>
                  <p className="text-zinc-500 font-medium">Allows publishing reference notes, previous years question papers, and Bihar Board study materials directly as PDFs.</p>
                  <button type="submit" className="px-5 py-2 bg-[#1A3A5C] text-white hover:bg-[#1A3A5C]/90 font-mono font-bold text-[10px] rounded">
                    + Seed Sample Class X History PDF
                  </button>
                </form>

                <div className="space-y-2">
                  {studyMaterials.map((sm) => (
                    <div key={sm.id} className="p-3 bg-neutral-50 rounded border flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-[#1A3A5C]">{language === 'en' ? sm.titleEn : sm.titleHi}</p>
                        <p className="font-mono text-[10px] text-zinc-500">{sm.className} • {language === 'en' ? sm.subjectEn : sm.subjectHi} ({sm.fileSize})</p>
                      </div>
                      <button
                        onClick={async () => {
                          await deleteStudyMaterial(sm.id);
                        }}
                        className="p-1 px-2 bg-red-100 text-red-700 font-mono text-[10px] rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. CSV DATA TRANSACTIONAL BATCH IMPORTS CENTER */}
        {adminTab === 'imports' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-6">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2 flex justify-between items-center">
              <span>{labels.imports}</span>
              <span className="text-[10px] bg-[#2E7D32]/10 text-[#2E7D32] px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                Phase 10 Compliant
              </span>
            </h3>

            <div className="p-4 bg-amber-500/[0.03] border border-amber-500/20 text-xs rounded text-gray-700 space-y-1.5 leading-normal">
              <p className="font-bold text-amber-700 flex items-center gap-1.5 font-mono">
                <AlertCircle className="w-4 h-4 text-[#D4522A]" />
                <span>Important Principal Operational Instructions:</span>
              </p>
              <ul className="list-disc pl-4 space-y-1 text-zinc-600">
                <li>Prepare data in Microsoft Excel or Google Sheets, export as **CSV (comma-separated)**, and copy-paste here.</li>
                <li>The system parses, cleanses, and executes strict semantic validation (such as exam total marks range 0-100, valid class formats).</li>
                <li>Imported elements synchronize reactive Firestore collections instantly with no system lag.</li>
              </ul>
            </div>

            <form onSubmit={handleRunBatchImportSubmit} className="space-y-4 text-xs font-semibold">
              <div className="flex gap-4 items-center flex-wrap">
                <span className="text-xs font-bold text-[#1A3A5C] font-mono">Select Destination Ledger:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'students', label: 'Students Register' },
                    { key: 'teachers', label: 'Teachers Staff' },
                    { key: 'timetable', label: 'Timetable Grid' },
                    { key: 'results', label: 'Exam Grades (0-100)' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setImportDataset(tab.key as any);
                        setImportCsvText('');
                        setImportValidationErrors([]);
                        setImportSuccessRows(null);
                      }}
                      className={`px-3 py-1.5 font-mono font-bold text-[10px] rounded transition ${importDataset === tab.key ? 'bg-[#D4522A] text-white shadow' : 'bg-neutral-100 hover:bg-neutral-200'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample template dynamic placeholder helper */}
              <div className="space-y-1">
                <span className="font-mono text-[10px] uppercase text-zinc-400 font-bold block">
                  Expected Columns & Demo CSV Sample:
                </span>
                <pre className="p-2.5 bg-neutral-900 text-emerald-400 font-mono text-[10px] rounded leading-normal overflow-x-auto">
                  {importDataset === 'students' && "Format: NameEn, NameHi, Class, Section, RollNumber\nExample:\nPooja Kumari, पूजा कुमारी, Class X, A, 114\nShreya Sinha, श्रेया सिन्हा, Class X, B, 115"}
                  {importDataset === 'teachers' && "Format: NameEn, NameHi, Designation, Subject, Email\nExample:\nRanveer Roy, रणबीर रॉय, Senior Lecturer, Physics, ranveer.roy@omarbalika132.edu.in\nMegha Das, मेघा दास, Assistant Mistress, Biography, megha.das@omarbalika132.edu.in"}
                  {importDataset === 'timetable' && "Format: Class, Section, Day, Period, TimeSlot, Subject, Teacher\nExample:\nClass X, A, Monday, 1, 09:00 AM - 09:45 AM, Chemistry, Dr. Sharda Sahay\nClass IX, B, Tuesday, 2, 09:45 AM - 10:30 AM, English Literature, Meena Jha"}
                  {importDataset === 'results' && "Format: StudentId, Subject, Marks(0-100), Grade, TermName\nExample:\nstudent_123, Mathematics, 88, A+, Mid-Term Assessment\nstudent_456, General Science, 92, A+, Mid-Term Assessment"}
                </pre>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase text-zinc-500 font-bold block">
                  Paste Comma-Separated (CSV) Rows Below:
                </label>
                <textarea
                  required
                  rows={6}
                  value={importCsvText}
                  onChange={(e) => setImportCsvText(e.target.value)}
                  placeholder="Paste rows here..."
                  className="p-3 border rounded w-full bg-white font-mono leading-normal focus:outline-orange-600"
                />
              </div>

              {/* Progress and status overlays */}
              {importValidationErrors.length > 0 && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded text-[11px] leading-relaxed text-red-600 font-semibold space-y-1">
                  <p className="font-bold font-mono text-xs text-red-700 flex items-center gap-1">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>CSV Validation Failure (Execution Blocked):</span>
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {importValidationErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              {importSuccessRows !== null && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-[11px] font-bold text-emerald-800 rounded space-y-1 flex items-start gap-2 animate-pulse">
                  <CheckSquare className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-emerald-900 leading-none">Import Transacted Successfully!</h5>
                    <p className="font-normal font-mono text-[10px] mt-1 text-emerald-700">
                      Successfully parsed and committed {importSuccessRows} records to the live schools database.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="px-5 py-2 bg-[#1A3A5C] text-white hover:bg-[#1A3A5C]/95 text-[11px] font-mono font-bold rounded flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>Run Batch Production Import</span>
              </button>
            </form>
          </div>
        )}

        {/* 9. DURABLE SYSTEM SCHOOL SETTINGS INTERFACE */}
        {adminTab === 'settings' && (
          <div className="bg-white p-5 rounded shadow-xs space-y-6">
            <h3 className="text-sm md:text-base font-serif font-bold text-[#1A3A5C] border-b pb-2 flex justify-between items-center">
              <span>{language === 'en' ? 'School Profile & Central Dynamics' : 'स्कूल प्रोफाइल एवं मूल सेटिंग्स'}</span>
              <span className="text-[10px] bg-[#2E7D32]/10 text-[#2E7D32] px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                Durable System Settings
              </span>
            </h3>

            {settingsSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 rounded animate-bounce">
                ✓ {language === 'en' ? 'School settings saved and synchronized live!' : 'स्कूल सेटिंग्स सफलतापूर्वक सहेज ली गई हैं!'}
              </div>
            )}

            <form onSubmit={handleSaveSettingsSubmit} className="space-y-5 text-xs text-gray-700">
              {/* Group 1: Identity Names */}
              <div className="bg-neutral-50 p-4 rounded border border-neutral-200/50 space-y-4">
                <h4 className="font-bold text-[#1A3A5C] font-mono uppercase text-[10px]">1. Institutional Identity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">School Name (English)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsNameEn}
                      onChange={(e) => setSetsNameEn(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">स्कूल का नाम (हिन्दी)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsNameHi}
                      onChange={(e) => setSetsNameHi(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Official Address (English)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsAddrEn}
                      onChange={(e) => setSetsAddrEn(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">आधिकारिक पता (हिन्दी)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsAddrHi}
                      onChange={(e) => setSetsAddrHi(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Principal Profile */}
              <div className="bg-neutral-50 p-4 rounded border border-neutral-200/50 space-y-4">
                <h4 className="font-bold text-[#1A3A5C] font-mono uppercase text-[10px]">2. Administrative Leadership (Head Desk)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Head Name (English)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsPrincEn}
                      onChange={(e) => setSetsPrincEn(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">प्रधानाचार्य का नाम (हिन्दी)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsPrincHi}
                      onChange={(e) => setSetsPrincHi(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Official Designation (English)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsDesigEn}
                      onChange={(e) => setSetsDesigEn(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">पदनाम (हिन्दी)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsDesigHi}
                      onChange={(e) => setSetsDesigHi(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Principal Message (English)</label>
                    <textarea
                      rows={3}
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsMsgEn}
                      onChange={(e) => setSetsMsgEn(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">प्रधानाचार्य सन्देश (हिन्दी)</label>
                    <textarea
                      rows={3}
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsMsgHi}
                      onChange={(e) => setSetsMsgHi(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Principal Qualifications (English)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E] text-xs"
                      placeholder="E.g. M.A., B.Ed, Principal"
                      value={setsPrincQualEn}
                      onChange={(e) => setSetsPrincQualEn(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">प्रधानाचार्य शैक्षणिक योग्यता (हिन्दी)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E] text-xs"
                      placeholder="जैसे एम.ए., बी.एड, प्राचार्य"
                      value={setsPrincQualHi}
                      onChange={(e) => setSetsPrincQualHi(e.target.value)}
                    />
                  </div>
                </div>

                {/* Principal Photo Uploader Component */}
                <div className="border-t pt-4 space-y-2">
                  <label className="block text-xs font-bold font-mono text-[#1A3A5C] uppercase tracking-wide">Principal Portrait Photo</label>
                  <p className="text-[10px] text-zinc-500 font-mono">This photo will represent you on the public main screen and faculty rosters.</p>
                  <div className="flex items-center gap-4 bg-white p-3 border border-zinc-200 rounded">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          setUploadingPhoto(true);
                          const fileId = `principal_portrait_${Date.now()}`;
                          try {
                            const { ref: sRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
                            const storageRef = sRef(storage, `principal/${fileId}`);
                            const snap = await uploadBytes(storageRef, f);
                            const url = await getDownloadURL(snap.ref);
                            setSetsLogo(url);
                          } catch (storageErr) {
                            console.warn("Storage failed. Falling back to base64:", storageErr);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSetsLogo(reader.result as string);
                            };
                            reader.readAsDataURL(f);
                          } finally {
                            setUploadingPhoto(false);
                          }
                        }
                      }}
                      className="text-xs text-slate-500 font-mono file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#D4522A] hover:file:bg-orange-100"
                    />
                    {uploadingPhoto ? (
                      <span className="text-xs text-[#D4522A] animate-pulse font-mono">Uploading Portrait...</span>
                    ) : setsLogo ? (
                      <div className="relative w-11 h-11 border rounded-md overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={setsLogo} alt="Principal Portrait" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setSetsLogo('')}
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-[8px] font-bold text-white transition-opacity font-mono"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-mono italic">No portrait uploaded (initials used)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Group 3: Technical Codes & Counts */}
              <div className="bg-neutral-50 p-4 rounded border border-neutral-200/50 space-y-4">
                <h4 className="font-bold text-[#1A3A5C] font-mono uppercase text-[10px]">3. Institutional Statistics & Government Codes</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">UDISE Unified Code</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E] font-mono"
                      value={setsUdise}
                      onChange={(e) => setSetsUdise(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">BSEB School Code</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E] font-mono"
                      value={setsBseb}
                      onChange={(e) => setSetsBseb(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Establishment Year</label>
                    <input
                      type="number"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E] font-mono"
                      value={setsEstYear}
                      onChange={(e) => setSetsEstYear(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Teacher Strength Count</label>
                    <input
                      type="number"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E] font-mono"
                      value={setsTeachCount}
                      onChange={(e) => setSetsTeachCount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Girls Student Strength Count</label>
                    <input
                      type="number"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E] font-mono"
                      value={setsStudCount}
                      onChange={(e) => setSetsStudCount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Matric / Class X Pass Rate (%)</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E]"
                      value={setsPassRate}
                      onChange={(e) => setSetsPassRate(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Contact particulars */}
              <div className="bg-neutral-50 p-4 rounded border border-neutral-200/50 space-y-4">
                <h4 className="font-bold text-[#1A3A5C] font-mono uppercase text-[10px]">4. Institutional Contacts</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Contact Phone</label>
                    <input
                      type="text"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E] font-mono"
                      value={setsPhone}
                      onChange={(e) => setSetsPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono mb-1">Official E-mail</label>
                    <input
                      type="email"
                      className="w-full p-2.5 border border-zinc-300 rounded bg-white text-[#1C1C1E] font-mono"
                      value={setsEmail}
                      onChange={(e) => setSetsEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#D4522A] text-white hover:bg-[#D4522A]/90 text-xs font-mono font-bold rounded shadow-md uppercase transition"
                >
                  Save and Publish School settings
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
