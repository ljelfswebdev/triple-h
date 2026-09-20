import SiteImage from "@/components/ui/SiteImage";
import Reveal, { StaggerReveal } from "@/components/ui/Reveal";
import { headingMarkup, hasRichText, mediaUrl } from "@/lib/content";
import { ContentLink, RichCopy } from "./Content";

export default function SplitIntro({ content = {}, titleId = "split-intro-title" }) {
  const hasImage = Boolean(mediaUrl(content.image));
  const hasCopy = Boolean(hasRichText(content.title) || hasRichText(content.text) || content.items?.length || content.link?.url);
  if (!hasImage && !hasCopy) return null;
  return (
    <section className="py-[var(--section-padding-medium)]" aria-labelledby={hasRichText(content.title) ? titleId : undefined}>
      <div className="container">
        <div className={`grid items-center gap-[30px] max-[800px]:grid-cols-1 ${hasImage && hasCopy ? "grid-cols-2" : "grid-cols-1"}`.trim()}>
          {hasImage ? <Reveal className={`w-full max-[800px]:max-w-[560px] max-[800px]:justify-self-center ${!hasCopy ? "max-w-[760px] justify-self-center" : ""}`.trim()} duration={650} from="fade"><SiteImage className="h-auto max-h-[520px] w-full rounded-[var(--radius-large)] object-cover" src={content.image} width={654} height={520} objectFit="cover" sizes="(max-width: 800px) 100vw, 50vw" /></Reveal> : null}
          {hasCopy ? <Reveal className={!hasImage ? "max-w-none" : ""} from={hasImage ? "right" : "up"}>
            {hasRichText(content.title) ? <h2 className="mt-0 mb-[18px]" id={titleId} dangerouslySetInnerHTML={{ __html: headingMarkup(content.title) }} /> : null}
            <RichCopy html={content.text} />
            {content.items?.length ? <StaggerReveal as="ul" className="mt-[18px] grid list-none grid-cols-2 gap-x-5 gap-y-[18px] p-0 max-[540px]:grid-cols-1" duration={420} from="up" stagger={65}>{content.items.map((item, index) => <li className="flex items-start gap-[13px]" key={index}><span className="shrink-0 text-[length:var(--font-h6)] font-bold text-[var(--color-secondary)]" aria-hidden="true">✓</span><RichCopy html={item.text} /></li>)}</StaggerReveal> : null}
            {content.link?.url ? <div className="mt-5"><ContentLink link={content.link} variant="btn-secondary" /></div> : null}
          </Reveal> : null}
        </div>
      </div>
    </section>
  );
}
