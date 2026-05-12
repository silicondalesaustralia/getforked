export function SiteSearchBar() {
  return (
    <section className="border-b border-border/60 bg-background/80 py-4">
      <div className="container">
        <form action="/search/" className="mx-auto max-w-4xl">
          <label className="sr-only" htmlFor="sitewide-search-input">
            Search for a customisation or automation you need
          </label>
          <input
            id="sitewide-search-input"
            name="q"
            placeholder="Search for a customisation or automation you need"
            className="h-14 w-full rounded-[12px] border border-[#2a3639] bg-[#050708] px-5 text-base text-zinc-100 placeholder:text-zinc-500"
          />
        </form>
      </div>
    </section>
  );
}
