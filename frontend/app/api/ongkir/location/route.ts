import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'province';
  const id = searchParams.get('id');

  const apiKey = process.env.KOMERCE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API Key belum disetting di .env.local" }, { status: 500 });
  }

  // Komerce/RajaOngkir endpoints
  let url = 'https://api.rajaongkir.com/starter/province';
  if (type === 'city') {
    url = `https://api.rajaongkir.com/starter/city?province=${id}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { key: apiKey }
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Location fetch error:", error);
    return NextResponse.json({ error: "Gagal mengambil data lokasi" }, { status: 500 });
  }
}
