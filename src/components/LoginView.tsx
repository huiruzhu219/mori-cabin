import { useState } from "react";
import { Flower, Lock, Phone, Sparkles } from "lucide-react";
import { MOCK_USER } from "../mockData";
import { UserProfile } from "../types";

interface LoginViewProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

const AVATARS = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
];

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [name, setName] = useState(MOCK_USER.name);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState(MOCK_USER.avatar);

  const login = () => {
    onLoginSuccess({
      name: name.trim() || "小葵",
      avatar,
      phoneNumber,
      bio: "今天也很好，慢慢记录生活。",
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center px-6 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-10 text-[#5d5449] bg-[#fcf9f2]">
      <div className="text-center mb-9">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#8e9a86]/12 border border-[#dfd6c5] flex items-center justify-center mb-4">
          <Flower size={34} className="text-[#8e9a86]" />
        </div>
        <h1 className="text-2xl font-bold font-serif">今天也很好</h1>
        <p className="text-xs text-[#a0907d] mt-2">给生活碎片一个温柔的小屋</p>
      </div>

      <section className="bg-white rounded-3xl p-5 border border-[#dfd6c5] shadow-sm space-y-4">
        <label className="block">
          <span className="text-xs font-bold text-[#8e9a86]">昵称</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-[#dfd6c5] bg-[#fdfbf7] px-4 py-3 text-sm outline-none focus:border-[#8e9a86]"
            placeholder="给自己取个可爱的名字"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold text-[#8e9a86]">手机号</span>
          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-[#dfd6c5] bg-[#fdfbf7] px-4 py-3">
            <Phone size={16} className="text-[#a0907d]" />
            <input
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              placeholder="用于本地模拟登录"
            />
          </div>
        </label>

        <div>
          <span className="text-xs font-bold text-[#8e9a86]">头像</span>
          <div className="mt-2 flex gap-3">
            {AVATARS.map((item) => (
              <button
                key={item}
                onClick={() => setAvatar(item)}
                className={`w-12 h-12 rounded-full overflow-hidden border-2 ${avatar === item ? "border-[#e3a387]" : "border-[#dfd6c5]"}`}
              >
                <img src={item} alt="avatar" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={login}
          className="w-full rounded-full bg-[#8e9a86] py-3 text-sm font-bold text-white shadow-[0_4px_12px_rgba(142,154,134,0.25)]"
        >
          进入生活小屋
        </button>

        <button
          onClick={() => onLoginSuccess({ ...MOCK_USER, isWeChatUser: true })}
          className="w-full rounded-full border border-[#dfd6c5] bg-[#fcf9f2] py-3 text-sm font-bold text-[#7a6b4c] flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          使用示例账号
        </button>
      </section>

      <p className="mt-5 flex items-center justify-center gap-1 text-[10px] text-[#a0907d]">
        <Lock size={12} />
        当前版本仅做本地原型验证，数据保存在浏览器本地。
      </p>
    </div>
  );
}
