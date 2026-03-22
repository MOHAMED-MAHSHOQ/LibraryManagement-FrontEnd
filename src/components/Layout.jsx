import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            backgroundColor: '#0f0f23',
            color: '#ffffff',
            fontFamily: 'Inter, system-ui, sans-serif',
        }}>
            <Sidebar />
            <main style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
            }}>
                <Outlet />
            </main>

        </div>
    )
}