import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CoverPage from './pages/CoverPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ListPage from './pages/ListPage'
import MountainDetailPage from './pages/MountainDetailPage'
import RecordEditPage from './pages/RecordEditPage'
import DiaryPage from './pages/DiaryPage'
import MapPage from './pages/MapPage'
import MyAscentPage from './pages/MyAscentPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-[430px] mx-auto min-h-screen">
        <Routes>
          <Route path="/" element={<CoverPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/list" element={<ListPage />} />
          <Route path="/mountain/:id" element={<MountainDetailPage />} />
          <Route path="/record/:mountainId" element={<RecordEditPage />} />
          <Route path="/diary" element={<DiaryPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/ascent" element={<MyAscentPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
