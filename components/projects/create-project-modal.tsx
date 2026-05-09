import { Modal } from "@/components/ui/modal";

type CreateProjectModalProps = {
  open: boolean;
};

export function CreateProjectModal({ open }: CreateProjectModalProps) {
  return (
    <Modal open={open} title="Create project">
      <p className="text-sm text-slate-600">Project creation will be implemented in a focused feature branch.</p>
    </Modal>
  );
}

