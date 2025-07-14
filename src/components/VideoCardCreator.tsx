
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, Download, Music, Sparkles, Video } from 'lucide-react';
import { VideoCardData } from '@/types';
import { toast } from 'sonner';

interface VideoCardCreatorProps {
  cardData: VideoCardData;
  onDataChange: (data: Partial<VideoCardData>) => void;
}

const VideoCardCreator = ({ cardData, onDataChange }: VideoCardCreatorProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const musicTracks = [
    { id: 'romantic-piano', name: 'Romantic Piano', duration: 30 },
    { id: 'wedding-bells', name: 'Wedding Bells', duration: 45 },
    { id: 'classical-strings', name: 'Classical Strings', duration: 60 },
    { id: 'gentle-acoustic', name: 'Gentle Acoustic', duration: 30 },
    { id: 'orchestral-love', name: 'Orchestral Love Theme', duration: 90 }
  ];

  const transitionStyles = [
    { id: 'fade', name: 'Fade' },
    { id: 'slide', name: 'Slide' },
    { id: 'heart-wipe', name: 'Heart Wipe' },
    { id: 'floral-bloom', name: 'Floral Bloom' },
    { id: 'sparkle', name: 'Sparkle Effect' }
  ];

  const animationStyles = [
    { id: 'gentle', name: 'Gentle Movement' },
    { id: 'floating', name: 'Floating Elements' },
    { id: 'romantic', name: 'Romantic Glow' },
    { id: 'elegant', name: 'Elegant Zoom' },
    { id: 'dynamic', name: 'Dynamic Flow' }
  ];

  const updateVideoSettings = (key: string, value: any) => {
    onDataChange({
      videoSettings: {
        ...cardData.videoSettings,
        [key]: value
      }
    });
  };

  const generateVideoPreview = async () => {
    setIsGenerating(true);
    toast.info('Generating video preview...');
    
    // Simulate video generation (in real app, this would call a video generation API)
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Video preview generated!');
    }, 3000);
  };

  const downloadVideo = async () => {
    toast.info('Preparing video download...');
    // In a real implementation, this would trigger video generation and download
    setTimeout(() => {
      toast.success('Video downloaded successfully!');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Video className="h-5 w-5 text-primary" />
          <h3 className="font-serif text-xl font-semibold">Video Card Settings</h3>
        </div>

        <div className="space-y-6">
          {/* Duration */}
          <div className="space-y-3">
            <Label>Video Duration: {cardData.videoSettings?.duration || 30} seconds</Label>
            <Slider
              value={[cardData.videoSettings?.duration || 30]}
              onValueChange={(value) => updateVideoSettings('duration', value[0])}
              max={120}
              min={15}
              step={15}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>15s</span>
              <span>30s</span>
              <span>60s</span>
              <span>120s</span>
            </div>
          </div>

          {/* Music Track */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <Music className="h-4 w-4 mr-2" />
              Background Music
            </Label>
            <Select 
              value={cardData.videoSettings?.musicTrack || ''} 
              onValueChange={(value) => updateVideoSettings('musicTrack', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose background music" />
              </SelectTrigger>
              <SelectContent>
                {musicTracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.name} ({track.duration}s)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Animation Style */}
          <div className="space-y-2">
            <Label className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2" />
              Animation Style
            </Label>
            <Select 
              value={cardData.videoSettings?.animationStyle || 'gentle'} 
              onValueChange={(value) => updateVideoSettings('animationStyle', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select animation style" />
              </SelectTrigger>
              <SelectContent>
                {animationStyles.map((style) => (
                  <SelectItem key={style.id} value={style.id}>
                    {style.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transitions */}
          <div className="space-y-2">
            <Label>Transition Effects</Label>
            <div className="grid grid-cols-2 gap-2">
              {transitionStyles.map((transition) => (
                <button
                  key={transition.id}
                  onClick={() => {
                    const currentTransitions = cardData.videoSettings?.transitions || [];
                    const isSelected = currentTransitions.includes(transition.id);
                    const newTransitions = isSelected
                      ? currentTransitions.filter(t => t !== transition.id)
                      : [...currentTransitions, transition.id];
                    updateVideoSettings('transitions', newTransitions);
                  }}
                  className={`p-2 text-sm rounded border transition-all ${
                    (cardData.videoSettings?.transitions || []).includes(transition.id)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {transition.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Video Preview */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Video Preview</h4>
        <div className="aspect-video bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
          {isGenerating ? (
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generating preview...</p>
            </div>
          ) : (
            <div className="text-center">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">Video preview will appear here</p>
              <Button onClick={generateVideoPreview} className="wedding-gradient">
                <Play className="h-4 w-4 mr-2" />
                Generate Preview
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button 
          onClick={generateVideoPreview}
          disabled={isGenerating}
          variant="outline"
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
              Generating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Preview Video
            </>
          )}
        </Button>
        
        <Button 
          onClick={downloadVideo}
          className="wedding-gradient w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Video
        </Button>
      </div>
    </div>
  );
};

export default VideoCardCreator;
