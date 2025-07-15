import type { Context } from 'hono';
import ky from 'ky';
import { type RegistryItem, registryItemSchema } from '../lib/validators';
import { cssVarsToCss } from './css-transformer';

const THEME_START = '/* ==UI-THEME-VARS:START== */';
const THEME_END = '/* ==UI-THEME-VARS:END== */';

export async function getThemeCss(themeId: string): Promise<string | null> {
  const url = `https://tweakcn.com/r/themes/${themeId}`;
  const theme = await ky
    .get(url, { throwHttpErrors: false, timeout: false })
    .json<RegistryItem>();

  const parsedRegistryItem = registryItemSchema.safeParse(theme);
  if (!parsedRegistryItem.success) {
    return null;
  }

  const registryItem = parsedRegistryItem.data;
  const themeCss = cssVarsToCss(registryItem.cssVars ?? {});

  return themeCss;
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
  // event: Event
}): Promise<string | null | undefined> {
  const theme = c.req.query('theme');
  const asset = c.req.query('asset') || 'main.user.css';

  let result: string | null | undefined = content;

  if (theme && asset === 'main.user.css') {
    const css = await getThemeCss(theme);
    const wrappedCss = `${THEME_START}\n${css}\n${THEME_END}`;

    const themeRegex = new RegExp(
      `${THEME_START.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}[\\s\\S]*?${THEME_END.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')}`,
      'm'
    );

    result = changeMetadata(result, 'updateURL', c.req.url);

    if (themeRegex.test(result)) {
      result = result.replace(themeRegex, wrappedCss);
    }
  }

  return result;
}
