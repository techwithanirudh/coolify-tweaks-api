import mime from 'mime';
import { ofetch } from 'ofetch';
import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  processContent,
} from '#imports';
import { owner, repo } from '~/config';

export default defineEventHandler(async (event) => {
  const tag = getRouterParam(event, 'tag');
  const asset = (getQuery(event)?.asset as string) ?? 'main.user.css';

  if (!(tag && asset)) {
    throw createError({
      status: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid input',
      data: { field: tag ? 'asset' : 'tag' },
    });
  }

  const url = `https://github.com/${owner}/${repo}/releases/${encodeURIComponent(tag)}/download/${encodeURIComponent(asset)}`;

  try {
    const {
      _data: content,
      headers: rawHeaders,
      status,
      statusText,
      ok,
    } = await ofetch.raw(url, {
      method: 'GET',
      responseType: 'text',
      ignoreResponseError: true,
      retry: 0,
      headers: { Accept: '*/*' },
    });

    if (!ok) {
      throw createError({
        status,
        statusMessage: statusText,
        message: `GitHub returned ${status}: ${statusText}`,
        data: { url, tag },
      });
    }

    const processed = await processContent({ content: content ?? '', event });

    const headers = new Headers(rawHeaders);
    const detected = mime.getType(asset);

    headers.set('Content-Type', detected || 'application/octet-stream');
    headers.set('X-Proxy-Host', 'github.com');
    headers.delete('Content-Encoding');
    headers.delete('Content-Disposition');

    return new Response(processed, { status, headers });
  } catch (error) {
    throw createError({
      status: 500,
      statusMessage: 'Internal Server Error',
      message: `Failed to fetch from GitHub: ${error instanceof Error ? error.message : 'Unknown error'}`,
      data: { url, tag },
    });
  }
});
