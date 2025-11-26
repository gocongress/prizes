// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ViteTypeOptions {}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_OTP_CODE_LENGTH: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
