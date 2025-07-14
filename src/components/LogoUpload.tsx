
import { useState, useRef } from 'react';
import { Upload, X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface LogoUploadProps {
  logo?: string;
  onLogoChange: (logo: string) => void;
}

const LogoUpload = ({ logo, onLogoChange }: LogoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onLogoChange(imageUrl);
        toast.success('Logo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const removeLogo = () => {
    onLogoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Logo removed');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Crown className="h-4 w-4 text-primary" />
        <label className="text-base font-medium">Custom Logo/Monogram</label>
      </div>
      
      {logo ? (
        <Card className="relative p-4">
          <div className="flex items-center justify-center">
            <img 
              src={logo} 
              alt="Wedding Logo" 
              className="max-w-32 max-h-32 object-contain rounded-md"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeLogo}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <Card
          className={`border-dashed border-2 p-6 text-center cursor-pointer transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
        >
          <Crown className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Add your wedding logo or monogram
          </p>
          <p className="text-xs text-muted-foreground">
            PNG with transparent background recommended
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
        </Card>
      )}
    </div>
  );
};

export default LogoUpload;
