declare global {
  interface Window {
    AwsWafIntegration: {
      init: (options: { onCaptchaSuccess: () => void }) => void;
    };
  }
}

export {}; 