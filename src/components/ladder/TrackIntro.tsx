interface TrackIntroProps {
  title: string;
  children: React.ReactNode;
}

/** Heading block at the top of each track's list page. */
export function TrackIntro({ title, children }: TrackIntroProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl">{title}</h1>
      <p className="text-lg leading-relaxed text-ink-2">{children}</p>
    </div>
  );
}

export const LIST_PAGE = "mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 pt-10 pb-20 sm:px-8 sm:pt-16";
