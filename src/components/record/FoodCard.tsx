import { useEffect, useRef, useState } from "react";
import { Camera, Star, Trash2, Utensils, type LucideIcon } from "lucide-react";

function readImageAsDataUrl(file: File, onLoad: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onLoad(reader.result);
  };
  reader.readAsDataURL(file);
}

function Rating({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="transition-transform active:scale-125">
          <Star size={22} className={star <= value ? "fill-amber-400 text-amber-400" : "text-[#d9d2c6]"} />
        </button>
      ))}
    </div>
  );
}

export interface EntryCardProps {
  key?: string;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  iconColor: string;
  imageUrl: string;
  onImageChange: (value: string) => void;
  name: string;
  onNameChange: (value: string) => void;
  namePlaceholder: string;
  rating: number;
  onRatingChange: (value: number) => void;
  note: string;
  onNoteChange: (value: string) => void;
  notePlaceholder: string;
  onRemove?: () => void;
}

export default function FoodCard({
  title,
  subtitle,
  icon: Icon = Utensils,
  iconColor,
  imageUrl,
  onImageChange,
  name,
  onNameChange,
  namePlaceholder,
  rating,
  onRatingChange,
  note,
  onNoteChange,
  notePlaceholder,
  onRemove,
}: EntryCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <article className="relative rounded-[24px] bg-white border border-[#dfd6c5] p-5 shadow-[0_5px_14px_rgba(93,84,73,0.05)]">
      <div className="washi-tape-green -top-3 -right-1 h-6 w-[100px] opacity-45" />
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className={`text-[20px] font-bold font-serif tracking-wide flex items-center gap-2 ${iconColor}`}>
          <Icon size={22} strokeWidth={1.9} />
          {title} · {subtitle}
        </h3>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="w-9 h-9 rounded-full border border-[#eadfce] bg-[#fffdf8] text-[#c58d78] flex items-center justify-center shadow-sm active:scale-95"
            aria-label={`删除${title}`}
          >
            <Trash2 size={17} />
          </button>
        )}
      </div>
      <div className="flex gap-6 items-start max-[520px]:gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative w-[168px] h-[168px] rounded-lg bg-[#faf6ee] border border-[#dfd6c5] overflow-hidden flex-shrink-0 shadow-inner group max-[520px]:w-[112px] max-[520px]:h-[112px]"
        >
          {imageFailed ? (
            <span className="absolute inset-0 flex flex-col items-center justify-center bg-[#faf6ee] text-[#a0907d]">
              <Camera size={26} className="text-[#e3a387]" />
              <span className="mt-2 text-sm font-bold">{title}</span>
            </span>
          ) : (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" onError={() => setImageFailed(true)} />
          )}
          <span className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100">
            <Camera size={24} />
            <span className="mt-2 text-sm font-bold">上传照片</span>
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) readImageAsDataUrl(file, onImageChange);
            }}
          />
        </button>
        <div className="flex-1 pt-2 space-y-4 min-w-0">
          <input
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={namePlaceholder}
            className="w-full border-b border-[#dfd6c5] bg-transparent pb-2 text-[20px] font-bold text-[#5d5449] outline-none placeholder:text-[#b5aa9a] max-[520px]:text-base"
          />
          <Rating value={rating} onChange={onRatingChange} />
          <input
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={notePlaceholder}
            className="w-full bg-transparent text-[17px] text-[#a0907d] outline-none placeholder:text-[#b8ad9f] max-[520px]:text-sm"
          />
        </div>
      </div>
    </article>
  );
}
