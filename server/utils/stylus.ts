import { createError, getQuery, getRequestURL, type H3Event } from 'h3';
import { ofetch } from 'ofetch';
import { type RegistryItem, registryItemSchema } from 'shadcn/registry';
import { cssVarsToCss } from './css-transformer';

const THEME_START = '/* ==UI-THEME-VARS:START== */';
const THEME_END = '/* ==UI-THEME-VARS:END== */';
const CUID_REGEX = /^c[a-z0-9]{24}$/;

function isCUID(id: string): boolean {
  return CUID_REGEX.test(id);
}

export async function getThemeCss(themeId: string): Promise<string | null> {
  const url = isCUID(themeId)
    ? `https://tweakcn.com/r/themes/${encodeURIComponent(themeId)}`
    : `https://tweakcn.com/r/themes/${encodeURIComponent(themeId)}.json`;

  try {
    const theme = await ofetch<RegistryItem>(url, {
      retry: 0,
      ignoreResponseError: true,
    });

    const parsed = registryItemSchema.safeParse(theme);
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid theme data',
        data: parsed.error.issues,
      });
    }

    const registryItem = parsed.data;
    return cssVarsToCss(registryItem.cssVars ?? {});
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: `Theme not found: ${themeId}`,
    });
  }
}

export function changeMetadata(
  content: string,
  field: string,
  value: string
): string {
  const metaRegex = new RegExp(`^(@${field}\\s+).+$`, 'm');
  return content.replace(metaRegex, `$1${value}`);
}

export async function processContent({
  content,
  event,
}: {
  content: string;
  event: H3Event;
}): Promise<string | null | undefined> {
  const query = getQuery(event);
  const theme = query.theme as string | undefined;
  const asset = (query.asset as string) ?? 'main.user.css';

  let result = content;

  if (theme && asset === 'main.user.css') {
    const css = await getThemeCss(theme);
    const wrappedCss = `${THEME_START}\n${css}\n${THEME_END}`;

    const escapedStart = THEME_START.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    const escapedEnd = THEME_END.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
    const themeRegex = new RegExp(
      `${escapedStart}[\\s\\S]*?${escapedEnd}`,
      'm'
    );

    const url = getRequestURL(event);
    const searchParams = new URLSearchParams(url.search);
    result = changeMetadata(
      result,
      'updateURL',
      `${url.origin}/release/latest/?${searchParams.toString()}`
    );

    if (themeRegex.test(result)) {
      result = result.replace(themeRegex, wrappedCss);
    }
  }

  return result;
}
