'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type FormInputType = 'url' | 'text' | 'tweet';

const schema = z.object({
  inputType: z.enum(['url', 'text', 'tweet']),
  input: z.string().min(3, 'Please enter something to verify.').max(20000),
});

export type VerificationFormValues = z.infer<typeof schema>;

const TABS: { value: FormInputType; label: string; icon: typeof Link }[] = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'url', label: 'URL', icon: Link },
  { value: 'tweet', label: 'Tweet', icon: Sparkles },
];

export function VerificationForm({
  onSubmit,
  loading,
}: {
  onSubmit: (values: VerificationFormValues) => void;
  loading: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { inputType: 'text', input: '' },
  });

  const activeType = watch('inputType');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
      <div className="mb-4 flex gap-2">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setValue('inputType', value)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition',
              activeType === value
                ? 'bg-accent text-background'
                : 'bg-surface text-muted hover:text-white',
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <textarea
        {...register('input')}
        rows={5}
        placeholder={
          activeType === 'url'
            ? 'https://example.com/article-to-fact-check'
            : 'Paste a claim, tweet, or paragraph to verify…'
        }
        className="w-full resize-none rounded-xl border border-border bg-surface p-4 text-sm outline-none transition focus:border-accent"
      />
      {errors.input && <p className="mt-2 text-sm text-danger">{errors.input.message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-accent py-3 font-semibold text-background shadow-glow transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Verifying…' : 'Verify claim'}
      </button>
    </form>
  );
}
