'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCredits } from '@/types';
import { toast } from 'sonner';

interface CreditManagerProps {
  credits: UserCredits;
  onCreditsUpdate: () => void;
}

export function CreditManager({ credits, onCreditsUpdate }: CreditManagerProps) {
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid top-up amount');
      return;
    }

    if (amount > 1000) {
      toast.error('Maximum top-up amount is 1000 credits');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message, {
          description: `Your balance is now ${result.data.balance} credits`,
        });
        setTopUpAmount('');
        onCreditsUpdate();
      } else {
        toast.error(result.message || 'Failed to top up credits');
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.error('Top-up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickTopUpAmounts = [10, 25, 50, 100];

  const handleQuickTopUp = (amount: number) => {
    setTopUpAmount(amount.toString());
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <span className="text-2xl mr-2">💰</span>
          Credit Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold text-blue-600">
                {credits.balance.toFixed(1)} Credits
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Used</p>
              <p className="text-lg font-semibold text-gray-800">
                {credits.totalUsed.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Top-up Section */}
        <div className="space-y-4">
          <Label htmlFor="topup-amount" className="text-base font-medium">
            Top-up Credits
          </Label>
          
          {/* Quick Top-up Buttons */}
          <div className="flex gap-2 flex-wrap">
            {quickTopUpAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => handleQuickTopUp(amount)}
                className="px-3 py-1 text-sm"
              >
                +{amount}
              </Button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="topup-amount"
                type="number"
                placeholder="Enter amount"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                min="1"
                max="1000"
                step="0.5"
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleTopUp}
              disabled={isLoading || !topUpAmount}
              className="px-6 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Top Up'
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Maximum top-up: 1000 credits per transaction
          </p>
        </div>

        {/* Credit Pricing Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Credit Pricing</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>7 days key:</span>
              <span className="font-medium">1.0 credit</span>
            </div>
            <div className="flex justify-between">
              <span>14 days key:</span>
              <span className="font-medium">2.0 credits</span>
            </div>
            <div className="flex justify-between">
              <span>30 days key:</span>
              <span className="font-medium">3.5 credits</span>
            </div>
          </div>
        </div>

        {/* Last Top-up Info */}
        {credits.lastTopUp && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Last top-up: {new Date(credits.lastTopUp).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}