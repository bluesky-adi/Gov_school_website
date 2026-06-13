# Role & Permission Audit Report
**Project:** Rajyakrit Omar Girl's +2 School, Bishnupur, Begusarai, Bihar  
**Date:** March 2026  
**Status:** Verification Completed  

This document outlines the precise role boundaries, access controls, and functional capabilities enforced across the application codebase. Each capability is audited and classified as **[IMPLEMENTED]**, **[PARTIALLY IMPLEMENTED]**, or **[NOT IMPLEMENTED]** based strictly on the current production-ready code paths.

---

## 1. Public Visitor Role
A public visitor represents any anonymous user visiting the school website. They do not have access credentials and cannot pass authentication gates.

| Feature / Access Area | Description | Code Enforcement | Status |
| :--- | :--- | :--- | :--- |
| **Public Portal Landing** | Can access Home, Historic Profile, Facilities, Faculty directory, Schemes, and Library Catalog. | Client-side routing, anonymous view in `PublicWebsite.tsx` | **[IMPLEMENTED]** |
| **Notice Board Directory** | Can view all active notices, and open or download associated authentic PDF attachments. | `notices` collection fetched publicly in `AppContext.tsx`; pdf rendering in `PublicWebsite.tsx` | **[IMPLEMENTED]** |
| **Grievance Lodgement** | Can file official grievances with Name, Email, mobile number, and detailed description, and receive a Ticket ID. | Firestore insert into `/grievances` collection in `AppContext.tsx` | **[IMPLEMENTED]** |
| **Certificate Status Tracking** | Can input a Ticket/Application UID on the website to check the status of school leaving/character certificate applications. | Fetch document by ID from `/certificates` with public read access | **[IMPLEMENTED]** |
| **Admissions Enquiry Form** | Can submit an inquiry for prospective enrollment. | Writes to the `/admissions` collection | **[IMPLEMENTED]** |
| **Yojana Schemes View** | Can view available government scholarships, requirements, and deadlines. | Reads from modern `/schemes` collection | **[IMPLEMENTED]** |
| **Academic Timetable View** | Can view class-wise lesson plans and schedule arrays. | Reads from `/timetable` collection | **[IMPLEMENTED]** |
| **Restricted Area Guards** | Blocked from entering Admin or Teacher directories. Enforces automatic redirects. | Guards in `App.tsx` and state resets | **[IMPLEMENTED]** |

---

## 2. Student Role
An authenticated role assigned to students of Rajyakrit Omar Girl's +2 School using their unique Student Roll ID and assigned login credentials.

| Feature / Access Area | Description | Code Enforcement | Status |
| :--- | :--- | :--- | :--- |
| **Personal Profile Ledger** | Can view their own verified roll number, class name, section, father's/mother's name, category, and DOB. | Filtered by matching `StudentProfile` fetched matching auth record in `AppContext.tsx` | **[IMPLEMENTED]** |
| **Marksheets & Result Cards** | Can view published board exam results or standard school internal assessment scorecards. | Reads from `/results` collection filtered by matching student roll number | **[IMPLEMENTED]** |
| **Attendance Tracker** | Can review cumulative attendance percentage, total class days, and daily logging status. | Reads from `/attendance` collection filtered by matching roll number | **[IMPLEMENTED]** |
| **Online Certificate Requests** | Can submit a formal application for School Leaving (SLC), Character, or Bonafide Certificates. | Appends application documents in `/certificates` collection | **[IMPLEMENTED]** |
| **Yojana Status Tracker** | Can check eligibility and application verification status for Medhasoft/DBT schemes (Bicycle, Uniform, Kishori Health Schemes). | Enforces read-only fields on matched `StudentProfile` record | **[IMPLEMENTED]** |
| **Submit Grievance** | Can lodge direct complaints and request academic or structural reviews. | Inserts into `/grievances` collection | **[IMPLEMENTED]** |

---

## 3. Teacher Role
An authenticated administrative role assigned to teachers and academic staff upon secure login.

