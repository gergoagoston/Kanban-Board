import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Register from './Register';
import Dashboard from './dasboard/Dashboard';
import BoardDetails from './board/BoardDetails';
import PlanningPoker from './planningPoker/PlanningPoker';
import { AuthProvider } from '../contexts/authContext/AuthProvider';
import { SocketContextProvider } from '../contexts/socketContext/SocketProvider';
import { ToastProvider } from '../contexts/toasterContext/ToasterProvider';
import ChatMainBoard from './chat/ChatMainBoard';
import { PeerProvider } from '../contexts/peerContext/PeerProvider';

const withProviders = (Component: React.ComponentType) => (
  <ToastProvider>
    <PeerProvider>
      <SocketContextProvider>
        <Component />
      </SocketContextProvider>
    </PeerProvider>
  </ToastProvider>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={withProviders(Dashboard)} />
          <Route path="/dashboard/:boardId" element={withProviders(BoardDetails)} />
          <Route path="/dashboard/:boardId/planningPoker" element={withProviders(PlanningPoker)} />
          <Route path="/chat" element={withProviders(ChatMainBoard)} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
