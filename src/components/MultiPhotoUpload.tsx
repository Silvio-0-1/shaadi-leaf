
import { useState, useRef } from 'react';
import { Upload, X, Image, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface MultiPhotoUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  photoShape?: 'square' | 'circle' | 'rounded';
  onPhotoShapeChange?: (shape: 'square' | 'circle' | 'rounded') => void;
}

const MultiPhotoUpload = ({ 
  images, 
  onImagesChange, 
  maxImages = 4,
  photoShape = 'rounded',
  onPhotoShapeChange
}: MultiPhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList) => {
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);
    
    if (filesToProcess === 0) {
      toast.warning('Maximum number of images reached');
      return;
    }

    const processedImages: string[] = [];
    let processedCount = 0;

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          processedImages.push(imageUrl);
          processedCount++;
          
          // Only update when all files are processed
          if (processedCount === filesToProcess) {
            onImagesChange([...images, ...processedImages]);
            toast.success(`${processedImages.length} image(s) uploaded successfully!`);
          }
        };
        reader.readAsDataURL(file);
      } else {
        processedCount++;
        if (processedCount === filesToProcess && processedImages.length > 0) {
          onImagesChange([...images, ...processedImages]);
          toast.success(`${processedImages.length} image(s) uploaded successfully!`);
        }
      }
    }

    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} more image(s) can be added`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.success('Image removed');
  };

  const canAddMore = images.length < maxImages;

  const getImageClasses = () => {
    const baseClasses = "w-full h-24 object-cover";
    switch (photoShape) {
      case 'circle':
        return `${baseClasses} rounded-full`;
      case 'square':
        return `${baseClasses} rounded-none`;
      case 'rounded':
      default:
        return `${baseClasses} rounded-md`;
    }
  };

  const getPreviewContainerClasses = () => {
    // For the preview grid, we use aspect-square to ensure perfect squares/circles
    const baseClasses = "aspect-square overflow-hidden";
    switch (photoShape) {
      case 'circle':
        return `${baseClasses} rounded-full`;
      case 'square':
        return `${baseClasses} rounded-none`;
      case 'rounded':
      default:
        return `${baseClasses} rounded-md`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {images.length}/{maxImages} photos
        </span>
      </div>

      {/* Photo Shape Selector */}
      {onPhotoShapeChange && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Photo Shape</Label>
          <Select value={photoShape} onValueChange={onPhotoShapeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select photo shape" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rounded">Rounded</SelectItem>
              <SelectItem value="square">Square</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="relative p-2 group">
            <div className={getPreviewContainerClasses()}>
              <img 
                src={image} 
                alt={`Wedding photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Card>
        ))}

        {/* Add More Button */}
        {canAddMore && (
          <Card
            className={`border-dashed border-2 p-4 text-center cursor-pointer transition-colors h-32 flex flex-col items-center justify-center ${
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
            <Plus className="h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Add Photo</p>
          </Card>
        )}
      </div>

      {/* Upload Area (when no images) */}
      {images.length === 0 && (
        <Card
          className={`border-dashed border-2 p-8 text-center cursor-pointer transition-colors ${
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
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag & drop images or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Add up to {maxImages} photos • JPG, PNG up to 5MB each
          </p>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={className}>{children}</label>
);

export default MultiPhotoUpload;
