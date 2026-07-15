'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { verify } from '@/lib/api';
import { VerificationFormValues } from '@/components/VerificationForm';

export function useVerification() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: verify,
    onSuccess: (data) => {
      router.push(`/passport/${data.publicId}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const isVerifying = isSubmitting || mutation.isPending;

  useEffect(() => {
    if (!isVerifying) return;
    const id = window.setTimeout(() => {
      document.getElementById('verification-loading')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
    return () => window.clearTimeout(id);
  }, [isVerifying]);

  const submit = (values: VerificationFormValues) => {
    setIsSubmitting(true);
    mutation.reset();
    mutation.mutate({
      inputType: values.inputType,
      input: values.input,
    });
  };

  return {
    submit,
    isVerifying,
    isError: mutation.isError,
    error: mutation.error,
  };
}
