"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message);
        return;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      setErrorMessage("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      <section className="relative w-full lg:w-1/2 min-h-[260px] lg:min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#EFF4F9] to-[#E1ECF6] lg:border-r border-[#E2EAF2] flex flex-col justify-between overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute inset-0"
        >
          <div className="absolute inset-0 [background-image:radial-gradient(rgba(53,111,159,0.2)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] [-webkit-mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

          <div className="absolute inset-y-0 right-[18%] w-px bg-[#356F9F]/[0.08]" />
          <div className="absolute inset-x-0 bottom-[22%] h-px bg-[#356F9F]/[0.08]" />

          <div className="absolute -top-28 -left-24 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-[#356F9F]/12 blur-3xl" />
          <div className="absolute -bottom-32 -right-24 h-72 w-72 sm:h-[26rem] sm:w-[26rem] rounded-full bg-[#D8B98C]/[0.15] blur-3xl" />

          <div className="absolute bottom-5 right-5 sm:bottom-10 sm:right-10 lg:bottom-14 lg:right-14 h-[130px] w-[170px] sm:h-[240px] sm:w-[300px] lg:h-[320px] lg:w-[390px]">
            <div className="absolute bottom-0 right-0 h-[46%] w-[72%] rounded-3xl border border-white/80 backdrop-blur-[2px] bg-gradient-to-tr from-[#356F9F]/10 to-white/70 shadow-[0_24px_50px_-24px_rgba(25,59,89,0.3)]" />
            <div className="absolute bottom-[36%] right-[14%] h-[40%] w-[50%] rounded-3xl border border-white/80 backdrop-blur-[2px] bg-gradient-to-tr from-[#356F9F]/[0.14] to-white/70 shadow-[0_24px_50px_-24px_rgba(25,59,89,0.3)]" />
            <div className="absolute bottom-[68%] right-[4%] h-[28%] w-[34%] rounded-3xl border border-white/80 backdrop-blur-[2px] bg-gradient-to-tr from-[#D8B98C]/25 to-white/70 shadow-[0_24px_50px_-24px_rgba(216,185,140,0.45)]" />
          </div>
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:pt-10 lg:pl-10">
          <Image
            src="/logo.png"
            alt="Tataloka - Kelola Gudang, Lebih Tertata."
            width={260}
            height={78}
            priority
            className="w-48 sm:w-60 lg:w-[270px] h-auto object-contain"
          />
        </div>

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

      <section className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-[440px]">
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-bricolage)] text-[32px] sm:text-[38px] font-bold tracking-tight leading-tight text-[#193B59]">
              Welcome <span className="text-[#356F9F]">Back!</span>
            </h1>

            <p className="mt-1.5 text-[15px] sm:text-[16px] text-[#5C768D] font-normal">
              Silakan masuk ke akun Tataloka Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-[14px] font-semibold text-[#193B59] mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full h-[46px] px-4 rounded-[8px] border border-[#CBD5E1] bg-white text-[14px] text-[#193B59] placeholder-[#94A1AD] transition-colors focus:outline-none focus:border-[#356F9F] focus:ring-2 focus:ring-[#356F9F]/20"
              />

              <p className="mt-1.5 text-[11.5px] text-[#7B8B9A]">
                Gunakan email yang telah terdaftar di Tataloka.
              </p>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[14px] font-semibold text-[#193B59] mb-2"
              >
                Password
              </label>

              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="w-full h-11.5 pl-4 pr-11 rounded-[8px] border border-transparent bg-[#F5F7FA] text-[14px] text-[#193B59] placeholder-[#94A1AD] transition-colors focus:outline-none focus:bg-white focus:border-[#356F9F] focus:ring-2 focus:ring-[#356F9F]/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                  className="absolute right-3.5 flex items-center justify-center p-1 text-[#5C768D] hover:text-[#193B59] transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.9} />
                  ) : (
                    <Eye size={18} strokeWidth={1.9} />
                  )}
                </button>
              </div>

              <div className="mt-2.5 flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-[12.5px] font-medium text-[#5C768D] hover:text-[#356F9F] transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[48px] rounded-full bg-gradient-to-r from-[#356F9F] to-[#193B59] hover:from-[#2D608A] hover:to-[#132E47] text-white text-[15px] font-semibold shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="mt-9 text-center">
            <p className="text-[15px] text-[#64748B]">
              Belum punya akun supplier?
            </p>

            <Link
              href="/register"
              className="mt-0.5 inline-block text-[15px] font-bold text-[#2B6291] hover:text-[#193B59] transition-colors"
            >
              Register as Supplier
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}