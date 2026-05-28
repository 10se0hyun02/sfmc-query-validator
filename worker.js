/**
 * Cloudflare Worker — SFMC CORS Proxy
 *
 * 배포 방법:
 *   1. https://workers.cloudflare.com 접속 (무료 계정 가능)
 *   2. "Create a Worker" → 이 파일 내용 붙여넣기
 *   3. 배포 후 URL(예: https://sfmc-proxy.yourname.workers.dev) 복사
 *   4. 앱의 "SFMC 연결" 탭 → 프록시 URL에 붙여넣기
 *
 * 허용 타겟: *.marketingcloudapis.com 도메인만 프록시
 */

const ALLOWED_HOST_SUFFIX = '.marketingcloudapis.com';

export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Sfmc-Target',
    };

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const target = request.headers.get('X-Sfmc-Target');
    if (!target) {
      return json({ error: 'X-Sfmc-Target 헤더가 필요합니다.' }, 400, corsHeaders);
    }

    let targetUrl;
    try {
      targetUrl = new URL(target);
    } catch {
      return json({ error: '유효하지 않은 URL입니다.' }, 400, corsHeaders);
    }

    if (!targetUrl.hostname.endsWith(ALLOWED_HOST_SUFFIX)) {
      return json({ error: `허용된 도메인이 아닙니다: ${targetUrl.hostname}` }, 403, corsHeaders);
    }

    // SFMC에 필요한 헤더만 선택적으로 전달 (브라우저 보안 헤더 제외)
    const ALLOWED_HEADERS = new Set(['content-type', 'authorization', 'accept', 'accept-encoding', 'soapaction']);
    const proxyHeaders = new Headers();
    for (const [key, val] of request.headers) {
      if (ALLOWED_HEADERS.has(key.toLowerCase())) {
        proxyHeaders.set(key, val);
      }
    }

    const isBodyless = ['GET', 'HEAD'].includes(request.method);
    const proxyResp = await fetch(target, {
      method: request.method,
      headers: proxyHeaders,
      body: isBodyless ? null : request.body,
    });

    const respHeaders = new Headers(proxyResp.headers);
    for (const [k, v] of Object.entries(corsHeaders)) respHeaders.set(k, v);

    return new Response(proxyResp.body, {
      status: proxyResp.status,
      statusText: proxyResp.statusText,
      headers: respHeaders,
    });
  },
};

function json(obj, status, extra = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}
