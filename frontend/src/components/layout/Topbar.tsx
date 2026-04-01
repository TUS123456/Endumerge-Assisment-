import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const roleLabel: Record<string, string> = {
  ADMIN: 'Administrator',
  ADMISSION_OFFICER: 'Admission Officer',
  MANAGEMENT: 'Management',
};

const roleBadge: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  ADMISSION_OFFICER: 'bg-blue-100 text-blue-700',
  MANAGEMENT: 'bg-green-100 text-green-700',
};

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-4">
      {user && (
        <>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <User size={16} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${roleBadge[user.role] ?? ''}`}>
                {roleLabel[user.role] ?? user.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </>
      )}
    </header>
  );
}
