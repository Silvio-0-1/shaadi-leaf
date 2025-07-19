
import { Download, Image, FileText } from 'lucide-react';
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

  const handleDownloadImage = async () => {
    await downloadAsImage(cardId, 'wedding-card', 'high');
  };

  const handleDownloadPDF = async () => {
    await downloadAsPDF(cardId, 'wedding-card');
  };

  const handleShareableLink = async () => {
    // Shareable link logic would go here
    console.log('Creating shareable link...');
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CreditActionButton
            creditCost={CREDIT_COSTS.DOWNLOAD_HIGH_RES}
            actionType="download_image"
            actionName="Download Image"
            onAction={handleDownloadImage}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Image className="mr-2 h-4 w-4" />
            Download Image
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
            Download PDF
            <Badge variant="secondary" className="ml-auto">
              {CREDIT_COSTS.DOWNLOAD_PDF}
            </Badge>
          </CreditActionButton>

          <CreditActionButton
            creditCost={0}
            actionType="shareable_link"
            actionName="Create Shareable Link"
            onAction={handleShareableLink}
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Download className="mr-2 h-4 w-4" />
            Shareable Link
            <Badge variant="secondary" className="ml-auto">
              Free
            </Badge>
          </CreditActionButton>
        </div>
      </CardContent>
    </Card>
  );
};

export default DownloadSection;
