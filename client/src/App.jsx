import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ReviewDetail from './pages/ReviewDetail.jsx';
import ManualReview from './pages/ManualReview.jsx';
import Repositories from './pages/Repositories.jsx';
export default function App(){
  return(
    <BrowserRouter>
    <AuthProvider>
    <Routes>
        {/* Public */}
      <Route path='/' element={<Landing />}/>
        {/* Protected */}
      <Route path='/dashboard' element={
        <ProtectedRoute>
        <Dashboard />
       </ProtectedRoute>
        }/>
      <Route path='/reviews/:id' element={
        <ProtectedRoute>
        <ReviewDetail />
         </ProtectedRoute>
        } />
      <Route path='/manual' element={
        <ProtectedRoute>
        <ManualReview />
        </ProtectedRoute>
        } />
       <Route path="/repositories" element={
            <ProtectedRoute><Repositories /></ProtectedRoute>
          } />
    </Routes>
   </AuthProvider>
    </BrowserRouter>
  );
} 