import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Account.css";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const { register, user, isAuthLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
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

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Đăng ký không thành công.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="account-page">
      <section className="account-card">
        <p className="account-eyebrow">MODENA</p>
        <h1>Tạo tài khoản</h1>
        <p className="account-description">
          Điền thông tin để tạo tài khoản.
        </p>

        {isAuthLoading ? (
          <p role="status">Đang kiểm tra tài khoản…</p>
        ) : (
          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-field">
              Họ và tên
              <input
                type="text"
                name="fullName"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                value={form.fullName}
                onChange={handleChange}
                required
              />
            </label>

            <label className="account-field">
              Email
              <input
                type="email"
                name="email"
                autoComplete="email"
                maxLength={254}
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="account-field">
              Số điện thoại
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                maxLength={20}
                value={form.phone}
                onChange={handleChange}
                required
              />
            </label>

            <label className="account-field">
              Mật khẩu
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <label className="account-field">
              Nhập lại mật khẩu
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>

            {error && <p className="account-error" role="alert">{error}</p>}

            <button className="account-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo tài khoản…" : "Đăng ký"}
            </button>
          </form>
        )}

        <p className="account-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </section>
    </main>
  );
}