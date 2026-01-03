import { useState } from 'react';
import { AppIntake } from '@/types/karma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VercelPWAPromptCardProps {
  app: AppIntake;
}

function generateVercelPWAPrompt(app: AppIntake): string {
  const prompt = `Prepare "${app.name}" for Vercel PWA deployment.

CONSTRAINTS:
- Do NOT redesign the app
- Do NOT add new features
- Preserve the original intent: "${app.description}"
- Target user: ${app.intendedUser}

PWA REQUIREMENTS:
1. Add or verify manifest.json with:
   - name: "${app.name}"
   - short_name: "${app.name.split(' ').slice(0, 2).join(' ')}"
   - start_url: "/"
   - display: "standalone"
   - background_color and theme_color matching brand
   - Icons: 192x192 and 512x512 PNG

2. Register service worker for offline capability:
   - Cache static assets
   - Handle offline gracefully with fallback UI

3. Verify installability:
   - App can be added to home screen
   - Splash screen displays correctly

4. Build verification:
   - Run \`npm run build\` and confirm no errors
   - Test production build locally
   - Verify all routes load without 404s

5. Meta tags:
   - viewport meta tag present
   - theme-color meta tag matching manifest
   - apple-touch-icon link tags

${app.repoUrl ? `REPOSITORY: ${app.repoUrl}` : 'REPOSITORY: Not yet linked'}

After completing, confirm:
✅ manifest.json present and valid
✅ Service worker registered
✅ Build passes without errors
✅ App installable as PWA`;

  return prompt;
}

export function VercelPWAPromptCard({ app }: VercelPWAPromptCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const vercelPrompt = generateVercelPWAPrompt(app);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(vercelPrompt);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Vercel/PWA prompt copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please select and copy manually',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="border-blue-500/50 bg-blue-500/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-blue-600">
          <Cloud className="h-4 w-4" />
          Vercel / PWA Prompt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">APP: {app.name}</p>
          {app.repoUrl && (
            <p className="text-xs text-muted-foreground mb-2">REPO: {app.repoUrl}</p>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">COPY-PASTE PWA PROMPT:</p>
          <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
            {vercelPrompt}
          </div>
        </div>

        <Button 
          onClick={handleCopy} 
          className="w-full"
          variant={copied ? 'outline' : 'default'}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Vercel/PWA Prompt
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Use in Lovable, Rork, or Claude to prepare for Vercel deployment.
        </p>
      </CardContent>
    </Card>
  );
}
