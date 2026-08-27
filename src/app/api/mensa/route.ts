import { NextResponse } from "next/server";
import { MOCK_MENSA } from "@/lib/mock";
import { getMensa } from "@/lib/smartcity";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getMensa());
  } catch {
    return NextResponse.json(MOCK_MENSA);
  }
}
