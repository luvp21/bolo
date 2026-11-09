import { SessionLab } from "./SessionLab";

// Phase 1 gate: a full practice session on one passage.
// Add ?demo=read or ?demo=free to preview the results screen with sample data.
export default async function SessionLabPage(props: PageProps<"/lab/session">) {
  const { demo } = await props.searchParams;
  const mode = demo === "read" || demo === "free" ? demo : undefined;
  return <SessionLab demo={mode} />;
}
