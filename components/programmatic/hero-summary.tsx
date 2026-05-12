type Props = {
  text: string;
  className?: string;
};

export function HeroSummary({ text, className = "" }: Props) {
  const paragraphs = splitSummary(text);

  return (
    <div className={`max-w-3xl space-y-4 text-lg leading-8 text-[#C8D2CE] md:text-xl md:leading-9 ${className}`}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}

function splitSummary(text: string) {
  const explicitParagraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (explicitParagraphs.length > 1) {
    return explicitParagraphs;
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length < 3) {
    return [text];
  }

  const splitAt = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, splitAt).join(" "), sentences.slice(splitAt).join(" ")];
}
