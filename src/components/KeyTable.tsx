'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { KeyData } from '@/types';
import { getKeyStatusDisplay } from '@/lib/keyUtils';
import { toast } from 'sonner';

interface KeyTableProps {
  keys: KeyData[];
  onKeysUpdate: () => void;
}

export function KeyTable({ keys, onKeysUpdate }: KeyTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredKeys, setFilteredKeys] = useState<KeyData[]>(keys);
  const [loadingStates, setLoadingStates] = useState<Record<string, string>>({});

  useEffect(() => {
    const filtered = keys.filter(key =>
      key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredKeys(filtered);
  }, [keys, searchTerm]);

  const setKeyLoading = (keyId: string, action: string) => {
    setLoadingStates(prev => ({ ...prev, [keyId]: action }));
  };

  const clearKeyLoading = (keyId: string) => {
    setLoadingStates(prev => {
      const newStates = { ...prev };
      delete newStates[keyId];
      return newStates;
    });
  };

  const handlePauseResume = async (key: KeyData) => {
    const newStatus = key.status === 'active' ? 'paused' : 'active';
    const action = newStatus === 'paused' ? 'Pausing' : 'Resuming';
    
    setKeyLoading(key.id, action);

    try {
      const response = await fetch('/api/keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyId: key.id,
          status: newStatus,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        onKeysUpdate();
      } else {
        toast.error(result.message || `Failed to ${newStatus} key`);
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.error(`${action} key error:`, error);
    } finally {
      clearKeyLoading(key.id);
    }
  };

  const handleDelete = async (key: KeyData) => {
    if (!confirm(`Are you sure you want to delete the key "${key.key}"?`)) {
      return;
    }

    setKeyLoading(key.id, 'Deleting');

    try {
      const response = await fetch(`/api/keys?keyId=${key.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        onKeysUpdate();
      } else {
        toast.error(result.message || 'Failed to delete key');
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.error('Delete key error:', error);
    } finally {
      clearKeyLoading(key.id);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Key copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy key');
    }
  };

  const getStatusBadge = (key: KeyData) => {
    const statusInfo = getKeyStatusDisplay(key);
    const variant = statusInfo.status === 'Active' ? 'default' : 
                   statusInfo.status === 'Paused' ? 'secondary' : 'destructive';
    
    return (
      <Badge variant={variant} className="text-xs">
        {statusInfo.status}
        {statusInfo.remainingDays > 0 && ` (${statusInfo.remainingDays}d)`}
      </Badge>
    );
  };

  const getActionButtons = (key: KeyData) => {
    const statusInfo = getKeyStatusDisplay(key);
    const isExpired = statusInfo.status === 'Expired';
    const keyLoading = loadingStates[key.id];

    return (
      <div className="flex space-x-2">
        {!isExpired && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePauseResume(key)}
            disabled={!!keyLoading}
            className="text-xs px-2 py-1"
          >
            {keyLoading === 'Pausing' || keyLoading === 'Resuming' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500 mr-1"></div>
                {keyLoading}...
              </div>
            ) : (
              key.status === 'active' ? 'Pause' : 'Resume'
            )}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDelete(key)}
          disabled={!!keyLoading}
          className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
        >
          {keyLoading === 'Deleting' ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500 mr-1"></div>
              Deleting...
            </div>
          ) : (
            'Delete'
          )}
        </Button>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <span className="text-2xl mr-2">📋</span>
            Generated Keys ({filteredKeys.length})
          </CardTitle>
          <div className="w-64">
            <Input
              placeholder="Search keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredKeys.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {keys.length === 0 ? (
              <div>
                <p className="text-lg mb-2">No keys generated yet</p>
                <p className="text-sm">Generate your first key to get started!</p>
              </div>
            ) : (
              <p>No keys match your search criteria</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeys.map((key) => (
                  <TableRow key={key.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono">
                      <div className="flex items-center space-x-2">
                        <span 
                          className="cursor-pointer hover:text-blue-600 truncate"
                          onClick={() => copyToClipboard(key.key)}
                          title="Click to copy"
                        >
                          {key.key}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {key.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{key.duration} days</TableCell>
                    <TableCell>{key.credits}</TableCell>
                    <TableCell>{getStatusBadge(key)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {getActionButtons(key)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}