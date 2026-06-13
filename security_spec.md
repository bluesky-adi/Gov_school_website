# Firestore Security Specification & Payload Tests

## 1. Data Invariants

- **Notices**: Anyone can read notices. Only authenticated Admin users can create, update, or delete notices.
- **Student Profiles**: Public visitors cannot read student profiles. Only the student herself (via authenticated matching Roll Number / ID or specific search credentials), their parent, or authenticated teachers/admins can access student records. Users cannot modify their own student profiles (preventing bank details fabrication).
- **Exam Results**: Releasing/modifying exam marks is strictly restricted to teachers or admin roles. Students and Parents can retrieve only their own results.
- **Attendance**: Checked and submitted solely by verified teachers/admin. Read is accessible by the student/parent matching the student ID.
- **Homework**: Only teachers and admins can create/update/delete. Anyone can read standard homework.
- **Study Materials**: Only teachers and admins can upload. Anyone can read.
- **Grievances**: Any user can submit a grievance (even anonymously). Once submitted, only admins can view details and reply. Anonymous submissions must not permit reading by general users.
- **Certificates**: A student can apply for a certificate. Once applied, only the applying student/owner and admins can view or handle it. Only admins can update the status or instructions.

---

## 2. The "Dirty Dozen" Invalidation Payloads (Security Red Team TDD)

These represent 12 malicious payloads that MUST be explicitly blocked by our Firestore Security Rules.

### Payload 1: Unauthorized Notice Creation (Identity Spoofing)
An unauthenticated or visitor client tries to publish a notice.
```json
// Target Path: /notices/attacker_notice
{
  "titleEn": "School is closed permanently",
  "titleHi": "स्कूल स्थायी रूप से बंद है",
  "contentEn": "False content to cause alarm",
  "contentHi": "झूठा कंटेंट",
  "category": "Urgent",
  "publishedDate": "2026-06-11",
  "isUrgent": true,
  "isPinned": true,
  "author": "Attacker"
}
```

### Payload 2: Notice Ghost Field Injection (Shadow Update)
An attacker attempts to inject a ghost field `isAdminNote` to bypass general filters.
```json
// Target Path: /notices/n1
{
  "titleEn": "Exam schedule revision",
  "titleHi": "परीक्षा कार्यक्रम संशोधन",
  "contentEn": "Revised timing info",
  "contentHi": "संशोधित समय",
  "category": "Academic",
  "publishedDate": "2026-06-11",
  "isUrgent": false,
  "isPinned": false,
  "author": "Principal",
  "ghostField": "Bypassed Security" // MUST BE REJECTED
}
```

### Payload 3: Student Roll No Hijacking (Identity Spoofing)
A student tries to modify her Roll Number or Admission Numbers to access other premium state scholarship details.
```json
// Target Path: /students/student_101
{
  "rollNo": "999", // Attempting alteration of key unique ID
  "nameEn": "Aarti Kumari",
  "nameHi": "आरती कुमारी"
}
```

### Payload 4: DBT Account Manipulation (Value Poisoning)
A student attempts to update her registered school bank account or IFSC code directly to divert government DBT funds.
```json
// Target Path: /students/student_101
{
  "bankAccountLast4": "4321", // Diverting state funds
  "ifscCode": "SBIN0001020"
}
```

### Payload 5: Unauthorized Marks Injection (Privilege Escalation)
A student tries to publish or modify her own exam results card.
```json
// Target Path: /examResults/malicious_marks
{
  "studentId": "s101",
  "examNameEn": "Board Preparation Pre-Test",
  "examNameHi": "मुख्य प्री-टेस्ट परीक्षा",
  "academicYear": "2026",
  "totalPercentage": 100, // Fabricated perfect score
  "grade": "A+",
  "resultStatus": "PASS",
  "remarksEn": "Brilliant Student",
  "remarksHi": "शानदार"
}
```

### Payload 6: Attendance Fraud (Identity Spoofing)
A student uploads daily logs marking herself "Present" on a day when she was absent, to meet the 75% scholarship threshold.
```json
// Target Path: /attendance/att_fake
{
  "studentId": "s101",
  "date": "2026-06-11",
  "status": "Present" // Fraudulent check-in
}
```

### Payload 7: Homework Pollution (Resource Poisoning)
A guest or student uploads 1MB of hazardous text scripts as "homework guidelines" under teacher's name.
```json
// Target Path: /homework/bad_hw
{
  "titleEn": "Massive Payload...",
  "teacherName": "Fabricated Teacher Name"
}
```

### Payload 8: Study Material Spoofing (Integrity Compromise)
A student attempts to delete or overwrite educational e-LOTS materials uploaded by teachers.
```json
// Target Path: /studyMaterials/sm_1
{
  "titleEn": "Malicious Script link"
}
```

### Payload 9: Hijacking Another Student's Certificate Request (PII Leak)
A visitor or other student attempts to pull private character certificate requests containing sensitive address.
```json
// Target Path: /certificates/cert_102
{
  "status": "Ready for Collection"
}
```

### Payload 10: State Bypass in Certificate (State Shortcutting)
A student tries to directly approve her own pending School Transfer Certificate by changing status from 'Applied' to 'Ready for Collection'.
```json
// Target Path: /certificates/cert_101 (existing status is 'Applied')
{
  "status": "Ready for Collection" // Unauthorized state change
}
```

### Payload 11: Reading Grievance Vault (PII Leak & Confidentiality Breach)
An unauthorized student tries to list or browse all submitted grievances (which might include sensitive complaints against staff).
```json
// Query Path: /grievances
"Unauthorized read/query list operation"
```

### Payload 12: Anonymous Grievance Deletion (Destructive Action)
A user tries to delete a Submitted grievance ticket to escape disciplinary audit.
```json
// Target Path: /grievances/gr_sensitive
"Unauthorized delete operation"
```

---

## 3. Test Runner Design

Below is a Firestore Node test framework script validating all denial scenarios:

```typescript
import { assertFails, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { setDoc, getDoc, deleteDoc } from 'firebase/firestore';

describe('Omar Girls High School Security Rules Verification', () => {
  let testEnv;

  before(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0655576405',
      firestore: {
        rules: require('fs').readFileSync('firestore.rules', 'utf8')
      }
    });
  });

  after(async () => {
    await testEnv.cleanup();
  });

  it('Payload 1: Should block unauthenticated notices creation', async () => {
    const unauthDb = testEnv.unauthenticatedContext().firestore();
    await assertFails(setDoc(doc(unauthDb, 'notices/attacker_notice'), {
      titleEn: 'School is closed permanently',
      titleHi: 'स्कूल स्थायी रूप से बंद है',
      contentEn: 'False content',
      contentHi: 'झूठ',
      category: 'Urgent',
      publishedDate: '2026-06-11',
      isUrgent: true,
      isPinned: true,
      author: 'Attacker'
    }));
  });

  it('Payload 4: Should block student modifying DBT details directly', async () => {
    const studentDb = testEnv.authenticatedContext('student_user').firestore();
    await assertFails(setDoc(doc(studentDb, 'students/s101'), {
      bankAccountLast4: '4321',
      ifscCode: 'SBIN0001020'
    }, { merge: true }));
  });
});
```
