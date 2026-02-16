import LoginForm from "../components/LoginForm";

export default function Login({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-blue-800">
      <LoginForm onLogin={onLogin} />
    </div>
  );
}
