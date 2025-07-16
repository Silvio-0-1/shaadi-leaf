
import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, Pause, Download, Music, Sparkles, Video, Volume2 } from 'lucide-react';
import { VideoCardData } from '@/types';
import { toast } from 'sonner';

interface VideoCardCreatorProps {
  cardData: VideoCardData;
  onDataChange: (data: Partial<VideoCardData>) => void;
}

const VideoCardCreator = ({ cardData, onDataChange }: VideoCardCreatorProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const musicTracks = [
    { id: 'romantic-piano', name: 'Romantic Piano', duration: 30, url: '/audio/romantic-piano.mp3' },
    { id: 'wedding-bells', name: 'Wedding Bells', duration: 45, url: '/audio/wedding-bells.mp3' },
    { id: 'classical-strings', name: 'Classical Strings', duration: 60, url: '/audio/classical-strings.mp3' },
    { id: 'gentle-acoustic', name: 'Gentle Acoustic', duration: 30, url: '/audio/gentle-acoustic.mp3' },
    { id: 'orchestral-love', name: 'Orchestral Love Theme', duration: 90, url: '/audio/orchestral-love.mp3' }
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
    if (!cardData.brideName || !cardData.groomName) {
      toast.error('Please add bride and groom names first');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating video preview...');
    
    try {
      // Create a video preview using canvas animation
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 800;
      canvas.height = 1200;

      // Create frames for animation
      const frames: ImageData[] = [];
      const duration = cardData.videoSettings?.duration || 30;
      const fps = 24;
      const totalFrames = duration * fps;

      for (let frame = 0; frame < totalFrames; frame++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#fdf2f8');
        gradient.addColorStop(1, '#fce7f3');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Animated elements based on frame
        const progress = frame / totalFrames;
        
        // Floating hearts animation
        if (cardData.videoSettings?.animationStyle === 'floating') {
          for (let i = 0; i < 5; i++) {
            const x = 100 + i * 150 + Math.sin(progress * 4 + i) * 20;
            const y = 200 + Math.cos(progress * 3 + i) * 30;
            const opacity = 0.3 + Math.sin(progress * 2 + i) * 0.2;
            
            ctx.fillStyle = `rgba(244, 63, 94, ${opacity})`;
            ctx.font = '24px serif';
            ctx.fillText('♥', x, y);
          }
        }

        // Names with fade-in effect
        const nameOpacity = Math.min(1, progress * 3);
        ctx.fillStyle = `rgba(244, 63, 94, ${nameOpacity})`;
        ctx.font = 'bold 48px serif';
        ctx.textAlign = 'center';
        
        const brideName = cardData.brideName;
        const groomName = cardData.groomName;
        
        ctx.fillText(brideName, canvas.width / 2, canvas.height / 2 - 50);
        ctx.fillText('&', canvas.width / 2, canvas.height / 2);
        ctx.fillText(groomName, canvas.width / 2, canvas.height / 2 + 50);

        // Wedding date
        if (cardData.weddingDate) {
          ctx.fillStyle = `rgba(107, 114, 128, ${nameOpacity})`;
          ctx.font = '24px serif';
          const date = new Date(cardData.weddingDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          ctx.fillText(date, canvas.width / 2, canvas.height / 2 + 120);
        }

        frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      }

      // Convert frames to video blob (simplified for demo)
      const videoBlob = await createVideoFromFrames(frames, fps);
      const videoUrl = URL.createObjectURL(videoBlob);
      setVideoPreviewUrl(videoUrl);
      
      setIsGenerating(false);
      toast.success('Video preview generated!');
    } catch (error) {
      console.error('Video generation error:', error);
      setIsGenerating(false);
      toast.error('Failed to generate video preview');
    }
  };

  const createVideoFromFrames = async (frames: ImageData[], fps: number): Promise<Blob> => {
    // In a real implementation, you would use WebCodecs API or a library like FFmpeg.js
    // For now, we'll create a simple animated WebM using MediaRecorder
    
    const canvas = canvasRef.current;
    if (!canvas) throw new Error('Canvas not available');
    
    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: BlobPart[] = [];
    
    return new Promise((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
      
      recorder.onerror = reject;
      
      recorder.start();
      
      // Animate the canvas for recording
      let frameIndex = 0;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const animate = () => {
        if (frameIndex < frames.length) {
          ctx.putImageData(frames[frameIndex], 0, 0);
          frameIndex++;
          setTimeout(animate, 1000 / fps);
        } else {
          recorder.stop();
        }
      };
      
      animate();
    });
  };

  const downloadVideo = async () => {
    if (!videoPreviewUrl) {
      toast.error('Please generate a video preview first');
      return;
    }

    toast.info('Preparing video download...');
    
    try {
      const link = document.createElement('a');
      link.href = videoPreviewUrl;
      link.download = `${cardData.brideName}-${cardData.groomName}-wedding-video.webm`;
      link.click();
      
      toast.success('Video downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download video');
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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
                    <div className="flex items-center">
                      <Volume2 className="h-3 w-3 mr-2" />
                      {track.name} ({track.duration}s)
                    </div>
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
        <div className="aspect-video bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25 relative overflow-hidden">
          {videoPreviewUrl ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={videoPreviewUrl}
                className="w-full h-full object-cover rounded-lg"
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
              <button
                onClick={togglePlayback}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </button>
            </div>
          ) : isGenerating ? (
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generating video preview...</p>
              <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
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
        
        {/* Hidden canvas for video generation */}
        <canvas ref={canvasRef} className="hidden" />
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
              {videoPreviewUrl ? 'Regenerate' : 'Generate'} Preview
            </>
          )}
        </Button>
        
        <Button 
          onClick={downloadVideo}
          disabled={!videoPreviewUrl}
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
