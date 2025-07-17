
import { Download, Image, FileText, Video, Music, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreditActionButton from './CreditActionButton';
import { useCredits } from '@/hooks/useCredits';
import { downloadAsImage, downloadAsPDF } from '@/utils/downloadUtils';

interface DownloadSectionProps {
  cardId: string;
}

const DownloadSection = ({ cardId }: DownloadSectionProps) => {
  const { CREDIT_COSTS } = useCredits();

  const handleDownloadLowRes = async () => {
    await downloadAsImage(cardId, 'wedding-card-low-res', 'low');
  };

  const handleDownloadHighRes = async () => {
    await downloadAsImage(cardId, 'wedding-card-high-res', 'high');
  };

  const handleDownloadPDF = async () => {
    await downloadAsPDF(cardId, 'wedding-card');
  };

  const handleDownloadVideo = async () => {
    // Video download logic would go here
    throw new Error('Video download feature coming soon!');
  };

  const handleAddMusic = async () => {
    // Music addition logic would go here
    throw new Error('Music feature coming soon!');
  };

  const handleAIVoiceover = async () => {
    // AI voiceover logic would go here
    throw new Error('AI voiceover feature coming soon!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download & Features
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CreditActionButton
            creditCost={CREDIT_COSTS.DOWNLOAD_LOW_RES}
            actionType="download_low_res"
            actionName="Download Low-Res Image"
            onAction={handleDownloadLowRes}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Image className="mr-2 h-4 w-4" />
            Low-Res Image
            <Badge variant="secondary" className="ml-auto">
              {CREDIT_COSTS.DOWNLOAD_LOW_RES}
            </Badge>
          </CreditActionButton>

          <CreditActionButton
            creditCost={CREDIT_COSTS.DOWNLOAD_HIGH_RES}
            actionType="download_high_res"
            actionName="Download High-Res Image"
            onAction={handleDownloadHighRes}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Image className="mr-2 h-4 w-4" />
            High-Res Image
            <Badge variant="secondary" className="ml-auto">
              {CREDIT_COSTS.DOWNLOAD_HIGH_RES}
            </Badge>
          </CreditActionButton>

          <CreditActionButton
            creditCost={CREDIT_COSTS.DOWNLOAD_PDF}
            actionType="download_pdf"
            actionName="Download PDF"
            onAction={handleDownloadPDF}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
            <Badge variant="secondary" className="ml-auto">
              {CREDIT_COSTS.DOWNLOAD_PDF}
            </Badge>
          </CreditActionButton>

          <CreditActionButton
            creditCost={CREDIT_COSTS.DOWNLOAD_VIDEO}
            actionType="download_video"
            actionName="Download Video Card"
            onAction={handleDownloadVideo}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Video className="mr-2 h-4 w-4" />
            Video Card
            <Badge variant="secondary" className="ml-auto">
              {CREDIT_COSTS.DOWNLOAD_VIDEO}
            </Badge>
          </CreditActionButton>

          <CreditActionButton
            creditCost={CREDIT_COSTS.ADD_MUSIC}
            actionType="add_music"
            actionName="Add Background Music"
            onAction={handleAddMusic}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Music className="mr-2 h-4 w-4" />
            Add Music
            <Badge variant="secondary" className="ml-auto">
              {CREDIT_COSTS.ADD_MUSIC}
            </Badge>
          </CreditActionButton>

          <CreditActionButton
            creditCost={CREDIT_COSTS.AI_VOICEOVER}
            actionType="ai_voiceover"
            actionName="AI Voiceover"
            onAction={handleAIVoiceover}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Mic className="mr-2 h-4 w-4" />
            AI Voiceover
            <Badge variant="secondary" className="ml-auto">
              {CREDIT_COSTS.AI_VOICEOVER}
            </Badge>
          </CreditActionButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadSection;
