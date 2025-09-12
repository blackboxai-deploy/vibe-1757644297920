import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { UserCredits, CreditTopUpRequest, ApiResponse } from '@/types';

// GET - Get user credits
export async function GET() {
  try {
    const credits = storage.getUserCredits();
    return NextResponse.json<ApiResponse<UserCredits>>({
      success: true,
      data: credits,
      message: 'Credits retrieved successfully'
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to retrieve credits',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST - Top up credits
export async function POST(request: NextRequest) {
  try {
    const body: CreditTopUpRequest = await request.json();
    const { amount } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Top-up amount must be greater than 0'
      }, { status: 400 });
    }

    if (amount > 1000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Maximum top-up amount is 1000 credits'
      }, { status: 400 });
    }

    // Add credits
    storage.addCredits(amount);
    const updatedCredits = storage.getUserCredits();

    return NextResponse.json<ApiResponse<UserCredits>>({
      success: true,
      data: updatedCredits,
      message: `Successfully topped up ${amount} credits!`
    });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to top up credits',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT - Reset credits (for testing/admin purposes)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { balance, totalPurchased } = body;

    if (balance < 0 || totalPurchased < 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Credit values cannot be negative'
      }, { status: 400 });
    }

    const currentCredits = storage.getUserCredits();
    const updatedCredits: UserCredits = {
      ...currentCredits,
      balance: balance ?? currentCredits.balance,
      totalPurchased: totalPurchased ?? currentCredits.totalPurchased,
      lastTopUp: new Date()
    };

    storage.saveUserCredits(updatedCredits);

    return NextResponse.json<ApiResponse<UserCredits>>({
      success: true,
      data: updatedCredits,
      message: 'Credits updated successfully!'
    });

  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to update credits',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}