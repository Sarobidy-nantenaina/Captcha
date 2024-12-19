'use client';

import { useState, useEffect, useCallback } from "react";

function Home() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaRequired, setCaptchaRequired] = useState<boolean>(false);
  const [captchaSolved, setCaptchaSolved] = useState<boolean>(false);
  const [forbiddenCount, setForbiddenCount] = useState<number>(0);

  const loadCaptchaScript = useCallback(() => {
    const script = document.createElement("script");
    script.src =
      "https://b82b1763d1c3.eu-west-3.captcha-sdk.awswaf.com/b82b1763d1c3/jsapi.js";
    script.defer = true; // Changed from async to defer for correct script loading
    script.onload = () => {
      // Initialize CAPTCHA once the script is loaded
      if (window.AwsWafIntegration) {
        window.AwsWafIntegration.init({
          onCaptchaSuccess: () => {
            setCaptchaSolved(true);
            setCaptchaRequired(false);
          },
          onCaptchaError: () => {
            setCaptchaSolved(false);
            setCaptchaRequired(true);
          },
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (captchaRequired && !captchaSolved) {
      loadCaptchaScript();
    }
  }, [captchaRequired, captchaSolved, loadCaptchaScript]);

  const fetchWhoAmI = async () => {
    try {
      const response = await fetch("https://api.prod.jcloudify.com/whoami", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        if (response.status === 405) {
          setCaptchaRequired(true); // Trigger CAPTCHA requirement after HTTP 405 response
          return;
        } else if (response.status === 403) {
          setForbiddenCount((prev) => prev + 1);
          setSequence((prev) => [...prev, "Forbidden"]);
          return;
        } else {
          throw new Error(`Erreur API: ${response.statusText}`);
        }
      }
      const data = await response.text();
      setSequence((prev) => [...prev, data]);
    } catch (error) {
      console.error("Erreur:", error);
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
    }
  };

  const fetchSequence = async (n: number) => {
    try {
      setLoading(true);
      setError(null);
      setSequence([]);
      setCaptchaRequired(false);
      setCaptchaSolved(false);
      setForbiddenCount(0);

      for (let i = 1; i <= n; i++) {
        await fetchWhoAmI();
        if (captchaRequired && !captchaSolved) {
          await new Promise<void>((resolve) => {
            const checkCaptcha = setInterval(() => {
              if (captchaSolved) {
                clearInterval(checkCaptcha);
                resolve();
              }
            }, 1000);
          });
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const n = parseInt(formData.get("n") as string, 10);
    fetchSequence(n);
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gradient-to-b from-[#0D0D0D] to-[#1a1a1a] bg-opacity-90 backdrop-blur-lg"
      style={{
        background:
          "linear-gradient(90deg, rgba(9,9,121,1) 22%, rgba(2,0,36,1) 57%, rgba(0,212,255,1) 100%)",
      }}
    >
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7B61FF] to-[#FF47B4]">
        CAPTCHA 
      </h1>

      <div
        className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white/10 backdrop-blur-[10px] shadow-lg border border-white/20"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          borderRadius: "10px",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        {error && (
          <div className="text-red-400 mb-4 bg-red-500/10 backdrop-blur-[10px] p-3 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B61FF]"></div>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-4"
            >
              <label htmlFor="n" className="text-lg text-white/80 font-medium">
                Entrez un nombre entre 1 et 1000:
              </label>
              <input
                type="number"
                id="n"
                name="n"
                min="1"
                max="1000"
                required
                className="px-4 py-2 bg-white/10 backdrop-blur-[10px] text-white/80 rounded-lg border border-white/20"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#7B61FF] to-[#FF47B4] hover:opacity-90 text-white/80 rounded-lg transition-colors duration-300 border border-white/20"
              >
                Soumettre
              </button>
            </form>

            {sequence.length > 0 && (
              <div className="text-white/80 mt-4">
                <h2>Résultat:</h2>
                <ul>
                  {sequence.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
                {forbiddenCount > 0 && (
                  <div className="text-red-400 mt-2">
                    Nombre d'erreurs 403: {forbiddenCount}
                  </div>
                )}
              </div>
            )}

            {captchaRequired && !captchaSolved && (
              <div className="mt-4">
                <div id="captcha-container"></div> {/* CAPTCHA will be rendered here */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
