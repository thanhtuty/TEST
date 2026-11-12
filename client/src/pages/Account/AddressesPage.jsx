import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../../services/addressService.js";
import "./Account.css";

const emptyForm = {
  label: "Nhà riêng",
  fullName: "",
  phone: "",
  address: "",
  isDefault: false,
};

export default function AddressesPage() {
  const { user, token, isAuthLoading } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    if (!token) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    getAddresses(token)
      .then((data) => {
        if (active) setAddresses(data);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || "Không thể tải sổ địa chỉ.");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  if (isAuthLoading) {
    return (
      <main className="account-page profile-page">
        <p role="status">Đang kiểm tra tài khoản...</p>
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

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
    setMessage("");
  }

  function beginEdit(address) {
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      isDefault: address.isDefault,
    });
    setEditingId(address._id);
    setError("");
    setMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const updatedAddresses = editingId
        ? await updateAddress(token, editingId, form)
        : await createAddress(token, form);

      setAddresses(updatedAddresses);
      setMessage(editingId ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ.");
      resetForm();
    } catch (requestError) {
      setError(requestError.message || "Không thể lưu địa chỉ.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSetDefault(address) {
    setError("");
    setMessage("");

    try {
      const updatedAddresses = await updateAddress(token, address._id, {
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        isDefault: true,
      });
      setAddresses(updatedAddresses);
      setMessage("Đã đặt làm địa chỉ mặc định.");
    } catch (requestError) {
      setError(requestError.message || "Không thể cập nhật địa chỉ.");
    }
  }

  async function handleDelete(addressId) {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    setError("");
    setMessage("");

    try {
      const updatedAddresses = await deleteAddress(token, addressId);
      setAddresses(updatedAddresses);
      if (editingId === addressId) resetForm();
      setMessage("Đã xóa địa chỉ.");
    } catch (requestError) {
      setError(requestError.message || "Không thể xóa địa chỉ.");
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
            <Link to="/account/profile">Thông tin cá nhân</Link>
            <Link className="is-active" to="/account/addresses">
              Sổ địa chỉ
            </Link>
            <Link to="/account/orders">Đơn hàng của tôi</Link>
          </nav>
        </aside>

        <section className="profile-panel">
          <header className="profile-panel-heading">
            <p className="account-eyebrow">GIAO HÀNG</p>
            <h2>Sổ địa chỉ</h2>
            <p>Lưu địa chỉ để dùng nhanh khi đặt hàng.</p>
          </header>

          {error && <p className="account-error" role="alert">{error}</p>}
          {message && <p className="account-success" role="status">{message}</p>}
          {isLoading && <p role="status">Đang tải địa chỉ...</p>}

          <form className="account-form address-form" onSubmit={handleSubmit}>
            <h3>{editingId ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}</h3>

            <div className="address-form-grid">
              <label className="account-field">
                Tên gợi nhớ
                <input
                  name="label"
                  value={form.label}
                  onChange={handleChange}
                  placeholder="Nhà riêng, Công ty..."
                  minLength={2}
                  maxLength={40}
                  required
                />
              </label>

              <label className="account-field">
                Người nhận
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label className="account-field">
                Số điện thoại
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  maxLength={20}
                  required
                />
              </label>

              <label className="account-field address-field-wide">
                Địa chỉ đầy đủ
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  autoComplete="street-address"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  minLength={8}
                  maxLength={300}
                  rows={3}
                  required
                />
              </label>
            </div>

            <label className="address-default-toggle">
              <input
                type="checkbox"
                name="isDefault"
                checked={form.isDefault}
                onChange={handleChange}
              />
              <span>Đặt làm địa chỉ mặc định</span>
            </label>

            <div className="address-form-actions">
              {editingId && (
                <button
                  className="address-secondary-button"
                  type="button"
                  onClick={resetForm}
                >
                  Hủy sửa
                </button>
              )}
              <button
                className="account-submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Đang lưu..."
                  : editingId
                    ? "Lưu địa chỉ"
                    : "Thêm địa chỉ"}
              </button>
            </div>
          </form>

          <section className="address-list" aria-labelledby="saved-addresses-title">
            <div className="address-list-heading">
              <h3 id="saved-addresses-title">Địa chỉ đã lưu</h3>
              <span>{addresses.length}</span>
            </div>

            {!isLoading && addresses.length === 0 && (
              <p className="address-empty">
                Bạn chưa lưu địa chỉ nào. Thêm địa chỉ để dùng khi checkout.
              </p>
            )}

            <div className="address-cards">
              {addresses.map((address) => (
                <article className="address-card" key={address._id}>
                  <div className="address-card-heading">
                    <div>
                      <strong>{address.label}</strong>
                      {address.isDefault && (
                        <span className="address-default-badge">Mặc định</span>
                      )}
                    </div>
                    <div className="address-card-actions">
                      <button type="button" onClick={() => beginEdit(address)}>
                        Sửa
                      </button>
                      <button
                        className="address-delete-button"
                        type="button"
                        onClick={() => handleDelete(address._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <p>{address.fullName}</p>
                  <p>{address.phone}</p>
                  <p>{address.address}</p>

                  {!address.isDefault && (
                    <button
                      className="address-set-default"
                      type="button"
                      onClick={() => handleSetDefault(address)}
                    >
                      Đặt làm mặc định
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
