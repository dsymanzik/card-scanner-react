import { Outlet } from 'react-router'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#111] text-[#ddd] font-sans text-sm">
      <Sidebar />
      <main className="flex-1 p-5">
        <Outlet />
      </main>
    </div>
  )
}
