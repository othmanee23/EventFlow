import { initials } from "@/lib/utils";

type AvatarProps = {
  name: string;
};

export function Avatar({ name }: AvatarProps) {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-sky text-xs font-semibold text-brand-blue">
      {initials(name)}
    </span>
  );
}

