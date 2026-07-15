'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, FileText, Image as ImageIcon, X, Upload, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FormInputType = 'text' | 'url' | 'image';

const schema = z
  .object({
    inputType: z.enum(['text', 'url', 'image']),
    input: z.string().min(1, 'Please enter a claim or select an image to verify.'),
  })
  .refine(
    (data) => {
      if (data.inputType === 'url') {
        return /^https?:\/\/\S+/.test(data.input);
      }
      if (data.inputType === 'text') {
        return data.input.trim().length >= 3 && data.input.trim().length <= 20000;
      }
      return true;
    },
    {
      message:
        'Invalid input. URLs must start with http/https, text must be between 3 and 20000 characters.',
      path: ['input'],
    },
  );

export type VerificationFormValues = z.infer<typeof schema>;

const TABS: { value: FormInputType; label: string; icon: typeof FileText }[] = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'url', label: 'URL', icon: Link },
  { value: 'image', label: 'Image', icon: ImageIcon },
];

export function VerificationForm({
  onSubmit,
  loading,
  className,
  defaultValues,
}: {
  onSubmit: (values: VerificationFormValues) => void;
  loading: boolean;
  className?: string;
  defaultValues?: Partial<VerificationFormValues>;
}) {
  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      inputType: defaultValues?.inputType ?? 'text',
      input: defaultValues?.input ?? '',
    },
  });

  const activeType = watch('inputType');
  const textValue = watch('input') || '';
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue('input', e.target.value);
    trigger('input');
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Only image files (PNG/JPEG/WebP) are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds the 5MB limit.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const base64 = e.target.result as string;
        setImagePreview(base64);
        setValue('input', base64);
        trigger('input');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('input', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const setTab = (type: FormInputType) => {
    setValue('inputType', type);
    setValue('input', '');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-card/70 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-6',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="mb-4 flex gap-1 rounded-2xl border border-white/5 bg-black/20 p-1">
        {TABS.map(({ value, label, icon: Icon }) => {
          const active = activeType === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                active ? 'text-background' : 'text-muted hover:text-white',
              )}
            >
              {active && (
                <motion.span
                  layoutId="verify-tab"
                  className="absolute inset-0 rounded-xl bg-accent shadow-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={15} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeType === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="relative"
          >
            <textarea
              value={textValue}
              onChange={handleTextChange}
              rows={5}
              placeholder="Paste a claim, paragraph, or text block to verify…"
              className="w-full resize-none rounded-2xl border border-border bg-surface/80 p-4 pb-8 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent/60 focus:ring-1 focus:ring-accent/20"
            />
            <div className="absolute bottom-3 right-3 text-xs text-muted">
              {textValue.length.toLocaleString()} / 20,000
            </div>
          </motion.div>
        )}

        {activeType === 'url' && (
          <motion.div
            key="url"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <input
              type="text"
              value={textValue}
              onChange={(e) => {
                setValue('input', e.target.value);
                trigger('input');
              }}
              placeholder="https://example.com/article-to-fact-check"
              className="w-full rounded-2xl border border-border bg-surface/80 p-4 text-sm outline-none transition placeholder:text-muted/60 focus:border-accent/60 focus:ring-1 focus:ring-accent/20"
            />
          </motion.div>
        )}

        {activeType === 'image' && (
          <motion.div
            key="image"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            {!imagePreview ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface/50 px-4 py-12 text-center transition hover:border-accent/40',
                  dragActive && 'border-accent bg-accent/5',
                )}
              >
                <Upload size={32} className="mb-3 text-muted" />
                <p className="mb-1 text-sm font-medium">Drag & drop a screenshot or image</p>
                <p className="text-xs text-muted">PNG, JPEG, WebP up to 5MB</p>
              </div>
            ) : (
              <div className="relative flex flex-col items-center rounded-2xl border border-border bg-surface/50 p-4">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="mb-3 max-h-60 rounded-lg object-contain"
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-accent"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="flex items-center gap-1 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/5"
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {errors.input && <p className="mt-2 text-sm text-danger">{errors.input.message}</p>}

      <button
        type="submit"
        disabled={loading || !textValue}
        className="group mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-background shadow-glow transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Verifying…' : 'Verify claim'}
        {!loading && (
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        )}
      </button>
    </form>
  );
}
