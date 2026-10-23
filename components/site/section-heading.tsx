export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  number,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  number?: string;
}) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      <span className="eyebrow">
        {number ? <span className="section-number">{number}</span> : null}
        {eyebrow}
      </span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
