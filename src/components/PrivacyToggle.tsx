import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff } from 'lucide-react';

interface PrivacyToggleProps {
  isPublic: boolean;
  onToggle: (isPublic: boolean) => void;
  disabled?: boolean;
}

export const PrivacyToggle = ({ isPublic, onToggle, disabled }: PrivacyToggleProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/30">
        <div className="flex items-center space-x-2 flex-1">
          {isPublic ? (
            <Eye className="h-4 w-4 text-amber-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-green-600" />
          )}
          <Label htmlFor="privacy-toggle" className="text-sm font-medium cursor-pointer">
            {isPublic ? 'Public' : 'Private'} Sharing
          </Label>
        </div>
        <Switch
          id="privacy-toggle"
          checked={isPublic}
          onCheckedChange={onToggle}
          disabled={disabled}
        />
      </div>
      
      <Alert className={isPublic ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50"}>
        <Shield className={`h-4 w-4 ${isPublic ? 'text-amber-600' : 'text-green-600'}`} />
        <AlertDescription className={isPublic ? 'text-amber-800' : 'text-green-800'}>
          {isPublic 
            ? "⚠️ Your wedding card will be discoverable by anyone with the link. Personal information will be visible to all visitors."
            : "🔒 Your wedding card is private. Only people with the exact link can view it, and it won't appear in any public listings."
          }
        </AlertDescription>
      </Alert>
    </div>
  );
};