'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Link, FileText, Image as ImageIcon, X, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';

type FormInputType = 'text' | 'url' | 'image';

const schema = z.object({
  inputType: z.enum(['text', 'url', 'image']),
  input: z.string().min(1, 'Please enter a claim or select an image to verify.'),
}).refine((data) => {
  if (data.inputType === 'url') {
    return /^https?:\/\/\S+/.test(data.input);
  }
  if (data.inputType === 'text') {
    return data.input.trim().length >= 3 && data.input.trim().length <= 20000;
  }
  return true;
}, {
  message: 'Invalid input. URLs must start with http/https, text must be between 3 and 20000 characters.',
  path: ['input'],
});

export type VerificationFormValues = z.infer<typeof schema>;

const TABS: { value: FormInputType; label: string; icon: any }[] = [
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'url', label: 'URL', icon: Link },
  { value: 'image', label: 'Image', icon: ImageIcon },
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
    trigger,
  } = useForm<VerificationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { inputType: 'text', input: '' },
  });

  const activeType = watch('inputType');
  const textValue = watch('input') || '';
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
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
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
      <div className="mb-4 flex gap-2">
        {TABS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
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

      {activeType === 'text' && (
        <div className="relative">
          <textarea
            value={textValue}
            onChange={handleTextChange}
            rows={5}
            placeholder="Paste a claim, paragraph, or text block to verify…"
            className="w-full resize-none rounded-xl border border-border bg-surface p-4 pb-8 text-sm outline-none transition focus:border-accent"
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted">
            {textValue.length} / 20,000 characters
          </div>
        </div>
      )}

      {activeType === 'url' && (
        <input
          type="text"
          value={textValue}
          onChange={(e) => {
            setValue('input', e.target.value);
            trigger('input');
          }}
          placeholder="https://example.com/article-to-fact-check"
          className="w-full rounded-xl border border-border bg-surface p-4 text-sm outline-none transition focus:border-accent"
        />
      )}

      {activeType === 'image' && (
        <div>
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
                'flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface py-12 px-4 text-center cursor-pointer transition hover:border-accent/40',
                dragActive && 'border-accent bg-accent/5'
              )}
            >
              <Upload size={32} className="text-muted mb-3" />
              <p className="text-sm font-medium mb-1">Drag & drop your screenshot or image here</p>
              <p className="text-xs text-muted">Supports PNG, JPEG, WebP up to 5MB</p>
            </div>
          ) : (
            <div className="relative rounded-xl border border-border bg-surface p-4 flex flex-col items-center">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="max-h-60 rounded-lg object-contain mb-3"
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
                  className="flex items-center gap-1 rounded-lg border border-danger/30 text-danger px-3 py-1.5 text-xs font-medium transition hover:bg-danger/5"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {errors.input && <p className="mt-2 text-sm text-danger">{errors.input.message}</p>}

      <button
        type="submit"
        disabled={loading || !textValue}
        className="mt-4 w-full rounded-xl bg-accent py-3 font-semibold text-background shadow-glow transition hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Verifying…' : 'Verify claim'}
      </button>
    </form>
  );
}
