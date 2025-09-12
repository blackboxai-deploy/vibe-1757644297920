import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { ApiResponse } from '@/types';

// GET - Get key statistics
export async function GET() {
  try {
    const stats = storage.getKeyStats();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: stats,
      message: 'Statistics retrieved successfully'
    });
  } catch (error) {
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Failed to retrieve statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}