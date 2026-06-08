import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { profileApi } from '@/lib/api/endpoints';
import { queryClient, queryKeys } from '@/lib/queryClient';
import { HttpError } from '@/lib/api/client';
import { useAuth } from '@/features/auth/AuthContext';
import { profileSchema, type ProfileValues } from '@/features/auth/schemas';
import { Avatar, Button, Card, Skeleton, TextField } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { ErrorState } from '@/components/feedback/ErrorState';
import { FormAlert } from '@/features/auth/FormAlert';
import type { User } from '@/types';

export default function ProfilePage() {
  const { setUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: profileApi.get,
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', email: '', phone: '', address: '' },
  });

  useEffect(() => {
    if (data) {
      reset({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
      setAvatarPreview(data.avatarUrl);
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileValues) =>
      profileApi.update({ ...values, avatarUrl: avatarPreview }),
    onSuccess: (updated: User) => {
      queryClient.setQueryData(queryKeys.profile, updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
      setUser(updated);
      reset({
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        address: updated.address,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      if (err instanceof HttpError) {
        if (err.fields) {
          for (const [field, message] of Object.entries(err.fields)) {
            setError(field as keyof ProfileValues, { message });
          }
        }
        setFormError(err.message);
      } else {
        setFormError('Something went wrong while saving. Please try again.');
      }
    },
  });

  function onSubmit(values: ProfileValues) {
    setFormError(null);
    setSaved(false);
    mutation.mutate(values);
  }

  function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setAvatarPreview(typeof reader.result === 'string' ? reader.result : null);
    reader.readAsDataURL(file);
  }

  return (
    <>
      <PageHeader
        topTitle="Account"
        title="Profile"
        description="Manage your personal details and how we reach you."
      />

      {isError ? (
        <Card>
          <ErrorState message="We couldn't load your profile." onRetry={() => void refetch()} />
        </Card>
      ) : (
        <div className="grid grid-cols-[300px_1fr] gap-6 items-start max-[820px]:grid-cols-1">
          {/* Avatar card */}
          <Card as="section" className="flex flex-col items-center text-center gap-3" aria-label="Profile photo">
            {isLoading ? (
              <Skeleton width={96} height={96} radius="50%" />
            ) : (
              <Avatar name={data?.fullName ?? ''} src={avatarPreview} size={96} />
            )}
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-text m-0">
                {isLoading ? <Skeleton width={140} /> : data?.fullName}
              </p>
              <p className="text-sm text-text-muted m-0 break-words">
                {isLoading ? <Skeleton width={180} /> : data?.email}
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onPickAvatar}
              aria-label="Choose a profile photo"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              Change photo
            </Button>
          </Card>

          {/* Details form */}
          <Card as="section" aria-label="Edit details">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} height={44} />
                ))}
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                {formError && <FormAlert message={formError} />}
                {saved && (
                  <p className="m-0 text-sm font-medium text-positive-text" role="status">
                    ✓ Your profile has been updated.
                  </p>
                )}

                <TextField
                  label="Full name"
                  autoComplete="name"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <TextField
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <TextField
                  label="Phone number"
                  type="tel"
                  autoComplete="tel"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <TextField
                  label="Address"
                  autoComplete="street-address"
                  error={errors.address?.message}
                  {...register('address')}
                />

                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    loading={mutation.isPending}
                    disabled={!isDirty && avatarPreview === data?.avatarUrl}
                  >
                    Save changes
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
