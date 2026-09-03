"use client";

export function AutoSubmitSelect({
  action,
  name,
  defaultValue,
  children,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  name: string;
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <form action={action}>
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className={className}
      >
        {children}
      </select>
    </form>
  );
}
