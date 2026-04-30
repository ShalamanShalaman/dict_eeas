import React, { useState, useEffect } from 'react';
import { 
  BookOpen, FileText, Upload, Users, Shield, 
  Clock, CheckCircle, AlertCircle, ChevronRight,
  Search, User, Layers, Save, Folder, Briefcase,
  Home, Activity, Settings
} from 'lucide-react';

const manualContent = [
  {
    id: 'dashboard',
    title: 'Home Dashboard',
    icon: Home,
    allowedRoles: ['employee', 'reviewer', 'admin'],
    sections: [
      {
        heading: 'Employee View',
        content: 'Your dashboard provides a high-level summary of your document workflow. It displays real-time counts for Total Submissions, Pending Drafts, Submitted documents, and Approved/Declined statuses. The "Recent Activity" timeline tracks your latest document movements, and "Quick Actions" provides fast navigation to core system features.'
      },
      {
        heading: 'Reviewer View',
        content: 'If you are assigned as a Reviewer, your dashboard focuses on team management. It displays the count of documents awaiting your approval (Pending) versus those you have already processed (Approved/Declined). It provides direct access to your specific Reviewer queues.'
      },
      {
        heading: 'Admin View',
        content: 'Administrators see system-wide metrics, including total registered accounts segmented by Employees and Reviewers. The Admin dashboard also includes a live, mini-feed of the System Audits, allowing you to instantly search and monitor recent user activities without leaving the home page.'
      }
    ]
  },
  {
    id: 'upload-attendance',
    title: 'Attendance Processor',
    icon: Upload,
    allowedRoles: ['employee', 'reviewer', 'admin'],
    sections: [
      {
        heading: '1. Shared Office PDFs',
        content: 'Instead of everyone uploading the same bulk biometric PDF, colleagues can click "Share to Office". Open the "Available Office Shared PDFs" accordion at the top of the page to see files uploaded by your team. Click "Extract" to instantly pull your data from a shared file without needing to download it to your device.'
      },
      {
        heading: '2. PDF Date Format & Extraction',
        content: 'Different biometric machines format dates differently. Before clicking "Extract PDF", select the correct PDF Date Format (DD/MM or MM/DD) to ensure the system reads the days and months correctly. Once set, drag your PDF into the dashed zone and click Extract.'
      },
      {
        heading: '3. Log Source & Month Selectors',
        content: 'Because biometric PDFs often contain logs for multiple employees, the system extracts everyone into memory. Use the "Select Log Source" dropdown to search for and select your specific name. If your biometric data spans across multiple months, a "Select Month" dropdown will appear, allowing you to isolate the specific period you are filing for.'
      },
      {
        heading: '4. DTR Table & Undertime Computation',
        content: 'The DTR table maps your raw logs to days 1-31. The system automatically cross-references your time logs against your designated Office Location Schedule to compute exact Undertime (Hours and Minutes). \n• Duplicate Scans: If you scanned multiple times for the same period (e.g., two Morning In logs), the system automatically selects the earliest time and highlights the cell in Amber. Click the cell to select a different scan, or double-click to type a manual override.'
      },
      {
        heading: '5. Table Tools (Merging & Batching)',
        content: '• Split/Merge Cells: Hover your mouse on the border between two time cells (e.g., AM OUT and PM IN). A merge icon will appear, allowing you to combine them for continuous shifts.\n• Batch Remarks: Click the checkboxes on the far-left side of the table rows. A floating tool will appear. You can apply remarks like "Work Suspension", "Holiday", or "Leaves" to all selected days simultaneously. Selecting "Weekend" requires exactly two consecutive days to be checked.'
      },
      {
        heading: '6. Accomplishment Report (AR) Tab',
        content: 'The AR tab dynamically syncs with your DTR. \n• Auto-Highlighting: Any day with a recorded time log is automatically highlighted in green.\n• Manual Inclusion: If you worked but have no biometric log, click the day number to manually include it in the report.\n• Task Formatting: In the text area, type a hyphen (-) or asterisk (*) followed by a space, and press Enter to automatically create a formatted bulleted list.'
      },
      {
        heading: '7. DTR Adjustment Slip Tab',
        content: 'If your biometrics failed or you went on Official Business, switch to this tab. You can add specific rows for the missing dates/times, select the reason (Fingerprint issue, OB, Personal, or Other), and provide specific details. This generates a separate official Word document for your supervisor.'
      }
    ]
  },
  {
    id: 'saved-progress',
    title: 'Saved Progress',
    icon: Save,
    allowedRoles: ['employee', 'reviewer', 'admin'],
    sections: [
      {
        heading: 'Managing Your Drafts',
        content: 'The Saved Progress page is your personal library divided into two tabs:\n• Attendance Drafts: These are `.json` files representing unfinished DTR/AR sessions. Clicking "Resume Work" will reload the exact state of your table, tasks, and settings back into the Attendance Processor.\n• Ready to Submit: These are finalized `.pdf` files that have been converted but not yet sent to a reviewer.'
      },
      {
        heading: 'Bulk Actions & Pinning',
        content: 'Click the checkbox icon at the top of the search bar to enter Selection Mode. You can click multiple documents to delete them simultaneously. You can also click the "Pin" icon to permanently keep important drafts at the very top of your list for quick access.'
      }
    ]
  },
  {
    id: 'submit-approval',
    title: 'Submit for Approval',
    icon: FileText,
    allowedRoles: ['employee', 'reviewer', 'admin'],
    sections: [
      {
        heading: 'Step 1: Attach Files',
        content: 'In this step, you upload all required documents for your submission. The system supports Excel (.xlsx), Word (.docx), Images (.jpg, .png), and existing PDFs. Once all files are uploaded, click "Convert to PDF". The system will process, sequence, and merge all these disparate file types into a single, unified PDF document.'
      },
      {
        heading: 'Step 2: Review and Submit',
        content: 'After conversion, you can preview the merged PDF to ensure everything looks correct. You have the option to rename the file before submission. Select your designated Reviewing Officer from the dropdown (which automatically defaults to the reviewer assigned to your office) and click "Submit for Approval".'
      }
    ]
  },
  {
    id: 'my-submissions',
    title: 'My Submissions',
    icon: Activity,
    allowedRoles: ['employee', 'reviewer', 'admin'],
    sections: [
      {
        heading: 'Tracking Document Status',
        content: 'This page tracks the live status of every document you have submitted. You can filter by: Submitted, Pending, Approved, and Declined. \n• View PDF: Click the eye icon to preview exactly what your reviewer sees.\n• Download Signed: If a document is marked as Approved, a green download link will appear containing the final, digitally signed version of your document.'
      },
      {
        heading: 'Handling Declined Documents',
        content: 'If your document is Declined, it will be flagged in red. A "Rejection Reason" box will appear directly under the status, displaying the exact note your reviewer left explaining why the document needs revision.'
      }
    ]
  },
  {
    id: 'reviewer-dashboard',
    title: 'Reviewer Dashboard',
    icon: CheckCircle,
    allowedRoles: ['reviewer', 'admin'],
    sections: [
      {
        heading: 'Pending Reviews',
        content: 'This tab contains the queue of documents submitted by employees assigned to you. Click the Eye icon to open the PDF viewer and review their merged DTRs, ARs, and attachments.'
      },
      {
        heading: 'Upload Signed Document (Approve)',
        content: 'To approve a submission, click the green Upload icon. You must upload the finalized, signed version of their PDF (containing your e-signature or scanned physical signature). Doing so instantly changes the document status to "Approved" and notifies the employee.'
      },
      {
        heading: 'Declining a Submission',
        content: 'To reject a submission, click the red "X" icon. The system will prompt you with a modal requiring you to type a reason for declining. This reason is permanently attached to the document log and is sent directly to the employee so they can make the necessary corrections.'
      },
      {
        heading: 'Archive Management',
        content: 'The Archive tab stores your historical record of all Approved and Declined documents. You can retrieve signed copies from here at any time, or permanently delete old records to clean up your workspace.'
      }
    ]
  },
  {
    id: 'my-profile',
    title: 'My Profile',
    icon: User,
    allowedRoles: ['employee', 'reviewer', 'admin'],
    sections: [
      {
        heading: 'Personal Information & OTP Verification',
        content: 'You can update your name, contact number, and email. Note: If you change your registered email address, the system will flag your account as "Unverified". You must click the "Verify" button to trigger a One-Time Password (OTP) to your new inbox. You cannot save your profile changes until the 6-digit OTP is verified.'
      },
      {
        heading: 'Profile Pictures',
        content: 'Click the camera icon on your avatar to upload a profile photo. The system accepts JPG, PNG, GIF, and WEBP formats up to 5MB. You can also remove your picture, reverting your avatar back to your initials.'
      },
      {
        heading: 'Security & Password Resets',
        content: 'To change your password, you must input your "Old Password" to verify your identity. If you forgot your password, click "Forgot Password?". The system will email a 6-digit verification code to your registered email address, allowing you to bypass the old password requirement and set a new one.'
      }
    ]
  },
  {
    id: 'admin-settings',
    title: 'Admin Settings (Users & Locations)',
    icon: Settings,
    allowedRoles: ['admin'],
    sections: [
      {
        heading: 'Office Locations & Scheduling',
        content: '• Global Schedule: Click the "Global Schedule" button to set the standard AM and PM working hours for the entire organization. This overwrites all locations.\n• Local Overrides: If a specific field office operates on a different schedule, edit that specific location and fill out the "Local Office Hours Overrides". This schedule will dictate how Undertimes are computed for employees assigned to that office.\n• Reviewer Assignment: When creating an office, you must assign a specific Reviewer from the dropdown. All employees in that office will route their submissions to this person.'
      },
      {
        heading: 'User Management',
        content: 'Admins can Create, Edit, or Delete users. When creating an account, you must assign them a Role (Employee, Reviewer, Admin), an Office Location, and a Position. The system will automatically generate a highly secure 12-character temporary password, email it directly to the user, and force them to change it on their first login.'
      }
    ]
  },
  {
    id: 'system-audits',
    title: 'System Audits',
    icon: Shield,
    allowedRoles: ['admin'],
    sections: [
      {
        heading: 'Live Audit Trail',
        content: 'The System Audits page records a permanent, unalterable log of every action taken in the system (Logins, Creations, Updates, Deletions, Document Submissions, Approvals). The table auto-refreshes every 5 seconds to show live activity.'
      },
      {
        heading: 'Deep Inspection & Filtering',
        content: 'You can filter the logs by specific Dates, User Roles, or Action Types. If an audit log references a specific Document ID or JSON Draft, an interactive "View Document" or "View Draft Data" button will appear inside the log details. Clicking this allows you to physically inspect the file associated with the action in a Read-Only Audit Mode.'
      },
      {
        heading: 'Exporting Data',
        content: 'Click "Export CSV" to download a spreadsheet of the currently filtered logs for external reporting or security reviews.'
      }
    ]
  }
];

