"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Github,
  Chrome,
  AlertCircle,
} from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setError("");
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch {
      setError("Đăng nhập bằng " + (provider === "google" ? "Google" : "GitHub") + " thất bại");
      setOauthLoading(null);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isLogin) {
        // === LOGIN ===
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          if (result.code === "credentials") {
            setError("Email hoặc mật khẩu không chính xác");
          } else {
            setError("Tài khoản chưa tồn tại. Vui lòng đăng ký!");
          }

          setIsLoading(false);
          return;
        }

        router.push("/");
        router.refresh();
      } else {
        // === REGISTER ===
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
          setError("Mật khẩu xác nhận không khớp");
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Mật khẩu phải có ít nhất 6 ký tự");
          setIsLoading(false);
          return;
        }

        // Register
        const registerRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const registerData = await registerRes.json();

        if (!registerRes.ok) {
          setError(registerData.error || "Đăng ký thất bại");
          setIsLoading(false);
          return;
        }

        // Auto login after register
        const loginResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (loginResult?.error) {
          setError(
            "Đăng ký thành công nhưng đăng nhập thất bại. Vui lòng đăng nhập lại.",
          );
          setIsLogin(true);
          setIsLoading(false);
          return;
        }

        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Đã xảy ra lỗi kết nối, vui lòng thử lại");
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-primary/20 blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/20 blur-[120px] animate-pulse [animation-delay:2s]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[80px] animate-pulse [animation-delay:4s]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, var(--foreground) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 flex w-full max-w-[1000px] mx-4 rounded-3xl border border-border/50 bg-card/80 shadow-2xl shadow-primary/5 backdrop-blur-xl overflow-hidden">
        {/* Left panel — branding */}
        <div className="relative hidden w-[420px] shrink-0 flex-col justify-between overflow-hidden bg-primary p-10 lg:flex">
          {/* Pattern decoration */}
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/20" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full border-[30px] border-white/15" />
            <div className="absolute right-10 bottom-1/3 h-32 w-32 rounded-full border-[20px] border-white/10" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <Image
                src="/Logo.png"
                alt="Daniel Social"
                width={48}
                height={48}
                className="rounded-xl brightness-200"
              />
              <span
                className="text-2xl font-bold text-primary-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Daniel Social
              </span>
            </div>
            <p className="mt-6 text-lg leading-relaxed text-primary-foreground/80">
              Kết nối, chia sẻ và khám phá cùng cộng đồng. Nơi mọi khoảnh khắc
              đều đáng nhớ.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            {/* Feature highlights */}
            {[
              { emoji: "💬", text: "Nhắn tin real-time với bạn bè" },
              { emoji: "📸", text: "Chia sẻ khoảnh khắc bằng ảnh & stories" },
              { emoji: "🔔", text: "Nhận thông báo tức thì" },
              { emoji: "🔥", text: "Khám phá xu hướng mới nhất" },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg backdrop-blur-sm">
                  {feature.emoji}
                </span>
                <span className="text-sm font-medium text-primary-foreground/90">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <p className="relative z-10 text-xs text-primary-foreground/50">
            © 2026 Daniel Social. All rights reserved.
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-1 flex-col justify-center px-8 py-10 sm:px-12 lg:px-14">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <Image
              src="/Logo.png"
              alt="Daniel Social"
              width={40}
              height={40}
              className="rounded-xl brightness-150"
            />
            <span
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Daniel Social
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-2xl font-bold text-foreground sm:text-3xl"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {isLogin ? "Chào mừng trở lại" : "Tạo tài khoản"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin
                ? "Đăng nhập để tiếp tục trải nghiệm"
                : "Đăng ký ngay để khám phá cộng đồng"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2 rounded-xl border-border py-5 transition-all hover:border-emerald-500/40 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
              type="button"
              onClick={() => handleOAuthSignIn("google")}
              disabled={oauthLoading !== null || isLoading}
            >
              {oauthLoading === "google" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
              ) : (
                <Chrome className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">Google</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 rounded-xl border-border py-5 transition-all hover:border-blue-500/40 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
              type="button"
              onClick={() => handleOAuthSignIn("github")}
              disabled={oauthLoading !== null || isLoading}
            >
              {oauthLoading === "github" ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
              ) : (
                <Github className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">GitHub</span>
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center">
            <Separator className="flex-1" />
            <span className="px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              hoặc
            </span>
            <Separator className="flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field — register only */}
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isLogin
                  ? "grid-rows-[0fr] opacity-0"
                  : "grid-rows-[1fr] opacity-100",
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-2 pb-4">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    Họ và tên
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Nguyễn Văn A"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      className="rounded-xl border-border bg-secondary/50 py-5 pl-10 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background"
                      tabIndex={isLogin ? -1 : 0}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="rounded-xl border-border bg-secondary/50 py-5 pl-10 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  Mật khẩu
                </Label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  className="rounded-xl border-border bg-secondary/50 py-5 pl-10 pr-10 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password — register only */}
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isLogin
                  ? "grid-rows-[0fr] opacity-0"
                  : "grid-rows-[1fr] opacity-100",
              )}
            >
              <div className="overflow-hidden">
                <div className="space-y-2 pb-1">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-foreground"
                  >
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        updateField("confirmPassword", e.target.value)
                      }
                      className="rounded-xl border-border bg-secondary/50 py-5 pl-10 pr-10 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background"
                      tabIndex={isLogin ? -1 : 0}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      tabIndex={isLogin ? -1 : 0}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2 rounded-xl py-5 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <>
                  {isLogin ? "Đăng nhập" : "Đăng ký"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle between login/register */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
                setShowPassword(false);
                setShowConfirmPassword(false);
                setError("");
              }}
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </p>

          {/* Terms */}
          {!isLogin && (
            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground/70">
              Bằng cách đăng ký, bạn đồng ý với{" "}
              <span className="text-primary cursor-pointer hover:underline">
                Điều khoản dịch vụ
              </span>{" "}
              và{" "}
              <span className="text-primary cursor-pointer hover:underline">
                Chính sách bảo mật
              </span>{" "}
              của chúng tôi.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
