"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama lengkap wajib diisi.";
    } else if (formData.name.trim().length > 150) {
      newErrors.name = "Maksimal 150 karakter.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Format email tidak valid.";
    } else if (formData.email.trim().length > 150) {
      newErrors.email = "Maksimal 150 karakter.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi.";
    } else if (formData.phone.trim().length > 30) {
      newErrors.phone = "Maksimal 30 karakter.";
    }

    if (!formData.company_name.trim()) {
      newErrors.company_name = "Nama perusahaan wajib diisi.";
    } else if (formData.company_name.trim().length > 150) {
      newErrors.company_name = "Maksimal 150 karakter.";
    }

    if (!formData.password) {
      newErrors.password = "Password wajib diisi.";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password minimal 8 karakter.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password wajib diisi.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Password tidak cocok.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitError("");

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      company_name: formData.company_name.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.message || "Pendaftaran gagal.");
        return;
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Register Error:", error);
      setSubmitError(
        "Tidak dapat terhubung ke server. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Kolom Kiri: Panel Branding */}
      <section className="relative w-full lg:w-1/2 min-h-[260px] lg:min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#EFF4F9] to-[#E1ECF6] lg:border-r border-[#E2EAF2] flex flex-col justify-between overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0"
        >
          <div className="absolute inset-0 [background-image:radial-gradient(rgba(53,111,159,0.2)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] [-webkit-mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

          <div className="absolute inset-y-0 right-[18%] w-px bg-[#356F9F]/[0.08]" />
          <div className="absolute inset-x-0 bottom-[22%] h-px bg-[#356F9F]/[0.08]" />

          <div className="absolute -top-28 -left-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-[#356F9F]/[0.12] blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-72 w-72 sm:h-[26rem] sm:w-[26rem] rounded-full bg-[#D8B98C]/[0.15] blur-3xl" />

          <div className="absolute bottom-5 right-5 sm:bottom-10 sm:right-10 lg:bottom-14 lg:right-14 h-[130px] w-[170px] sm:h-[240px] sm:w-[300px] lg:h-[320px] lg:w-[390px]">
            <div className="absolute bottom-0 right-0 h-[46%] w-[72%] rounded-3xl border border-white/80 backdrop-blur-[2px] bg-gradient-to-tr from-[#356F9F]/10 to-white/70 shadow-[0_24px_50px_-24px_rgba(25,59,89,0.3)]" />
            <div className="absolute bottom-[36%] right-[14%] h-[40%] w-[50%] rounded-3xl border border-white/80 backdrop-blur-[2px] bg-gradient-to-tr from-[#356F9F]/[0.14] to-white/70 shadow-[0_24px_50px_-24px_rgba(25,59,89,0.3)]" />
            <div className="absolute bottom-[68%] right-[4%] h-[28%] w-[34%] rounded-3xl border border-white/80 backdrop-blur-[2px] bg-gradient-to-tr from-[#D8B98C]/25 to-white/70 shadow-[0_24px_50px_-24px_rgba(216,185,140,0.45)]" />
          </div>
        </div>

        {/* Logo */}
        <div className="relative z-10 p-6 sm:p-10 lg:pt-10 lg:pl-10">
          <Link href="/login" className="inline-block">
            <Image
              src="/logo.png"
              alt="Tataloka - Kelola Gudang, Lebih Tertata."
              width={260}
              height={78}
              priority
              className="w-48 sm:w-60 lg:w-[270px] h-auto object-contain"
            />
          </Link>
        </div>

        {/* Branding Text */}
        <div className="relative z-10 hidden lg:block p-10 pb-14">
          <div className="h-[2px] w-14 rounded-full bg-[#D8B98C]" />
          <p className="mt-4 text-[11px] font-semibold tracking-[0.18em] text-[#356F9F]">
            WAREHOUSE MANAGEMENT SYSTEM
          </p>
          <p className="mt-3 max-w-[320px] text-[24px] font-semibold leading-snug tracking-tight text-[#193B59]">
            Kelola gudang dengan lebih tertata, akurat, dan efisien.
          </p>
        </div>
      </section>

      {/* Kolom Kanan: Form Register */}
      <section className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-10 sm:px-12 lg:px-16">
        <div className="w-full max-w-[440px]">
          <div className="mb-6">
            <h1 className="font-[family-name:var(--font-bricolage)] text-[28px] sm:text-[34px] font-bold tracking-tight leading-tight text-[#193B59]">
              Create Supplier <span className="text-[#356F9F]">Account</span>
            </h1>
            <p className="mt-1.5 text-[14.5px] sm:text-[15px] text-[#5C768D] font-normal">
              Daftarkan perusahaan Anda untuk bergabung dengan TATALOKA.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label htmlFor="name" className="block text-[14px] font-semibold text-[#193B59] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  maxLength={150}
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className={`w-full h-[46px] px-4 rounded-[8px] border text-[14px] text-[#193B59] placeholder-[#94A1AD] transition-colors focus:outline-none focus:bg-white focus:ring-2 ${
                    errors.name
                      ? "border-red-400 bg-white focus:ring-red-200"
                      : "border-transparent bg-[#F5F7FA] focus:border-[#356F9F] focus:ring-[#356F9F]/20"
                  }`}
                />
                {errors.name && <p className="mt-1 text-[11.5px] text-red-500">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-[14px] font-semibold text-[#193B59] mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={150}
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nama@domain.com"
                  className={`w-full h-[46px] px-4 rounded-[8px] border text-[14px] text-[#193B59] placeholder-[#94A1AD] transition-colors focus:outline-none focus:bg-white focus:ring-2 ${
                    errors.email
                      ? "border-red-400 bg-white focus:ring-red-200"
                      : "border-transparent bg-[#F5F7FA] focus:border-[#356F9F] focus:ring-[#356F9F]/20"
                  }`}
                />
                {errors.email && <p className="mt-1 text-[11.5px] text-red-500">{errors.email}</p>}
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-[14px] font-semibold text-[#193B59] mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                maxLength={30}
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="08xxxxxxxxx"
                className={`w-full h-[46px] px-4 rounded-[8px] border text-[14px] text-[#193B59] placeholder-[#94A1AD] transition-colors focus:outline-none focus:bg-white focus:ring-2 ${
                  errors.phone
                    ? "border-red-400 bg-white focus:ring-red-200"
                    : "border-transparent bg-[#F5F7FA] focus:border-[#356F9F] focus:ring-[#356F9F]/20"
                }`}
              />
              {errors.phone && <p className="mt-1 text-[11.5px] text-red-500">{errors.phone}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="company_name" className="block text-[14px] font-semibold text-[#193B59] mb-1.5">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                maxLength={150}
                required
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Masukkan nama perusahaan"
                className={`w-full h-[46px] px-4 rounded-[8px] border text-[14px] text-[#193B59] placeholder-[#94A1AD] transition-colors focus:outline-none focus:bg-white focus:ring-2 ${
                  errors.company_name
                    ? "border-red-400 bg-white focus:ring-red-200"
                    : "border-transparent bg-[#F5F7FA] focus:border-[#356F9F] focus:ring-[#356F9F]/20"
                }`}
              />
              {errors.company_name && <p className="mt-1 text-[11.5px] text-red-500">{errors.company_name}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[14px] font-semibold text-[#193B59] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Buat password"
                  className={`w-full h-[46px] pl-4 pr-16 rounded-[8px] border text-[14px] text-[#193B59] placeholder-[#94A1AD] transition-colors focus:outline-none focus:bg-white focus:ring-2 ${
                    errors.password
                      ? "border-red-400 bg-white focus:ring-red-200"
                      : "border-transparent bg-[#F5F7FA] focus:border-[#356F9F] focus:ring-[#356F9F]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 text-[12.5px] font-medium text-[#5C768D] hover:text-[#193B59] transition-colors cursor-pointer"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11.5px] text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-[14px] font-semibold text-[#193B59] mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className={`w-full h-[46px] pl-4 pr-16 rounded-[8px] border text-[14px] text-[#193B59] placeholder-[#94A1AD] transition-colors focus:outline-none focus:bg-white focus:ring-2 ${
                    errors.confirmPassword
                      ? "border-red-400 bg-white focus:ring-red-200"
                      : "border-transparent bg-[#F5F7FA] focus:border-[#356F9F] focus:ring-[#356F9F]/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-4 text-[12.5px] font-medium text-[#5C768D] hover:text-[#193B59] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-[11.5px] text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Account Approval */}
            <div className="pt-1">
              <div className="flex items-start gap-3.5 rounded-[10px] bg-[#E8F1FA] border border-[#D4E4F4] px-4 py-3.5">
                <Image
                  src="/approval-icon.png"
                  alt="Approval Icon"
                  width={36}
                  height={36}
                  className="h-9 w-9 shrink-0 object-contain mt-0.5"
                />
                <div>
                  <p className="text-[13px] font-bold text-[#193B59]">Account Approval</p>
                  <p className="mt-0.5 text-[12px] text-[#356F9F] leading-snug">
                    Your account will be reviewed by the administrator before you can sign in.
                  </p>
                </div>
              </div>
            </div>

            {submitError && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {submitError}
              </p>
            )}

            {/* Create Account */}
            <div className="pt-1.5">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] rounded-full bg-gradient-to-r from-[#356F9F] to-[#193B59] hover:from-[#2D608A] hover:to-[#132E47] text-white text-[15px] font-semibold shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          {/* Sign In */}
          <div className="mt-6 text-center">
            <p className="text-[14.5px] text-[#64748B]">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#2B6291] hover:text-[#193B59] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Modal Feedback */}
      {isSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#193B59]/40 backdrop-blur-xs px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-[#CBD5E1] text-center">
            <h3 className="text-lg font-bold text-[#193B59]">Registration Submitted</h3>
            <p className="mt-2 text-sm text-[#5C768D]">
              Your account will be reviewed by the administrator before you can sign in.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setIsSubmitted(false)}
                className="flex-1 h-10 rounded-full border border-[#CBD5E1] text-sm font-semibold text-[#193B59] hover:bg-[#F5F7FA] transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                href="/login"
                className="flex-1 h-10 rounded-full bg-gradient-to-r from-[#356F9F] to-[#193B59] hover:from-[#2D608A] hover:to-[#132E47] text-sm font-semibold text-white flex items-center justify-center transition-all"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
