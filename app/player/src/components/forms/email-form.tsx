import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/env";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

const emailSchema = z.object({
  email: z.email('Please enter a valid e-mail address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
  verifyCallback: (token: string) => void;
  handleVerifyError: () => void;
}

export function EmailForm({ onSubmit, isLoading, verifyCallback, handleVerifyError }: EmailFormProps) {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const handleSubmit = async (data: EmailFormData) => {
    await onSubmit(data.email);
  };

  return (<>
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...form.register('email')}
          className={form.formState.errors.email ? 'border-red-500' : ''}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending code…
          </>
        ) : (
          'Continue'
        )}
      </Button>
    </form>
    <Turnstile siteKey={env.VITE_TURNSTILE_SITE_KEY} onSuccess={verifyCallback} onError={handleVerifyError} className="flex justify-center pt-2" />
  </>
  );
}
