/**
 * Core Types & Typescripts Definitions
 * Omar Girls High School, Bihar, India
 */

export type Language = 'en' | 'hi';

export enum UserRole {
  VISITOR = 'VISITOR',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export interface SchoolSettings {
  schoolNameEn: string;
  schoolNameHi: string;
  logo: string;
  principalNameEn: string;
  principalNameHi: string;
  principalDesignationEn: string;
  principalDesignationHi: string;
  principalMessageEn: string;
  principalMessageHi: string;
  principalQualificationsEn?: string;
  principalQualificationsHi?: string;
  phone: string;
  email: string;
  addressEn: string;
  addressHi: string;
  udise: string;
  bsebCode: string;
  bsebMatricCode?: string;
  bsebInterCode?: string;
  teacherCount: number;
  studentCount: number;
  passRate: string;
  establishmentYear: number;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  nameEn: string;
  nameHi: string;
  email?: string;
  mobile?: string;
  rollNo?: string;
  admissionNo?: string;
  className?: string; // Class IX, X, XI, XII (Girls High School usually 9th to 12th in Bihar system)
  section?: string;
  dob?: string;
  forcePasswordChange?: boolean;
  status?: 'Active' | 'Disabled' | 'Transferred';
}

export type NoticeCategory = 'Academic' | 'Examination' | 'Scholarship' | 'Admission' | 'Holiday' | 'Urgent';

export interface Notice {
  id: string;
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
  category: NoticeCategory;
  publishedDate: string;
  expiryDate?: string;
  isUrgent: boolean;
  isPinned: boolean;
  pdfUrl?: string;
  author: string;
}

export interface ScholarshipScheme {
  id: string;
  titleEn: string;
  titleHi: string;
  category: 'State' | 'Central' | 'Bicycle' | 'Uniform' | 'Medhavriti' | 'Mukhyamantri';
  descriptionEn: string;
  descriptionHi: string;
  eligibilityEn: string;
  eligibilityHi: string;
  benefitsEn: string;
  benefitsHi: string;
  deadline: string;
  documentsEn: string[];
  documentsHi: string[];
  contactPerson: string;
  contactDesignation: string;
  medhasoftInfoEn?: string;
  medhasoftInfoHi?: string;
  dbtInfoEn?: string;
  dbtInfoHi?: string;
}

export interface StudentProfile {
  id: string;
  rollNo: string;
  nameEn: string;
  nameHi: string;
  email?: string;
  className: 'Class IX' | 'Class X' | 'Class XI' | 'Class XII';
  section: 'A' | 'B' | 'C';
  fatherNameEn: string;
  fatherNameHi: string;
  motherNameEn: string;
  motherNameHi: string;
  dob: string;
  category: 'General' | 'OBC' | 'EBC' | 'SC' | 'ST';
  bankAccountLast4: string;
  ifscCode: string;
  medhasoftStatus: 'Verified' | 'Pending Verification' | 'Rejected' | 'Not Registered';
  dbtPaymentStatus: 'Payment Disbursed' | 'In Process' | 'Aadhaar Account Link Pending' | 'Details Required';
  status?: 'Active' | 'Transferred' | 'Disabled';
}

export interface TeacherProfile {
  id: string;
  nameEn: string;
  nameHi: string;
  designationEn: string;
  designationHi: string;
  qualificationEn: string;
  qualificationHi: string;
  subjectsEn: string[];
  subjectsHi: string[];
  email: string;
  avatarUrl?: string;
  dob?: string;
  status?: 'Active' | 'Disabled';
}

export interface TimetableEntry {
  id: string;
  className: string;
  section: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number; // 1 to 8
  time: string;
  subjectEn: string;
  subjectHi: string;
  teacherEn: string;
  teacherHi: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Leave';
  className: string;
  section: string;
}

export interface ExamResult {
  id: string;
  studentId: string;
  examNameEn: string;
  examNameHi: string;
  academicYear: string;
  subBlockMarks: {
    subjectEn: string;
    subjectHi: string;
    fullMarks: number;
    passMarks: number;
    marksObtained: number;
    grade: string;
  }[];
  totalPercentage: number;
  grade: string;
  resultStatus: 'PASS' | 'PROMOTED' | 'FAIL';
  remarksEn: string;
  remarksHi: string;
}

export interface Homework {
  id: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  className: string;
  section: string;
  subjectEn: string;
  subjectHi: string;
  assignedDate: string;
  dueDate: string;
  teacherName: string;
}

export interface StudyMaterial {
  id: string;
  titleEn: string;
  titleHi: string;
  className: string;
  subjectEn: string;
  subjectHi: string;
  descriptionEn?: string;
  descriptionHi?: string;
  downloadUrl?: string;
  fileSize?: string;
  uploadedDate: string;
  isELots: boolean; // Bihar e-LOTS portal educational resources
}

export interface Book {
  id: string;
  titleEn: string;
  titleHi: string;
  authorEn: string;
  authorHi: string;
  categoryEn: string;
  categoryHi: string;
  accessionNo: string;
  isAvailable: boolean;
  shelfLocation: string;
}

export interface Grievance {
  id: string;
  ticketNo: string;
  categoryEn: string;
  categoryHi: string;
  content: string;
  isAnonymous: boolean;
  complainantName?: string;
  complainantPhone?: string;
  submittedDate: string;
  status: 'Submitted' | 'Under Investigation' | 'Resolved' | 'Closed';
  resolutionNoteEn?: string;
  resolutionNoteHi?: string;
  resolutionDate?: string;
}

export interface CertificateRequest {
  id: string;
  referenceNo: string;
  studentNameEn: string;
  studentNameHi: string;
  rollNo: string;
  className: string;
  academicYear: string;
  type: 'Transfer Certificate' | 'School Leaving Certificate (SLC)' | 'Bonafide Certificate' | 'Character Certificate';
  reasonEn: string;
  reasonHi: string;
  documentsAttached: string[];
  status: 'Applied' | 'In Process' | 'Ready for Collection' | 'Dispatched' | 'Rejected';
  appliedDate: string;
  completionDate?: string;
  instructionsEn?: string;
  instructionsHi?: string;
}

export interface FAQItem {
  questionEn: string;
  questionHi: string;
  answerEn: string;
  answerHi: string;
}
