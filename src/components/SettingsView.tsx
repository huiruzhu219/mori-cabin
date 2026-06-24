import { useState } from "react";
import { ArrowLeft, Camera, Check, Palette, User } from "lucide-react";
import { UserProfile } from "../types";

interface SettingsViewProps {
  userProfile: UserProfile;
  onChangeProfile: (updatedProfile: UserProfile) => void;
  activeTheme: string;
  onChangeTheme: (themeName: string) => void;
  onBack: () => void;
}

const THEME_OPTIONS = [
  { id: "theme-mori", name: "森野暮绿", colors: ["#8e9a86", "#e3a387"], desc: "柔和、自然、手账感" },
  { id: "theme-amber", name: "落木金秋", colors: ["#b25e38", "#cca45a"], desc: "暖色、复古、治愈" },
  { id: "theme-twilight", name: "暮山淡紫", colors: ["#8c7355", "#a37ea8"], desc: "安静、晚霞、轻梦感" },
  { id: "theme-matcha", name: "半岛抹茶", colors: ["#6c755e", "#a67258"], desc: "清淡、茶香、慢生活" },
  { id: "theme-sunset", name: "夕照落日", colors: ["#cc6d52", "#e8a556"], desc: "明亮、松弛、好心情" },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=200&auto=format&fit=crop",
];

export default function SettingsView({ userProfile, onChangeProfile, activeTheme, onChangeTheme, onBack }: SettingsViewProps) {
  const [name, setName] = useState(userProfile.name);
  const [bio, setBio] = useState(userProfile.bio || "");
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [message, setMessage] = useState("");

  const saveProfile = () => {
    const updated = { ...userProfile, name: name.trim() || "小葵", bio: bio.trim(), avatar };
    onChangeProfile(updated);
    setMessage("资料已保存");
    window.setTimeout(() => setMessage(""), 1800);
  };

  return (
    <div className="space-y-6 pb-6">
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-white border border-[#dfd6c5] flex items-center justify-center text-[#8e9a86]">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-base font-bold font-serif">小屋设置</h1>
        <span className="w-9" />
      </header>

      {message && <div className="rounded-full bg-[#8e9a86] px-4 py-2 text-center text-xs font-bold text-white">{message}</div>}

      <section className="rounded-3xl bg-white border border-[#dfd6c5] p-5 shadow-sm">
        <h2 className="text-xs font-bold text-[#8e9a86] flex items-center gap-1.5 mb-4"><User size={14} />个人资料</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[#dfd6c5]" />
            <span className="absolute -right-1 bottom-0 rounded-full bg-[#e3a387] p-1 text-white"><Camera size={11} /></span>
          </div>
          <div className="flex-1 space-y-2">
            <input value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-[#dfd6c5] bg-[#fdfbf7] px-3 py-2 text-sm outline-none focus:border-[#8e9a86]" />
            <input value={bio} onChange={(event) => setBio(event.target.value)} className="w-full rounded-xl border border-[#dfd6c5] bg-[#fdfbf7] px-3 py-2 text-xs outline-none focus:border-[#8e9a86]" placeholder="一句温柔签名" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {AVATARS.map((item) => (
            <button key={item} onClick={() => setAvatar(item)} className={`w-10 h-10 rounded-full overflow-hidden border-2 ${avatar === item ? "border-[#e3a387]" : "border-transparent"}`}>
              <img src={item} alt="avatar option" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
        <button onClick={saveProfile} className="mt-4 w-full rounded-full bg-[#8e9a86] py-3 text-sm font-bold text-white flex items-center justify-center gap-2">
          <Check size={15} />
          保存资料
        </button>
      </section>

      <section className="rounded-3xl bg-white border border-[#dfd6c5] p-5 shadow-sm">
        <h2 className="text-xs font-bold text-[#8e9a86] flex items-center gap-1.5 mb-4"><Palette size={14} />主题配色</h2>
        <div className="space-y-2">
          {THEME_OPTIONS.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onChangeTheme(theme.id)}
              className={`w-full rounded-2xl border p-3 text-left flex items-center justify-between ${activeTheme === theme.id ? "border-[#8e9a86] bg-[#faf8f4]" : "border-[#dfd6c5] bg-white"}`}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  {theme.colors.map((color) => (
                    <span key={color} className="w-5 h-5 rounded-full border border-white" style={{ backgroundColor: color }} />
                  ))}
                </div>
                <div>
                  <p className="text-xs font-bold">{theme.name}</p>
                  <p className="text-[10px] text-[#a0907d]">{theme.desc}</p>
                </div>
              </div>
              {activeTheme === theme.id && <Check size={15} className="text-[#8e9a86]" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
