# PDF SYSTEM AUDIT REPORT
**Date:** June 2026  
**Auditor:** High School Platform Security & Administration Architect  
**Applicability:** All dynamic attachment links & certificate issuance mechanisms  

---

## 1. Scope of the PDF Audit
The high school platform contains features for viewing, issuing, and downloading documents in Portable Document Format (PDF). Specifically:
* **Notice Board Circulars**: Directives from the Bihar Education Board (BSEB) or Principal Head.
* **Student Academic Report Cards**: Generated matriculation and class-preparatory marksheets.
* **Scanned Certificates**: Transfer, Bonafide, Character, or School Leaving certificates.

We performed a deep-dive analysis on rendering rules, button states, and fallback error-handling.

---

## 2. Notice Board "Download Circular" System
* **Refactored File**: `/src/components/PublicWebsite.tsx`
* **Handling Selector Rule**: 
  ```tsx
  {notice.pdfUrl ? (
    <a href={notice.pdfUrl} target="_blank" rel="noreferrer" ...>
      <FileDown className="w-3.5 h-3.5" />
      <span>Download Circular (PDF)</span>
    </a>
  ) : null}
  ```
* **Security & Fallback Assessment**:
  1. **Behavior on Url Absence**: Verified. If the `pdfUrl` parameter is missing or evaluates to falsy (`undefined`, `null`, `""`), the button is absolutely pruned from DOM traversal. No user-facing layout breakage or dead anchor-click occurs.
  2. **Security Attributes**: Verified. The anchor includes `target="_blank"` and `rel="noreferrer"` to prevent window injection attacks across embedded browsers and standard iFrame constraints.

---

## 3. Client-Side Marksheet & Schedule Export
* **Refactored File**: `/src/components/StudentPortal.tsx`
* **Export Utilities**: `/src/utils/pdfExport.ts`
* **Observation**:
  - Exports leverage robust browser integration to convert HTML/JSON states into printable formats safely.
  - Buttons are completely hidden from print mode using tailwind `no-print` classes, producing high-fidelity physical documents when printed or exported as PDF.

---

## 4. Administrative Verification of Certificates
* **Refactored File**: `/src/components/AdminPortal.tsx`
* **Action Flow**:
  - The Principal Head approves uploaded or requested scanned certificate.
  - Verification logs clearly note that the physical certificate must be signed at the Desk.
  - The "Download Certificate PDF" button is visible and active on student profiles ONLY if the record has an associated certificate file link, satisfying rigorous administrative oversight.

---

## 5. Audit Results Summary

| Target Section | Button Label / Action | State Handling | Audit Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Notice Board** | Download Circular (PDF) | Conditional (`!!pdfUrl`) | Pass. Falsy URLs completely pruned. | **Green** |
| **Student Board** | Download PDF Marksheet | Interactive browser export | Pass. Tailored no-print selectors layout. | **Green** |
| **Certificate Hub** | Download Certificate PDF| Scanned verification link | Pass. Active check on approvals hierarchy. | **Green** |

**Recommendation:** Non-technical teachers uploading notices via the Admin Panel should make sure to upload PDFs to a central cloud storage bucket (or paste the direct drive link) inside the `PDF URL Attachment` field to make it instantly accessible for download.
