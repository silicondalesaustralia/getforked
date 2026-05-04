const limits = [
  "TikTok: target 15 posts/day (audit required)",
  "YouTube: target 6 uploads/day (quota aware)",
  "Instagram Reels: target 10-15/day",
  "Facebook: target 10-25/day",
  "X/Twitter: target 16/day",
];

export default function AdminAccountsPage() {
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Connected Accounts</h2>
      <p className="text-zinc-300">Manage OAuth state and platform publishing limits.</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-300">
        {limits.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
