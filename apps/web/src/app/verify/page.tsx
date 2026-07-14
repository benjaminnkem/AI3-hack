'use client';

import { useMutation } from '@tanstack/react-query';
import { verify } from '@/lib/api';
import { VerificationForm, VerificationFormValues } from '@/components/VerificationForm';
import { LoadingScreen } from '@/components/LoadingScreen';
import { PassportView } from '@/components/PassportView';

export default function VerifyPage() {
  const mutation = useMutation({ mutationFn: verify });

  const handleSubmit = (values: VerificationFormValues) => {
    mutation.mutate({ inputType: values.inputType, input: values.input });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Verify a claim</h1>
        <p className="mt-2 text-muted">
          Paste text, a URL, or a tweet. Mesh returns a full Evidence Passport.
        </p>
      </div>

      <VerificationForm onSubmit={handleSubmit} loading={mutation.isPending} />

      {mutation.isPending && <LoadingScreen />}

      {mutation.isError && (
        <div className="card border-danger/40 p-4 text-sm text-danger">
          Verification failed. Check that the API and Gonka credentials are configured.
        </div>
      )}

      {mutation.data && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Evidence Passport</h2>
            <a
              href={`/passport/${mutation.data.publicId}`}
              className="text-sm text-accent hover:underline"
            >
              Public link →
            </a>
          </div>
          <PassportView passport={mutation.data} />
        </div>
      )}
    </div>
  );
}
