import { Navbar, Nav, Button, Stack } from 'react-bootstrap';
import { useAuth } from '../contexts/authContext/useAuth';
import { useNavigate } from 'react-router-dom';
import '../style/Navbar.css';
import logo from '../assets/logo.png';
import szoveg from '../assets/szoveg.png';
import logoutsd from '../assets/logout.png';

const Navbarom = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleHome = () => {
    navigate('/dashboard');
  };

  return (
    <Navbar variant="dark" expand="lg" className="mb-4 custom-navbar">
      <Stack direction="horizontal" gap={3} className="w-100">
        <Button className="button" variant="secondary" size="sm" onClick={handleHome}>
          <img src={logo} alt="Logo" style={{ height: '40px' }} />
        </Button>
        <div className="ms-auto">
          <img src={szoveg} alt="Logo" style={{ height: '25px' }} />
        </div>
        <div className="ms-auto">
          <Nav>
            {user && (
              <Button className="button" variant="secondary" size="sm" onClick={handleLogout}>
                <img src={logoutsd} alt="Logo" style={{ height: '30px' }} />
              </Button>
            )}
          </Nav>
        </div>
      </Stack>
    </Navbar>
  );
};

export default Navbarom;
