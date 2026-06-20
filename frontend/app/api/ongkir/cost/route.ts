import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, weight, courier } = body;
    
    // Origin is fixed to Kecamatan Laweyan, Kota Surakarta
    // From BinderByte Wilayah: ID untuk Laweyan, Surakarta adalah 33.72.01
    // API Cek Ongkir BinderByte meminta format dist_ID untuk kecamatan.
    const ORIGIN_DISTRICT_ID = "dist_33.72.01";
    
    const apiKey = process.env.BINDERBYTE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key belum disetting" }, { status: 500 });
    }

    // BinderByte Cek Ongkir menggunakan POST application/x-www-form-urlencoded
    const response = await fetch("https://api.binderbyte.com/v1/cost", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        api_key: apiKey,
        origin: ORIGIN_DISTRICT_ID,
        destination: `dist_${destination}`, // The destination ID from frontend is the kecamatan ID like 32.73.25
        weight: weight.toString(),
        courier: courier // e.g. jne,pos,sicepat
      }).toString()
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Cost fetch error:", error);
    return NextResponse.json({ error: "Gagal menghitung ongkir via BinderByte" }, { status: 500 });
  }
}
