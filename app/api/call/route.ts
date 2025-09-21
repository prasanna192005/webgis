// app/api/call/route.ts
import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { phone_number } = body

    if (!phone_number) {
      return NextResponse.json({ success: false, error: "Phone number is required" }, { status: 400 })
    }

    const headers = {
      Authorization: `Bearer ${process.env.BLAND_API_KEY}`, // ✅ Bearer token
      "Content-Type": "application/json",
    }

    const data = {
      phone_number,
      voice: "June",
      wait_for_greeting: false,
      record: true,
      answered_by_enabled: true,
      noise_cancellation: false,
      interruption_threshold: 100,
      block_interruptions: false,
      max_duration: 12,
      model: "base",
      language: "en",
      background_track: "none",
      voicemail_action: "hangup",
      task: `You are Sunita, a support agent at the Forest Rights Helpline. You assist claimants with FRA cases using the FRA Atlas. You are empathetic and bilingual (English + Hindi).`
      // ⚠️ Keep task concise, not the full sample convo. 
      // You can still pass conversation examples separately if needed.
    }

    const response = await axios.post("https://api.bland.ai/v1/calls", data, { headers })

    return NextResponse.json({ success: true, data: response.data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    )
  }
}
