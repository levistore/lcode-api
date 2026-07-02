import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors mb-8 font-sans"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8">
          <span className="text-lg font-extrabold text-text-primary tracking-tight font-display">
            Lcode <span className="text-accent font-display">API</span>
          </span>
        </Link>

        {/* Card */}
        <div className="premium-glass rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-text-primary font-display">{title}</h1>
            <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
          </div>
          {children}
        </div>

        {footer && <div className="mt-6 text-center">{footer}</div>}
      </motion.div>
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, type, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          type={isPassword && showPassword ? "text" : type}
          className={`w-full bg-bg-tertiary border ${
            error ? "border-error" : "border-white/[0.08]"
          } rounded-xl py-2.5 ${icon ? "pl-10" : "pl-4"} ${
            isPassword ? "pr-10" : "pr-4"
          } text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}

interface SubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export function SubmitButton({ children, loading, disabled }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 px-5 py-3 premium-btn disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] mt-6"
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
