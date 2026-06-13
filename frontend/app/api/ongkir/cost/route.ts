import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, weight, courier } = body;
    
    const apiKey = process.env.KOMERCE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key belum disetting" }, { status: 500 });
    }

    // Origin ID 445 = Kota Surakarta
    const response = await fetch("https://api.rajaongkir.com/starter/cost", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "key": apiKey
      },
      body: new URLSearchParams({
        origin: "445",
        destination: destination.toString(),
        weight: weight.toString(),
        courier: courier
      }).toString()
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Cost fetch error:", error);
    return NextResponse.json({ error: "Gagal menghitung ongkir" }, { status: 500 });
  }
}
