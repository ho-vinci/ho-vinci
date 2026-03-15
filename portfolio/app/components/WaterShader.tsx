"use client";

import { useEffect, useRef } from "react";

// three.js は CDN から実行時にロード
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
      // WebGL 非対応デバイスへの安全なフォールバック
      try {
        renderer = new T.WebGLRenderer({ antialias: false, alpha: true });
      } catch {
        return;
      }

      // モバイルではピクセル比を 1 に抑えてパフォーマンスを確保
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      renderer.setPixelRatio(isMobile ? 1 : Math.min(devicePixelRatio, 2));

      const initW = window.innerWidth;
      const initH = window.innerHeight;
      renderer.setSize(initW, initH, false);
      renderer.setClearColor(0x000000, 0);

      const canvas = renderer.domElement;
      canvas.style.position = "absolute";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100%";
      mount!.appendChild(canvas);

      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      // タッチ/クリックで波を起こせるよう、インタラクション座標を保持
      const interactionPoints: Array<{ u: number; v: number; t: number }> = [];
      const clock = new T.Clock();

      // ── シェーダーユニフォーム ──────────────────────────────────────
      // RenderTarget を一切使わず、フラグメントシェーダーだけで波を描画。
      // モバイルの WebGL 実装差異（FloatType 非対応など）を回避できる。
      const uniforms = {
        uTime:       { value: 0.0 },
        uResolution: { value: new T.Vector2(initW, initH) },
        // タッチ/クリック波: 最大4点を保持
        uHitUV:  { value: [
          new T.Vector2(-1, -1),
          new T.Vector2(-1, -1),
          new T.Vector2(-1, -1),
          new T.Vector2(-1, -1),
        ]},
        uHitTime: { value: new T.Vector4(-999, -999, -999, -999) },
      };

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `;

      // precision は mediump でモバイル互換性を確保
      const fragmentShader = `
        precision mediump float;

        uniform float     uTime;
        uniform vec2      uResolution;
        uniform vec2      uHitUV[4];
        uniform vec4      uHitTime;

        varying vec2 vUv;

        // ─── 擬似乱数 ───────────────────────────────────────────────
        float rand(vec2 co) {
          return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
        }

        // ─── 1点からの円形波 ──────────────────────────────────────
        float ripple(vec2 uv, vec2 center, float startT, float t) {
          float age    = t - startT;
          if (age < 0.0 || age > 4.5) return 0.0;
          float dist   = length(uv - center);
          // 波の速度・減衰・周波数
          float speed  = 0.22;
          float freq   = 18.0;
          float damp   = exp(-age * 1.2) * exp(-dist * 4.5);
          float wave   = sin((dist - age * speed) * freq) * damp;
          return wave;
        }

        // ─── 環境波（ランダム発生 + 定常うねり） ─────────────────
        float ambientWaves(vec2 uv, float t) {
          float h = 0.0;

          // 低速なうねり（複数方向の sin 合成）
          h += sin(uv.x * 4.2 + t * 0.40) * cos(uv.y * 3.7 + t * 0.33) * 0.030;
          h += sin(uv.x * 7.1 - t * 0.55 + uv.y * 2.3) * 0.018;
          h += cos(uv.x * 2.8 + uv.y * 5.5 + t * 0.28) * 0.022;
          h += sin(uv.x * 11.0 + t * 0.70) * cos(uv.y * 9.0 - t * 0.60) * 0.010;

          // ランダム発生リップル（シード値で位置と時間をばらす）
          for (int i = 0; i < 6; i++) {
            float fi   = float(i);
            float seed = fi * 137.508;
            float cx   = rand(vec2(seed, 0.1)) * 0.8 + 0.1;
            float cy   = rand(vec2(seed, 0.2)) * 0.8 + 0.1;
            // 各リップルは 5.5 秒周期でリセット
            float period = 5.5;
            float offset = rand(vec2(seed, 0.3)) * period;
            float lt     = mod(t + offset, period);
            h += ripple(uv, vec2(cx, cy), 0.0, lt) * 0.35;
          }

          return h;
        }

        // ─── 法線からライティング ─────────────────────────────────
        vec3 waterColor(vec2 uv, float h, float hE, float hN) {
          float dX = (hE - h) * 28.0;
          float dZ = (hN - h) * 28.0;
          vec3 normal = normalize(vec3(-dX, 1.0, dZ));

          vec3 V = vec3(0.0, 1.0, 0.0);
          vec3 L = normalize(vec3(0.3, 1.0, 0.5));
          float NdotV  = max(dot(normal, V), 0.0);
          float fresnel = pow(1.0 - NdotV, 4.5);
          vec3 H  = normalize(L + V);
          float spec  = pow(max(dot(normal, H), 0.0), 30.0) * 0.50;
          vec3 L2 = normalize(vec3(-0.4, 0.8, -0.3));
          vec3 H2 = normalize(L2 + V);
          float spec2 = pow(max(dot(normal, H2), 0.0), 15.0) * 0.18;
          float crest  = pow(max( h, 0.0), 1.4) * 1.8;
          float trough = pow(max(-h, 0.0), 1.4) * 0.6;
          vec3 hi     = vec3(0.08, 0.10, 0.12);
          vec3 bright = vec3(0.40, 0.48, 0.55);
          vec3 col = hi * (fresnel * 1.10 + spec * 2.0 + spec2 * 1.6)
                   + mix(hi, bright, crest) * crest
                   - hi * trough;
          return col;
        }

        void main() {
          vec2 uv = vUv;
          float t  = uTime;
          float eps = 1.0 / min(uResolution.x, uResolution.y);

          float h  = ambientWaves(uv, t);
          float hE = ambientWaves(uv + vec2(eps, 0.0), t);
          float hN = ambientWaves(uv + vec2(0.0, eps), t);

          // タッチ/クリック波を重ねる
          float hitTimes[4];
          hitTimes[0] = uHitTime.x;
          hitTimes[1] = uHitTime.y;
          hitTimes[2] = uHitTime.z;
          hitTimes[3] = uHitTime.w;
          for (int i = 0; i < 4; i++) {
            float r  = ripple(uv, uHitUV[i], hitTimes[i], t);
            float rE = ripple(uv + vec2(eps,0.), uHitUV[i], hitTimes[i], t);
            float rN = ripple(uv + vec2(0.,eps), uHitUV[i], hitTimes[i], t);
            h  += r  * 0.6;
            hE += rE * 0.6;
            hN += rN * 0.6;
          }

          vec3 col = waterColor(uv, h, hE, hN);
          gl_FragColor = vec4(col, 1.0);
        }
      `;

      scene.add(
        new T.Mesh(
          new T.PlaneGeometry(2, 2),
          new T.ShaderMaterial({ uniforms, vertexShader, fragmentShader })
        )
      );

      // ─── インタラクション（タッチ / クリック） ──────────────────
      let hitIdx = 0;

      function addHit(u: number, v: number) {
        const t = clock.getElapsedTime();
        uniforms.uHitUV.value[hitIdx].set(u, v);
        const arr = [
          uniforms.uHitTime.value.x,
          uniforms.uHitTime.value.y,
          uniforms.uHitTime.value.z,
          uniforms.uHitTime.value.w,
        ];
        arr[hitIdx] = t;
        uniforms.uHitTime.value.set(...(arr as [number, number, number, number]));
        hitIdx = (hitIdx + 1) % 4;
        interactionPoints.push({ u, v, t });
      }

      const onTouch = (e: TouchEvent) => {
        const rect = mount!.getBoundingClientRect();
        Array.from(e.touches).forEach(touch => {
          const u = (touch.clientX - rect.left) / rect.width;
          const v = 1 - (touch.clientY - rect.top) / rect.height;
          addHit(u, v);
        });
      };
      const onClick = (e: MouseEvent) => {
        const rect = mount!.getBoundingClientRect();
        addHit(
          (e.clientX - rect.left) / rect.width,
          1 - (e.clientY - rect.top) / rect.height
        );
      };
      const onMouseMove = (e: MouseEvent) => {
        const rect = mount!.getBoundingClientRect();
        addHit(
          (e.clientX - rect.left) / rect.width,
          1 - (e.clientY - rect.top) / rect.height
        );
      };

      mount!.addEventListener("touchstart", onTouch, { passive: true });
      mount!.addEventListener("touchmove",  onTouch, { passive: true });
      mount!.addEventListener("click", onClick);
      mount!.addEventListener("mousemove", onMouseMove);

      // ─── リサイズ ────────────────────────────────────────────────
      const onResize = () => {
        if (!mount || !renderer) return;
        const nw = window.innerWidth;
        const nh = window.innerHeight;
        renderer.setSize(nw, nh, false);
        uniforms.uResolution.value.set(nw, nh);
      };
      window.addEventListener("resize", onResize);
      const resizeObserver = new ResizeObserver(() => onResize());
      if (mount!.parentElement) resizeObserver.observe(mount!.parentElement);
      resizeObserver.observe(mount!);

      // ─── アニメーションループ ────────────────────────────────────
      function animate() {
        if (cleanup) return;
        animId = requestAnimationFrame(animate);
        uniforms.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
      }
      animate();
      requestAnimationFrame(onResize);

      // クリーンアップ関数を DOM ノードに格納
      (mount as HTMLDivElement & { _wCleanup?: () => void })._wCleanup = () => {
        cancelAnimationFrame(animId);
        mount!.removeEventListener("touchstart", onTouch);
        mount!.removeEventListener("touchmove",  onTouch);
        mount!.removeEventListener("click", onClick);
        mount!.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("resize", onResize);
        resizeObserver.disconnect();
        renderer.dispose();
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
        width: "100vw",
        height: "100%",
        cursor: "crosshair",
      }}
    />
  );
}
