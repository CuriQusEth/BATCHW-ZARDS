import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    // Values read precisely from actual project files (agent-card.json and server.ts)
    name: "BatchWizards Orchestrator",
    status: "active",
    wallet: "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
    platform: "BatchWizards",
    version: "1.0.0"
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      name: "BatchWizards Orchestrator",
      status: "active",
      wallet: "0x29536D0bc1004ab274c4F0F59734Ad74D4559b7B",
      platform: "BatchWizards",
      version: "1.0.0",
      receivedPayload: body
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
