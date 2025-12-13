import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const commonItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/profile', label: 'My Profile', icon: '👤' }
    ];

    const roleBasedItems = {
      admin: [
        { path: '/employees', label: 'Employees', icon: '👥' },
        { path: '/departments', label: 'Departments', icon: '🏢' },
        { path: '/leave-requests', label: 'Leave Requests', icon: '📋' },
        { path: '/attendance', label: 'Attendance', icon: '✓' },
        { path: '/performance', label: 'Performance', icon: '⭐' },
        { path: '/reports', label: 'Reports', icon: '📈' }
      ],
      hr_officer: [
        { path: '/employees', label: 'Employees', icon: '👥' },
        { path: '/departments', label: 'Departments', icon: '🏢' },
        { path: '/leave-requests', label: 'Leave Requests', icon: '📋' },
        { path: '/attendance', label: 'Attendance', icon: '✓' },
        { path: '/performance', label: 'Performance', icon: '⭐' },
        { path: '/reports', label: 'Reports', icon: '📈' }
      ],
      department_head: [
        { path: '/employees', label: 'My Department', icon: '👥' },
        { path: '/leave-requests', label: 'Leave Requests', icon: '📋' },
        { path: '/attendance', label: 'Attendance', icon: '✓' },
        { path: '/performance', label: 'Performance', icon: '⭐' }
      ],
      finance_officer: [
        { path: '/employees', label: 'Employees', icon: '👥' },
        { path: '/reports', label: 'Reports', icon: '📈' }
      ],
      employee: [
        { path: '/leave-requests', label: 'My Leave Requests', icon: '📋' },
        { path: '/attendance', label: 'My Attendance', icon: '✓' },
        { path: '/performance', label: 'My Reviews', icon: '⭐' }
      ]
    };

    return [...commonItems, ...(roleBasedItems[user?.role] || [])];
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {getMenuItems().map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              isActive ? 'sidebar-link active' : 'sidebar-link'
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
