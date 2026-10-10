// pages/LoginPage.jsx: S02 log in form (email, password).
import { Link } from 'react-router';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthForm from '../components/AuthForm.jsx';

function validate({ email, password }) {
  const errors = {};
  if (!email) errors.email = 'Enter your email';
  if (!password) errors.password = 'Enter your password';
  return errors;
}

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <AuthForm
      title="Log in"
      submitLabel="Log in"
      submittingLabel="Logging in…"
      validate={validate}
      onSubmit={login}
      footer={<>New here? <Link to="/signup">Create an account</Link></>}
    />
  );
}
