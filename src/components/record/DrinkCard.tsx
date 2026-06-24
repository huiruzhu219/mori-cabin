import { Coffee } from "lucide-react";
import FoodCard, { EntryCardProps } from "./FoodCard";

export default function DrinkCard(props: Omit<EntryCardProps, "icon">) {
  return <FoodCard {...props} icon={Coffee} />;
}