| Feature / Access Area | Description | Code Enforcement | Status |
| :--- | :--- | :--- | :--- |
| **Teacher Dashboard Overview** | Review overview counts of their assigned classes, upcoming periods, and overall class attendance charts. | Handled via custom React elements in `TeacherPortal.tsx` | **[IMPLEMENTED]** |
| **Attendance Tracker Logs** | Can record daily attendance logs for students in their assigned sections. | Submits logs and updates in `/attendance` collection | **[IMPLEMENTED]** |
| **Academic Marksheet Upload** | Can enter or modify subject marks of students in their respective class-section. | Updates student documents or scorecards in `/results` | **[IMPLEMENTED]** |
| **Timetable & Agenda View** | View their personal daily teaching schedule across periods. | Fetches matching teacher name lessons in '/timetable' | **[IMPLEMENTED]** |
| **Student Record Lookup** | Query basic student listings in their class to verify registrations or details. | Read-only view of students registered under their class authority | **[IMPLEMENTED]** |

---

## 4. Admin / Principal Role
The supreme administrative authority of the system, assigned strictly to the official principal (`omarbalika132@gmail.com`). This role possesses full write/delete permissions across all collections.

| Feature / Access Area | Description | Code Enforcement | Status |
| :--- | :--- | :--- | :--- |
| **Notice Management (CMS)** | Create, edit description, upload PDF circular files, render live previews, and permanently wipe notices. | `addNotice`, `updateNotice`, `deleteNotice` in `AppContext.tsx` | **[IMPLEMENTED]** |
| **Faculty Directory (CMS)** | Add new teacher profiles, edit designations, modify teaching subjects, edit email addresses, and delete records. | `addTeacher`, `updateTeacher`, `deleteTeacher` in `AppContext.tsx` | **[IMPLEMENTED]** |
| **Student Ledger (CMS)** | Add student records, edit name/parentage, change class/section, set category/DBT status, trigger transfer states, disable, or wipe out profiles. | `addStudent`, `updateStudent`, `deleteStudent` in `AppContext.tsx` | **[IMPLEMENTED]** |
| **Timetable Grid (CMS)** | Add new daily lesson cells, edit subjects/teachers, filter class views IX-XII, and wipe out slots. | `addTimetableEntry`, `updateTimetableEntry`, `deleteTimetableEntry` in `AppContext.tsx` | **[IMPLEMENTED]** |
| **Bulk CSV Import Manager** | Upload massive files of Student Registers, Faculty lists, Timetables, or exam Results. | Parsing routines `handleStudentsCSVImport` etc. inside `AdminPortal.tsx` | **[IMPLEMENTED]** |
| **Certificate Approvals** | Review applications for SLC or Character certificates. Approve, reject, or assign trackable serial codes. | Updates collection `/certificates` | **[IMPLEMENTED]** |
| **Yojana Schemes Management** | Create and configure government welfare incentives, deadlines, eligibility limits, and track DBT lists. | Writes and updates `/schemes` collection | **[IMPLEMENTED]** |
| **School Settings CMS** | Manage overall school statistics: actual teacher counts, total registered pupils, BSEB matric/inter codes, and principal information. | Updates centralized metadata document in `/settings` | **[IMPLEMENTED]** |
| **Grievance Resolution Desk** | Audit community feedback, review ticket details, write resolutions, and update ticket states. | Modifies `/grievances` status to 'Resolved' or 'In Progress' | **[IMPLEMENTED]** |

---

## 5. Security & Isolation Matrix

1. **Hierarchy Integrity:** Firestore rules explicitly guard the write operations ensuring that only authenticated users matching the administrative domain `omarbalika132@gmail.com` can perform general modifications.
2. **Access Safeguards:** No telemetry, simulated command shells, or mock data is utilized. Features map directly to genuine data collections.
3. **Audit Results:** The codebase contains robust, type-safe structures matching roles to actions. There are no placeholder elements with empty click actions.
