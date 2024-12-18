"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

function Home() {
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [captchaImages, setCaptchaImages] = useState<string[]>([]);
  const [captchaType, setCaptchaType] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [correctIndices, setCorrectIndices] = useState<number[]>([]);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Définir les types de CAPTCHA possibles avec leurs traductions
  const captchaTypes = [
    { en: "car", fr: "voitures" },  
    { en: "house", fr: "maisons" },
    { en: "dog", fr: "chiens" },
    { en: "cat", fr: "chats" },
    { en: "tree", fr: "arbres" },
    { en: "mountain", fr: "montagnes" },
    { en: "bicycle", fr: "vélos" },
    { en: "plane", fr: "avions" },
    { en: "boat", fr: "bateaux" },
    { en: "flower", fr: "fleurs" },
    { en: "river", fr: "rivières" },
    { en: "bridge", fr: "ponts" },
    { en: "street", fr: "rues" },
    { en: "sun", fr: "soleil" },
    { en: "moon", fr: "lune" },
    { en: "cloud", fr: "nuages" }
  ];
  const UNSPLASH_ACCESS_KEY = "DElUL9khuvfe4vL5kNyamDOHkyw2qLIGyWQWrCC_pw0";

  // Générer un nouveau CAPTCHA avec des images depuis Unsplash
  const generateCaptcha = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsVerified(false);
      
      // Choisir un type aléatoire de CAPTCHA parmi captchaTypes
      const randomType = captchaTypes[Math.floor(Math.random() * captchaTypes.length)];
      
      // Décider du nombre d'images correctes (3 ou 4)
      const numCorrectImages = Math.floor(Math.random() * 2) + 3;
      
      // Générer des indices aléatoires pour les images correctes
      const correctImageIndices: number[] = [];
      while (correctImageIndices.length < numCorrectImages) {
        const idx = Math.floor(Math.random() * 9);
        if (!correctImageIndices.includes(idx)) {
          correctImageIndices.push(idx);
        }
      }
      setCorrectIndices(correctImageIndices);

      // Premier fetch: images de la catégorie choisie en utilisant randomType.en
      const categoryImagesResponse = await fetch(
        `https://api.unsplash.com/photos/random?query=${randomType.en}&count=${numCorrectImages}&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      
      if (!categoryImagesResponse.ok) {
        if (categoryImagesResponse.status === 429) {
          throw new Error("Limite d'appels API Unsplash dépassée. Veuillez réessayer plus tard.");
        }
        throw new Error(`Erreur API Unsplash: ${categoryImagesResponse.statusText}`);
      }
      
      const categoryImages = await categoryImagesResponse.json();
      
      // Deuxième fetch: images complètement aléatoires
      const randomImagesResponse = await fetch(
        `https://api.unsplash.com/photos/random?count=${9 - numCorrectImages}&client_id=${UNSPLASH_ACCESS_KEY}`
      );

      if (!randomImagesResponse.ok) {
        if (randomImagesResponse.status === 429) {
          throw new Error("Limite d'appels API Unsplash dépassée. Veuillez réessayer plus tard.");
        }
        throw new Error(`Erreur API Unsplash: ${randomImagesResponse.statusText}`);
      }

      const randomImages = await randomImagesResponse.json();

      // Combiner et mélanger les images
      const allImages = new Array(9).fill(null);
      correctImageIndices.forEach((index, i) => {
        allImages[index] = categoryImages[i].urls.small;
      });
      
      let randomImageIndex = 0;
      for (let i = 0; i < 9; i++) {
        if (allImages[i] === null) {
          allImages[i] = randomImages[randomImageIndex].urls.small;
          randomImageIndex++;
        }
      }
      
      setCaptchaImages(allImages);
      setCaptchaType(randomType.fr);
      setUserSelection([]);
      setIsValid(null);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Initialiser le CAPTCHA au chargement
  useEffect(() => {
    generateCaptcha();
  }, []);

  const toggleSelection = (index: number) => {
    if (!isVerified) {
      setUserSelection(prev => {
        if (prev.includes(index)) {
          return prev.filter(i => i !== index);
        } else {
          return [...prev, index];
        }
      });
    }
  };

  // Vérifier le CAPTCHA
  const verifyCaptcha = async () => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur a sélectionné toutes les bonnes images
      const allCorrectSelected = correctIndices.every(i => userSelection.includes(i));
      const noIncorrectSelected = userSelection.every(i => correctIndices.includes(i));
      
      setIsValid(allCorrectSelected && noIncorrectSelected);
      setIsVerified(true);
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    generateCaptcha();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 bg-gradient-to-b from-[#0D0D0D] to-[#1a1a1a] bg-opacity-90 backdrop-blur-lg" style={{ background: 'linear-gradient(90deg, rgba(9,9,121,1) 22%, rgba(2,0,36,1) 57%, rgba(0,212,255,1) 100%)' }}>
      <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#7B61FF] to-[#FF47B4]">CAPTCHA DEMO</h1>  

      <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-white/10 backdrop-blur-[10px] shadow-lg border border-white/20" style={{ background: 'rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
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
            <p className="text-lg mb-2 text-white/80 font-medium bg-white/10 backdrop-blur-[10px] px-4 py-2 rounded-lg border border-white/20">
              Sélectionnez toutes les {captchaType}
            </p>

            <div className="grid grid-cols-3 gap-3">
              {captchaImages.map((img, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer border-4 rounded-xl overflow-hidden w-[120px] h-[120px] backdrop-blur-[10px] transition-all duration-300 hover:scale-105
                    ${!isVerified && userSelection.includes(index) ? "border-[#7B61FF]/70" : "border-white/20"}
                    ${isVerified && correctIndices.includes(index) ? "border-green-400/70" : ""}
                    ${isVerified && userSelection.includes(index) && !correctIndices.includes(index) ? "border-red-400/70" : ""}`}
                  onClick={() => toggleSelection(index)}
                >
                  <img
                    src={img}
                    alt={`Option ${index + 1}`}
                    className={`w-full h-full object-cover ${isVerified && !correctIndices.includes(index) && !userSelection.includes(index) ? "blur-sm" : ""}`}
                  />
                  {isVerified && correctIndices.includes(index) && (
                    <div className="absolute top-1 right-1 bg-green-400/20 backdrop-blur-[10px] rounded-full p-1 border border-green-400/30">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {isVerified && userSelection.includes(index) && !correctIndices.includes(index) && (
                    <div className="absolute top-1 right-1 bg-red-400/20 backdrop-blur-[10px] rounded-full p-1 border border-red-400/30">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={generateCaptcha}
                className="px-4 py-2 bg-white/10 backdrop-blur-[10px] text-white/80 rounded-lg hover:bg-white/20 transition-colors duration-300 border border-white/20"
                disabled={loading}
              >
                Nouveau 
              </button>

              <button
                onClick={verifyCaptcha}
                className={`px-4 py-2 backdrop-blur-[10px] rounded-lg transition-colors duration-300 border ${isVerified ? 'bg-white/10 cursor-not-allowed border-white/20' : 'bg-gradient-to-r from-[#7B61FF] to-[#FF47B4] hover:opacity-90 border-white/20'} text-white/80`}
                disabled={userSelection.length === 0 || loading || isVerified}
              >
                Vérifier
              </button>

              {isValid !== null && !isValid && (
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-yellow-500/20 backdrop-blur-[10px] text-white/80 rounded-lg hover:bg-yellow-500/30 transition-colors duration-300 border border-yellow-500/30"
                >
                  Réessayer
                </button>
              )}
            </div>

            {isValid !== null && (
              <div className={`flex items-center gap-2 backdrop-blur-[10px] p-2 rounded-lg ${isValid ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'} font-semibold`}>
                {isValid && (
                  <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {isValid ? 'Correct!' : 'Incorrect, voici les bonnes réponses'}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Home;