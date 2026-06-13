import {
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
  CertificateRequest
} from './types.ts';

// Initial bilingual Seed notices
export const INITIAL_NOTICES: Notice[] = [];

// Bihar schemes models
export const SCHOLARSHIPS_AND_SCHEMES: ScholarshipScheme[] = [
  {
    id: 'sch1',
    titleEn: 'Mukhyamantri Balika Cycle Yojana',
    titleHi: 'मुख्यमंत्री बालिका साइकिल योजना',
    category: 'Bicycle',
    descriptionEn: 'Bihar governments pioneer scheme to promote girls\' secondary education by providing Rs. 3,000 directly to girls enrolled in Class IX for purchasing a bicycle.',
    descriptionHi: 'बालिकाओं की माध्यमिक शिक्षा को बढ़ावा देने के लिए बिहार सरकार की इस अग्रणी योजना के तहत कक्षा नौवीं में नामांकित लड़कियों को साइकिल खरीदने के लिए सीधे 3,000 रुपये प्रदान किए जाते हैं।',
    eligibilityEn: 'Girl students regularly enrolled in Class IX of Government school or Government aided high schools with minimum 75% school attendance.',
    eligibilityHi: 'सरकारी स्कूल या सरकारी सहायता प्राप्त हाई स्कूल की कक्षा नौवीं में नियमित रूप से नामांकित छात्राएं जिनकी उपस्थिति कम से कम 75% हो।',
    benefitsEn: 'Direct Benefit Transfer (DBT) of ₹3,000 in student\'s/parent\'s joint bank account linked with Medhasoft portal.',
    benefitsHi: 'मेधासॉफ्ट पोर्टल से लिंक छात्र/अभिभावक के संयुक्त बैंक खाते में ₹3,000 का डीबीटी (Direct Benefit Transfer)।',
    deadline: '2026-09-30',
    documentsEn: ['Aadhaar Card (Student)', 'Caste Certificate (if non-general)', 'Bank Passbook Front Page', '75% Attendance Verification', 'Medhasoft Registration Slip'],
    documentsHi: ['आधार कार्ड (छात्रा)', 'जाति प्रमाण पत्र (सामान्य श्रेणी को छोड़कर)', 'बैंक पासबुक का मुख्य पृष्ठ', '75% उपस्थिति सत्यापन', 'मेधासॉफ्ट पंजीकरण रसीद'],
    contactPerson: 'Bicycle Department In-Charge',
    contactDesignation: 'Bicycle Nodal Officer',
    medhasoftInfoEn: 'Synchronized on Medhasoft Class IX database.',
    medhasoftInfoHi: 'मेधासॉफ्ट क्लास IX डेटाबेस पर सिंक किया गया है।'
  },
  {
    id: 'sch2',
    titleEn: 'Mukhyamantri Balika Poshak Yojana (Uniform Scheme)',
    titleHi: 'मुख्यमंत्री बालिका पोशाक योजना (यूनिफॉर्म स्कीम)',
    category: 'Uniform',
    descriptionEn: 'Provides uniforms allowance for school girls to reduce dropout rates and ensure visual uniformity.',
    descriptionHi: 'छात्राओं के स्कूल छोड़ने की दर को कम करने और पोशाक समानता सुनिश्चित करने के लिए पोशाक भत्ता प्रदान किया जाता है।',
    eligibilityEn: 'All girls student enrolled in Class IX to XII in Omar Girls High School, Bihar.',
    eligibilityHi: 'उमर गर्ल्स हाई स्कूल, बिहार में कक्षा नौवीं से बारहवीं तक नामांकित सभी छात्राएं।',
    benefitsEn: 'Class IX-X girls receive ₹1,000 and Class XI-XII girls receive ₹1,500 annually for buying uniforms.',
    benefitsHi: 'कक्षा नौवीं-दसवीं की छात्राओं को प्रतिवर्ष ₹1,000 एवं कक्षा ग्यारहवीं-बारहवीं की छात्राओं को ₹1,500 की पोशाक राशि प्रदान की जाती है।',
    deadline: '2026-08-15',
    documentsEn: ['Aadhaar Card', 'Admission Receipt', 'Bank account linked with Aadhaar & Seeded block'],
    documentsHi: ['आधार कार्ड', 'नामांकन रसीद', 'आधार और मेधासॉफ्ट से जुड़ा बैंक खाता'],
    contactPerson: 'Uniform Welfare Coordinator',
    contactDesignation: 'Uniform Scheme In-Charge'
  },
  {
    id: 'sch3',
    titleEn: 'Mukhyamantri Balika Kishori Swasthya Karyakram',
    titleHi: 'मुख्यमंत्री बालिका किशोरी स्वास्थ्य कार्यक्रम',
    category: 'Mukhyamantri',
    descriptionEn: 'Promotes health and personal hygiene among school-going adolescent girls by providing monetary assistance directly.',
    descriptionHi: 'विद्यालय जाने वाली किशोरियों के स्वास्थ्य और व्यक्तिगत स्वच्छता को बढ़ावा देने के लिए प्रत्यक्ष मौद्रिक सहायता प्रदान की जाती है।',
    eligibilityEn: 'All adolescent girls enrolled in Class IX to XII of the high school.',
    eligibilityHi: 'हाई स्कूल की कक्षा नौवीं से बारहवीं तक नामांकित सभी किशोरियां।',
    benefitsEn: 'Quarterly financial assistance of ₹300 per annum for sanitary health & hygiene distributed through DBT.',
    benefitsHi: 'डीबीटी के माध्यम से स्वच्छता स्वास्थ्य के लिए प्रतिवर्ष ₹300 की वित्तीय सहायता।',
    deadline: '2026-10-31',
    documentsEn: ['Aadhaar ID', 'Class Roll verification entry'],
    documentsHi: ['आधार आईडी', 'कक्षा रोल नंबर सत्यापन'],
    contactPerson: 'School Health Coordinator',
    contactDesignation: 'School Health In-charge'
  },
  {
    id: 'sch4',
    titleEn: 'Mukhyamantri Balika Protsahan Yojana (Medhavriti - 10th/12th Pass)',
    titleHi: 'मुख्यमंत्री बालिका प्रोत्साहन योजना (मेधावृत्ति - 10वीं/12वीं पास)',
    category: 'Medhavriti',
    descriptionEn: 'Bihar State scholarship reward schemes for girl students passing Matriculation (10th) with First Division or Intermediate (12th) examinations to aid higher studies.',
    descriptionHi: 'मैट्रिक (10वीं) परीक्षा प्रथम श्रेणी या इंटरमीडिएट (12वीं) परीक्षा उत्तीर्ण करने वाली छात्राओं को आगे की पढ़ाई हेतु बिहार सरकार की प्रोत्साहन राशि योजना।',
    eligibilityEn: 'Girl students passing Bihar School Examination Board (BSEB) Matriculation with First Division or Intermediate (unmarried girls) of Bihar board.',
    eligibilityHi: 'बिहार विद्यालय परीक्षा समिति (BSEB) मैट्रिक परीक्षा प्रथम श्रेणी से या इंटरमीडिएट उत्तीर्ण करने वाली (अविवाहित) छात्राएं।',
    benefitsEn: '₹10,000 reward for matriculation first-class pass; ₹25,000 for unmarried girls passing Intermediate exams.',
    benefitsHi: 'मैट्रिक प्रथम श्रेणी से पास होने पर ₹10,000; इंटरमीडिएट परीक्षा उत्तीर्ण करने वाली अविवाहित लड़कियों को ₹25,000 की राशि।',
    deadline: '2026-07-31',
    documentsEn: ['Aadhaar Certificate', 'BSEB Board Marksheet', 'Caste Certificate', 'Domicile or Residence Certificate of Bihar', 'Income Certificate', 'Joint/Individual Bank account in Bihar branch'],
    documentsHi: ['आधार प्रमाण पत्र', 'BSEB बोर्ड अंकतालिका', 'जाति प्रमाण पत्र', 'बिहार राज्य निवास प्रमाण पत्र', 'आय प्रमाण पत्र', 'बिहार शाखा में व्यक्तिगत बैंक खाता'],
    contactPerson: 'Principal Head Office',
    contactDesignation: 'Headmistress / Principal'
  }
];

