import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAccounts } from '../../hooks/useAccounts';

export const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { accounts } = useAccounts();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutConfirmed, setLogoutConfirmed] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const userHasCheckedInAccount = accounts.some(
    (account) => account.current_user_id === user?.id && account.status === 'in-use'
  );

  const checkedInAccount = accounts.find(
    (account) => account.current_user_id === user?.id && account.status === 'in-use'
  );

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setLogoutConfirmed(false);
    setLogoutError('');
  };

  const handleLogoutConfirm = async () => {
    if (userHasCheckedInAccount) {
      setLogoutError(
        `You cannot log out. Please 'Check Out' the '${checkedInAccount?.name}' account first.`
      );
      return;
    }

    if (!logoutConfirmed) {
      setLogoutError('Please confirm that you have logged out of all LinkedIn accounts.');
      return;
    }

    await signOut();
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="bg-dark-secondary border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-royal-400">
                LinkedIn Token Tracker
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/schedule"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Schedule
                </Link>
                {user?.user_metadata.is_admin && (
                  <>
                    <Link
                      to="/admin"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Admin Panel
                    </Link>
                    <Link
                      to="/admin/logs"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Usage Logs
                    </Link>
                    <Link
                      to="/admin/schedule"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Manage Schedule
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">
                {user?.user_metadata.full_name}
                {user?.user_metadata.is_admin && (
                  <span className="ml-2 text-xs bg-royal-900/30 text-royal-400 px-2 py-1 rounded border border-royal-700/50">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={handleLogoutClick}
                className="btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="card max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Confirm Sign Out</h2>

            {logoutError && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                {logoutError}
              </div>
            )}

            {!userHasCheckedInAccount && (
              <div className="mb-6">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logoutConfirmed}
                    onChange={(e) => setLogoutConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-dark-border bg-dark-secondary text-royal-600 focus:ring-royal-500"
                  />
                  <span className="text-sm text-gray-300">
                    I confirm I have logged out of all LinkedIn accounts and closed all browser windows.
                  </span>
                </label>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              {!userHasCheckedInAccount && (
                <button
                  onClick={handleLogoutConfirm}
                  className="btn-danger flex-1"
                  disabled={!logoutConfirmed}
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
