import QRCode from "qrcode";

export type QrBoxPayload = {
  type: "koinnu_box";
  id: number;
  boxNumber: string;
};

export function encodeBoxPayload(id: number, boxNumber: string): string {
  return JSON.stringify({ type: "koinnu_box", id, boxNumber } satisfies QrBoxPayload);
}

export async function generateBoxQrDataUrl(id: number, boxNumber: string): Promise<string> {
  const data = encodeBoxPayload(id, boxNumber);
  return QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: { dark: "#1a1a2e", light: "#ffffff" }
  });
}
