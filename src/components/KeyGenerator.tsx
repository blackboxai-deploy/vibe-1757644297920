'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeyGenerationRequest, CREDIT_PLANS } from '@/types';
import { toast } from 'sonner';

interface KeyGeneratorProps {
  onKeyGenerated: () => void;
  userCredits: number;
}

export function KeyGenerator({ onKeyGenerated, userCredits }: KeyGeneratorProps) {
  const [keyType, setKeyType] = useState<'random' | 'custom'>('random');
  const [duration, setDuration] = useState<7 | 14 | 30>(7);
  const [customKey, setCustomKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const requiredCredits = CREDIT_PLANS[duration];
  const hasEnoughCredits = userCredits >= requiredCredits;

  const handleGenerate = async () => {
    if (!hasEnoughCredits) {
      toast.error(`Insufficient credits! You need ${requiredCredits} credits but only have ${userCredits}`);
      return;
    }

    if (keyType === 'custom' && !customKey.trim()) {
      toast.error('Please enter a custom key value');
      return;
    }

    setIsGenerating(true);

    const request: KeyGenerationRequest = {
      type: keyType,
      duration,
      ...(keyType === 'custom' && { customKey })
    };

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message, {
          description: `Key: ${result.data.key.key}`,
          duration: 6000,
        });
        
        // Clear form
        setCustomKey('');
        onKeyGenerated();
      } else {
        toast.error(result.message || 'Failed to generate key');
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.error('Key generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center">
          <span className="text-2xl mr-2">🔑</span>
          Generate New Key
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Key Type</Label>
          <RadioGroup
            value={keyType}
            onValueChange={(value) => setKeyType(value as 'random' | 'custom')}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="random" id="random" />
              <Label htmlFor="random" className="cursor-pointer">
                Random Key
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="cursor-pointer">
                Custom Key
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Custom Key Input */}
        {keyType === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="custom-key" className="text-sm font-medium">
              Custom Key Value
            </Label>
            <Input
              id="custom-key"
              type="text"
              placeholder="Enter your custom key (e.g., my-special-key)"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="w-full"
              maxLength={50}
            />
            <p className="text-xs text-gray-500">
              Will be formatted as: hg-{customKey ? customKey.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'your-key'}
            </p>
          </div>
        )}

        {/* Duration Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Duration</Label>
          <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value) as 7 | 14 | 30)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">
                <div className="flex justify-between items-center w-full">
                  <span>7 days</span>
                  <span className="ml-4 text-sm text-gray-500">1.0 credit</span>
                </div>
              </SelectItem>
              <SelectItem value="14">
                <div className="flex justify-between items-center w-full">
                  <span>14 days</span>
                  <span className="ml-4 text-sm text-gray-500">2.0 credits</span>
                </div>
              </SelectItem>
              <SelectItem value="30">
                <div className="flex justify-between items-center w-full">
                  <span>30 days</span>
                  <span className="ml-4 text-sm text-gray-500">3.5 credits</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Credit Info */}
        <div className={`p-3 rounded-lg border ${hasEnoughCredits ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex justify-between items-center text-sm">
            <span>Credits Required:</span>
            <span className="font-semibold">{requiredCredits}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Your Balance:</span>
            <span className={`font-semibold ${hasEnoughCredits ? 'text-green-600' : 'text-red-600'}`}>
              {userCredits}
            </span>
          </div>
          {!hasEnoughCredits && (
            <p className="text-xs text-red-600 mt-1">
              Insufficient credits! Please top up to continue.
            </p>
          )}
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !hasEnoughCredits}
          className={`w-full py-3 text-base font-semibold ${
            hasEnoughCredits 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Key...
            </div>
          ) : (
            `Generate Key (${requiredCredits} credits)`
          )}
        </Button>

        {/* Key Preview */}
        {keyType === 'random' && (
          <div className="text-xs text-gray-500 text-center">
            Generated key will look like: <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">hg-Ab3Kf7Mn2Qr8Sv1Z</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}