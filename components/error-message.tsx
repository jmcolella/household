interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-md bg-destructive/10 border border-destructive p-4">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
