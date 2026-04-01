import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, GraduationCap, BookOpen,
  ClipboardList, FileText, Settings, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useRoleAccess } from '../../hooks/useRoleAccess';

const mastersLinks = [
  { to: '/masters/institution', label: 'Institution' },
  { to: '/masters/campus', label: 'Campus' },
  { to: '/masters/department', label: 'Department' },
  { to: '/masters/program', label: 'Program' },
  { to: '/masters/academic-year', label: 'Academic Year' },
  { to: '/masters/course-type', label: 'Course Type' },
  { to: '/masters/entry-type', label: 'Entry Type' },
  { to: '/masters/admission-mode', label: 'Admission Mode' },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
    isActive
      ? 'bg-blue-600 text-white'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

export function Sidebar() {
  const { isAdmin } = useRoleAccess();
  const [mastersOpen, setMastersOpen] = useState(false);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <GraduationCap className="text-blue-600" size={28} />
          <span className="text-xl font-bold text-gray-900">EduMerge</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Admission Management</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        {/* Masters — Admin only */}
        {isAdmin && (
          <div>
            <button
              onClick={() => setMastersOpen((o) => !o)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Building2 size={18} />
              <span className="flex-1 text-left">Masters</span>
              {mastersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {mastersOpen && (
              <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-200 pl-3">
                {mastersLinks.map((l) => (
                  <NavLink key={l.to} to={l.to} className={navLinkClass}>
                    {l.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        )}

        <NavLink to="/seat-matrix" className={navLinkClass}>
          <BookOpen size={18} />
          Seat Matrix
        </NavLink>

        <NavLink to="/applicants" className={navLinkClass}>
          <Users size={18} />
          Applicants
        </NavLink>

        <NavLink to="/admissions" className={navLinkClass}>
          <ClipboardList size={18} />
          Admissions
        </NavLink>

        <NavLink to="/reports" className={navLinkClass}>
          <FileText size={18} />
          Reports
        </NavLink>

        {isAdmin && (
          <NavLink to="/settings" className={navLinkClass}>
            <Settings size={18} />
            Settings
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
