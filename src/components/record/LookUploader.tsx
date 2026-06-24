import { Shirt } from "lucide-react";
import FoodCard, { EntryCardProps } from "./FoodCard";

export default function LookUploader(props: Omit<EntryCardProps, "icon">) {
  return <FoodCard {...props} icon={Shirt} />;
}
