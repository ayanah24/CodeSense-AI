import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ReviewDetail from './pages/ReviewDetail.jsx';

export default function App(){
  return(
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Landing />}/>
      <Route path='/dashboard' element={<Dashboard />}/>
      <Route path='/reviews/:id' element={<ReviewDetail />} />
    </Routes>
    </BrowserRouter>
  );
} 