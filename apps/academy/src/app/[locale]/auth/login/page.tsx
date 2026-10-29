import { enabledSocialProviders } from "@/lib/social-auth";
import LoginForm from "./LoginForm";

// 소셜 로그인 버튼은 키(env)가 있는 제공자만 — 서버에서 판단해 내려준다
export default function LoginPage() {
  return <LoginForm social={enabledSocialProviders()} />;
}
