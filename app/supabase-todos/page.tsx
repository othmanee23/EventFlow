import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function SupabaseTodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: todos } = await supabase.from("todos").select();

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-slate-950">Supabase Todos</h1>
      <ul className="grid gap-2">
        {todos?.map((todo: { id: string | number; name: string }) => (
          <li className="rounded-md border border-border-soft bg-white px-3 py-2 text-slate-700" key={todo.id}>
            {todo.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
