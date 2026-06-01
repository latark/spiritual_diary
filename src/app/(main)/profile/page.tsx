import { signOutAction } from '@/features/auth';

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 pt-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-ink text-3xl">Я</h1>
        <p className="text-ink-muted">Твой профиль и проводник.</p>
      </div>

      <form action={signOutAction}>
        <button
          type="submit"
          className="bg-surface-raised text-ink-muted hover:text-ink rounded-lg px-4 py-2.5 text-sm transition-colors duration-300"
        >
          Выйти
        </button>
      </form>
    </div>
  );
}