// Initial seeded students database for low-end logins
export const INITIAL_STUDENTS: StudentProfile[] = [];

// Initial seeded teachers
export const INITIAL_TEACHERS: TeacherProfile[] = [];

// Initial school FAQs
export const PORTAL_FAQS: FAQItem[] = [
  {
    questionEn: 'How to register students on Medhasoft Bihar DBT portal?',
    questionHi: 'मेधासॉफ्ट बिहार डीबीटी पोर्टल पर छात्रा का पंजीकरण कैसे करें?',
    answerEn: 'The school administration directly uploads valid student registry details on the Medhasoft portal. Parents must submit Aadhaar matching certificates and a bank savings passbook that is Aadhaar-status active.',
    answerHi: 'विद्यालय प्रशासन योग्य छात्राओं की प्रविष्टि सीधे मेधासॉफ्ट पोर्टल पर अपलोड करता है। अभिभावकों को आधार कार्ड और बैंक बचत पासबुक जमा करनी होगी जो आधार-सीडेड होनी चाहिए।'
  },
  {
    questionEn: 'What is the required school attendance percentage for Bihar government scholarships?',
    questionHi: 'बिहार सरकार की छात्रवृत्ति योजनाओं के लिए न्यूनतम कितनी विद्यालय उपस्थिति आवश्यक है?',
    answerEn: 'As per direct state rules, girls must maintain a minimum of 75% class attendance in each term to claim Uniforms, Bicycles, and Medhavriti scholarship benefits.',
    answerHi: 'राज्य सरकार के प्रत्यक्ष निर्देशानुसार, पोशाक, साइकिल और मेधावृत्ति छात्रवृत्ति का लाभ उठाने के लिए छात्राओं की विद्यालय में ७५% उपस्थिति अनिवार्य है।'
  },
  {
    questionEn: 'How can students submit an application for an official School Leaving Certificate/Character Cert?',
    questionHi: 'यूनिवर्सिटी/उच्च शिक्षा के लिए विद्यालय स्थानांतरण प्रमाण-पत्र (टी.सी.) या आचरण प्रमाण-पत्र कैसे प्राप्त करें?',
    answerEn: 'You can submit an online request directly via the "Certificate Center" tab inside the portal. Upload final matriculation/intermediate marksheet and school enrollment ledger details. Normal processing time is 4 to 7 working days.',
    answerHi: 'आप इस पोर्टल के भीतर "सर्टिफिकेट सेंटर" टैब के माध्यम से ऑनलाइन आवेदन कर सकते हैं। इसके बाद ७ दिनों के भीतर प्रधानाचार्या के कार्यालय से प्रमाणपत्र संकलित किया जा सकता है।'
  },
  {
    questionEn: 'What is the e-LOTS Bihar platform integrated in our Library section?',
    questionHi: 'पुस्तकालय खंड में एकीकृत ई-लॉट्स (e-LOTS) बिहार मंच क्या है?',
    answerEn: 'e-LOTS (electronic Library of Teachers and Students) from Bihar Education Project Council delivers e-textbooks containing video lectures, interactive test mocks, and teachers instruction resources for primary and high schools.',
    answerHi: 'ई-लॉट्स (e-LOTS) बिहार शिक्षा परियोजना परिषद का डिजिटल मंच है जो पाठ्यपुस्तकों, विषयवार वीडियो व्याख्यानों और ऑनलाइन शैक्षिक संसाधनों तक तुरंत पहुंच प्रदान करता है।'
  }
];

// Initial Timetable blocks
export const INITIAL_TIMETABLE: TimetableEntry[] = [];

// Initial Exam Results
export const INITIAL_EXAM_RESULTS: ExamResult[] = [];

// Initial Homework list
export const INITIAL_HOMEWORK: Homework[] = [];

// Study materials database pointing to Bihar State Board and e-LOTS portal topics
export const INITIAL_STUDY_MATERIALS: StudyMaterial[] = [];

// Initial school books
export const INITIAL_BOOKS: Book[] = [];

// Initial complaints / Grievances
export const INITIAL_GRIEVANCES: Grievance[] = [];

// Initial Certificates
export const INITIAL_CERTIFICATE_REQUESTS: CertificateRequest[] = [];
