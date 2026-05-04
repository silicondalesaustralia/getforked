export default function PrivacyPolicyPage() {
  return (
    <div className="container py-14">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <div className="mt-6 max-w-3xl space-y-4 text-zinc-300">
        <p>
          We collect contact and business information you submit through our forms so we can respond to
          enquiries, assess fit, and provide service proposals.
        </p>
        <p>
          We do not sell your personal information. Data is stored in infrastructure we control and only
          accessed by authorised team members and approved processors needed to operate the service.
        </p>
        <p>
          You can request access, correction, or deletion of your data by contacting
          {" "}
          <a href="mailto:hello@getforked.dev" className="text-accent underline">
            hello@getforked.dev
          </a>
          .
        </p>
        <p>
          This policy may be updated as our systems evolve. Material updates will be reflected on this page.
        </p>
      </div>
    </div>
  );
}
