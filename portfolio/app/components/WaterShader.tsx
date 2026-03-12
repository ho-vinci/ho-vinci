"use client";

import { useEffect, useRef } from "react";

// three.js is loaded via CDN at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThreeLib = any;

export default function WaterShader() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let renderer: any = null;
    let animId: number;
    let cleanup = false;

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
    script.onload = () => {
      if (cleanup) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const T: ThreeLib = (window as any).THREE;
      if (!T) return;
      init(T);
    };
    document.head.appendChild(script);

    function init(T: ThreeLib) {
      const SIM_RES = 1024;
      const PLANE_SZ = 22;
      const SUBSTEPS = 4;

      renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      const initW = window.innerWidth;
      const initH = window.innerHeight;
      renderer.setSize(initW, initH);
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      mount!.appendChild(canvas);

      const scene = new T.Scene();
      const w = initW;
      const h = initH;
      const aspect = w / h;
      const camera = new T.OrthographicCamera(
        -aspect * PLANE_SZ / 2, aspect * PLANE_SZ / 2,
        PLANE_SZ / 2, -PLANE_SZ / 2,
        0.1, 200
      );
      camera.position.set(0, 50, 0);
      camera.lookAt(0, 0, 0);

      const simCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const simScene = new T.Scene();

      const rtOpts = {
        minFilter: T.NearestFilter,
        magFilter: T.LinearFilter,
        format: T.RGBAFormat,
        type: T.FloatType,
        depthBuffer: false,
        stencilBuffer: false,
      };
      let ping = new T.WebGLRenderTarget(SIM_RES, SIM_RES, rtOpts);
      let pong = ping.clone();

      const simUniforms = {
        uState: { value: null },
        uTexel: { value: new T.Vector2(1 / SIM_RES, 1 / SIM_RES) },
        uMouse: { value: new T.Vector2(-1, -1) },
        uImpulse: { value: 0 },
      };

      simScene.add(
        new T.Mesh(
          new T.PlaneGeometry(2, 2),
          new T.ShaderMaterial({
            uniforms: simUniforms,
            vertexShader: `
              varying vec2 vUv;
              void main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }
            `,
            fragmentShader: `
              precision highp float;
              uniform sampler2D uState;
              uniform vec2      uTexel;
              uniform vec2      uMouse;
              uniform float     uImpulse;
              varying vec2 vUv;
              void main() {
                float curr = texture2D(uState, vUv).r;
                float prev = texture2D(uState, vUv).g;
                float n = texture2D(uState, vUv + vec2(0., uTexel.y)).r;
                float s = texture2D(uState, vUv - vec2(0., uTexel.y)).r;
                float e = texture2D(uState, vUv + vec2(uTexel.x, 0.)).r;
                float w = texture2D(uState, vUv - vec2(uTexel.x, 0.)).r;
                float lap  = n + s + e + w - 4.0 * curr;
                float c    = 0.50;
                float next = 2.0 * curr - prev + c * c * lap;
                next *= 0.9955;
                next  = clamp(next, -1., 1.);
                if (uImpulse > 0.001) {
                  float d = length(vUv - uMouse);
                  next -= uImpulse * exp(-d * d * 7000.0);
                  next  = clamp(next, -1., 1.);
                }
                gl_FragColor = vec4(next, curr, 0., 1.);
              }
            `,
          })
        )
      );

      const dispUniforms = {
        uHeightMap: { value: null },
        uTexel: { value: new T.Vector2(1 / SIM_RES, 1 / SIM_RES) },
        uDispScale: { value: 0.44 },
      };

      const waterGeo = new T.PlaneGeometry(PLANE_SZ, PLANE_SZ, 480, 480);
      waterGeo.rotateX(-Math.PI / 2);

      scene.add(
        new T.Mesh(
          waterGeo,
          new T.ShaderMaterial({
            uniforms: dispUniforms,
            vertexShader: `
              precision highp float;
              uniform sampler2D uHeightMap;
              uniform vec2      uTexel;
              uniform float     uDispScale;
              varying vec2  vUv;
              varying vec3  vNormal;
              varying float vHeight;
              void main() {
                vUv = uv;
                float h  = texture2D(uHeightMap, uv).r;
                float hE = texture2D(uHeightMap, uv + vec2(uTexel.x, 0.)).r;
                float hN = texture2D(uHeightMap, uv + vec2(0., uTexel.y)).r;
                vHeight  = h;
                float scale = uDispScale * 55.0;
                float dX    = (hE - h) * scale;
                float dZ    = (hN - h) * scale;
                vNormal     = normalize(vec3(-dX, 1.0, dZ));
                vec3 pos = position;
                pos.y   += h * uDispScale;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `,
            fragmentShader: `
              precision highp float;
              varying vec2  vUv;
              varying vec3  vNormal;
              varying float vHeight;
              void main() {
                vec3 V = normalize(vec3(0.0, 1.0, 0.0));
                vec3 L = normalize(vec3(0.3, 1.0, 0.5));
                float NdotV  = max(dot(vNormal, vec3(0.,1.,0.)), 0.0);
                float fresnel = pow(1.0 - NdotV, 4.5);
                vec3  H    = normalize(L + V);
                float spec = pow(max(dot(vNormal, H), 0.0), 30.0) * 0.50;
                vec3  L2   = normalize(vec3(-0.4, 0.8, -0.3));
                vec3  H2   = normalize(L2 + V);
                float spec2= pow(max(dot(vNormal, H2), 0.0), 15.0) * 0.18;
                float h      = vHeight;
                float crest  = pow(max(h, 0.0), 1.4) * 1.8;
                float trough = pow(max(-h, 0.0), 1.4) * 0.6;
                vec3 hi  = vec3(0.08, 0.10, 0.12);
                vec3 bright = vec3(0.40, 0.48, 0.55);
                vec3 col = hi * (fresnel * 1.10 + spec * 2.0 + spec2 * 1.6)
                         + mix(hi, bright, crest) * crest
                         - hi * trough;
                gl_FragColor = vec4(col, 1.0);
              }
            `,
          })
        )
      );

      const raycaster = new T.Raycaster();
      const ndcMouse = new T.Vector2();
      const wPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);
      const hitPt = new T.Vector3();
      let impulse = 0;
      let lastSpawnT = -1;
      const clock = new T.Clock();

      function inject(cx: number, cy: number) {
        const t = clock.getElapsedTime();
        if (t - lastSpawnT < 0.016) return;
        lastSpawnT = t;
        const w = mount!.clientWidth;
        const h = mount!.clientHeight;
        ndcMouse.set((cx / w) * 2 - 1, -(cy / h) * 2 + 1);
        raycaster.setFromCamera(ndcMouse, camera);
        if (raycaster.ray.intersectPlane(wPlane, hitPt)) {
          const u = (hitPt.x + PLANE_SZ / 2) / PLANE_SZ;
          const v = (-hitPt.z + PLANE_SZ / 2) / PLANE_SZ;
          if (u > 0 && u < 1 && v > 0 && v < 1) {
            simUniforms.uMouse.value.set(u, v);
            impulse = 0.35;
          }
        }
      }

      const onMouseMove = (e: MouseEvent) => {
        const rect = mount!.getBoundingClientRect();
        inject(e.clientX - rect.left, e.clientY - rect.top);
      };
      const onClick = (e: MouseEvent) => {
        const rect = mount!.getBoundingClientRect();
        inject(e.clientX - rect.left, e.clientY - rect.top);
      };
      const onTouch = (e: TouchEvent) => {
        const rect = mount!.getBoundingClientRect();
        inject(
          e.touches[0].clientX - rect.left,
          e.touches[0].clientY - rect.top
        );
      };

      mount!.addEventListener("mousemove", onMouseMove);
      mount!.addEventListener("click", onClick);
      mount!.addEventListener("touchmove", onTouch, { passive: true });

      const onResize = () => {
        if (!mount || !renderer) return;
        const nw = window.innerWidth;
        const nh = window.innerHeight;
        const na = nw / nh;
        camera.left   = -na * PLANE_SZ / 2;
        camera.right  =  na * PLANE_SZ / 2;
        camera.top    =  PLANE_SZ / 2;
        camera.bottom = -PLANE_SZ / 2;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      };
      window.addEventListener("resize", onResize);

      let nextAmbient = 1.8;
      function spawnAmbient(t: number) {
        if (t > nextAmbient) {
          const u = 0.15 + Math.random() * 0.7;
          const v = 0.15 + Math.random() * 0.7;
          simUniforms.uMouse.value.set(u, v);
          impulse = 0.45;
          nextAmbient = t + 2.5 + Math.random() * 3.0;
        }
      }

      function animate() {
        if (cleanup) return;
        animId = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        spawnAmbient(t);

        for (let i = 0; i < SUBSTEPS; i++) {
          simUniforms.uState.value = ping.texture;
          simUniforms.uImpulse.value = i === 0 ? impulse : 0.0;
          renderer.setRenderTarget(pong);
          renderer.render(simScene, simCam);
          renderer.setRenderTarget(null);
          const tmp = ping;
          ping = pong;
          pong = tmp;
        }
        impulse *= 0.55;
        dispUniforms.uHeightMap.value = ping.texture;
        renderer.render(scene, camera);
      }

      animate();

      // Store cleanup fn on the DOM node
      (
        mount as HTMLDivElement & { _wCleanup?: () => void }
      )._wCleanup = () => {
        cancelAnimationFrame(animId);
        mount!.removeEventListener("mousemove", onMouseMove);
        mount!.removeEventListener("click", onClick);
        mount!.removeEventListener("touchmove", onTouch);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        ping.dispose();
        pong.dispose();
      };
    }

    return () => {
      cleanup = true;
      const m = mount as HTMLDivElement & { _wCleanup?: () => void };
      if (m._wCleanup) m._wCleanup();
      if (renderer && mount && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        cursor: "crosshair",
      }}
    />
  );
}
