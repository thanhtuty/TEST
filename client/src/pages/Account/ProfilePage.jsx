import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import "./Account.css";

export default function ProfilePage() {
  const { user, token, isAuthLoading, updateProfile, changePassword } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
    });
  }, [user]);

  if (isAuthLoading) {
    return (
      <main className="account-page profile-page">
        <p role="status">Đang tải hồ sơ...</p>
      </main>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const initials = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await updateProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
      setMessage("Thông tin hồ sơ đã được cập nhật.");
    } catch (requestError) {
      setError(requestError.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePasswordFormChange(event) {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordError("");
    setPasswordMessage("");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu mới xác nhận chưa khớp.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordMessage("Đổi mật khẩu thành công.");
      window.alert("Đổi mật khẩu thành công.");
    } catch (requestError) {
      setPasswordError(requestError.message || "Không thể đổi mật khẩu.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <main className="account-page profile-page">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-avatar" aria-hidden="true">
            {initials || "M"}
          </div>

          <p className="profile-sidebar-eyebrow">TÀI KHOẢN MODENA</p>
          <h1>{user.fullName}</h1>
          <p className="profile-sidebar-description">
            Quản lý thông tin và đơn hàng của bạn.
          </p>

          <nav className="profile-nav" aria-label="Khu vực tài khoản">
            <Link className="is-active" to="/account/profile">
              Thông tin cá nhân
            </Link>
            <Link to="/account/addresses">Sổ địa chỉ</Link>
            <Link to="/account/orders">Đơn hàng của tôi</Link>
          </nav>
        </aside>

        <section className="profile-panel">
          <header className="profile-panel-heading">
            <p className="account-eyebrow">HỒ SƠ CỦA BẠN</p>
            <h2>Thông tin cá nhân</h2>
            <p>Thông tin này được dùng khi bạn đặt hàng.</p>
          </header>

          <form className="account-form profile-form" onSubmit={handleSubmit}>
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

            <label className="account-field profile-field-wide">
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

            {error && (
              <p className="account-error profile-field-wide" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="account-success profile-field-wide" role="status">
                {message}
              </p>
            )}

            <div className="profile-form-footer profile-field-wide">
              <p>Bạn có thể cập nhật thông tin bất cứ lúc nào.</p>
              <button
                className="account-submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>

          <section className="password-section">
            <header className="password-section-heading">
              <h3>Đổi mật khẩu</h3>
              <p>Nhập mật khẩu hiện tại và chọn mật khẩu mới.</p>
            </header>

            <form className="password-form" onSubmit={handlePasswordSubmit}>
              <label className="account-field">
                Mật khẩu hiện tại
                <input
                  type="password"
                  name="currentPassword"
                  autoComplete="current-password"
                  maxLength={128}
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordFormChange}
                  required
                />
              </label>

              <label className="account-field">
                Mật khẩu mới
                <input
                  type="password"
                  name="newPassword"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                  required
                />
              </label>

              <label className="account-field">
                Nhập lại mật khẩu mới
                <input
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFormChange}
                  required
                />
              </label>

              {passwordError && (
                <p className="account-error" role="alert">
                  {passwordError}
                </p>
              )}

              {passwordMessage && (
                <p className="account-success" role="status">
                  {passwordMessage}
                </p>
              )}

              <button
                className="account-submit password-submit"
                type="submit"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}
