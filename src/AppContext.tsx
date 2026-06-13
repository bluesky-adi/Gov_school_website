import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  UserRole,
  UserProfile,
  Notice,
  ScholarshipScheme,
  StudentProfile,
  TeacherProfile,
  TimetableEntry,
  ExamResult,
  Homework,
  StudyMaterial,
  Book,
  FAQItem,
  Grievance,
  CertificateRequest,
  AttendanceRecord,
  SchoolSettings
} from './types.ts';
import {
  INITIAL_NOTICES,
  SCHOLARSHIPS_AND_SCHEMES,
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  PORTAL_FAQS,
  INITIAL_TIMETABLE,
  INITIAL_EXAM_RESULTS,
  INITIAL_HOMEWORK,
  INITIAL_STUDY_MATERIALS,
  INITIAL_BOOKS,
  INITIAL_GRIEVANCES,
  INITIAL_CERTIFICATE_REQUESTS
} from './data.ts';
import { collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, signOut as firebaseSignOut, inMemoryPersistence, initializeAuth, getAuth } from 'firebase/auth';
import { firedb, auth, handleFirestoreError, OperationType } from './firebase.ts';
import { getApps, initializeApp } from 'firebase/app';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize secondary app with safe hot-reloading guard to manage student & teacher Auth creation
const secondaryApp = getApps().find(app => app.name === "SecondaryOrgApp") || initializeApp(firebaseConfig, "SecondaryOrgApp");
let secAuth;
const existingApp = getApps().find(app => app.name === "SecondaryOrgApp");
if (existingApp) {
  secAuth = getAuth(existingApp);
} else {
  try {
    secAuth = initializeAuth(secondaryApp, {
      persistence: inMemoryPersistence
    });
  } catch (e) {
    secAuth = getAuth(secondaryApp);
  }
}
export const secondaryAuth = secAuth;

