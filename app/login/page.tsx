"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Icon from "@/components/ui/Icon";
import Alert from "@/components/ui/Alert";
import { login } from "@/config/dummyAuth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username atau email wajib diisi.");
      return;
    }
    if (!password) {
      setError("Password wajib diisi.");
      return;
    }

    setIsLoading(true);
    await Promise.resolve();
    const user = await login(username, password);
    if (!user) {
      setIsLoading(false);
      setError("Username atau password tidak sesuai.");
      return;
    }

    router.replace("/dashboard");
  }

  return (
    <main className="login-page" id="main-content" tabIndex={-1}>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-brand">
          <div className="login-brand-icon">
            <Image
              src="/logo-kkp.png"
              width={96}
              height={96}
              alt="Logo Kementerian Kelautan dan Perikanan"
              priority
              style={{ objectFit: "contain" }}
            />
          </div>
          <div>
            <p className="login-brand-name">ARSIP KEPEGAWAIAN KEMENTERIAN KELAUTAN DAN PERIKANAN</p>
            <p className="login-brand-subtitle">Sistem Manajemen Arsip &amp; Kepegawaian</p>
          </div>
        </div>



        {error && <Alert variant="error" message={error} />}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username atau email</label>
            <input
              id="username"
              name="username"
              className="form-input"
              type="text"
              autoComplete="username"
              placeholder="Masukkan username atau email"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="form-input-wrapper">
              <input
                id="password"
                name="password"
                className="form-input has-icon-right"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="form-input-icon-right clickable login-password-toggle"
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                <Icon name={showPassword ? "eye-off" : "eye"} size={17} />
              </button>
            </div>
          </div>

          <button className="btn btn-primary login-submit" type="submit" disabled={isLoading}>
            {isLoading ? <span className="loading-spinner login-spinner" aria-hidden="true" /> : null}
            {isLoading ? "Memeriksa..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}