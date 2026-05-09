import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types/comment";

type CommentsSectionProps = {
  comments: Comment[];
};

export function CommentsSection({ comments }: CommentsSectionProps) {
  return (
    <section className="grid gap-4">
      {comments.map((comment) => (
        <article className="flex gap-3" key={comment.id}>
          <Avatar name={comment.author.name} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-slate-950">{comment.author.name}</p>
              <time className="text-xs text-slate-500">{formatDate(comment.createdAt)}</time>
            </div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{comment.body}</p>
          </div>
        </article>
      ))}
    </section>
  );
}

