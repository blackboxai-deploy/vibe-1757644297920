import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { 
  generateRandomKey, 
  formatCustomKey, 
  validateCustomKey, 
  calculateExpiryDate, 
  getCreditsForDuration, 
  generateKeyId
} from '@/lib/keyUtils';
import { KeyData, KeyGenerationRequest, ApiResponse } from '@/types';

// GET - Retrieve all keys
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const duration = searchParams.get('duration')
    const search = searchParams.get('search')

    // Get keys with optional filters
    const keys = storage.searchKeys({
      status: status as any || 'all',
      type: type as any || 'all',
      duration: duration ? parseInt(duration) as any : 'all',
      search: search || undefined
    })

    return NextResponse.json<ApiResponse<KeyData[]>>({
      success: true,
      data: keys,
      message: 'Keys retrieved successfully'
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to retrieve keys',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Generate new key
export async function POST(request: NextRequest) {
  try {
    const body: KeyGenerationRequest = await request.json();
    const { type, duration, customKey } = body;

    // Validate duration
    if (![7, 14, 30].includes(duration)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid duration. Must be 7, 14, or 30 days.'
      }, { status: 400 });
    }

    // Check credits
    const credits = storage.getUserCredits();
    const requiredCredits = getCreditsForDuration(duration);
    
    if (credits.balance < requiredCredits) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: `Insufficient credits. Required: ${requiredCredits}, Available: ${credits.balance}`
      }, { status: 400 });
    }

    let keyValue: string;
    
    if (type === 'custom') {
      if (!customKey) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: 'Custom key value is required for custom key type'
        }, { status: 400 });
      }

      // Validate custom key
      const validation = validateCustomKey(customKey);
      if (!validation.valid) {
        return NextResponse.json<ApiResponse>({
          success: false,
          message: validation.message
        }, { status: 400 });
      }

      keyValue = formatCustomKey(customKey);
    } else {
      keyValue = generateRandomKey();
    }

    // Check if key already exists
    if (storage.keyExists(keyValue)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Key already exists. Please try a different custom key or generate a new random key.'
      }, { status: 409 });
    }

    // Deduct credits
    const creditDeducted = storage.deductCredits(requiredCredits);
    if (!creditDeducted) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Failed to deduct credits'
      }, { status: 500 });
    }

    // Create new key
    const newKey: KeyData = {
      id: generateKeyId(),
      key: keyValue,
      type,
      credits: requiredCredits,
      duration,
      expiryDate: calculateExpiryDate(duration),
      status: 'active',
      createdAt: new Date(),
      lastModified: new Date()
    };

    // Save key
    storage.addKey(newKey);

    // Get updated credits
    const updatedCredits = storage.getUserCredits();

    return NextResponse.json<ApiResponse<{
      key: KeyData;
      creditsRemaining: number;
    }>>({
      success: true,
      data: {
        key: newKey,
        creditsRemaining: updatedCredits.balance
      },
      message: `Key generated successfully! ${requiredCredits} credits deducted.`
    });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to generate key',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Update key (pause/resume)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyId, status } = body;

    if (!keyId || !status) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Key ID and status are required'
      }, { status: 400 });
    }

    if (!['active', 'paused'].includes(status)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Status must be either "active" or "paused"'
      }, { status: 400 });
    }

    const updated = storage.updateKey(keyId, { status });
    
    if (!updated) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Key not found'
      }, { status: 404 });
    }

    const action = status === 'active' ? 'resumed' : 'paused';
    
    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Key ${action} successfully!`
    });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to update key',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE - Delete key
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Key ID is required'
      }, { status: 400 });
    }

    const deleted = storage.deleteKey(keyId);
    
    if (!deleted) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Key not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Key deleted successfully!'
    });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to delete key',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}