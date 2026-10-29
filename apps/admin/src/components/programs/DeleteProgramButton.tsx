"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteProgram } from "@/lib/actions/programs";
import { Button } from "@/components/ui";
import { useAction } from "@/components/ui/feedback";

export function DeleteProgramButton({ id, title, locale }: { id: string; title: string; locale: string }) {
  const router = useRouter();
  const { run, isPending } = useAction();
  return (
    <Button
      variant="danger"
      disabled={isPending}
      onClick={() =>
        run(() => deleteProgram(id), {
          refresh: false,
          confirm: {
            title: `'${title}'을(를) 삭제할까요?`,
            body: "커리큘럼·퀴즈가 함께 삭제되며 되돌릴 수 없습니다.",
            confirmLabel: "삭제",
            danger: true,
          },
          onSuccess: () => router.push(`/${locale}/programs`),
        })
      }
    >
      <Trash2 className="h-3.5 w-3.5" aria-hidden />
      삭제
    </Button>
  );
}