export default function SystemManual({ user }) {
  const [activeTab, setActiveTab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const userRole = user?.role?.toLowerCase() || 'employee';

  // Filter categories based on the user's role
  const roleFilteredContent = manualContent.filter(tab => 
    tab.allowedRoles.includes(userRole)
  );

  useEffect(() => {
    if (roleFilteredContent.length > 0 && !activeTab) {
      setActiveTab(roleFilteredContent[0].id);
    }
  }, [roleFilteredContent, activeTab]);

  // Deep search filtering
  const searchFilteredContent = roleFilteredContent.map(tab => {
    const matchedSections = tab.sections.filter(
      sec => sec.heading.toLowerCase().includes(searchQuery.toLowerCase()) || 
             sec.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...tab, sections: matchedSections, hasMatch: matchedSections.length > 0 };
  }).filter(tab => tab.hasMatch || tab.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const activeContent = searchFilteredContent.find(tab => tab.id === activeTab) || searchFilteredContent[0];

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-slate-50/50">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            System Manual & Help Center
          </h1>
          <p className="text-slate-500 mt-2">Comprehensive page-by-page technical reference for DICT-EAAS.</p>
        </div>
        <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm border border-indigo-200">
            <User className="w-4 h-4" />
            Viewing as: <span className="uppercase tracking-wider">{userRole}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden sticky top-24">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search instructions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all"
                />
              </div>
            </div>
            <nav className="p-3 flex flex-col gap-1.5 max-h-[70vh] overflow-y-auto">
              {searchFilteredContent.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left
                      ${isActive 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {tab.title}
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-white" />}
                  </button>
                );
              })}
              {searchFilteredContent.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-500 flex flex-col items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                    No manual sections found matching "{searchQuery}"
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          {activeContent ? (
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-20">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-8 mb-8">
                <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-md text-white">
                  <activeContent.icon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">{activeContent.title}</h2>
                    <p className="text-slate-500 mt-1 font-medium text-sm uppercase tracking-wider">{activeContent.sections.length} Core Features</p>
                </div>
              </div>

              <div className="space-y-10">
                {activeContent.sections.map((section, idx) => (
                  <div key={idx} className="group relative pl-6 border-l-2 border-slate-100 hover:border-indigo-400 transition-colors duration-300">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-slate-200 group-hover:border-indigo-500 transition-colors duration-300" />
                    <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-indigo-700 transition-colors">
                      {section.heading}
                    </h3>
                    <div className="text-slate-600 leading-relaxed space-y-3 text-sm md:text-base">
                      {section.content.split('\n').map((line, lineIdx) => (
                        <p key={lineIdx} className={line.startsWith('•') ? 'pl-6 relative before:content-[""] before:absolute before:left-2 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-indigo-400 before:rounded-full' : ''}>
                          {line.replace('• ', '')}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}