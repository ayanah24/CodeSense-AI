import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ReviewDetail from './pages/ReviewDetail.jsx';
import ManualReview from './pages/ManualReview.jsx';
export default function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing />}/>
      <Route path='/dashboard' element={<Dashboard />}/>
      <Route path='/reviews/:id' element={<ReviewDetail />} />
      <Route path='/manual' element={<ManualReview />} />
    </Routes>
    </BrowserRouter>
  );
} 