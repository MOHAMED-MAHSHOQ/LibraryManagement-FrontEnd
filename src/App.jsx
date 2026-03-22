import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Books from './pages/Books'
import UnassignedShelf from './pages/UnassignedShelf'

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index              element={<Dashboard />} />
                <Route path="/students"   element={<Students />} />
                <Route path="/books"      element={<Books />} />
                <Route path="/unassigned" element={<UnassignedShelf />} />
            </Route>
        </Routes>
    )
}