import { NextResponse } from 'next/server';

const ALL_COURIERS = ['jne', 'pos', 'tiki', 'sicepat', 'anteraja', 'lion', 'ninja', 'sap', 'ide', 'jnt', 'wahana', 'spx'];

async function fetchCost(apiKey: string, origin: string, destination: string, weight: string, courier: string) {
  try {
    const response = await fetch("https://api.binderbyte.com/v1/cost", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        api_key: apiKey,
        origin,
        destination,
        weight,
        courier,
      }).toString(),
    });

    const text = await response.text();
    if (!text || text.trim() === '') return null;

    const data = JSON.parse(text);
    if (data.code === "200" && data.data?.results) {
      return data.data.results;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destination, weight, courier } = body;

    const ORIGIN_DISTRICT_ID = "dist_33.72.01"; // Laweyan, Surakarta

    const apiKey = process.env.BINDERBYTE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key belum disetting" }, { status: 500 });
    }

    const destId = `dist_${destination}`;
    const weightStr = weight.toString();

    // Kirim request per kurir secara paralel agar tidak timeout/empty response
    const courierList = courier ? courier.split(',').map((c: string) => c.trim()) : ALL_COURIERS;

    const promises = courierList.map((c: string) =>
      fetchCost(apiKey, ORIGIN_DISTRICT_ID, destId, weightStr, c)
    );

    const results = await Promise.all(promises);

    // Gabungkan semua hasil yang berhasil
    const allResults: any[] = [];
    for (const result of results) {
      if (result && Array.isArray(result)) {
        allResults.push(...result);
      }
    }

    return NextResponse.json({
      code: "200",
      message: "Successfully calculated cost",
      data: {
        origin: { id: ORIGIN_DISTRICT_ID },
        destination: { id: destId },
        weight: weightStr,
        results: allResults,
      },
    });
  } catch (error) {
    console.error("Cost fetch error:", error);
    return NextResponse.json({ error: "Gagal menghitung ongkir via BinderByte" }, { status: 500 });
  }
}
