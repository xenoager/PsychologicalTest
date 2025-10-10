// vite.config.ts
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    // 개발 서버에서 접근할 일이 있다면 같이 넣어두면 편합니다.
    allowedHosts: ["graceful-harrietta-kaionos-1579b421.koyeb.app"],
  },
  preview: {
    host: true, // 0.0.0.0 리슨 (컨테이너/PAAS 필수)
    port: Number(process.env.PORT) || 4173, // Koyeb의 PORT 환경변수 사용
    allowedHosts: ["graceful-harrietta-kaionos-1579b421.koyeb.app"],
  },
});