// Helper to ensure user is created in Firebase Auth and we have their real UID
const getOrCreateAuthUser = async (email: string, passwordAllowed: string): Promise<string> => {
  try {
    const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, passwordAllowed);
    await firebaseSignOut(secondaryAuth);
    return userCred.user.uid;
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use' || error.message?.includes('already-in-use')) {
      try {
        const userCred = await signInWithEmailAndPassword(secondaryAuth, email, passwordAllowed);
        const uid = userCred.user.uid;
        await firebaseSignOut(secondaryAuth);
        return uid;
      } catch (signInErr: any) {
        console.warn("Could not sign in to retrieve existing UID:", signInErr.message);
        throw new Error(`Authentication record already exists for ${email}, but credentials mismatch or cannot sign in: ${signInErr.message}`);
      }
    } else {
      throw error;
    }
  }
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  
  adminTab: 'dash' | 'notices' | 'yojanas' | 'grievances' | 'certificates' | 'users' | 'cms' | 'imports' | 'settings';
  setAdminTab: (tab: 'dash' | 'notices' | 'yojanas' | 'grievances' | 'certificates' | 'users' | 'cms' | 'imports' | 'settings') => void;
  
  schoolSettings: SchoolSettings;
  updateSchoolSettings: (settings: Partial<SchoolSettings>) => Promise<void>;

  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  loginAs: (role: UserRole, identifier?: string, passwordEntered?: string) => Promise<string | null>; // returns error message or null if success
  logout: () => Promise<void>;
  isOnline: boolean;
  changeUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  
  usersList: UserProfile[];
  manageUserCreate: (newProfile: Omit<UserProfile, "id"> & { status: "Active" | "Disabled"; createdBy: string; createdAt: string; password?: string }) => Promise<void>;
  manageUserUpdate: (id: string, updates: Partial<UserProfile & { status: string }>) => Promise<void>;
  manageUserDelete: (id: string) => Promise<void>;

  setMedhasoftVerifiedState: (studentId: string, status: string) => Promise<void>;
  resolveGrievance: (id: string, resolutionEn: string, resolutionHi: string) => Promise<void>;

  notices: Notice[];
  addNotice: (notice: Omit<Notice, 'id' | 'publishedDate'>) => void;
  updateNotice: (id: string, notice: Partial<Notice>) => Promise<void>;
  deleteNotice: (id: string) => void;
  
  schemes: ScholarshipScheme[];
  addScheme: (scheme: Omit<ScholarshipScheme, "id">) => Promise<void>;
  updateScheme: (id: string, scheme: Partial<ScholarshipScheme>) => Promise<void>;
  deleteScheme: (id: string) => Promise<void>;

  students: StudentProfile[];
  updateStudentDBT: (id: string, medhasoft: any, dbt: any) => void;
  addStudent: (student: Omit<StudentProfile, 'id'>) => void;
  updateStudent: (id: string, student: Partial<StudentProfile>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  teachers: TeacherProfile[];
  addTeacher: (teacher: Omit<TeacherProfile, "id">) => Promise<void>;
  updateTeacher: (id: string, teacher: Partial<TeacherProfile>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;

  timetable: TimetableEntry[];
  addTimetableEntry: (entry: Omit<TimetableEntry, "id">) => Promise<void>;
  updateTimetableEntry: (id: string, entry: Partial<TimetableEntry>) => Promise<void>;
  deleteTimetableEntry: (id: string) => Promise<void>;

  examResults: ExamResult[];
  
  homework: Homework[];
  addHomework: (hw: Omit<Homework, 'id' | 'assignedDate'>) => void;
  deleteHomework: (id: string) => void;
  
  studyMaterials: StudyMaterial[];
  addStudyMaterial: (mat: Omit<StudyMaterial, 'id' | 'uploadedDate'>) => void;
  updateStudyMaterial: (id: string, mat: Partial<StudyMaterial>) => Promise<void>;
  deleteStudyMaterial: (id: string) => Promise<void>;
  
  books: Book[];
  addBook: (book: Omit<Book, "id">) => Promise<void>;
  updateBook: (id: string, book: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  searchBooks: (query: string) => Book[];
  
  faqs: FAQItem[];
  
  grievances: Grievance[];
  addGrievance: (g: Omit<Grievance, 'id' | 'ticketNo' | 'submittedDate' | 'status'>) => string; // returns ticketNo
  updateGrievanceStatus: (id: string, status: any, resolutionEn?: string, resolutionHi?: string) => void;
  queryGrievanceByTicket: (ticketNo: string) => Promise<Grievance | null>;
  
  certificates: CertificateRequest[];
  applyCertificate: (req: Omit<CertificateRequest, 'id' | 'referenceNo' | 'status' | 'appliedDate'>) => string; // returns refNo
  updateCertificateStatus: (id: string, status: any, instructionsEn?: string, instructionsHi?: string) => void;
  queryCertificateByReference: (refNo: string) => Promise<CertificateRequest | null>;

  attendance: AttendanceRecord[];
  submitBulkAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  submitBulkResults: (results: ExamResult[]) => void;
  isAdminCreated: boolean;
  bootstrapFirstAdmin: () => Promise<{ success: boolean; email?: string; error?: string }>;
}

const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  schoolNameEn: "Rajyakrit Omar Girl's +2 School",
  schoolNameHi: "राजकीयकृत उमर गर्ल्स +2 स्कूल",
  logo: "/logo.png",
  principalNameEn: "Md Afroz Alam",
  principalNameHi: "मो अफ़रोज़ आलम",
  principalDesignationEn: "Principal",
  principalDesignationHi: "प्राचार्य",
  principalMessageEn: "Dear students and parents, Rajyakrit Omar Girl's +2 School has been a beacon of learning since 1947. In alignment with Bihar Government educational goals, we emphasize girls' education, digital literacy, and academic excellence following the Bihar School Examination Board (BSEB) curriculum. We empower our girls through modern computer education and Bihar state welfare schemes. I invite you to join our digital shift.",
  principalMessageHi: "प्रिय छात्राओं एवं अभिभावकों, राजकीयकृत उमर गर्ल्स +2 स्कूल १९४७ से शिक्षा का ज्योति पुंज रहा है। हम बिहार सरकार के शैक्षिक लक्ष्यों के अनुरूप बिहार विद्यालय परीक्षा समिति (BSEB) द्वारा संचालित माध्यमिक एवं उच्च माध्यमिक पाठ्यक्रमों के माध्यम से न केवल शैक्षणिक उत्कृष्टता बल्कि आधुनिक कम्प्यूटर शिक्षा, डिजिटल साक्षरता और राज्य की विभिन्न कल्याणकारी योजनाओं से बालिकाओं को सशक्त बनाते हैं। मैं आप सभी को हमारे इस डिज़िटल और शैक्षणिक सफर से जुड़ने का आमंत्रण देता हूँ।",
  principalQualificationsEn: "",
  principalQualificationsHi: "",
  phone: "+91 94314 00000",
  email: "omarbalika132@gmail.com",
  addressEn: "Bishnupur, Begusarai, Bihar, 851101",
  addressHi: "विष्णुपुर, बेगूसराय, बिहार, 851101",
  udise: "10201001210",
  bsebCode: "26011",
  bsebMatricCode: "26011",
  bsebInterCode: "84091",
  teacherCount: 32,
  studentCount: 1800,
  passRate: "96.6%",
  establishmentYear: 1947
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  // Load initial settings
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('oghs_lang');
    return (saved as Language) || 'en';
  });

  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [adminTab, setAdminTab] = useState<'dash' | 'notices' | 'yojanas' | 'grievances' | 'certificates' | 'users' | 'cms' | 'imports' | 'settings'>('dash');

  // State models - initialized with static defaults and synced via Firestore
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<TeacherProfile[]>(INITIAL_TEACHERS);
  const [timetable, setTimetable] = useState<TimetableEntry[]>(INITIAL_TIMETABLE);
  const [examResults, setExamResults] = useState<ExamResult[]>(INITIAL_EXAM_RESULTS);
  const [homework, setHomework] = useState<Homework[]>(INITIAL_HOMEWORK);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(INITIAL_STUDY_MATERIALS);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [faqs] = useState<FAQItem[]>(PORTAL_FAQS);
  const [schemes, setSchemes] = useState<ScholarshipScheme[]>(SCHOLARSHIPS_AND_SCHEMES);
  const [grievances, setGrievances] = useState<Grievance[]>(INITIAL_GRIEVANCES);
  const [certificates, setCertificates] = useState<CertificateRequest[]>(INITIAL_CERTIFICATE_REQUESTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Connection Status listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync document language of course
  useEffect(() => {
    localStorage.setItem('oghs_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  // Dynamic School Settings subscription
  useEffect(() => {
    const docRef = doc(firedb, 'school_settings', 'current');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setSchoolSettings(docSnap.data() as SchoolSettings);
      } else {
        setDoc(docRef, DEFAULT_SCHOOL_SETTINGS)
          .then(() => {
            setSchoolSettings(DEFAULT_SCHOOL_SETTINGS);
          })
          .catch((e) => {
            console.warn("School settings seeding or permissions issue (expected for visitors):", e.message);
          });
      }
    }, (error) => {
      console.warn("School settings read restricted or offline:", error.message);
    });
    return unsubscribe;
  }, []);

  const [isAdminCreated, setIsAdminCreated] = useState<boolean>(true);

  // Monitor first admin presence
  useEffect(() => {
    const usersRef = collection(firedb, 'users');
    const q = query(usersRef, where('role', '==', UserRole.ADMIN));
    const unsubscribe = onSnapshot(q, (snap) => {
      if (snap.empty) {
        console.log("BOOTSTRAP MONITOR: No administrators exist in the database yet!");
        setIsAdminCreated(false);
      } else {
        console.log("BOOTSTRAP MONITOR: Found active admins. Setup disabled.");
        setIsAdminCreated(true);
      }
    }, (err) => {
      console.warn("Bootstrap monitor issue (could be visitor or offline):", err.message);
    });
    return unsubscribe;
  }, []);

  const bootstrapFirstAdmin = async () => {
    try {
      const email = 'omarbalika132@gmail.com';
      const password = 'AdminPass123';
      let firebaseUser;
      try {
        const uCred = await createUserWithEmailAndPassword(auth, email, password);
        firebaseUser = uCred.user;
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use' || authErr.message?.includes('already-in-use')) {
          const uCred = await signInWithEmailAndPassword(auth, email, password);
          firebaseUser = uCred.user;
        } else {
          throw authErr;
        }
      }

      if (firebaseUser) {
        const profile: UserProfile = {
          id: firebaseUser.uid,
          role: UserRole.ADMIN,
          nameEn: 'Smt. Aadiya Priyam (Admin)',
          nameHi: 'श्रीमती आदिया प्रियम् (प्रशासक)',
          email: email
        };
        await setDoc(doc(firedb, 'users', firebaseUser.uid), profile);
        await setDoc(doc(firedb, 'admins', firebaseUser.uid), {
          uid: firebaseUser.uid,
          role: 'ADMIN',
          permissions: ['all']
        });
        setIsAdminCreated(true);
        return { success: true, email };
      }
      return { success: false, error: 'Authorization setup could not be established.' };
    } catch (e: any) {
      console.error("Bootstrap first admin error:", e);
      return { success: false, error: e.message || String(e) };
    }
  };

  const updateSchoolSettings = async (updates: Partial<SchoolSettings>) => {
    try {
      const docRef = doc(firedb, 'school_settings', 'current');
      await setDoc(docRef, { ...schoolSettings, ...updates }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'school_settings/current');
    }
  };

  // Real Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(firedb, 'users', firebaseUser.uid);
        const unsubSnapshot = onSnapshot(userDocRef, (userDoc) => {
          if (userDoc.exists()) {
            setUserState(userDoc.data() as UserProfile);
          } else {
            // Self-healing bootstrap if doc missing
            const isPrincipalEmail = firebaseUser.email === 'omarbalika132@gmail.com' || firebaseUser.email === 'aadiyapriyam142005@gmail.com';
            const bootstrapProfile: UserProfile = {
              id: firebaseUser.uid,
              role: isPrincipalEmail ? UserRole.ADMIN : UserRole.VISITOR,
              nameEn: firebaseUser.displayName || 'Guest Visitor',
              nameHi: 'अतिथि आगंतुक',
              email: firebaseUser.email || undefined
            };
            setUserState(bootstrapProfile);
            setDoc(userDocRef, bootstrapProfile).catch(err => console.error("Profile write error:", err));
            if (isPrincipalEmail) {
              setDoc(doc(firedb, 'admins', firebaseUser.uid), {
                uid: firebaseUser.uid,
                role: 'ADMIN',
                permissions: ['all']
              }).catch(err => console.error("Admin write error:", err));
            }
          }
        }, (err) => {
          console.error("User doc read denied or error:", err);
        });
        return () => unsubSnapshot();
      } else {
        setUserState(null);
      }
    });

    return unsubscribe;
  }, []);

  // --- FIRESTORE SUBSCRIPTIONS AND AUTO-SEEDING EFFECTS ---

  // 1. Notices Subscription and Seeding
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firedb, 'notices'), (snapshot) => {
      if (snapshot.empty) {
        if (user && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
          INITIAL_NOTICES.forEach(async (item) => {
            try {
              await setDoc(doc(firedb, 'notices', item.id), item);
            } catch (e) {
              console.error("Notices seeding error:", e);
            }
          });
        }
      } else {
        const items: Notice[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as Notice);
        });
        setNotices(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'notices');
    });
    return unsubscribe;
  }, [user]);

  // 2. Students Subscription and Seeding
  useEffect(() => {
    if (!user) {
      setStudents([]);
      return;
    }

    let q;
    if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) {
      q = collection(firedb, 'students');
    } else if (user.rollNo) {
      q = query(collection(firedb, 'students'), where('rollNo', '==', user.rollNo));
    } else {
      setStudents([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: StudentProfile[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id } as StudentProfile);
      });
      setStudents(items);

      // Only attempt to seed if collection is completely empty and user has write permissions
      if (snapshot.empty && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
        INITIAL_STUDENTS.forEach(async (item) => {
          try {
            await setDoc(doc(firedb, 'students', item.id), item);
          } catch (e) {
            console.error("Students seeding error:", e);
          }
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'students');
    });
    return unsubscribe;
  }, [user]);

  // 3. Exam Results Subscription and Seeding
  useEffect(() => {
    if (!user) {
      setExamResults([]);
      return;
    }

    let q;
    if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) {
      q = collection(firedb, 'examResults');
    } else if (user.rollNo) {
      const studentProfile = students.find(s => s.rollNo === user.rollNo);
      if (studentProfile) {
        q = query(collection(firedb, 'examResults'), where('studentId', '==', studentProfile.id));
      } else {
        setExamResults([]);
        return;
      }
    } else {
      setExamResults([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: ExamResult[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id } as ExamResult);
      });
      setExamResults(items);

      if (snapshot.empty && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
        INITIAL_EXAM_RESULTS.forEach(async (item) => {
          try {
            await setDoc(doc(firedb, 'examResults', item.id), item);
          } catch (e) {
            console.error("Exam results seeding error:", e);
          }
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'examResults');
    });
    return unsubscribe;
  }, [user, students]);

  // 4. Attendance Subscription and Seeding
  useEffect(() => {
    if (!user) {
      setAttendance([]);
      return;
    }

    let q;
    if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) {
      q = collection(firedb, 'attendance');
    } else if (user.rollNo) {
      const studentProfile = students.find(s => s.rollNo === user.rollNo);
      if (studentProfile) {
        q = query(collection(firedb, 'attendance'), where('studentId', '==', studentProfile.id));
      } else {
        setAttendance([]);
        return;
      }
    } else {
      setAttendance([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: AttendanceRecord[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id } as AttendanceRecord);
      });
      setAttendance(items);

      if (snapshot.empty && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
        const seeded: AttendanceRecord[] = [];
        const dates = ['2026-06-08', '2026-06-09', '2026-06-10'];
        INITIAL_STUDENTS.forEach((student) => {
          dates.forEach((date, i) => {
            seeded.push({
              id: `att_${student.id}_${i}`,
              studentId: student.id,
              date,
              status: i === 1 && student.id === 's103' ? 'Absent' : 'Present',
              className: student.className,
              section: student.section,
            });
          });
        });
        seeded.forEach(async (item) => {
          try {
            await setDoc(doc(firedb, 'attendance', item.id), item);
          } catch (e) {
            console.error("Attendance seeding error:", e);
          }
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'attendance');
    });
    return unsubscribe;
  }, [user, students]);

  // 5. Homework Subscription and Seeding
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firedb, 'homework'), (snapshot) => {
      if (snapshot.empty) {
        // Only seed if collection is completely empty and user has write permissions
        if (user && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
          INITIAL_HOMEWORK.forEach(async (item) => {
            try {
              await setDoc(doc(firedb, 'homework', item.id), item);
            } catch (e) {
              console.error("Homework seeding error:", e);
            }
          });
        }
      } else {
        const items: Homework[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as Homework);
        });
        setHomework(items);
      }
    }, (error) => {
      // Just log warning if homework list fails to read
      console.warn("Homework reading is restricted or offline:", error.message);
    });
    return unsubscribe;
  }, [user]);

  // 6. Study Materials Subscription and Seeding
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firedb, 'studyMaterials'), (snapshot) => {
      if (snapshot.empty) {
        // Only seed if collection is completely empty and user has write permissions
        if (user && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
          INITIAL_STUDY_MATERIALS.forEach(async (item) => {
            try {
              await setDoc(doc(firedb, 'studyMaterials', item.id), item);
            } catch (e) {
              console.error("Study materials seeding error:", e);
            }
          });
        }
      } else {
        const items: StudyMaterial[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as StudyMaterial);
        });
        setStudyMaterials(items);
      }
    }, (error) => {
      // Just log warning if study materials fails to read
      console.warn("Study materials reading is restricted or offline:", error.message);
    });
    return unsubscribe;
  }, [user]);

  // 7. Grievances Subscription and Seeding (Only Admin/Staff lists them)
  useEffect(() => {
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.TEACHER)) {
      setGrievances([]);
      return;
    }

    const unsubscribe = onSnapshot(collection(firedb, 'grievances'), (snapshot) => {
      if (snapshot.empty) {
        INITIAL_GRIEVANCES.forEach(async (item) => {
          try {
            await setDoc(doc(firedb, 'grievances', item.id), item);
          } catch (e) {
            console.error("Grievances seeding error:", e);
          }
        });
      } else {
        const items: Grievance[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as Grievance);
        });
        setGrievances(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'grievances');
    });
    return unsubscribe;
  }, [user]);

  // 8. Certificates Subscription and Seeding
  useEffect(() => {
    if (!user) {
      setCertificates([]);
      return;
    }

    let q;
    if (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER) {
      q = collection(firedb, 'certificates');
    } else if (user.rollNo) {
      q = query(collection(firedb, 'certificates'), where('rollNo', '==', user.rollNo));
    } else {
      setCertificates([]);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: CertificateRequest[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id } as CertificateRequest);
      });
      setCertificates(items);

      if (snapshot.empty && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
        INITIAL_CERTIFICATE_REQUESTS.forEach(async (item) => {
          try {
            await setDoc(doc(firedb, 'certificates', item.id), item);
          } catch (e) {
            console.error("Certificates seeding error:", e);
          }
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'certificates');
    });
    return unsubscribe;
  }, [user]);

  // 9. Teachers Subscription and Seeding
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firedb, 'teachers'), (snapshot) => {
      if (snapshot.empty) {
        if (user && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
          INITIAL_TEACHERS.forEach(async (item) => {
            try {
              await setDoc(doc(firedb, 'teachers', item.id), item);
            } catch (e) {
              console.error("Teachers seeding error:", e);
            }
          });
        }
      } else {
        const items: TeacherProfile[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as TeacherProfile);
        });
        setTeachers(items);
      }
    }, (error) => {
      console.warn("Teachers reading restricted or offline:", error.message);
    });
    return unsubscribe;
  }, [user]);

  // 10. Timetable Subscription and Seeding
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firedb, 'timetable'), (snapshot) => {
      if (snapshot.empty) {
        if (user && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
          INITIAL_TIMETABLE.forEach(async (item) => {
            try {
              await setDoc(doc(firedb, 'timetable', item.id), item);
            } catch (e) {
              console.error("Timetable seeding error:", e);
            }
          });
        }
      } else {
        const items: TimetableEntry[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as TimetableEntry);
        });
        setTimetable(items);
      }
    }, (error) => {
      console.warn("Timetable reading restricted or offline:", error.message);
    });
    return unsubscribe;
  }, [user]);

  // 11. Books Subscription and Seeding
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firedb, 'books'), (snapshot) => {
      if (snapshot.empty) {
        if (user && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
          INITIAL_BOOKS.forEach(async (item) => {
            try {
              await setDoc(doc(firedb, 'books', item.id), item);
            } catch (e) {
              console.error("Books seeding error:", e);
            }
          });
        }
      } else {
        const items: Book[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as Book);
        });
        setBooks(items);
      }
    }, (error) => {
      console.warn("Books reading restricted or offline:", error.message);
    });
    return unsubscribe;
  }, [user]);

  // 12. Schemes Subscription and Seeding
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firedb, 'schemes'), (snapshot) => {
      if (snapshot.empty) {
        if (user && (user.role === UserRole.ADMIN || user.role === UserRole.TEACHER)) {
          SCHOLARSHIPS_AND_SCHEMES.forEach(async (item) => {
            try {
              await setDoc(doc(firedb, 'schemes', item.id), item);
            } catch (e) {
              console.error("Schemes seeding error:", e);
            }
          });
        }
      } else {
        const items: ScholarshipScheme[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ ...docSnap.data(), id: docSnap.id } as ScholarshipScheme);
        });
        setSchemes(items);
      }
    }, (error) => {
      console.warn("Schemes reading restricted or offline:", error.message);
    });
    return unsubscribe;
  }, [user]);

  // 13. Users List Listener for Admin portal
  useEffect(() => {
    if (!user || user.role !== UserRole.ADMIN) {
      setUsersList([]);
      return;
    }
    const unsubscribe = onSnapshot(collection(firedb, 'users'), (snapshot) => {
      const items: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id } as UserProfile);
      });
      setUsersList(items);
    }, (error) => {
      console.warn("Users billing subscription restricted or offline:", error.message);
    });
    return unsubscribe;
  }, [user]);

  // Set Language
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  // Login Handler (Real multirole login using Firebase Authentication)
  const loginAs = async (role: UserRole, identifier?: string, passwordEntered?: string): Promise<string | null> => {
    try {
      let email = '';
      let password = passwordEntered || '';
      let nameEn = '';
      let nameHi = '';
      let rollNo = '';
      let className = 'Class X';
      let section = 'A';
      let admissionNo = '';

      if (role === UserRole.VISITOR) {
        email = 'guest.visitor@omarbalika132.edu.in';
        password = password || 'VisitorPass123';
        nameEn = 'Guest Visitor';
        nameHi = 'अतिथि आगंतुक';
      } else if (role === UserRole.ADMIN) {
        const cleanId = identifier && identifier.includes('@') ? identifier.trim() : 'omarbalika132@gmail.com';
        email = cleanId;
        password = password || 'AdminPass123';
        nameEn = 'Principal Admin';
        nameHi = 'प्रशासक';
      } else if (role === UserRole.TEACHER) {
        if (!identifier) {
          return language === 'en' ? 'Teacher Email or ID is required.' : 'शिक्षक ईमेल या आईडी आवश्यक है।';
        }
        const cleanId = identifier.trim();
        const teacher = teachers.find(t => t.id === cleanId || t.email === cleanId);
        if (cleanId.includes('@')) {
          email = cleanId;
        } else if (teacher && teacher.email) {
          email = teacher.email;
        } else {
          email = `teacher.${cleanId.toLowerCase()}@omarbalika132.edu.in`;
        }
        password = password || 'TeacherPass123';
        if (teacher) {
          nameEn = teacher.nameEn;
          nameHi = teacher.nameHi;
        } else {
          nameEn = `Teacher ${cleanId}`;
          nameHi = `शिक्षक ${cleanId}`;
        }
      } else if (role === UserRole.STUDENT) {
        if (!identifier) {
          return language === 'en' 
            ? 'Admission / Roll Number is required.' 
            : 'नामांकन / रोल नंबर दर्ज करना अनिवार्य है।';
        }
        const cleanId = identifier.trim();
        const student = students.find(s => s.rollNo === cleanId || s.id === cleanId);
        
        rollNo = student ? student.rollNo : cleanId;
        admissionNo = student ? (student.id || cleanId) : `ADM-2024-${cleanId}`;
        email = `student.${rollNo.toLowerCase()}@omarbalika132.edu.in`;
        password = password || 'StudentPass123';
        
        if (student) {
          nameEn = student.nameEn;
          nameHi = student.nameHi;
          className = student.className;
          section = student.section;
        } else {
          nameEn = `Student Roll ${rollNo}`;
          nameHi = `छात्रा रोल ${rollNo}`;
        }
      }

      // Perform real credentials authentication
      let firebaseUser;
      try {
        const uCred = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser = uCred.user;
      } catch (loginErr: any) {
        if (
          loginErr.code === 'auth/user-not-found' || 
          loginErr.code === 'auth/invalid-credential' || 
          loginErr.code === 'auth/invalid-email' ||
          loginErr.code === 'auth/user-disabled'
        ) {
          // Attempt on-the-fly registration to guarantee entry in fresh sandbox env
          try {
            const uCred = await createUserWithEmailAndPassword(auth, email, password);
            firebaseUser = uCred.user;
          } catch (registerErr: any) {
            return (language === 'en' ? 'Auth registration error: ' : 'सक्रिय पंजीकरण त्रुटि: ') + registerErr.message;
          }
        } else {
          return (language === 'en' ? 'Auth login failed: ' : 'लॉगिन विफल: ') + loginErr.message;
        }
      }

      if (firebaseUser) {
        // Construct and cache profile document in active /users collection
        const profile: UserProfile = {
          id: firebaseUser.uid,
          role,
          nameEn,
          nameHi,
          email,
          ...(rollNo && { rollNo, className, section, admissionNo })
        };

        await setDoc(doc(firedb, 'users', firebaseUser.uid), profile, { merge: true });

        // Provision administrative privileges inside Firestore /admins collection
        if (role === UserRole.ADMIN || role === UserRole.TEACHER) {
          await setDoc(doc(firedb, 'admins', firebaseUser.uid), {
            uid: firebaseUser.uid,
            role: role === UserRole.ADMIN ? 'ADMIN' : 'TEACHER',
            permissions: role === UserRole.ADMIN ? ['all'] : ['grades', 'attendance', 'homework']
          }, { merge: true });
        }
        return null; // Successful login
      }

      return 'Unable to establish Firebase session.';
    } catch (e: any) {
      console.error(e);
      return e.message;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUserState(null);
    } catch (e) {
      console.error("Logout issue:", e);
    }
  };

  const changeUserPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!auth.currentUser) {
        return { success: false, error: 'No authenticated session.' };
      }
      // Update password in Firebase Auth
      await updatePassword(auth.currentUser, newPassword);
      
      // Update custom profile in Firestore
      await updateDoc(doc(firedb, 'users', auth.currentUser.uid), {
        forcePasswordChange: false
      });
      
      // Update local state is also updated through onSnapshot
      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message };
    }
  };

  // Board Notice Management
  const addNotice = async (newNotice: Omit<Notice, 'id' | 'publishedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const noticeId = `notice_${Date.now()}`;
    const noticeItem: Notice = {
      ...newNotice,
      id: noticeId,
      publishedDate: today
    };
    try {
      await setDoc(doc(firedb, 'notices', noticeId), noticeItem);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `notices/${noticeId}`);
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      await deleteDoc(doc(firedb, 'notices', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `notices/${id}`);
    }
  };

  // Student Admin Actions
  const updateStudentDBT = async (id: string, medhasoftStatus: any, dbtPaymentStatus: any) => {
    try {
      await updateDoc(doc(firedb, 'students', id), { medhasoftStatus, dbtPaymentStatus });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `students/${id}`);
    }
  };

  const parseDobToPassword = (dob: string): string => {
    if (!dob) return 'WelcomePass123';
    const cleaned = dob.replace(/[^0-9]/g, '');
    if (dob.includes('-')) {
      const parts = dob.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const [y, m, d] = parts;
        return `${d}${m}${y}`;
      } else {
        // DD-MM-YYYY
        const [d, m, y] = parts;
        return `${d}${m}${y}`;
      }
    }
    return cleaned || 'WelcomePass123';
  };

  const addStudent = async (student: Omit<StudentProfile, 'id'>) => {
    const loginEmail = `student.${student.rollNo.toLowerCase()}@omarbalika132.edu.in`;
    const defaultPassword = parseDobToPassword(student.dob);
    let uid: string;
    try {
      uid = await getOrCreateAuthUser(loginEmail, defaultPassword);
    } catch (authErr: any) {
      console.error("Auth creation failed for Student:", authErr.message);
      throw authErr;
    }

    const newStudent: StudentProfile = {
      ...student,
      id: uid
    };

    try {
      // 1. Write student specialized profile record
      await setDoc(doc(firedb, 'students', uid), newStudent);

      // 2. Write unified public session profile record
      const userProfile: UserProfile = {
        id: uid,
        role: UserRole.STUDENT,
        nameEn: student.nameEn,
        nameHi: student.nameHi,
        email: loginEmail,
        rollNo: student.rollNo,
        className: student.className,
        section: student.section,
        admissionNo: student.rollNo,
        dob: student.dob,
        forcePasswordChange: true,
        status: 'Active'
      };
      await setDoc(doc(firedb, 'users', uid), userProfile);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `students/${uid}`);
    }
  };

  const updateStudent = async (id: string, student: Partial<StudentProfile>) => {
    try {
      await updateDoc(doc(firedb, 'students', id), student);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `students/${id}`);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(firedb, 'students', id));
      await deleteDoc(doc(firedb, 'users', id)).catch(() => {});
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `students/${id}`);
    }
  };

  // Homework Upload
  const addHomework = async (hw: Omit<Homework, 'id' | 'assignedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const hwId = `hw_${Date.now()}`;
    const newHw: Homework = {
      ...hw,
      id: hwId,
      assignedDate: today
    };
    try {
      await setDoc(doc(firedb, 'homework', hwId), newHw);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `homework/${hwId}`);
    }
  };

  const deleteHomework = async (id: string) => {
    try {
      await deleteDoc(doc(firedb, 'homework', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `homework/${id}`);
    }
  };

  // Study Materials Upload
  const addStudyMaterial = async (mat: Omit<StudyMaterial, 'id' | 'uploadedDate'>) => {
    const today = new Date().toISOString().split('T')[0];
    const smId = `sm_${Date.now()}`;
    const newMat: StudyMaterial = {
      ...mat,
      id: smId,
      uploadedDate: today
    };
    try {
      await setDoc(doc(firedb, 'studyMaterials', smId), newMat);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `studyMaterials/${smId}`);
    }
  };

  // Library Book Search
  const searchBooks = (query: string): Book[] => {
    if (!query.trim()) return books;
    const lower = query.toLowerCase();
    return books.filter(
      (b) =>
        b.titleEn.toLowerCase().includes(lower) ||
        b.titleHi.includes(lower) ||
        b.authorEn.toLowerCase().includes(lower) ||
        b.authorHi.includes(lower) ||
        b.accessionNo.toLowerCase().includes(lower)
    );
  };

  // Grievance Actions
  const addGrievance = (g: Omit<Grievance, 'id' | 'ticketNo' | 'submittedDate' | 'status'>): string => {
    const token = `G-2026-${Math.floor(10 + Math.random() * 90)}`;
    const today = new Date().toISOString().split('T')[0];
    const grId = `gr_${Date.now()}`;
    const newG: Grievance = {
      ...g,
      id: grId,
      ticketNo: token,
      submittedDate: today,
      status: 'Submitted'
    };
    
    // Async save to firestore in background
    setDoc(doc(firedb, 'grievances', grId), newG).catch((e) => {
      handleFirestoreError(e, OperationType.CREATE, `grievances/${grId}`);
    });
    
    return token;
  };

  const queryGrievanceByTicket = async (ticketNo: string): Promise<Grievance | null> => {
    try {
      const q = query(collection(firedb, 'grievances'), where('ticketNo', '==', ticketNo));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const firstDoc = querySnapshot.docs[0];
        return { ...firstDoc.data(), id: firstDoc.id } as Grievance;
      }
      return null;
    } catch (e) {
      console.error("Error querying grievance by ticket:", e);
      return null;
    }
  };

  const updateGrievanceStatus = async (
    id: string,
    status: 'Submitted' | 'Under Investigation' | 'Resolved' | 'Closed',
    resolutionEn?: string,
    resolutionHi?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const updates: any = { status };
    if (resolutionEn) updates.resolutionNoteEn = resolutionEn;
    if (resolutionHi) updates.resolutionNoteHi = resolutionHi;
    if (status === 'Resolved') updates.resolutionDate = today;

    try {
      await updateDoc(doc(firedb, 'grievances', id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `grievances/${id}`);
    }
  };

  // Certificate Actions
  const applyCertificate = (
    req: Omit<CertificateRequest, 'id' | 'referenceNo' | 'status' | 'appliedDate'>
  ): string => {
    const refNo = `OGHS-26-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];
    const certId = `cert_${Date.now()}`;
    const newReq: CertificateRequest = {
      ...req,
      id: certId,
      referenceNo: refNo,
      status: 'Applied',
      appliedDate: today
    };
    
    // Async save to firestore in background
    setDoc(doc(firedb, 'certificates', certId), newReq).catch((e) => {
      handleFirestoreError(e, OperationType.CREATE, `certificates/${certId}`);
    });

    return refNo;
  };

  const queryCertificateByReference = async (refNo: string): Promise<CertificateRequest | null> => {
    try {
      const q = query(collection(firedb, 'certificates'), where('referenceNo', '==', refNo));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const firstDoc = querySnapshot.docs[0];
        return { ...firstDoc.data(), id: firstDoc.id } as CertificateRequest;
      }
      return null;
    } catch (e) {
      console.error("Error querying certificate by reference:", e);
      return null;
    }
  };

  const updateCertificateStatus = async (
    id: string,
    status: 'Applied' | 'In Process' | 'Ready for Collection' | 'Dispatched' | 'Rejected',
    instructionsEn?: string,
    instructionsHi?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const updates: any = { status };
    if (instructionsEn) updates.instructionsEn = instructionsEn;
    if (instructionsHi) updates.instructionsHi = instructionsHi;
    if (status === 'Ready for Collection' || status === 'Dispatched') updates.completionDate = today;

    try {
      await updateDoc(doc(firedb, 'certificates', id), updates);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `certificates/${id}`);
    }
  };

  // Attendance Submission
  const submitBulkAttendance = async (records: Omit<AttendanceRecord, 'id'>[]) => {
    records.forEach(async (rec, i) => {
      const attId = `att_${rec.studentId}_${Date.now()}_${i}`;
      const newRecord = {
        ...rec,
        id: attId
      };
      try {
        await setDoc(doc(firedb, 'attendance', attId), newRecord);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `attendance/${attId}`);
      }
    });
  };

  // Results Submission (Teacher CSV/Excel)
  const submitBulkResults = async (results: ExamResult[]) => {
    results.forEach(async (res, i) => {
      const resId = `res_${res.studentId}_${Date.now()}_${i}`;
      const newResult = {
        ...res,
        id: resId
      };
      try {
        await setDoc(doc(firedb, 'examResults', resId), newResult);
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, `examResults/${resId}`);
      }
    });
  };

  // --- PRODUCTION ROLE-BASED USER MANAGEMENT IMPLEMENTATIONS ---
  const manageUserCreate = async (
    newProfile: Omit<UserProfile, "id"> & { status: "Active" | "Disabled"; createdBy: string; createdAt: string; password?: string }
  ) => {
    const loginEmail = newProfile.email || `user.${Date.now()}@omarbalika132.edu.in`;
    const checkPassword = newProfile.password || 'WelcomeOGHS123';
    let uid: string;
    try {
      uid = await getOrCreateAuthUser(loginEmail, checkPassword);
    } catch (authErr: any) {
      console.error("Auth creation failed for general user:", authErr.message);
      throw authErr;
    }

    const profile = {
      ...newProfile,
      id: uid,
    };
    try {
      // 1. Write unified profile
      await setDoc(doc(firedb, 'users', uid), profile);

      // 2. Provision permissions inside /admins if privileged
      if (profile.role === UserRole.ADMIN || profile.role === UserRole.TEACHER) {
        await setDoc(doc(firedb, 'admins', uid), {
          uid,
          role: profile.role,
          permissions: profile.role === UserRole.ADMIN ? ['all'] : ['grades', 'attendance', 'homework']
        });
      }

      // 3. Sync to specialized teacher table if their role is teacher to keep everything perfectly consistent
      if (profile.role === UserRole.TEACHER) {
        await setDoc(doc(firedb, 'teachers', uid), {
          id: uid,
          nameEn: profile.nameEn,
          nameHi: profile.nameHi,
          email: loginEmail,
          designationEn: 'Teacher / Staff',
          designationHi: 'शिक्षक / कर्मचारी',
          qualificationEn: 'Registered via accounts portal',
          qualificationHi: 'पंजीकृत कर्मचारी',
          subjectsEn: ['General Subjects'],
          subjectsHi: ['सामान्य विषय']
        });
      }

      // 4. Sync to specialized student table if their role is student to keep everything perfectly consistent
      if (profile.role === UserRole.STUDENT) {
        await setDoc(doc(firedb, 'students', uid), {
          id: uid,
          rollNo: (profile as any).rollNo || `roll-${Date.now().toString().slice(-6)}`,
          nameEn: profile.nameEn,
          nameHi: profile.nameHi,
          className: (profile as any).className || 'Class IX',
          section: (profile as any).section || 'A',
          fatherNameEn: 'S/O ' + profile.nameEn,
          fatherNameHi: 'पिता का नाम',
          motherNameEn: 'M/O ' + profile.nameEn,
          motherNameHi: 'माता का नाम',
          dob: (profile as any).dob || '2011-01-01',
          category: 'General',
          bankAccountLast4: '0000',
          ifscCode: 'BKID0004655',
          medhasoftStatus: 'Pending Verification',
          dbtPaymentStatus: 'In Process',
          status: 'Active'
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `users/${uid}`);
    }
  };

  const manageUserUpdate = async (id: string, updates: Partial<UserProfile & { status: string }>) => {
    try {
      await updateDoc(doc(firedb, 'users', id), updates);
      if (updates.role) {
        if (updates.role === UserRole.ADMIN || updates.role === UserRole.TEACHER) {
          await setDoc(doc(firedb, 'admins', id), {
            uid: id,
            role: updates.role,
            permissions: updates.role === UserRole.ADMIN ? ['all'] : ['grades', 'attendance', 'homework']
          });
        } else {
          await deleteDoc(doc(firedb, 'admins', id)).catch(() => {});
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${id}`);
    }
  };

  const manageUserDelete = async (id: string) => {
    try {
      await deleteDoc(doc(firedb, 'users', id));
      await deleteDoc(doc(firedb, 'admins', id)).catch(() => {});
      await deleteDoc(doc(firedb, 'teachers', id)).catch(() => {});
      await deleteDoc(doc(firedb, 'students', id)).catch(() => {});
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${id}`);
    }
  };

  // --- COMPLIANCE HANDLERS FOR ADMINPORTAL ---
  const setMedhasoftVerifiedState = async (studentId: string, status: string) => {
    await updateStudentDBT(studentId, status, undefined);
  };

  const resolveGrievance = async (id: string, resolutionEn: string, resolutionHi: string) => {
    await updateGrievanceStatus(id, 'Resolved', resolutionEn, resolutionHi);
  };

  // --- FULL-SUITE CMS OPERATIONS (Phase 4) ---
  const updateNotice = async (id: string, notice: Partial<Notice>) => {
    try {
      await updateDoc(doc(firedb, 'notices', id), notice);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notices/${id}`);
    }
  };

  const addTeacher = async (teacher: Omit<TeacherProfile, "id">) => {
    const loginEmail = teacher.email || `teacher.${Date.now()}@omarbalika132.edu.in`;
    const defaultPassword = teacher.dob ? parseDobToPassword(teacher.dob) : 'TeacherPass123';
    let uid: string;
    try {
      uid = await getOrCreateAuthUser(loginEmail, defaultPassword);
    } catch (authErr: any) {
      console.error("Auth creation failed for Teacher:", authErr.message);
      throw authErr;
    }

    const newTeacher: TeacherProfile = {
      ...teacher,
      id: uid
    };

    try {
      // 1. Write teacher specialized profile record
      await setDoc(doc(firedb, 'teachers', uid), newTeacher);

      // 2. Write unified public session profile record
      const userProfile: UserProfile = {
        id: uid,
        role: UserRole.TEACHER,
        nameEn: teacher.nameEn,
        nameHi: teacher.nameHi,
        email: loginEmail,
        dob: teacher.dob,
        forcePasswordChange: true,
        status: 'Active'
      };
      await setDoc(doc(firedb, 'users', uid), userProfile);

      // 3. Provision admin security permissions
      await setDoc(doc(firedb, 'admins', uid), {
        uid,
        role: 'TEACHER',
        permissions: ['grades', 'attendance', 'homework']
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `teachers/${uid}`);
    }
  };

  const updateTeacher = async (id: string, teacher: Partial<TeacherProfile>) => {
    try {
      await updateDoc(doc(firedb, 'teachers', id), teacher);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `teachers/${id}`);
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      await deleteDoc(doc(firedb, 'teachers', id));
      await deleteDoc(doc(firedb, 'users', id)).catch(() => {});
      await deleteDoc(doc(firedb, 'admins', id)).catch(() => {});
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `teachers/${id}`);
    }
  };

  const addTimetableEntry = async (entry: Omit<TimetableEntry, "id">) => {
    const ttId = `tt_${Date.now()}`;
    try {
      await setDoc(doc(firedb, 'timetable', ttId), { ...entry, id: ttId });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `timetable/${ttId}`);
    }
  };

  const updateTimetableEntry = async (id: string, entry: Partial<TimetableEntry>) => {
    try {
      await updateDoc(doc(firedb, 'timetable', id), entry);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `timetable/${id}`);
    }
  };

  const deleteTimetableEntry = async (id: string) => {
    try {
      await deleteDoc(doc(firedb, 'timetable', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `timetable/${id}`);
    }
  };

  const addScheme = async (scheme: Omit<ScholarshipScheme, "id">) => {
    const sId = `sch_${Date.now()}`;
    try {
      await setDoc(doc(firedb, 'schemes', sId), { ...scheme, id: sId });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `schemes/${sId}`);
    }
  };

  const updateScheme = async (id: string, scheme: Partial<ScholarshipScheme>) => {
    try {
      await updateDoc(doc(firedb, 'schemes', id), scheme);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `schemes/${id}`);
    }
  };

  const deleteScheme = async (id: string) => {
    try {
      await deleteDoc(doc(firedb, 'schemes', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `schemes/${id}`);
    }
  };

  const updateStudyMaterial = async (id: string, mat: Partial<StudyMaterial>) => {
    try {
      await updateDoc(doc(firedb, 'studyMaterials', id), mat);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `studyMaterials/${id}`);
    }
  };

  const deleteStudyMaterial = async (id: string) => {
    try {
      await deleteDoc(doc(firedb, 'studyMaterials', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `studyMaterials/${id}`);
    }
  };

  const addBook = async (book: Omit<Book, "id">) => {
    const bId = `b_${Date.now()}`;
    try {
      await setDoc(doc(firedb, 'books', bId), { ...book, id: bId });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `books/${bId}`);
    }
  };

  const updateBook = async (id: string, book: Partial<Book>) => {
    try {
      await updateDoc(doc(firedb, 'books', id), book);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `books/${id}`);
    }
  };

  const deleteBook = async (id: string) => {
    try {
      await deleteDoc(doc(firedb, 'books', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `books/${id}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        schoolSettings,
        updateSchoolSettings,
        user,
        setUser: setUserState,
        loginAs,
        logout,
        isOnline,
        changeUserPassword,
        adminTab,
        setAdminTab,
        usersList,
        manageUserCreate,
        manageUserUpdate,
        manageUserDelete,
        setMedhasoftVerifiedState,
        resolveGrievance,
        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        schemes,
        addScheme,
        updateScheme,
        deleteScheme,
        students,
        updateStudentDBT,
        addStudent,
        updateStudent,
        deleteStudent,
        teachers,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        timetable,
        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        examResults,
        homework,
        addHomework,
        deleteHomework,
        studyMaterials,
        addStudyMaterial,
        updateStudyMaterial,
        deleteStudyMaterial,
        books,
        addBook,
        updateBook,
        deleteBook,
        searchBooks,
        faqs,
        grievances,
        addGrievance,
        updateGrievanceStatus,
        queryGrievanceByTicket,
        certificates,
        applyCertificate,
        updateCertificateStatus,
        queryCertificateByReference,
        attendance,
        submitBulkAttendance,
        submitBulkResults,
        isAdminCreated,
        bootstrapFirstAdmin
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
};
