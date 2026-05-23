import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function SupabaseTodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  let todos: { id: string | number; name: string }[] | null = null;
  let requestError = "";

  try {
    const result = await supabase.from("todos").select();

    if (result.error) {
      requestError = result.error.message;
    } else {
      todos = (result.data as { id: string | number; name: string }[]) ?? [];
    }
  } catch (error) {
    requestError = error instanceof Error ? error.message : "Network error";
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-slate-950">Supabase Todos</h1>
      {requestError ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Supabase request failed: {requestError}
        </p>
      ) : null}
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
