import { setCaptchaToken } from '@dynamic-labs-sdk/client';
import HCaptcha from '@hcaptcha/react-hcaptcha';

import { Button } from '../../../components/ui/button';
import {
  setCaptchaResult,
  useIsCaptchaPromptVisible,
} from '../../../store/captcha';
import { dynamicClient } from '../../constants/dynamicClient';

export const Captcha = () => {
  const showHCaptchaPrompt = useIsCaptchaPromptVisible();

  const siteKey = dynamicClient.projectSettings?.security.hCaptcha?.siteKey;

  if (!siteKey || !showHCaptchaPrompt) {
    return null;
  }

  const onCaptchaVerify = (token: string) => {
    setCaptchaToken({ captchaToken: token });
    setCaptchaResult(true);
  };

  const onCancel = () => {
    setCaptchaResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card p-6 rounded-xl border border-border/60 shadow-lg">
        <form data-testid="captcha-form" className="flex flex-col gap-4">
          <HCaptcha
            sitekey={siteKey}
            onVerify={onCaptchaVerify}
            theme="light"
          />

          <Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </form>
      </div>
    </div>
  );
};
