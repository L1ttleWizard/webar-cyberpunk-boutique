export const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    
    // Check if script is already added
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      // If it already loaded
      if ((existingScript as any).dataset.loaded === 'true') {
        resolve();
      } else {
        // Wait for it to load
        const handleLoad = () => {
          existingScript.removeEventListener('load', handleLoad);
          resolve();
        };
        existingScript.addEventListener('load', handleLoad);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.loaded = 'false';
    
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    
    script.onerror = (err) => {
      reject(err);
    };

    document.head.appendChild(script);
  });
};
