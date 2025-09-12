import { NextRequest, NextResponse } from 'next/server'
import { KeyGenerationRequest, ApiResponse, KeyData } from '@/types'
import { 
  generateRandomKey, 
  formatCustomKey, 
  validateCustomKey, 
  calculateExpiryDate, 
  getCreditsForDuration,
  generateKeyId
} from '@/lib/keyUtils'
import { storage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const body: KeyGenerationRequest = await request.json()
    
    // Validate request
    if (!body.type || !body.duration) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Missing required fields: type and duration'
      }, { status: 400 })
    }

    if (!['random', 'custom'].includes(body.type)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid key type. Must be "random" or "custom"'
      }, { status: 400 })
    }

    if (![7, 14, 30].includes(body.duration)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid duration. Must be 7, 14, or 30 days'
      }, { status: 400 })
    }

    // Validate custom key if provided
    if (body.type === 'custom') {
      if (!body.customKey) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Custom key is required when type is "custom"'
        }, { status: 400 })
      }

      const validation = validateCustomKey(body.customKey)
      if (!validation.valid) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: validation.message
        }, { status: 400 })
      }
    }

    // Check user credits
    const userCredits = storage.getUserCredits()
    const requiredCredits = getCreditsForDuration(body.duration)

    if (userCredits.balance < requiredCredits) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: `Insufficient credits. Required: ${requiredCredits}, Available: ${userCredits.balance.toFixed(1)}`
      }, { status: 400 })
    }

    // Generate key
    let keyValue: string
    try {
      if (body.type === 'random') {
        keyValue = generateRandomKey()
      } else {
        keyValue = formatCustomKey(body.customKey!)
      }
    } catch (error) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate key'
      }, { status: 400 })
    }

    // Check if key already exists
    if (storage.keyExists(keyValue)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'This key already exists. Please try a different custom key or generate a random one.'
      }, { status: 409 })
    }

    // Deduct credits
    const creditDeducted = storage.deductCredits(requiredCredits)
    if (!creditDeducted) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Failed to deduct credits. Please try again.'
      }, { status: 500 })
    }

    // Create key object
    const now = new Date()
    const newKey: KeyData = {
      id: generateKeyId(),
      key: keyValue,
      type: body.type,
      credits: requiredCredits,
      duration: body.duration,
      expiryDate: calculateExpiryDate(body.duration),
      status: 'active',
      createdAt: now,
      lastModified: now
    }

    // Save key
    storage.addKey(newKey)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { key: newKey },
      message: 'Key generated successfully'
    })

  } catch (error) {
    console.error('Error in key generation:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}