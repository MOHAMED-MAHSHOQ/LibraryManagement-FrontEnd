import { NavLink } from 'react-router-dom'

export default function Sidebar() {
    return (
        <div style={{
            width: '220px',
            height: '100vh',
            backgroundColor: '#1a1a2e',
            borderRight: '1px solid #2a2a3e',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            padding: '0',
        }}>

            <div style={{
                padding: '20px 16px',
                borderBottom: '1px solid #2a2a3e',
            }}>
                <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#ffffff',
                }}>
                    LibraryOS
                </div>
                <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    marginTop: '2px',
                }}>
                    Capestart intern project
                </div>
            </div>

            <nav style={{ padding: '12px 8px', flex: 1 }}>

                <NavLink to="/" end style={navLinkStyle}>
                    Dashboard
                </NavLink>

                <NavLink to="/students" style={navLinkStyle}>
                    Students
                </NavLink>

                <NavLink to="/books" style={navLinkStyle}>
                    Books
                </NavLink>

                <NavLink to="/unassigned" style={navLinkStyle}>
                    Unassigned shelf
                </NavLink>

            </nav>

            <div style={{
                padding: '16px',
                borderTop: '1px solid #2a2a3e',
                fontSize: '11px',
                color: '#6b7280',
            }}>
                Spring Boot + React
            </div>

        </div>
    )
}

function navLinkStyle({ isActive }) {
    return {
        display: 'block',
        padding: '10px 12px',
        marginBottom: '4px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: isActive ? '600' : '400',
        color: isActive ? '#ffffff' : '#9ca3af',
        backgroundColor: isActive ? '#2a2a4e' : 'transparent',
        textDecoration: 'none',
    }
}

