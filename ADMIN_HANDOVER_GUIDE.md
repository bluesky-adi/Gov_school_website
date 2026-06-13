# ADMINISTRATIVE & SYSTEM HANDOVER GUIDE
**Institution:** Rajyakrit Omar Girl's +2 School, Bishnupur, Begusarai, Bihar  
**System Designation:** Integrated High School Management System & Portal (BSEB Standard)  
**Security Level:** Top Secret / Administrative Clearance Only  

---

## Part 1: Quick-Reference Q&A

### 1. What is the current admin email?
The current primary administrator email integrated into the secure system architecture is:
**`aadiyapriyam142005@gmail.com`**

### 2. What is the current admin password creation process?
The default production password is programmed as **`AdminPass123`**. 
During initial system start-up or db clearance, the administrator account is bootstrapped programmatically via the built-in system setup function, which creates the record in Firebase Auth and establishes Firestore-matching security documents in a single, safe transactional click.

### 3. Is the admin account already created in Firebase Auth?
* **Checking Status:** The platform monitors the `/users` collection for high-privilege entries dynamically. If the database is completely empty or newly initialized on the server, the account will be pending. 
* **If it has already been bootstrapped:** The account is fully active in Firebase Authentication and Firestore under the primary email.

### 4. If yes, where is it created?
It resides securely in:
1. **Firebase Authentication Console** under the credential database of the official project: `ai-studio-df6cf924-2254-4d2b-a3d3-c3da98c4ec03`.
2. **Firestore Database `/users` Document Collection** mapping the unique user identifier (`uid`) with `{ role: "ADMIN", email: "aadiyapriyam142005@gmail.com", nameEn: "Smt. Aadiya Priyam (Admin)" }`.
3. **Firestore Database `/admins` Privilege Ledger** authorizing system-wide capabilities.

### 5. If no, how exactly do I create it?
You do not need to write database queries or log files. Simply:
1. Open the application public landing page.
2. Click **Portal Log In** in the top navigation header.
3. If no ADMIN account exists, a yellow card will display:
   **"SYSTEM BOOTSTRAP: No Admin Found"**
4. Click **🚀 Run Initial School Setup Bootstrap**.
5. The system will register `aadiyapriyam142005@gmail.com` / `AdminPass123` on Firebase Auth, create the user profile database documents, and automatically log you in. The setup interface will then disable itself globally.

### 6. Can the admin email be changed later?
Yes. The platform determines "ADMIN" state based on matching roles in Firestore user documents rather than hardcoded client lists. To change the primary contact email:
- **Phase A (Standard):** Log in as Admin, navigate to the **School Settings** tab, and edit the *Official E-mail* text field. This changes the visible institutional contact point across headers and footers.
- **Phase B (Advanced Auth Integration):** To change the authentication credential itself, register a new user under the desired email address via standard sign-ups, and elevate their role to `ADMINISTRATOR` on the **User Accounts & Roles** dashboard tab.

### 7. Can the principal create another admin account?
**Yes.** The system contains an authoritative **User Accounts & Roles** directory workspace. A logged-in Admin can:
1. Browse any registered user profile (teacher, staff, or guest).
2. Modify their role directly using the role drop-down menu.
3. Promote any profile securely to the **ADMINISTRATOR (PRINCIPAL)** rank, giving them identical editing permissions.

### 8. What credentials should I hand over on Day 1?
Present the following checklist clearly on the hand-over folder:
```text
============================================================
           OFFICIAL ADMINISTRATIVE LOGIN PARTICULARS
============================================================
- PORTAL DOMAIN:    https://ais-pre-bqhicbj6smnijzl2np2pjx-969251645537.asia-southeast1.run.app
- MASTER EMAIL:     aadiyapriyam142005@gmail.com
- MASTER PASSWORD:  AdminPass123
============================================================
* IMPORTANT ACTION FOR DAY 1:
Identify the "School Settings" dashboard tab and update the 
Institutional Codes, Contact Numbers, and Principal's message.
============================================================
```

---

## Part 2: Long-Term System Management Instructions
To maintain maximum system structural integrity across school semesters, instruct the Principal and Nodal Officers on these core procedures:

* **Statistical Reporting:** No coding changes will ever be needed to update matriculation statistical badges. Simply type the updated percentages directly inside the **School Settings** dashboard.
* **Academic CSV Onboarding:** Collect annual class rosters in spreadsheets, save them as `.csv` formatted files, and drop them directly inside the **CSV Import Center** in the Admin panel to automatically register hundreds of students and generate clean marks records instantaneously.
