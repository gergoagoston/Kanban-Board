import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { UserDto } from '../dto/user.dto';
import { useAuth } from '../contexts/authContext/useAuth';
import '../style/Login.css';

interface LoginError {
  username?: string;
  password?: string;
  login?: string;
}

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<LoginError>({});
  const updateField = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name == 'password') {
      setPassword(e.target.value);
    } else {
      setUsername(e.target.value);
    }
  };

  const validateForm = () => {
    const newErrors: LoginError = { username: '', password: '' };
    if (!username) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    setError(newErrors);
    if (!password || !username) {
      return false;
    } else {
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const user = { username, password } as UserDto;
    const { success, error } = await loginUser(user);

    if (success) {
      await navigate('/dashboard'); // Redirect to dashboard on success
    } else {
      setError({ login: error }); // Display the error message
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="w-25 p-3">
          <Form noValidate onSubmit={handleSubmit}>
            <h1 className="text-center mb-4">Welcome back!</h1>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                placeholder="Enter your username"
                value={username}
                onChange={updateField}
                isInvalid={!!error.username}
                className="transparent"
              />
              <Form.Control.Feedback type="invalid">{error.username}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                name="password"
                value={password}
                onChange={updateField}
                isInvalid={!!error.password}
                className="transparent"
              />
              <Form.Control.Feedback type="invalid">{error.password}</Form.Control.Feedback>
            </Form.Group>
            {error.login && <p className="text-danger">{error.login}</p>}
            <div className="text-center">
              <Button type="submit">Submit</Button>
            </div>
          </Form>
          <div className="mt-3 text-center">
            <p>Don't have an account yet?</p>
            <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
