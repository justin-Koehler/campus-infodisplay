import { NextResponse } from "next/server";
import { MOCK_WEATHER } from "@/lib/mock";
import { getWeather } from "@/lib/smartcity";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getWeather());
  } catch {
    return NextResponse.json(MOCK_WEATHER);
  }
}
