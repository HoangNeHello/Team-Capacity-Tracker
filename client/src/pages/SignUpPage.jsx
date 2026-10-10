// pages/SignUpPage.jsx: S01 sign up form (email, password).
import { Link } from 'react-router';
import { useAuth } from '../auth/AuthContext.jsx';
import AuthForm from '../components/AuthForm.jsx';

function validate({ email, password }) {
  const errors = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';
  if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  return errors;
}

export default function SignUpPage() {
  const { signup } = useAuth();

  return (
    <AuthForm
      title="Create your account"
      submitLabel="Sign up"
      submittingLabel="Creating account…"
      isSignup
      validate={validate}
      onSubmit={signup}
      footer={<>Already have an account? <Link to="/login">Log in</Link></>}
    />
  );
}
