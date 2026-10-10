// components/AuthForm.jsx: centred email + password card shared by Sign up and Log in.
import { useState } from 'react';
import ErrorBanner from './ErrorBanner.jsx';

export default function AuthForm({ title, submitLabel, submittingLabel, isSignup, validate, onSubmit, footer }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const errors = validate({ email: email.trim(), password });
    setFieldErrors(errors);
    setError('');
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(email.trim(), password);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <p className="auth-brand">Team Capacity Tracker</p>
      <form className="card auth-card" onSubmit={handleSubmit} noValidate>
        <h1>{title}</h1>
        <ErrorBanner message={error} />

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors({ ...fieldErrors, email: undefined });
            }}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
          />
          {fieldErrors.email && <p id="email-error" className="field-error">{fieldErrors.email}</p>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldErrors({ ...fieldErrors, password: undefined });
            }}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? 'password-error' : isSignup ? 'password-hint' : undefined}
          />
          {fieldErrors.password ? (
            <p id="password-error" className="field-error">{fieldErrors.password}</p>
          ) : (
            isSignup && <p id="password-hint" className="field-hint">At least 8 characters.</p>
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </button>
        <p className="auth-footer">{footer}</p>
      </form>
    </div>
  );
}
