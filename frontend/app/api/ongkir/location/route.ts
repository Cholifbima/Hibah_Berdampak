import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'province';
  const id = searchParams.get('id');

  const apiKey = process.env.BINDERBYTE_API_KEY || "5fdb9fbaea3aa25404763aaa496ecf22ff6b05895fae80d711b5fef06dd58c21";

  if (!apiKey) {
    return NextResponse.json({ error: "API Key BinderByte belum disetting di .env.local" }, { status: 500 });
  }

  let url = `https://api.binderbyte.com/wilayah/provinsi?api_key=${apiKey}`;
  
  if (type === 'city' && id) {
    url = `https://api.binderbyte.com/wilayah/kabupaten?api_key=${apiKey}&id_provinsi=${id}`;
  } else if (type === 'district' && id) {
    url = `https://api.binderbyte.com/wilayah/kecamatan?api_key=${apiKey}&id_kabupaten=${id}`;
  } else if (type === 'village' && id) {
    url = `https://api.binderbyte.com/wilayah/kelurahan?api_key=${apiKey}&id_kecamatan=${id}`;
  }

  try {
    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Location fetch error:", error);
    return NextResponse.json({ error: "Gagal mengambil data lokasi dari BinderByte" }, { status: 500 });
  }
}
