import { Show, SignInButton, UserButton } from "@clerk/nextjs";

export function AuthButton() {
  return (
    <>
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <button type="button" className="rounded-full border border-line px-4 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent">
            Sign in
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
