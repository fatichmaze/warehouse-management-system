
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Panel kiri */}
      <section className="relative w-full lg:w-1/2 min-h-65 lg:min-h-screen bg-linear-to-b from-[#F8FAFC] via-[#EFF4F9] to-[#E1ECF6] lg:border-r border-[#E2EAF2] flex flex-col justify-between overflow-hidden">
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

      {/* Panel kanan */}
      <section className="w-full lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-16">
        <div className="w-full max-w-[440px]">
          <div className="mb-7">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF4F9] text-[#356F9F]">
              <Mail size={23} strokeWidth={1.8} />
            </div>

            <h1 className="font-(family-name:--font-bricolage) text-[32px] sm:text-[38px] font-bold tracking-tight leading-tight text-[#193B59]">
              Forgot Password?
            </h1>

            <p className="mt-2 text-[15px] text-[#5C768D]">
              Jangan khawatir, kami siap membantu Anda.
            </p>
          </div>

          <div className="rounded-xl border border-[#DCE7F0] bg-[#F8FAFC] p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={19} className="text-[#356F9F]" />
              <h2 className="text-[15px] font-semibold text-[#193B59]">
                Bantuan Reset Password
              </h2>
            </div>

            <p className="text-[14px] leading-relaxed text-[#5C768D]">
              Untuk menjaga keamanan akun, proses reset password
              dilakukan melalui Administrator TATALOKA.
            </p>

            <p className="mt-3 text-[14px] leading-relaxed text-[#5C768D]">
              Silakan hubungi Admin dan informasikan alamat email
              yang terdaftar pada akun Anda agar dapat dibantu
              dalam proses pengaturan ulang password.
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/login"
              className="w-full h-[48px] flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#356F9F] to-[#193B59] hover:from-[#2D608A] hover:to-[#132E47] text-white text-[15px] font-semibold shadow-sm transition-all duration-200"
            >
              <ArrowLeft size={17} />
              Kembali ke Login
            </Link>
          </div>

          <p className="mt-7 text-center text-[12px] text-[#94A1AD]">
            TATALOKA — Kelola Gudang, Lebih Tertata
          </p>
        </div>
      </section>
    </main>
  );
}
