import { NextRequest, NextResponse } from 'next/server'
import { orchestrate } from '@/lib/agents/orchestrator'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const result = await orchestrate(title, description || '')

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Orchestration error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
