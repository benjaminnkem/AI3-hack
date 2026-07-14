'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { verify } from '@/lib/api';
import { VerificationForm, VerificationFormValues } from '@/components/VerificationForm';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function VerifyPage() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: verify,
    onSuccess: (data) => {
      router.push(`/passport/${data.publicId}`);
    },
  });

  const handleSubmit = (values: VerificationFormValues) => {
    mutation.mutate({ inputType: values.inputType, input: values.input });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Verify a claim</h1>
        <p className="mt-2 text-muted">
          Submit text, a URL, or an image. Mesh will generate a verifiable Evidence Passport.
        </p>
      </div>

      {mutation.isPending ? (
        <LoadingScreen />
      ) : (
        <VerificationForm onSubmit={handleSubmit} loading={mutation.isPending} />
      )}

      {mutation.isError && (
        <div className="card border-danger/40 p-4 text-sm text-danger bg-danger/5">
          Verification failed. Check that the API and Gonka credentials are configured.
        </div>
      )}
    </div>
  );
}
