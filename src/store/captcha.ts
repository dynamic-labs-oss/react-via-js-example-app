import { isCaptchaRequired } from '@dynamic-labs-sdk/client';
import { createStore, useStore } from 'zustand';

import {
  type DeferredPromise,
  createDeferredPromise,
} from '../app/functions/deferredPromise';

type CaptchaStore = {
  promptCaptchaPromise: DeferredPromise<void> | null;
};

export const captchaStore = createStore<CaptchaStore>(() => ({
  promptCaptchaPromise: null,
}));

const getPromptCaptchaPromise = () => {
  return captchaStore.getState().promptCaptchaPromise;
};

export const promptCaptcha = async () => {
  let promptCaptchaPromise = getPromptCaptchaPromise();

  if (promptCaptchaPromise) {
    return promptCaptchaPromise.promise;
  }

  promptCaptchaPromise = createDeferredPromise<void>();

  captchaStore.setState({ promptCaptchaPromise });

  return promptCaptchaPromise.promise;
};

export const setCaptchaResult = (result: boolean) => {
  const promptCaptchaPromise = getPromptCaptchaPromise();

  if (!promptCaptchaPromise) {
    return;
  }

  if (result) {
    promptCaptchaPromise.resolve();
  } else {
    promptCaptchaPromise.reject(new Error('Captcha was dismissed'));
  }

  captchaStore.setState({ promptCaptchaPromise: null });
};

export const useIsCaptchaPromptVisible = () =>
  useStore(captchaStore, (state) => state.promptCaptchaPromise !== null);

export const promptCaptchaIfRequired = async () => {
  if (isCaptchaRequired()) {
    await promptCaptcha();
  }
};
