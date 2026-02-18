import LoginForm from "../components/LoginForm";

export default function Login({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onLogin={onLogin} />
    </div>
  );
}
