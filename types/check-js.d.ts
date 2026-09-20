declare const process: {
  env: Record<string, string | undefined>;
};

declare const Buffer: {
  byteLength(value: string): number;
  isBuffer(value: unknown): boolean;
};

declare module "node:crypto" {
  const crypto: {
    createHash(algorithm: string): {
      update(value: string): { digest(encoding: "hex"): string };
    };
  };
  export default crypto;
}
