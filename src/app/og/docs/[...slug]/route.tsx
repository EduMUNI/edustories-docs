import { getPageImage, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { appName } from '@/lib/shared';

export const revalidate = false;

// Brand tokens (mirrors src/app/global.css). The OG image is a light,
// on-brand card: white ground, Edustories blue accents, the real logo, Inter.
const BRAND = '#305cde';
const BRAND_LIGHT = '#7da0f5';
const FG = '#0f172a';
const MUTED = '#5b6472';
const SITE_HOST = 'docs.edustori.es';

// The horizontal logo, read once at build and inlined as a data URI. viewBox
// "0 0 174 40" gives the aspect ratio so the <img> isn't stretched. Falls back
// to a text wordmark if the file can't be read.
const logo = (() => {
  try {
    const svg = readFileSync(
      join(process.cwd(), 'public', 'logo-horizontal.svg'),
      'utf8'
    );
    const vb = svg
      .match(/viewBox="([\d.\s-]+)"/)?.[1]
      ?.split(/\s+/)
      .map(Number);
    const ratio = vb && vb.length === 4 && vb[3] ? vb[2] / vb[3] : 174 / 40;
    return {
      src: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      ratio,
    };
  } catch {
    return null;
  }
})();

// Inter for both weights, loaded once from the @fontsource CDN as woff (Satori
// supports woff/ttf/otf, not woff2). `latin-ext` is loaded under a second family
// name so the "Inter, InterExt" stack falls back to it for Czech diacritics
// (č/ř/ž/…). Any failure degrades to Satori's default font rather than breaking
// the build.
const fontsPromise: Promise<
  { name: string; data: ArrayBuffer; weight: 400 | 700; style: 'normal' }[]
> = (async () => {
  const files: [string, 400 | 700][] = [
    ['inter-latin-400-normal.woff', 400],
    ['inter-latin-700-normal.woff', 700],
    ['inter-latin-ext-400-normal.woff', 400],
    ['inter-latin-ext-700-normal.woff', 700],
  ];
  try {
    return await Promise.all(
      files.map(async ([file, weight]) => {
        const res = await fetch(
          `https://cdn.jsdelivr.net/npm/@fontsource/inter@5/files/${file}`
        );
        if (!res.ok) throw new Error(`font ${file}: ${res.status}`);
        return {
          name: file.includes('latin-ext') ? 'InterExt' : 'Inter',
          data: await res.arrayBuffer(),
          weight,
          style: 'normal' as const,
        };
      })
    );
  } catch {
    return [];
  }
})();

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[...slug]'>
) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const description = page.data.description ?? '';

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '80px',
        backgroundColor: '#ffffff',
        backgroundImage: `radial-gradient(circle at 88% 8%, rgba(48,92,222,0.14), rgba(48,92,222,0) 42%)`,
        fontFamily: 'Inter, InterExt',
        position: 'relative',
      }}
    >
      {/* brand accent bar along the bottom edge */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '14px',
          backgroundImage: `linear-gradient(90deg, ${BRAND}, ${BRAND_LIGHT})`,
        }}
      />

      {/* header: logo */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.src}
            alt={appName}
            height={48}
            width={Math.round(48 * logo.ratio)}
          />
        ) : (
          <div style={{ fontSize: 40, fontWeight: 700, color: BRAND }}>
            {appName}
          </div>
        )}
      </div>

      {/* body: title + description, vertically centred in the remaining space */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '10px',
              alignSelf: 'stretch',
              marginRight: '32px',
              borderRadius: '9999px',
              backgroundImage: `linear-gradient(180deg, ${BRAND}, ${BRAND_LIGHT})`,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: title(page.data.title),
                fontWeight: 700,
                color: FG,
                lineHeight: 1.08,
                letterSpacing: '-1.5px',
              }}
            >
              {page.data.title}
            </div>
            {description ? (
              <div
                style={{
                  marginTop: '28px',
                  fontSize: 32,
                  lineHeight: 1.4,
                  color: MUTED,
                  // clamp to keep the card readable for long descriptions
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 3,
                  overflow: 'hidden',
                }}
              >
                {description}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* footer: canonical host */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '9999px',
            backgroundColor: BRAND,
            marginRight: '14px',
          }}
        />
        <div style={{ fontSize: 26, fontWeight: 600, color: BRAND }}>
          {SITE_HOST}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: await fontsPromise,
    }
  );
}

// Scale the title down as it gets longer so it always fits the card.
function title(text: string): number {
  if (text.length > 55) return 54;
  if (text.length > 35) return 66;
  return 78;
}

export function generateStaticParams() {
  // This route is not locale-segmented; one OG image per page is enough
  // while English is the only language. When more locales ship, give the
  // route a [lang] segment so each locale gets its own image.
  return source.getPages().map((page) => ({
    slug: getPageImage(page).segments,
  }));
}
