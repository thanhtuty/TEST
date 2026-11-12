import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Account.css";

export default function LoginPage() {
  const { login, user, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Đăng nhập không thành công.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <p className="account-eyebrow">MODENA</p>
        <h1>Đăng nhập</h1>
        <p className="account-description">
          Đăng nhập để tiếp tục mua sắm.
        </p>

        {isAuthLoading ? (
          <p role="status">Đang kiểm tra tài khoản…</p>
        ) : (
          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-field">
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="account-field">
              Mật khẩu
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            {error && <p className="account-error" role="alert">{error}</p>}

            <button className="account-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>
        )}

        <p className="account-switch">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </section>
    </main>
  );
}