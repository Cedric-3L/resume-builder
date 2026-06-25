"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Smartphone,
  UserPlus,
} from "lucide-react";
import { Navbar } from "@/components/ui/Navbar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/supabase/client";

type AuthTab = "password" | "code" | "register";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn, refreshSession } = useAuthStore();
  const [redirectTo] = useState(() => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect") || "/dashboard";
  });
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<AuthTab>("password");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberLogin, setRememberLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      router.push(redirectTo);
    }
  }, [isLoggedIn, redirectTo, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const canSubmitPassword = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim()) && password.length >= 6;
  }, [identifier, password]);

  const canSubmitCode = useMemo(() => {
    return /^1\d{10}$/.test(phone) && code.trim().length === 6;
  }, [phone, code]);

  const canRegister = useMemo(() => {
    return (
      regName.trim().length > 0 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail.trim()) &&
      regPassword.length >= 8 &&
      regPassword === regConfirm
    );
  }, [regName, regEmail, regPassword, regConfirm]);

  function translateAuthError(message: string) {
    const map: Record<string, string> = {
      "Invalid login credentials": "邮箱或密码错误",
      "Email not confirmed": "邮箱未验证，请前往邮箱查看验证邮件",
      "Invalid phone number": "手机号格式不正确",
      "Invalid OTP": "验证码错误或已过期",
      "User already registered": "该邮箱已被注册，请直接登录",
      "Invalid email or password": "邮箱或密码错误",
    };
    return map[message] ?? message;
  }

  const handlePasswordLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    if (!canSubmitPassword) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier.trim(),
        password,
      });

      if (error) {
        setErrorMsg(translateAuthError(error.message));
        return;
      }

      if (data.user) {
        await refreshSession({ force: true });
        router.push(redirectTo);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async () => {
    setErrorMsg("");
    if (!/^1\d{10}$/.test(phone)) {
      setErrorMsg("请输入有效的 11 位手机号");
      return;
    }

    setCountdown(60);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setErrorMsg(translateAuthError(error.message));
      setCountdown(0);
    }
  };

  const handleCodeLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    if (!canSubmitCode) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: code,
        type: "sms",
      });

      if (error) {
        setErrorMsg(translateAuthError(error.message));
        return;
      }

      if (data.user) {
        await refreshSession({ force: true });
        router.push(redirectTo);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");
    if (!canRegister) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: { name: regName.trim() },
        },
      });

      if (error) {
        setErrorMsg(translateAuthError(error.message));
        return;
      }

      if (data.user) {
        if (data.user.identities?.length === 0) {
          setErrorMsg("该邮箱已被注册，请直接登录");
          return;
        }

        await refreshSession({ force: true });
        router.push(redirectTo);
        return;
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "注册失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-[#f8f4ed] text-[#171716]">
      <Navbar variant="auth" />

      <main className="grid h-[calc(100vh-66px)] min-h-[760px] w-full overflow-hidden lg:grid-cols-[54%_46%]">
          <section className="relative hidden overflow-hidden border-r border-[#bdb7ad] px-[60px] pb-0 pt-[78px] lg:flex lg:flex-col min-[1600px]:pt-[60px]">
            <div className="ml-12">
              <h1 className="font-editorial text-[56px] font-semibold leading-[1.22] tracking-[-.05em]">
                {activeTab === "register" ? <>从这一页，<br />开始被看见</> : activeTab === "code" ? <>不必记住密码，<br />只需记住目标</> : <>继续写下<br />你的下一步</>}
              </h1>
              <div className="editorial-rule mt-6" />
              <p className="mt-6 font-editorial text-[18px] tracking-[.07em] text-[#3f3b36]">
                {activeTab === "register" ? "建立账号，保存每一次认真修改" : activeTab === "code" ? "一个验证码，继续你的简历进度" : "专注打磨内容，让机会清晰可见"}
              </p>
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-[245px] min-[1600px]:top-[210px]">
              {/* The approved design uses this exact resume stack as a decorative login asset. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/template-assets/auth/login-resume-stack.png"
                alt=""
                aria-hidden="true"
                className="block h-auto w-full max-w-[800px] select-none"
              />
            </div>
          </section>

          <section className="flex items-start justify-center px-6 pb-12 pt-20 sm:px-12 lg:justify-start lg:px-[90px] lg:pt-[108px] min-[1600px]:pt-[68px]">
            <div className="w-full max-w-[448px]">
              <div className="mb-8 min-[1600px]:mb-2">
                <h1 className="font-editorial text-[42px] font-semibold tracking-[-.04em]">
                  {activeTab === "register" ? "创建账号" : "欢迎回来"}
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#77716a]">
                  {activeTab === "register"
                    ? "注册后即可在线编辑简历、导出 PDF 并管理多份版本。"
                    : "继续编辑你的简历内容，导出与管理都从这里开始。"}
                </p>
              </div>

              {activeTab !== "register" ? <div className="mb-8 flex border-b border-[#c7c1b8]">
                <button
                  type="button"
                  onClick={() => handleTabChange("password")}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-sm transition-all",
                    activeTab === "password"
                      ? "text-[#075be8] after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-[#075be8]"
                      : "text-[#77716a] hover:text-[#171716]"
                  )}
                >
                  <LockKeyhole className="h-4 w-4" />
                  密码登录
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("code")}
                  className={cn(
                    "relative flex flex-1 items-center justify-center gap-1.5 px-2 py-3 text-sm transition-all",
                    activeTab === "code"
                      ? "text-[#075be8] after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:bg-[#075be8]"
                      : "text-[#77716a] hover:text-[#171716]"
                  )}
                >
                  <MessageSquareText className="h-4 w-4" />
                  验证码登录
                </button>
              </div> : null}

              {errorMsg ? (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              ) : null}

              {activeTab === "register" ? (
                <form className="space-y-4" onSubmit={handleRegister}>
                  <button type="button" onClick={() => handleTabChange("password")} className="mb-1 text-sm text-[#075be8]">
                    ← 返回登录
                  </button>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">昵称</span>
                    <div className="editorial-input flex h-14 items-center gap-3 px-4">
                      <UserPlus className="h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="你的名字"
                        className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">邮箱</span>
                    <div className="editorial-input flex h-14 items-center gap-3 px-4">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="请输入邮箱地址"
                        className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">密码</span>
                    <div className="editorial-input flex h-14 items-center gap-3 px-4">
                      <LockKeyhole className="h-4 w-4 text-slate-400" />
                      <input
                        type={showRegPassword ? "text" : "password"}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="至少 8 位，含字母数字"
                        className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword((v) => !v)}
                        className="text-slate-400 transition hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">确认密码</span>
                    <div className="editorial-input flex h-14 items-center gap-3 px-4">
                      <LockKeyhole className="h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        placeholder="再次输入密码"
                        className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                    {regConfirm && regPassword !== regConfirm ? (
                      <p className="text-xs text-red-500">两次密码不一致</p>
                    ) : null}
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading || !canRegister}
                    className="editorial-button mt-2 inline-flex h-[58px] w-full items-center justify-center gap-2 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                    注册并进入工作台
                  </button>

                  <p className="text-center text-xs text-slate-400">
                    已有账号？
                    <button
                      type="button"
                      onClick={() => handleTabChange("password")}
                      className="ml-1 font-medium text-blue-600 hover:text-blue-700"
                    >
                      去登录
                    </button>
                  </p>
                </form>
              ) : activeTab === "password" ? (
                <form onSubmit={handlePasswordLogin}>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">邮箱</span>
                    <div className="editorial-input flex h-14 items-center gap-3 px-4">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="请输入邮箱地址"
                        className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                    {identifier.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim()) && (
                      <p className="text-xs text-amber-600">请输入正确的邮箱格式</p>
                    )}
                  </label>

                  <label className="mt-11 block space-y-2 min-[1600px]:mt-6">
                    <span className="text-sm font-medium text-slate-700">密码</span>
                    <div className="editorial-input flex h-14 items-center gap-3 px-4">
                      <LockKeyhole className="h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="请输入密码"
                        className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-slate-400 transition hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {password && password.length < 6 && (
                      <p className="text-xs text-amber-600">密码至少需要 6 位字符</p>
                    )}
                  </label>

                  <div className="mt-5 flex items-center justify-between text-sm">
                    <label className="flex cursor-pointer items-center gap-2 text-[#55514c]">
                      <input
                        type="checkbox"
                        checked={rememberLogin}
                        onChange={(event) => setRememberLogin(event.target.checked)}
                        className="h-4 w-4 accent-[#075be8]"
                      />
                      7 天内自动登录
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim())) {
                          setErrorMsg("请先输入正确的邮箱地址");
                          return;
                        }
                        setIsLoading(true);
                        setErrorMsg("");
                        const { error } = await supabase.auth.resetPasswordForEmail(identifier.trim(), {
                          redirectTo: `${window.location.origin}/login`,
                        });
                        if (error) {
                          setErrorMsg(translateAuthError(error.message));
                        } else {
                          setErrorMsg("重置密码邮件已发送，请查看邮箱");
                        }
                        setIsLoading(false);
                      }}
                      className="text-sm text-slate-400 transition-colors hover:text-blue-600"
                    >
                      忘记密码
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !canSubmitPassword}
                    className="editorial-button mt-12 inline-flex h-[58px] w-full items-center justify-center gap-2 px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-80 min-[1600px]:mt-10"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    登录并进入工作台
                  </button>

                  <p className="mt-5 text-xs text-[#55514c]">
                    还没有账号？
                    <button
                      type="button"
                      onClick={() => handleTabChange("register")}
                      className="ml-1 font-medium text-blue-600 hover:text-blue-700"
                    >
                      去注册
                    </button>
                  </p>
                  <div className="mt-16 border-t border-[#cbc5bb] pt-6 text-xs leading-6 text-[#77716a] min-[1600px]:mt-12">
                    演示账号：demo@geekcv.com　密码：123456
                  </div>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={handleCodeLogin}>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">手机号</span>
                    <div className="editorial-input flex items-center gap-3 px-4 py-3">
                      <Smartphone className="h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="请输入 11 位手机号"
                        className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">验证码</span>
                    <div className="flex gap-3">
                      <div className="editorial-input flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
                        <MessageSquareText className="h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="请输入验证码"
                          className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={countdown > 0}
                        onClick={handleSendCode}
                        className="shrink-0 border border-[#075be8] px-4 py-3 text-sm font-semibold text-[#075be8] transition hover:bg-[#075be8] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {countdown > 0 ? `${countdown}s` : "获取验证码"}
                      </button>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading || !canSubmitCode}
                    className="editorial-button inline-flex w-full items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-80"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    验证并登录
                  </button>
                </form>
              )}
            </div>
          </section>
      </main>

    </div>
  );
}
