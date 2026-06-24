import { useEffect, useState } from "react";

interface AvatarImageProps {
  src?: string;
  name?: string;
  className?: string;
}

export default function AvatarImage({ src, name = "小葵", className = "" }: AvatarImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div className={`bg-[#eef1eb] text-[#8e9a86] flex items-center justify-center font-bold font-serif ${className}`}>
        {name.trim().slice(0, 1) || "葵"}
      </div>
    );
  }

  return <img src={src} alt={name} className={className} onError={() => setFailed(true)} />;
}
