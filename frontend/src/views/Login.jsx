import LoginForm from "../components/LoginForm";

export default function Login({ onLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-grey-100">
      <LoginForm onLogin={onLogin} />
    </div>
  );
}
