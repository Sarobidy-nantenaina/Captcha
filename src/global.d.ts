declare global {
  interface Window {
    AwsWafIntegration: {
      init: (options: {
        onCaptchaSuccess: () => void;
        onCaptchaError: () => void;
      }) => void;
    };
  }
}

export {}; 