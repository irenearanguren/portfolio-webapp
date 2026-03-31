
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "redirectTo": "/projects",
    "route": "/"
  },
  {
    "renderMode": 0,
    "redirectTo": "/auth/login",
    "route": "/auth"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-47DV6E2C.js",
      "chunk-KQSE2ORO.js"
    ],
    "route": "/auth/login"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-47DV6E2C.js",
      "chunk-KQSE2ORO.js"
    ],
    "route": "/auth/register"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-MTDRSIC6.js",
      "chunk-3RICIVCV.js",
      "chunk-XVBQNTUO.js"
    ],
    "route": "/projects"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-MTDRSIC6.js",
      "chunk-NBP2WNL5.js",
      "chunk-KQSE2ORO.js",
      "chunk-XVBQNTUO.js"
    ],
    "route": "/projects/new"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-MTDRSIC6.js",
      "chunk-6DUTPYBB.js",
      "chunk-KQSE2ORO.js",
      "chunk-XVBQNTUO.js"
    ],
    "route": "/projects/*"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-MTDRSIC6.js",
      "chunk-NBP2WNL5.js",
      "chunk-KQSE2ORO.js",
      "chunk-XVBQNTUO.js"
    ],
    "route": "/projects/*/edit"
  },
  {
    "renderMode": 0,
    "redirectTo": "/projects",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 1501, hash: '4110ffc71ed7d6c42ebc763da37078fc421e265008c218ce9523616eb19c8c87', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1009, hash: '27b0db440a372a6a165803084e37dfcf206187d91809b2ae62784a8d0f4cfc83', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-3QRT5YUZ.css': {size: 3573, hash: 'zr03ruoDiPI', text: () => import('./assets-chunks/styles-3QRT5YUZ_css.mjs').then(m => m.default)}
  },
};
