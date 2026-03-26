import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import Layout from './components/Layout'
import BoxesPage from './pages/BoxesPage'
import ReviewPage from './pages/ReviewPage'
import ExportPage from './pages/ExportPage'
import MonitoringPage from './pages/MonitoringPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/boxes" replace />} />
          <Route path="boxes" element={<BoxesPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="monitoring" element={<MonitoringPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
